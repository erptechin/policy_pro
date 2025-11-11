import frappe
from frappe.share import add as add_share, remove as remove_share

def on_update_lead(doc, method):
    """Add share to Lead for the user"""
    if doc.name and doc.get("custom_lead_status") == "New":
        try:
            user = frappe.get_doc("User", frappe.session.user)
            add_share("Lead", doc.name, user.name, write=1, share=1)
            frappe.msgprint(frappe._("Lead access has been granted to {0}").format(user.name))
        except Exception as e:
            user_name = frappe.session.user if frappe.session.user else "Unknown"
            frappe.log_error(f"Error adding share for user {user_name} to Lead {doc.name}: {str(e)}")