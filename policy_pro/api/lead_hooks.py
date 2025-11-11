"""
Lead Document Event Handlers
Handles validation, assignment, and tracking for Lead DocType
"""

import frappe
from frappe import _
from policy_pro.api.validators import LeadValidator


def validate_lead(doc, method):
    """
    Validate lead before save
    - Ensure all mandatory fields are filled
    - Validate contact information
    - Validate call-back dates if status is "Call Back"

    Args:
        doc: Lead document
        method: Hook method name
    """
    try:
        LeadValidator.validate_all(doc)
    except frappe.ValidationError:
        raise
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'validate_lead')
        frappe.throw(_('Error validating lead: {error}').format(error=str(e)))


def on_insert_lead(doc, method):
    """
    Handle actions after lead is created
    - Auto-assign to sales agent
    - Add comment for creation
    - Log creation event
    - Publish real-time notification

    Args:
        doc: Lead document
        method: Hook method name
    """
    try:
        # Log lead creation
        frappe.logger().info(f"Lead {doc.name} created by {frappe.session.user}")

        # Auto-assign lead to sales agent
        assign_lead_to_agent_automatically(doc)

        # Add comment
        doc.add_comment(
            'Comment',
            _('Lead created with status: {status}').format(status=doc.status)
        )

        # Publish real-time notification for new lead
        frappe.publish_realtime(
            'new_lead',
            {
                'lead_id': doc.name,
                'lead_name': doc.lead_name,
                'status': doc.status,
                'source': doc.source or 'Manual',
                'timestamp': frappe.utils.now_datetime().isoformat()
            },
            user=frappe.session.user
        )

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'on_insert_lead')


def assign_lead_to_agent_automatically(doc):
    """
    Automatically assign lead to sales agent using round-robin or load balancing
    
    Args:
        doc: Lead document
    """
    try:
        # Get all active sales agents
        agent_roles = frappe.get_all(
            'Has Role',
            filters={'role': 'Sales Agent'},
            fields=['parent'],
            distinct=True
        )
        agent_emails = [role.parent for role in agent_roles]

        if not agent_emails:
            frappe.logger().warning(f"No sales agents found for lead assignment")
            return

        sales_agents = frappe.get_all(
            'User',
            filters={
                'enabled': 1,
                'name': ['in', agent_emails]
            },
            fields=['name', 'full_name']
        )

        if not sales_agents:
            frappe.logger().warning(f"No sales agents found for lead assignment")
            return

        # Simple round-robin: Get agent with least assigned leads today
        today = frappe.utils.today()
        agent_lead_counts = {}

        for agent in sales_agents:
            lead_count = frappe.db.count(
                'Lead',
                filters={
                    'owner': agent.name,
                    'creation': ['>=', today]
                }
            )
            agent_lead_counts[agent.name] = lead_count

        # Assign to agent with minimum leads
        if agent_lead_counts:
            assigned_agent = min(agent_lead_counts, key=agent_lead_counts.get)
            doc.owner = assigned_agent
            doc.add_comment(
                'Comment',
                _('Lead auto-assigned to {agent}').format(agent=assigned_agent)
            )
            frappe.logger().info(f"Lead {doc.name} auto-assigned to {assigned_agent}")

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'assign_lead_to_agent_automatically')


def on_update_lead(doc, method):
    """
    Handle lead updates
    - Track status changes
    - Log modifications

    Args:
        doc: Lead document
        method: Hook method name
    """
    try:
        # Get previous doc to compare changes
        if doc.has_value_changed('status'):
            old_status = doc.get_doc_before_save().get('status') if doc.get_doc_before_save() else 'N/A'
            frappe.logger().info(
                f"Lead {doc.name} status changed from {old_status} to {doc.status}"
            )

        # Log callback updates
        if doc.has_value_changed('custom_call_back_date'):
            frappe.logger().info(
                f"Lead {doc.name} callback date updated to {doc.custom_call_back_date}"
            )

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'on_update_lead')


def get_lead_permission_query_conditions(user):
    """
    Custom permission query for Lead DocType
    Filters leads based on user role:
    - Sales User: Can view all leads (for assignment), but can only edit won leads
    - Sales Agent: Can view only assigned leads
    - Sales Manager: Can view all leads
    - Others: Can view all leads

    Args:
        user: Username

    Returns:
        str: SQL WHERE clause condition
    """
    roles = frappe.get_roles(user)

    if "Sales User" in roles:
        # Sales User can view all leads (for assignment purposes)
        # Write permission is restricted via has_permission hook
        return "1=1"

    elif "Sales Agent" in roles:
        # Sales Agent sees only assigned leads
        return f"`tabLead`.owner = '{user}'"

    elif "Sales Manager" in roles or "Company Manager" in roles or "CEO" in roles:
        # Managers see all leads
        return "1=1"

    # Default: no access (restrictive)
    return "0=1"
