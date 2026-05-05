"""
Document Event Hooks for Policy Pro
"""
import frappe
import re
from frappe.share import add as add_share, remove as remove_share
from policy_pro.api.utils import create_response


def parse_currency_string(value):
    """
    Parse a currency string (e.g., '50,000 AED', '1,234.56 USD') to float
    
    Args:
        value: String value that may contain currency formatting
        
    Returns:
        float: Numeric value extracted from the string, or 0 if parsing fails
    """
    if not value:
        return 0.0
    
    # Convert to string if it's not already
    value_str = str(value).strip()
    
    # If it's already a number, return it
    try:
        return float(value_str)
    except (ValueError, TypeError):
        pass
    
    # Remove currency symbols and common currency codes (AED, USD, EUR, etc.)
    # Remove any non-digit characters except decimal point and comma
    # First, remove currency codes (3-letter codes at the end)
    value_str = re.sub(r'\s*[A-Z]{2,3}\s*$', '', value_str, flags=re.IGNORECASE)
    
    # Remove currency symbols ($, €, £, etc.)
    value_str = re.sub(r'[$€£¥₹]', '', value_str)
    
    # Remove commas (thousand separators)
    value_str = value_str.replace(',', '')
    
    # Strip whitespace
    value_str = value_str.strip()
    
    # Try to convert to float
    try:
        return float(value_str) if value_str else 0.0
    except (ValueError, TypeError):
        return 0.0


def on_update_lead(doc, method):
    """
    Handle Lead document updates
    
    - For "New" status: Grant access to the current user and set as assigned user
    - When assigned_user changes: Remove access from old user and grant access to new user
    
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
    
    # Handle assigned_user changes - manage share access
    assigned_user = doc.get("custom_assigned_user")
    if assigned_user:
        try:
            # Get previous assigned user from document before save
            previous_assigned_user = None
            if hasattr(doc, '_doc_before_save') and doc._doc_before_save:
                previous_assigned_user = doc._doc_before_save.get("custom_assigned_user")
            else:
                # Fallback: get from database (might be same as current if no change)
                previous_assigned_user = frappe.db.get_value("Lead", doc.name, "custom_assigned_user")
            
            # If assigned user has changed, remove access from old user
            if previous_assigned_user and previous_assigned_user != assigned_user:
                try:
                    remove_share("Lead", doc.name, previous_assigned_user)
                    frappe.logger().info(
                        f"Removed share access for user {previous_assigned_user} from Lead {doc.name}"
                    )
                except Exception as e:
                    # Share might not exist, which is fine
                    frappe.logger().debug(
                        f"Could not remove share for user {previous_assigned_user} from Lead {doc.name}: {str(e)}"
                    )
            
            # Add share access to new assigned user
            user = frappe.get_doc("User", assigned_user)
            add_share("Lead", doc.name, user.name, write=1, share=1)
            frappe.msgprint(
                frappe._("Lead access has been granted to {0}").format(user.name)
            )
        except Exception as e:
            frappe.log_error(
                f"Error managing share for user {assigned_user} on Lead {doc.name}: {str(e)}",
                "Lead Share Error"
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
            filters=[["User Role Profile", "role_profile", "in", ["Lead Manager", "Lead User"]], ["User", "enabled", "=", 1]],
            fields=["name", "full_name", "user_image"]
        )
        
        # Get all leads
        leads = frappe.get_all(
            "Lead",
            fields=["name", "owner", "custom_assigned_user"]
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
            leads_count = len([lead for lead in leads if lead.custom_assigned_user == agent.name])
            
            # Count deals (Sales Orders) for this agent
            agent_orders = [
                order for order in sales_orders
                if order.custom_agent == agent.name and
                order.status in ["Completed", "To Deliver and Bill", "To Bill", "Draft"]
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
            filters=[["User Role Profile", "role_profile", "=", "Lead Manager"], ["User", "enabled", "=", 1]]
        )
        
        # Count Lead Users (Users with role_profile_name = "Lead User")
        lead_users_count = frappe.db.count(
            "User",
            filters=[["User Role Profile", "role_profile", "=", "Lead User"], ["User", "enabled", "=", 1]]
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


@frappe.whitelist()
def get_sales_target_summary():
    """
    Get sales target summary with today's deals, revenue, and detailed agent performance
    
    Returns:
        dict: Sales target summary data with today's metrics and agent details
    """
    try:
        from frappe.utils import today
        
        today_date = today()
        
        # Get today's deals count and revenue
        today_orders = frappe.get_all(
            "Sales Order",
            filters={
                "transaction_date": today_date,
                "status": ["in", ["Completed", "To Deliver and Bill", "To Bill" , "Draft"]]
            },
            fields=["name", "custom_agent", "grand_total", "total", "status", "transaction_date"]
        )
        
        today_deals = len(today_orders)
        today_revenue = sum(
            float(order.grand_total or order.total or 0)
            for order in today_orders
        )
        
        # Get all Lead Users (sales agents)
        agents = frappe.get_all(
            "User",
            filters=[["User Role Profile", "role_profile", "in", ["Lead Manager", "Lead User"]], ["User", "enabled", "=", 1]],
            fields=["name", "full_name", "user_image"]
        )
        
        # Get all sales orders for agents
        all_orders = frappe.get_all(
            "Sales Order",
            fields=["name", "custom_agent", "grand_total", "total", "status", "transaction_date"]
        )
        
        # Get sales targets from User custom fields (if they exist)
        user_meta = frappe.get_meta("User")
        has_sales_target = user_meta.has_field("custom_sales_target")
        has_revenue_target = user_meta.has_field("custom_revenue_target")
        
        # Process data for each agent
        sales_target_data = []
        for agent in agents:
            # Get agent's sales orders for today (for deals count)
            agent_today_orders = [
                order for order in today_orders
                if order.custom_agent == agent.name and
                order.status in ["Completed", "To Deliver and Bill", "To Bill", "Draft"]
            ]
            
            total_deals = len(agent_today_orders)
            
            # Get agent's all sales orders (for revenue calculation)
            agent_all_orders = [
                order for order in all_orders
                if order.custom_agent == agent.name and
                order.status in ["Completed", "To Deliver and Bill", "To Bill", "Draft"]
            ]
            
            # Calculate revenue from all orders
            revenue = sum(
                float(order.grand_total or order.total or 0)
                for order in agent_all_orders
            )
            
            # Get cancellation/refund (for now, set to 0/0 as we need to check if this field exists)
            cancellation = 0
            refund = 0
            
            # Get sales target and revenue target from user custom fields
            sales_target = 0
            
            if has_sales_target or has_revenue_target:
                user_doc = frappe.get_doc("User", agent.name)
                if has_sales_target:
                    sales_target = parse_currency_string(user_doc.get("custom_sales_target"))
            
            sales_target_data.append({
                "name": agent.full_name or agent.name,
                "user_name": agent.name,
                "totalDeals": total_deals,
                "salesTarget": int(sales_target),
                "cancellation": round(cancellation, 2),
                "refund": round(refund, 2),
                "revenue": round(revenue, 2),
            })
        
        # Sort by total deals (descending)
        sales_target_data.sort(key=lambda x: x["totalDeals"], reverse=True)
        
        result = {
            "todayDeals": today_deals,
            "todayRevenue": round(today_revenue, 2),
            "salesTargetData": sales_target_data
        }
        
        create_response(200, "Sales target summary fetched successfully", result)
        
    except Exception as e:
        frappe.log_error(
            f"Error fetching sales target summary: {str(e)}",
            "Sales Target Summary Error"
        )
        create_response(500, f"Error fetching sales target summary: {str(e)}", None)