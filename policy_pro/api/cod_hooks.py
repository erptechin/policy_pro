"""
COD Document Event Handlers
Handles validation, approval workflow, and notifications for COD Document DocType
"""

import frappe
from frappe import _
from policy_pro.api.validators import CODValidator


def validate_cod_document(doc, method):
    """
    Validate COD document before save
    - Ensure at least one document is uploaded
    - Validate all documents have types specified

    Args:
        doc: COD Document
        method: Hook method name
    """
    try:
        CODValidator.validate_all(doc)
    except frappe.ValidationError:
        raise
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'validate_cod_document')
        frappe.throw(_('Error validating COD document: {error}').format(error=str(e)))


def on_submit_cod_document(doc, method):
    """
    Handle COD document submission
    - Send notification to Company Manager and CEO
    - Set submission date

    Args:
        doc: COD Document
        method: Hook method name
    """
    try:
        # Set submission date if not set
        if not doc.submission_date:
            doc.submission_date = frappe.utils.now_datetime()
            doc.save(ignore_permissions=True)

        # Send notification emails
        notify_cod_submission(doc)

        # Add comment
        doc.add_comment(
            'Comment',
            _('COD Document submitted for approval')
        )

        frappe.logger().info(f"COD Document {doc.name} submitted by {frappe.session.user}")

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'on_submit_cod_document')


def on_update_after_submit_cod_document(doc, method):
    """
    Handle COD document updates after submission
    - Update dashboard when both approvals are complete
    - Send notifications on approval/rejection

    Args:
        doc: COD Document
        method: Hook method name
    """
    try:
        # Check if manager approval changed
        if doc.has_value_changed('manager_approval_status'):
            if doc.manager_approval_status == 'Approved':
                doc.manager_approval_date = frappe.utils.now_datetime()
                doc.add_comment(
                    'Comment',
                    _('Approved by Manager: {user}').format(user=frappe.session.user)
                )
                # Notify CEO
                notify_ceo_for_approval(doc)
            elif doc.manager_approval_status == 'Rejected':
                doc.manager_approval_date = frappe.utils.now_datetime()
                doc.add_comment(
                    'Comment',
                    _('Rejected by Manager: {user}').format(user=frappe.session.user)
                )
                notify_agent_rejection(doc, 'Manager')

        # Check if CEO approval changed
        if doc.has_value_changed('ceo_approval_status'):
            if doc.ceo_approval_status == 'Approved':
                doc.ceo_approval_date = frappe.utils.now_datetime()
                doc.add_comment(
                    'Comment',
                    _('Approved by CEO: {user}').format(user=frappe.session.user)
                )
                # Update sales dashboard
                update_sales_dashboard(doc)
                notify_agent_approval(doc)
            elif doc.ceo_approval_status == 'Rejected':
                doc.ceo_approval_date = frappe.utils.now_datetime()
                doc.add_comment(
                    'Comment',
                    _('Rejected by CEO: {user}').format(user=frappe.session.user)
                )
                notify_agent_rejection(doc, 'CEO')

        doc.save(ignore_permissions=True)
        frappe.db.commit()

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'on_update_after_submit_cod_document')


def notify_cod_submission(doc):
    """
    Send email notification to Manager and CEO when COD is submitted

    Args:
        doc: COD Document
    """
    try:
        # Get Manager and CEO emails
        managers = frappe.get_all(
            'User',
            filters={
                'enabled': 1,
                'name': ['in', frappe.get_all(
                    'Has Role',
                    filters={'role': ['in', ['Company Manager', 'Sales Manager']]},
                    fields=['parent'],
                    distinct=True
                )]
            },
            fields=['name', 'email']
        )

        ceos = frappe.get_all(
            'User',
            filters={
                'enabled': 1,
                'name': ['in', frappe.get_all(
                    'Has Role',
                    filters={'role': 'CEO'},
                    fields=['parent'],
                    distinct=True
                )]
            },
            fields=['name', 'email']
        )

        # Prepare email content
        subject = _('New COD Document Submitted: {doc_name}').format(doc_name=doc.name)
        message = _("""
        A new COD Document has been submitted for approval.

        Details:
        - Document: {doc_name}
        - Customer: {customer}
        - Sales Agent: {agent}
        - Submission Date: {date}

        Please review and approve the document.
        """).format(
            doc_name=doc.name,
            customer=doc.customer,
            agent=doc.sales_agent,
            date=doc.submission_date
        )

        # Send to managers
        for manager in managers:
            if manager.email:
                frappe.sendmail(
                    recipients=[manager.email],
                    subject=subject,
                    message=message
                )

        # Send to CEOs
        for ceo in ceos:
            if ceo.email:
                frappe.sendmail(
                    recipients=[ceo.email],
                    subject=subject,
                    message=message
                )

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'notify_cod_submission')


def notify_ceo_for_approval(doc):
    """
    Notify CEO when Manager approves

    Args:
        doc: COD Document
    """
    try:
        ceos = frappe.get_all(
            'User',
            filters={
                'enabled': 1,
                'name': ['in', frappe.get_all(
                    'Has Role',
                    filters={'role': 'CEO'},
                    fields=['parent'],
                    distinct=True
                )]
            },
            fields=['email']
        )

        subject = _('COD Document Approved by Manager: {doc_name}').format(doc_name=doc.name)
        message = _("""
        COD Document {doc_name} has been approved by Manager and is pending your approval.

        Please review and provide final approval.
        """).format(doc_name=doc.name)

        for ceo in ceos:
            if ceo.email:
                frappe.sendmail(
                    recipients=[ceo.email],
                    subject=subject,
                    message=message
                )

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'notify_ceo_for_approval')


def notify_agent_approval(doc):
    """
    Notify sales agent when COD is fully approved

    Args:
        doc: COD Document
    """
    try:
        agent_email = frappe.db.get_value('User', doc.sales_agent, 'email')
        if not agent_email:
            return

        subject = _('COD Document Approved: {doc_name}').format(doc_name=doc.name)
        message = _("""
        Your COD Document {doc_name} has been fully approved by Manager and CEO.

        The document will now appear on the Sales Dashboard.
        """).format(doc_name=doc.name)

        frappe.sendmail(
            recipients=[agent_email],
            subject=subject,
            message=message
        )

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'notify_agent_approval')


def notify_agent_rejection(doc, rejected_by):
    """
    Notify sales agent when COD is rejected

    Args:
        doc: COD Document
        rejected_by: Who rejected (Manager/CEO)
    """
    try:
        agent_email = frappe.db.get_value('User', doc.sales_agent, 'email')
        if not agent_email:
            return

        subject = _('COD Document Rejected: {doc_name}').format(doc_name=doc.name)
        message = _("""
        Your COD Document {doc_name} has been rejected by {rejected_by}.

        Please review the comments and resubmit if needed.
        """).format(doc_name=doc.name, rejected_by=rejected_by)

        frappe.sendmail(
            recipients=[agent_email],
            subject=subject,
            message=message
        )

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'notify_agent_rejection')


def update_sales_dashboard(doc):
    """
    Update sales dashboard when COD is fully approved
    This triggers a real-time update for the dashboard

    Args:
        doc: COD Document
    """
    try:
        # Publish real-time event for dashboard update
        frappe.publish_realtime(
            'cod_approved',
            {
                'cod_id': doc.name,
                'customer': doc.customer,
                'sales_agent': doc.sales_agent,
                'approval_date': frappe.utils.now_datetime().isoformat()
            }
        )

        frappe.logger().info(f"Sales dashboard updated for approved COD: {doc.name}")

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'update_sales_dashboard')

