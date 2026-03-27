# Copyright (c) 2025, erptech and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.share import add as add_share, remove as remove_share
from frappe.utils import add_years, today


class CODManagement(Document):
	def on_update(self):
		"""
		Handle COD Management document updates
		
		- When approval_manager changes: Remove access from old manager and grant access to new manager
		- When status changes to "Approve": Set status to "Active", set renew_date, and create Sales Order
		
		Args:
			self: The COD Management document
		"""
		if not self.name:
			return
		
		# Handle approval_manager changes - manage share access
		approval_manager = self.get("approval_manager")
		if approval_manager:
			try:
				# Get previous approval manager from document before save
				previous_approval_manager = None
				if hasattr(self, '_doc_before_save') and self._doc_before_save:
					previous_approval_manager = self._doc_before_save.get("approval_manager")
				else:
					# Fallback: get from database (might be same as current if no change)
					previous_approval_manager = frappe.db.get_value("COD Management", self.name, "approval_manager")
				
				# If approval manager has changed, remove access from old manager
				if previous_approval_manager and previous_approval_manager != approval_manager:
					try:
						remove_share("COD Management", self.name, previous_approval_manager)
						frappe.logger().info(
							f"Removed share access for user {previous_approval_manager} from COD Management {self.name}"
						)
					except Exception as e:
						# Share might not exist, which is fine
						frappe.logger().debug(
							f"Could not remove share for user {previous_approval_manager} from COD Management {self.name}: {str(e)}"
						)
				
				# Add share access to new approval manager
				user = frappe.get_doc("User", approval_manager)
				add_share("COD Management", self.name, user.name, write=1, share=1)
				frappe.msgprint(
					frappe._("COD Management access has been granted to {0}").format(user.name)
				)
			except Exception as e:
				frappe.log_error(
					f"Error managing share for user {approval_manager} on COD Management {self.name}: {str(e)}",
					"COD Management Share Error"
				)
		
		# Handle status change to "Approve" - set to Active, set renew_date, and create Sales Order
		current_status = self.get("status")
		if current_status == "Approve":
			# Get previous status from document before save
			previous_status = None
			if hasattr(self, '_doc_before_save') and self._doc_before_save:
				previous_status = self._doc_before_save.get("status")
			else:
				# Fallback: get from database
				previous_status = frappe.db.get_value("COD Management", self.name, "status")
			
			# Only process if previous status was NOT "Approve" (to avoid duplicate processing)
			if previous_status != "Approve":
				try:
					# Set status to "Active"
					frappe.db.set_value("Car Profile", self.car_profile, "status", "Active")
					
					
					# Set renew_date to 1 year from current date
					renew_date = add_years(today(), 1)
					frappe.db.set_value("Car Profile", self.car_profile, "renew_date", renew_date)
					
					# Get required fields for Sales Order
					customer = self.get("customer")
					lead = self.get("lead")
					car_profile = self.get("car_profile")
					policy_amount = self.get("policy_amount") or 0
					
					if not customer:
						frappe.log_error(
							f"Customer is required to create Sales Order for COD Management {self.name}",
							"COD Management Sales Order Error"
						)
						return
					
					if not lead:
						frappe.log_error(
							f"Lead is required to create Sales Order for COD Management {self.name}",
							"COD Management Sales Order Error"
						)
						return
					
					# Get Agent from Lead's custom_assigned_user
					agent = frappe.db.get_value("Lead", lead, "custom_assigned_user")
					
					if not agent:
						frappe.log_error(
							f"Lead {lead} does not have an assigned user (agent) for COD Management {self.name}",
							"COD Management Sales Order Error"
						)
						return
				
					
					# Create Sales Order
					sales_order = frappe.new_doc("Sales Order")
					sales_order.customer = customer
					sales_order.custom_agent = agent
					sales_order.custom_lead = lead
					sales_order.custom_car_profile = car_profile
					sales_order.transaction_date = today()
					sales_order.delivery_date = frappe.utils.add_days(today(), 7)
					
					# Add item - try to use "Policy Pro" or use policy_name as item description
					item_code = "Policy Pro"
					# Check if item exists, if not, use a default item or create one
					if not frappe.db.exists("Item", item_code):
						# Try to get first available item or use policy_name
						item_code = frappe.db.get_value("Item", {"is_sales_item": 1}, "name")
						if not item_code:
							frappe.log_error(
								"No sales item found. Please create an item first.",
								"COD Management Sales Order Error"
							)
							return
					
					sales_order.append("items", {
						"item_code": item_code,
						"qty": 1,
						"rate": policy_amount
					})
					
					# Disable email notifications
					sales_order.flags.ignore_mandatory = True
					sales_order.flags.disable_email_notifications = True
					sales_order.insert(ignore_permissions=True)
					frappe.db.commit()
					
					frappe.msgprint(
						frappe._("Status set to Active, renew_date set, and Sales Order {0} created successfully").format(
							sales_order.name
						)
					)
					
				except Exception as e:
					frappe.log_error(
						f"Error processing approved COD Management {self.name}: {str(e)}",
						"COD Management Approval Error"
					)
					frappe.msgprint(
						frappe._("Error processing approval: {0}").format(str(e)),
						indicator="red"
					)
