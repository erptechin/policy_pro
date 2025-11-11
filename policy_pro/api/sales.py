"""
Policy Pro Sales Module APIs
Handles lead management, sales dashboard, and COD document operations
"""

import frappe
from frappe import _
from frappe.utils import getdate, now_datetime


# ============================================================================
# LEAD MANAGEMENT APIs
# ============================================================================

@frappe.whitelist()
def get_leads(status=None, owner=None, page=1, limit=20, filters=None):
    """
    Get paginated list of leads with filters

    Args:
        status (str): Filter by status
        owner (str): Filter by assigned agent
        page (int): Page number (1-indexed)
        limit (int): Records per page
        filters (dict): Additional filters

    Returns:
        dict: {status, data: {total, page, limit, leads}}
    """
    try:
        filter_conditions = {}

        if status:
            filter_conditions['status'] = status
        if owner:
            filter_conditions['owner'] = owner
        if filters:
            filter_conditions.update(filters)

        # Get total count
        total = frappe.db.count('Lead', filters=filter_conditions)

        # Get paginated results
        offset = (int(page) - 1) * int(limit)

        leads = frappe.get_all(
            'Lead',
            filters=filter_conditions,
            fields=[
                'name', 'lead_name', 'email_id', 'mobile_no', 'status', 'owner',
                'source', 'creation', 'modified',
                'custom_call_back_date', 'custom_call_back_time', 'custom_call_back_notes'
            ],
            limit_page_length=int(limit),
            offset=offset,
            order_by='modified desc'
        )

        return {
            'status': 'success',
            'data': {
                'total': total,
                'page': int(page),
                'limit': int(limit),
                'leads': leads
            }
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'get_leads')
        return {
            'status': 'error',
            'message': str(e)
        }


@frappe.whitelist()
def get_lead(lead_id):
    """
    Get single lead document

    Args:
        lead_id (str): Lead ID

    Returns:
        dict: Lead document data
    """
    try:
        lead = frappe.get_doc('Lead', lead_id)
        return {
            'status': 'success',
            'data': lead.as_dict()
        }
    except frappe.DoesNotExistError:
        return {
            'status': 'error',
            'message': _('Lead not found'),
            'code': 404
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'get_lead')
        return {
            'status': 'error',
            'message': str(e)
        }


@frappe.whitelist()
def create_lead(lead_name, email_id=None, mobile_no=None, **kwargs):
    """
    Create a new lead

    Args:
        lead_name (str): Customer name (mandatory)
        email_id (str): Email address
        mobile_no (str): Phone number
        **kwargs: Additional fields

    Returns:
        dict: Created lead data
    """
    try:
        # Validate mandatory fields
        if not email_id and not mobile_no:
            return {
                'status': 'error',
                'message': _('Either Email ID or Mobile No is required'),
                'code': 400
            }

        # Create new lead
        lead = frappe.get_doc({
            'doctype': 'Lead',
            'lead_name': lead_name,
            'email_id': email_id,
            'mobile_no': mobile_no,
            'status': 'Open',
            'source': kwargs.get('source', 'Manual'),
            **kwargs
        })

        lead.insert()
        frappe.db.commit()

        return {
            'status': 'success',
            'message': _('Lead created successfully'),
            'data': {
                'lead_id': lead.name,
                'lead_name': lead.lead_name
            }
        }
    except frappe.ValidationError as e:
        return {
            'status': 'error',
            'message': str(e),
            'code': 400
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'create_lead')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


@frappe.whitelist()
def update_lead_status(lead_id, status, callback_date=None, callback_time=None, notes=None):
    """
    Update lead status and call-back details

    Args:
        lead_id (str): Lead ID
        status (str): New status
        callback_date (str): Call-back date (if status='Call Back')
        callback_time (str): Call-back time (if status='Call Back')
        notes (str): Call-back notes

    Returns:
        dict: Update result
    """
    try:
        lead = frappe.get_doc('Lead', lead_id)
        old_status = lead.status

        # Validate if status is "Call Back", callback_date is required
        if status == 'Call Back':
            if not callback_date:
                return {
                    'status': 'error',
                    'message': _('Call Back Date is required when status is "Call Back"'),
                    'code': 400
                }

            # Check if date is in future
            if getdate(callback_date) < getdate(frappe.utils.today()):
                return {
                    'status': 'error',
                    'message': _('Call Back Date must be in the future'),
                    'code': 400
                }

        # Update lead
        lead.status = status

        if status == 'Call Back':
            lead.custom_call_back_date = callback_date
            lead.custom_call_back_time = callback_time
            lead.custom_call_back_notes = notes

        lead.save()
        frappe.db.commit()

        # Log status change
        lead.add_comment(
            'Comment',
            _('Status changed from {old} to {new}').format(old=old_status, new=status)
        )

        return {
            'status': 'success',
            'message': _('Lead status updated'),
            'data': {
                'lead_id': lead_id,
                'previous_status': old_status,
                'new_status': status
            }
        }
    except frappe.DoesNotExistError:
        return {
            'status': 'error',
            'message': _('Lead not found'),
            'code': 404
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'update_lead_status')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


@frappe.whitelist()
def get_won_leads():
    """
    Get won/converted leads (Sales User specific)

    Returns:
        dict: Won leads data
    """
    try:
        # Check permission
        if "Sales User" not in frappe.get_roles():
            return {
                'status': 'error',
                'message': _('You don\'t have permission to view this data'),
                'code': 403
            }

        leads = frappe.get_all(
            'Lead',
            filters={'status': ['in', ['Converted', 'Won']]},
            fields=['name', 'lead_name', 'status', 'owner', 'email_id', 'mobile_no'],
            order_by='modified desc'
        )

        return {
            'status': 'success',
            'data': leads
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'get_won_leads')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


@frappe.whitelist()
def assign_lead_to_agent(lead_name, agent_email):
    """
    Manually assign lead to a sales agent
    Accessible by Sales User and Sales Manager

    Args:
        lead_name (str): Lead document ID
        agent_email (str): Target agent's email

    Returns:
        dict: Assignment result
    """
    try:
        # Check permission
        roles = frappe.get_roles()
        if "Sales User" not in roles and "Sales Manager" not in roles:
            return {
                'status': 'error',
                'message': _('You don\'t have permission to assign leads'),
                'code': 403
            }

        # Validate agent exists
        if not frappe.db.exists("User", agent_email):
            return {
                'status': 'error',
                'message': _('Sales agent not found'),
                'code': 404
            }

        # Get lead
        lead = frappe.get_doc('Lead', lead_name)
        old_owner = lead.owner

        # Update owner
        lead.owner = agent_email
        lead.save(ignore_permissions=True)
        frappe.db.commit()

        # Log assignment
        lead.add_comment(
            'Comment',
            _('Lead reassigned from {old} to {new} by {user}').format(
                old=old_owner,
                new=agent_email,
                user=frappe.session.user
            )
        )

        return {
            'status': 'success',
            'message': _('Lead assigned successfully'),
            'data': {
                'lead_id': lead_name,
                'assigned_to': agent_email,
                'previous_owner': old_owner
            }
        }
    except frappe.DoesNotExistError:
        return {
            'status': 'error',
            'message': _('Lead not found'),
            'code': 404
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'assign_lead_to_agent')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


@frappe.whitelist()
def get_sales_agents():
    """
    Get all sales agents with their details

    Returns:
        dict: List of sales agents
    """
    try:
        # Get users with Sales Agent role
        agent_roles = frappe.get_all(
            'Has Role',
            filters={'role': 'Sales Agent'},
            fields=['parent'],
            distinct=True
        )
        
        agent_emails = [role.parent for role in agent_roles]

        if not agent_emails:
            return {
                'status': 'success',
                'data': []
            }

        agents = frappe.get_all(
            'User',
            filters={
                'name': ['in', agent_emails],
                'enabled': 1
            },
            fields=['name', 'full_name', 'user_image', 'email'],
            order_by='full_name asc'
        )

        return {
            'status': 'success',
            'data': agents
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'get_sales_agents')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


@frappe.whitelist()
def get_call_back_leads(date_from=None, date_to=None, agent_email=None):
    """
    Get leads with upcoming call-backs

    Args:
        date_from (str): Start date
        date_to (str): End date
        agent_email (str): Filter by specific agent

    Returns:
        dict: Leads with call-backs
    """
    try:
        if not date_from:
            date_from = frappe.utils.today()
        if not date_to:
            date_to = frappe.utils.add_days(frappe.utils.today(), 7)

        filters = [
            ['custom_call_back_date', '>=', date_from],
            ['custom_call_back_date', '<=', date_to],
            ['status', '=', 'Call Back']
        ]

        if agent_email:
            filters.append(['owner', '=', agent_email])

        leads = frappe.get_all(
            'Lead',
            filters=filters,
            fields=['name', 'lead_name', 'custom_call_back_date', 'custom_call_back_time',
                   'custom_call_back_notes', 'owner', 'status'],
            order_by='custom_call_back_date asc'
        )

        return {
            'status': 'success',
            'data': {
                'total': len(leads),
                'leads': leads
            }
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'get_call_back_leads')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


# ============================================================================
# SALES DASHBOARD APIs
# ============================================================================

@frappe.whitelist()
def get_sales_dashboard_data(date=None):
    """
    Get complete sales dashboard data

    Args:
        date (str): Dashboard date (default: today)

    Returns:
        dict: Dashboard data with agents, metrics, targets
    """
    try:
        if not date:
            date = frappe.utils.today()

        # Get sales agents with their details
        agent_roles = frappe.get_all(
            'Has Role',
            filters={'role': 'Sales Agent'},
            fields=['parent'],
            distinct=True
        )
        agent_emails = [role.parent for role in agent_roles]

        agents = []
        if agent_emails:
            agents = frappe.get_all(
                'User',
                filters={
                    'name': ['in', agent_emails],
                    'enabled': 1
                },
                fields=['name', 'full_name', 'user_image', 'email'],
                order_by='full_name asc'
            )

        # Get daily sales by agent
        sales_data = frappe.db.sql(
            """
            SELECT
                COUNT(*) as total_sales,
                COALESCE(SUM(grand_total), 0) as total_revenue,
                owner as sales_agent
            FROM `tabSales Invoice`
            WHERE DATE(posting_date) = %s AND docstatus = 1
            GROUP BY owner
            """,
            (date,),
            as_dict=True
        )

        # Get total daily sales
        total_sales = frappe.db.sql(
            """
            SELECT
                COUNT(*) as total_count,
                COALESCE(SUM(grand_total), 0) as total_revenue
            FROM `tabSales Invoice`
            WHERE DATE(posting_date) = %s AND docstatus = 1
            """,
            (date,),
            as_dict=True
        )

        # Get new leads today
        new_leads_today = frappe.db.sql(
            """
            SELECT COUNT(*) as count
            FROM `tabLead`
            WHERE DATE(creation) = %s
            """,
            (date,),
            as_dict=True
        )
        new_leads_today = new_leads_today[0].count if new_leads_today else 0

        # Get approved COD documents today (if COD DocType exists)
        approved_cods = 0
        if frappe.db.exists("DocType", "COD Document"):
            approved_cods_result = frappe.db.sql(
                """
                SELECT COUNT(*) as count
                FROM `tabCOD Document`
                WHERE manager_approval_status = 'Approved'
                AND ceo_approval_status = 'Approved'
                AND DATE(creation) = %s
                """,
                (date,),
                as_dict=True
            )
            approved_cods = approved_cods_result[0].count if approved_cods_result else 0

        return {
            'status': 'success',
            'data': {
                'date': date,
                'agents': agents,
                'sales_data': sales_data,
                'summary': {
                    'total_sales': total_sales[0].total_count if total_sales else 0,
                    'total_revenue': total_sales[0].total_revenue if total_sales else 0,
                    'new_leads': new_leads_today,
                    'approved_cods': approved_cods
                }
            }
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'get_sales_dashboard_data')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


@frappe.whitelist(allow_guest=True)
def create_lead_from_website(lead_data):
    """
    Create lead from website/webhook
    Allows guest access for website integration

    Args:
        lead_data (dict): Lead information from website

    Returns:
        dict: Created lead data
    """
    try:
        # Parse lead data
        if isinstance(lead_data, str):
            import json
            lead_data = json.loads(lead_data)

        # Create new lead
        lead = frappe.get_doc({
            'doctype': 'Lead',
            'lead_name': lead_data.get('name') or lead_data.get('lead_name'),
            'email_id': lead_data.get('email'),
            'mobile_no': lead_data.get('phone') or lead_data.get('mobile_no'),
            'status': 'Open',
            'source': lead_data.get('source', 'Website')
        })

        # Add any additional fields
        for key, value in lead_data.items():
            if key not in ['name', 'lead_name', 'email', 'phone', 'mobile_no', 'source']:
                if hasattr(lead, key):
                    setattr(lead, key, value)

        lead.insert()
        frappe.db.commit()

        # Publish real-time notification
        frappe.publish_realtime(
            'new_lead',
            {
                'lead_id': lead.name,
                'lead_name': lead.lead_name,
                'status': lead.status,
                'source': 'Website',
                'timestamp': frappe.utils.now_datetime().isoformat()
            }
        )

        return {
            'status': 'success',
            'message': _('Lead created successfully'),
            'data': {
                'lead_id': lead.name,
                'lead_name': lead.lead_name
            }
        }
    except frappe.ValidationError as e:
        return {
            'status': 'error',
            'message': str(e),
            'code': 400
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'create_lead_from_website')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


@frappe.whitelist()
def get_daily_quote():
    """
    Get motivational quote for the day

    Returns:
        dict: Daily quote
    """
    try:
        import datetime

        quotes = [
            {
                "text": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                "author": "Winston Churchill"
            },
            {
                "text": "The only way to do great work is to love what you do.",
                "author": "Steve Jobs"
            },
            {
                "text": "Don't watch the clock; do what it does. Keep going.",
                "author": "Sam Levenson"
            },
            {
                "text": "The future belongs to those who believe in the beauty of their dreams.",
                "author": "Eleanor Roosevelt"
            },
            {
                "text": "It is during our darkest moments that we must focus to see the light.",
                "author": "Aristotle"
            }
        ]

        day = datetime.date.today().timetuple().tm_yday
        quote = quotes[day % len(quotes)]

        return {
            'status': 'success',
            'data': {
                'quote': quote['text'],
                'author': quote['author'],
                'date': frappe.utils.today()
            }
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'get_daily_quote')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


# ============================================================================
# COD DOCUMENT APIs
# ============================================================================

@frappe.whitelist()
def create_cod_document(sales_order=None, sales_invoice=None, customer=None, lead=None, sales_agent=None, documents=None):
    """
    Create a new COD document

    Args:
        sales_order (str): Sales Order ID
        sales_invoice (str): Sales Invoice ID
        customer (str): Customer ID (required)
        lead (str): Lead ID
        sales_agent (str): Sales Agent email (required)
        documents (list): List of document items with type and file

    Returns:
        dict: Created COD document data
    """
    try:
        # Validate required fields
        if not customer:
            return {
                'status': 'error',
                'message': _('Customer is required'),
                'code': 400
            }

        if not sales_agent:
            sales_agent = frappe.session.user

        if not documents or len(documents) == 0:
            return {
                'status': 'error',
                'message': _('At least one document must be uploaded'),
                'code': 400
            }

        # Parse documents if string
        if isinstance(documents, str):
            import json
            documents = json.loads(documents)

        # Create COD document
        cod_doc = frappe.get_doc({
            'doctype': 'COD Document',
            'customer': customer,
            'sales_order': sales_order,
            'sales_invoice': sales_invoice,
            'lead': lead,
            'sales_agent': sales_agent,
            'submission_date': frappe.utils.now_datetime(),
            'manager_approval_status': 'Pending',
            'ceo_approval_status': 'Pending'
        })

        # Add documents
        for doc_item in documents:
            cod_doc.append('cod_documents', {
                'document_type': doc_item.get('document_type'),
                'file_attachment': doc_item.get('file_attachment'),
                'upload_date': frappe.utils.now_datetime(),
                'status': 'Pending',
                'comments': doc_item.get('comments', '')
            })

        cod_doc.insert()
        cod_doc.submit()
        frappe.db.commit()

        return {
            'status': 'success',
            'message': _('COD Document created successfully'),
            'data': {
                'cod_id': cod_doc.name,
                'customer': customer
            }
        }
    except frappe.ValidationError as e:
        return {
            'status': 'error',
            'message': str(e),
            'code': 400
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'create_cod_document')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


@frappe.whitelist()
def get_cod_documents(filters=None, page=1, limit=20):
    """
    Get COD documents with filters

    Args:
        filters (dict): Filter conditions
        page (int): Page number
        limit (int): Records per page

    Returns:
        dict: COD documents list
    """
    try:
        filter_conditions = {}
        if filters:
            if isinstance(filters, str):
                import json
                filters = json.loads(filters)
            filter_conditions.update(filters)

        # Role-based filtering
        roles = frappe.get_roles()
        if "Sales Agent" in roles:
            filter_conditions['sales_agent'] = frappe.session.user

        # Get total count
        total = frappe.db.count('COD Document', filters=filter_conditions)

        # Get paginated results
        offset = (int(page) - 1) * int(limit)

        cod_docs = frappe.get_all(
            'COD Document',
            filters=filter_conditions,
            fields=[
                'name', 'customer', 'sales_order', 'sales_invoice', 'lead',
                'sales_agent', 'submission_date', 'manager_approval_status',
                'ceo_approval_status', 'creation', 'modified'
            ],
            limit_page_length=int(limit),
            offset=offset,
            order_by='modified desc'
        )

        return {
            'status': 'success',
            'data': {
                'total': total,
                'page': int(page),
                'limit': int(limit),
                'cod_documents': cod_docs
            }
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'get_cod_documents')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


@frappe.whitelist()
def approve_cod_document(cod_id, approval_type, status, comments=None):
    """
    Approve or reject COD document
    approval_type: 'manager' or 'ceo'

    Args:
        cod_id (str): COD Document ID
        approval_type (str): 'manager' or 'ceo'
        status (str): 'Approved' or 'Rejected'
        comments (str): Approval comments

    Returns:
        dict: Approval result
    """
    try:
        # Check permissions
        roles = frappe.get_roles()
        if approval_type == 'manager':
            if "Company Manager" not in roles and "Sales Manager" not in roles:
                return {
                    'status': 'error',
                    'message': _('You don\'t have permission to approve as Manager'),
                    'code': 403
                }
        elif approval_type == 'ceo':
            if "CEO" not in roles:
                return {
                    'status': 'error',
                    'message': _('You don\'t have permission to approve as CEO'),
                    'code': 403
                }

        # Get COD document
        cod_doc = frappe.get_doc('COD Document', cod_id)

        # Update approval status
        if approval_type == 'manager':
            cod_doc.manager_approval_status = status
            cod_doc.manager_approval_comments = comments
            if status == 'Approved':
                cod_doc.manager_approval_date = frappe.utils.now_datetime()
        elif approval_type == 'ceo':
            # Check if manager approved first
            if cod_doc.manager_approval_status != 'Approved':
                return {
                    'status': 'error',
                    'message': _('Manager approval is required before CEO approval'),
                    'code': 400
                }
            cod_doc.ceo_approval_status = status
            cod_doc.ceo_approval_comments = comments
            if status == 'Approved':
                cod_doc.ceo_approval_date = frappe.utils.now_datetime()

        cod_doc.save(ignore_permissions=True)
        frappe.db.commit()

        return {
            'status': 'success',
            'message': _('COD Document {status} successfully').format(status=status.lower()),
            'data': {
                'cod_id': cod_id,
                'approval_type': approval_type,
                'status': status
            }
        }
    except frappe.DoesNotExistError:
        return {
            'status': 'error',
            'message': _('COD Document not found'),
            'code': 404
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'approve_cod_document')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }


@frappe.whitelist()
def get_approved_cod_summary(date=None):
    """
    Get summary of approved COD documents for dashboard

    Args:
        date (str): Date filter (default: today)

    Returns:
        dict: Approved COD summary
    """
    try:
        if not date:
            date = frappe.utils.today()

        approved_cods = frappe.db.sql(
            """
            SELECT COUNT(*) as count, SUM(1) as total
            FROM `tabCOD Document`
            WHERE manager_approval_status = 'Approved'
            AND ceo_approval_status = 'Approved'
            AND DATE(creation) = %s
            """,
            (date,),
            as_dict=True
        )

        return {
            'status': 'success',
            'data': {
                'date': date,
                'approved_count': approved_cods[0].count if approved_cods else 0
            }
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'get_approved_cod_summary')
        return {
            'status': 'error',
            'message': str(e),
            'code': 500
        }
