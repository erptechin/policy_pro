"""
Document Event Hooks for Policy Pro
"""
import frappe
from frappe.share import add as add_share, remove as remove_share
from policy_pro.api.utils import create_response


def on_update_lead(doc, method):
    """
    Handle Lead document updates
    
    - For "New" status: Grant access to the current user and set as assigned user
    - For "CEO Approval" status: Grant access to the assigned user
    
    Args:
        doc: The Lead document
        method: The method name (e.g., 'on_update')
    """
    if not doc.name:
        return
    
    lead_status = doc.get("custom_lead_status")
    
    # Handle "New" status - assign to current user
    if lead_status == "New":
        try:
            if not frappe.session.user:
                frappe.log_error("No session user found when updating Lead", "Lead Update Error")
                return
            
            user = frappe.get_doc("User", frappe.session.user)
            add_share("Lead", doc.name, user.name, write=1, share=1)
            frappe.db.set_value("Lead", doc.name, "custom_assigned_user", user.name)
            frappe.msgprint(
                frappe._("Lead access has been granted to {0}").format(user.name)
            )
        except Exception as e:
            user_name = frappe.session.user if frappe.session.user else "Unknown"
            frappe.log_error(
                f"Error adding share for user {user_name} to Lead {doc.name}: {str(e)}",
                "Lead Share Error"
            )
    
    # Handle "CEO Approval" status - grant access to assigned user
    elif lead_status == "CEO Approval":
        assigned_user = doc.get("custom_assigned_user")
        if not assigned_user:
            frappe.log_error(
                f"Lead {doc.name} has CEO Approval status but no assigned user",
                "Lead Update Error"
            )
            return
        
        try:
            user = frappe.get_doc("User", assigned_user)
            add_share("Lead", doc.name, user.name, write=1, share=1)
            frappe.msgprint(
                frappe._("Lead access has been granted to {0}").format(user.name)
            )
        except Exception as e:
            frappe.log_error(
                f"Error adding share for user {assigned_user} to Lead {doc.name}: {str(e)}",
                "Lead Share Error"
            )
    
    # Handle "Approved" status - create Customer and Sales Order
    elif lead_status == "Approved":
        try:
            # Get or create Customer
            customer_id = _get_or_create_customer(doc)
            if not customer_id:
                frappe.log_error(
                    f"Failed to get or create customer for Lead {doc.name}",
                    "Lead Approval Error"
                )
                return
            
            # Create Sales Order
            _create_sales_order(doc, customer_id)
            
        except Exception as e:
            frappe.log_error(
                f"Error processing approved Lead {doc.name}: {str(e)}",
                "Lead Approval Error"
            )


def _get_or_create_customer(lead_doc):
    """
    Get existing customer or create new one from Lead data
    
    Args:
        lead_doc: The Lead document
        
    Returns:
        str: Customer ID/name, or None if creation failed
    """
    first_name = lead_doc.get("first_name")
    last_name = lead_doc.get("last_name")
    customer_name = f"{first_name} {last_name or ''}".strip()

    # check if customer exists by name
    customer = frappe.db.get_value("Customer", {"customer_name": customer_name}, "name")
    if customer:
        return customer
    else:
        # Create new customer
        customer_doc = frappe.new_doc("Customer")
        customer_doc.customer_name = customer_name
        customer_doc.customer_type = "Individual"
        customer_doc.customer_group = frappe.db.get_single_value("Selling Settings", "customer_group") or "Individual"
        customer_doc.territory = frappe.db.get_single_value("Selling Settings", "territory") or "All Territories"
        customer_doc.insert(ignore_permissions=True)
        return customer_doc.name


def _create_sales_order(lead_doc, customer_id):
    """
    Create Sales Order from Lead data
    
    Args:
        lead_doc: The Lead document
        customer_id: The Customer ID/name
    """
    try:
        # Check if Sales Order already exists for this Lead
        existing_so = frappe.db.get_value("Sales Order",{"custom_lead": lead_doc.name},"name")
        
        if existing_so:
            frappe.msgprint(
                frappe._("Sales Order {0} already exists for this Lead").format(existing_so)
            )
            return
        
        # Create Sales Order
        sales_order = frappe.new_doc("Sales Order")
        sales_order.customer = customer_id
        sales_order.transaction_date = frappe.utils.today()
        sales_order.delivery_date = frappe.utils.add_days(frappe.utils.today(), 7)
        
        # Link to Lead if custom field exists
        if frappe.get_meta("Sales Order").has_field("custom_lead"):
            sales_order.custom_lead = lead_doc.name
        
        # Add item with item_code "Policy Pro"
        sales_order.append("items", {
            "item_code": "Policy Pro",
            "qty": 1,
            "rate": 0
        })
        
        # Disable email notifications
        sales_order.flags.ignore_mandatory = True
        sales_order.flags.disable_email_notifications = True
        sales_order.insert(ignore_permissions=True)
        frappe.db.commit()
        
        frappe.msgprint(
            frappe._("Sales Order {0} created successfully for Customer {1}").format(
                sales_order.name, customer_id
            )
        )
        
    except Exception as e:
        frappe.log_error(
            f"Error creating Sales Order for Lead {lead_doc.name}: {str(e)}",
            "Sales Order Creation Error"
        )


@frappe.whitelist()
def get_sales_report():
    """
    Get sales report data with leads, deals, and total value for each sales agent
    
    Returns:
        dict: Sales report data with agents, their leads count, deals count, and total value
    """
    try:
        # Get all Lead Users (sales agents)
        agents = frappe.get_all(
            "User",
            filters={
                "role_profile_name": "Lead User",
                "enabled": 1
            },
            fields=["name", "full_name", "user_image"]
        )
        
        # Get all leads
        leads = frappe.get_all(
            "Lead",
            fields=["name", "owner"]
        )
        
        # Get all sales orders
        sales_orders = frappe.get_all(
            "Sales Order",
            fields=["name", "custom_agent", "total", "grand_total", "status"]
        )
        
        # Process data for each agent
        sales_data = []
        for agent in agents:
            # Count leads for this agent
            leads_count = len([lead for lead in leads if lead.owner == agent.name])
            
            # Count deals (Sales Orders) for this agent
            agent_orders = [
                order for order in sales_orders
                if order.custom_agent == agent.name and
                order.status in ["Completed", "To Deliver and Bill", "To Bill"]
            ]
            deals_count = len(agent_orders)
            
            # Calculate total monetary value
            total_value = sum(
                float(order.grand_total or order.total or 0)
                for order in agent_orders
            )
            
            sales_data.append({
                "name": agent.full_name or agent.name,
                "user_name": agent.name,
                "image": agent.user_image,
                "leads": leads_count,
                "deals": deals_count,
                "totalValue": round(total_value, 2)
            })
        
        # Sort by total value (descending)
        sales_data.sort(key=lambda x: x["totalValue"], reverse=True)
        
        create_response(200, "Sales report fetched successfully", sales_data)
        
    except Exception as e:
        frappe.log_error(
            f"Error fetching sales report: {str(e)}",
            "Sales Report Error"
        )
        create_response(500, f"Error fetching sales report: {str(e)}", None)


@frappe.whitelist()
def get_statistics():
    """
    Get statistics counts for dashboard
    
    Returns:
        dict: Statistics data with counts for leads, lead managers, lead users, and sales orders
    """
    try:
        # Count all Leads
        leads_count = frappe.db.count("Lead")
        
        # Count Lead Managers (Users with role_profile_name = "Lead Manager")
        lead_managers_count = frappe.db.count(
            "User",
            filters={
                "role_profile_name": "Lead Manager",
                "enabled": 1
            }
        )
        
        # Count Lead Users (Users with role_profile_name = "Lead User")
        lead_users_count = frappe.db.count(
            "User",
            filters={
                "role_profile_name": "Lead User",
                "enabled": 1
            }
        )
        
        # Count all Sales Orders
        sales_orders_count = frappe.db.count("Sales Order")
        
        statistics = {
            "leads": leads_count,
            "leadManagers": lead_managers_count,
            "leadUsers": lead_users_count,
            "salesOrders": sales_orders_count
        }
        
        create_response(200, "Statistics fetched successfully", statistics)
        
    except Exception as e:
        frappe.log_error(
            f"Error fetching statistics: {str(e)}",
            "Statistics Error"
        )
        create_response(500, f"Error fetching statistics: {str(e)}", None)