# Backend Structure Guide

## Overview

The Policy Pro backend is built with Frappe Framework and follows a modular, scalable architecture. This guide describes the folder structure, module organization, and best practices.

## Directory Tree

```
policy_pro/
├── api/                             # API layer - REST endpoints
│   ├── __init__.py
│   ├── hooks.py                    # Document event handlers
│   ├── sales.py                    # Sales module APIs
│   ├── custom.py                   # Custom business logic APIs
│   ├── auth.py                     # Authentication utilities
│   ├── theme.py                    # Theme configuration APIs
│   ├── utils.py                    # API helper functions
│   ├── doctype.py                  # DocType utilities
│   └── validators/                 # Validation functions
│       ├── __init__.py
│       ├── lead_validator.py       # Lead validation
│       └── cod_validator.py        # COD validation
│
├── policy_pro/
│   ├── __init__.py
│   └── custom/                      # Custom DocType definitions (JSON)
│       ├── lead.json               # Extended Lead DocType
│       ├── cod_document.json       # COD Document DocType
│       ├── cod_document_item.json  # COD Document Item child table
│       ├── lead_assignment_rule.json  # Lead assignment config
│       └── sales_dashboard_config.json # Dashboard config
│
├── utils/                           # Utility & setup functions
│   ├── __init__.py
│   ├── after_app_install.py        # App initialization
│   ├── setup_roles.py              # Role creation
│   ├── setup_permissions.py        # Permission setup
│   ├── setup_email_templates.py    # Email template setup
│   ├── data_migration.py           # Data migration utilities
│   └── helpers.py                  # General helpers
│
├── templates/                       # Frappe templates
│   ├── __init__.py
│   └── pages/                      # Custom pages (if any)
│       └── __init__.py
│
├── hooks.py                         # Main app hooks configuration
├── __init__.py
└── README.md                        # Backend documentation
```

---

## Module Structure Details

### 1. API Layer (`api/`)

The API layer contains all REST endpoints (Frappe whitelisted methods).

#### `api/hooks.py` - Document Event Handlers

Handles lifecycle events for custom DocTypes.

```python
# policy_pro/api/hooks.py

import frappe
from frappe import _

# Document event configuration
doc_events = {
    "Lead": {
        "validate": "policy_pro.api.hooks.validate_lead_completeness",
        "after_insert": "policy_pro.api.hooks.assign_lead_to_agent",
        "on_update": "policy_pro.api.hooks.track_lead_changes"
    },
    "COD Document": {
        "on_submit": "policy_pro.api.hooks.notify_cod_submission",
        "on_update_after_submit": "policy_pro.api.hooks.update_cod_status"
    }
}

# Permission query configuration
permission_query_conditions = {
    "Lead": "policy_pro.api.hooks.get_lead_permission_conditions",
    "COD Document": "policy_pro.api.hooks.get_cod_document_permission_conditions"
}

# Event Handlers

def validate_lead_completeness(doc, method):
    """
    Validate Lead has all required fields
    Raises frappe.ValidationError if validation fails
    """
    mandatory_fields = ['lead_name', 'company_name']

    for field in mandatory_fields:
        if not doc.get(field):
            frappe.throw(
                _("Field '{field}' is mandatory").format(field=field),
                frappe.ValidationError
            )

    # Validate at least one contact method
    if not doc.get('email_id') and not doc.get('mobile_no'):
        frappe.throw(
            _("Either Email ID or Mobile No is required"),
            frappe.ValidationError
        )


def assign_lead_to_agent(doc, method):
    """
    Auto-assign new lead to sales agent based on rules
    """
    from policy_pro.api.assignment import AssignmentEngine

    assignment_engine = AssignmentEngine()
    agent = assignment_engine.get_best_assignment(doc)

    if agent:
        doc.owner = agent
        doc.add_comment(
            "Comment",
            _("Lead auto-assigned to {agent}").format(agent=agent)
        )
        frappe.db.commit()


def get_lead_permission_conditions(user):
    """
    Custom permission query for Lead DocType
    Returns SQL WHERE clause condition
    """
    roles = frappe.get_roles(user)

    if "Sales User" in roles:
        # Sales User sees only Won/Converted leads
        return "`tabLead`.status IN ('Converted', 'Won')"

    elif "Sales Agent" in roles:
        # Sales Agent sees only assigned leads
        return f"`tabLead`.owner = '{user}'"

    # All other roles (Manager, CEO) see everything
    return "1=1"


def notify_cod_submission(doc, method):
    """
    Send notification email when COD is submitted
    """
    from policy_pro.api.notifications import send_cod_notification

    send_cod_notification(doc)
```

#### `api/sales.py` - Sales Module APIs

All sales-related REST endpoints.

```python
# policy_pro/api/sales.py

import frappe
from frappe import _
from frappe.client import get_list, get_value, set_value
from frappe.utils import getdate, now_datetime

# Lead Management APIs

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
        dict: {total, page, limit, leads}
    """
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
        fields=['name', 'lead_name', 'email_id', 'mobile_no', 'status', 'owner'],
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


@frappe.whitelist()
def assign_lead(lead_name, agent_email):
    """
    Manually assign lead to a sales agent

    Args:
        lead_name (str): Lead document ID
        agent_email (str): Target agent's email

    Returns:
        dict: Assignment result
    """
    # Verify permission
    if "Sales User" not in frappe.get_roles() and "Sales Manager" not in frappe.get_roles():
        frappe.throw(_("You don't have permission to assign leads"))

    # Get and update lead
    lead = frappe.get_doc('Lead', lead_name)
    old_owner = lead.owner
    lead.owner = agent_email
    lead.save(ignore_permissions=True)

    # Log assignment
    lead.add_comment(
        'Comment',
        _("Lead reassigned from {old} to {new}").format(
            old=old_owner,
            new=agent_email
        )
    )

    frappe.db.commit()

    return {
        'status': 'success',
        'message': _("Lead assigned successfully"),
        'data': {
            'lead_id': lead_name,
            'assigned_to': agent_email
        }
    }


@frappe.whitelist()
def get_won_leads():
    """
    Get won/converted leads (Sales User specific)

    Returns:
        list: Won leads with relevant fields
    """
    if "Sales User" not in frappe.get_roles():
        frappe.throw(_("You don't have permission to view this data"))

    leads = frappe.get_all(
        'Lead',
        filters={'status': ['in', ['Converted', 'Won']]},
        fields=['name', 'lead_name', 'status', 'owner', 'email_id', 'mobile_no']
    )

    return {
        'status': 'success',
        'data': leads
    }


# Sales Dashboard APIs

@frappe.whitelist()
def get_sales_dashboard_data(date=None):
    """
    Get complete sales dashboard data

    Args:
        date (str): Dashboard date (default: today)

    Returns:
        dict: Dashboard data with agents, metrics, targets
    """
    if not date:
        date = frappe.utils.today()

    # Get sales agents
    agents = frappe.get_all(
        'User',
        filters={'enabled': 1, 'user_type': 'Website User'},
        fields=['name', 'full_name', 'user_image'],
        limit_page_length=0
    )

    # Get daily sales
    sales_data = frappe.db.sql(
        """
        SELECT
            COUNT(*) as total_sales,
            SUM(grand_total) as total_revenue,
            owner as sales_agent
        FROM `tabSales Invoice`
        WHERE posting_date = %s AND docstatus = 1
        GROUP BY owner
        """,
        (date,),
        as_dict=True
    )

    # Get targets
    targets = get_sales_targets(date)

    # Calculate summary
    summary = calculate_summary(sales_data, targets)

    return {
        'status': 'success',
        'data': {
            'agents': agents,
            'sales_data': sales_data,
            'targets': targets,
            'summary': summary
        }
    }


@frappe.whitelist()
def get_daily_quote():
    """
    Get motivational quote for the day

    Returns:
        dict: {quote, author, date}
    """
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
        }
        # Add more quotes
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


# COD Document APIs

@frappe.whitelist()
def create_cod_document(sales_order_id, documents, customer_id, lead_id=None):
    """
    Create a new COD document

    Args:
        sales_order_id (str): Sales Order ID
        documents (list): List of document uploads
        customer_id (str): Customer ID
        lead_id (str): Optional Lead ID

    Returns:
        dict: Created COD document data
    """
    # Create COD Document
    cod = frappe.get_doc({
        'doctype': 'COD Document',
        'sales_order': sales_order_id,
        'customer': customer_id,
        'lead': lead_id,
        'sales_agent': frappe.session.user,
        'submission_date': now_datetime(),
        'cod_documents': documents
    })

    cod.insert()
    cod.submit()

    return {
        'status': 'success',
        'message': _("COD Document created successfully"),
        'data': {
            'cod_id': cod.name,
            'sales_order': sales_order_id
        }
    }


@frappe.whitelist()
def approve_cod_document(cod_id, status, comments=None):
    """
    Approve or reject COD document

    Args:
        cod_id (str): COD Document ID
        status (str): 'Approved' or 'Rejected'
        comments (str): Approval comments

    Returns:
        dict: Update result
    """
    roles = frappe.get_roles()

    if "Company Manager" not in roles and "CEO" not in roles:
        frappe.throw(_("You don't have permission to approve COD documents"))

    cod = frappe.get_doc('COD Document', cod_id)

    if "CEO" in roles:
        cod.ceo_approval_status = status
        cod.ceo_comments = comments
    else:
        cod.manager_approval_status = status
        cod.manager_comments = comments

    cod.save()

    return {
        'status': 'success',
        'message': _("COD Document updated"),
        'data': {'cod_id': cod_id}
    }


# Helper Functions

def calculate_summary(sales_data, targets):
    """Calculate summary metrics"""
    total_sales = sum(s['total_sales'] for s in sales_data if s['total_sales'])
    total_revenue = sum(s['total_revenue'] for s in sales_data if s['total_revenue'])

    return {
        'total_sales': total_sales,
        'total_revenue': total_revenue,
        'target_achieved': total_revenue >= sum(t['target_amount'] for t in targets)
    }


def get_sales_targets(date):
    """Get sales targets for date"""
    targets = frappe.get_all(
        'Sales Target',
        filters={'fiscal_year': frappe.utils.get_fiscal_year(date)[0]},
        fields=['sales_agent', 'target_amount']
    )
    return targets
```

#### `api/validators/` - Validation Functions

Separated validation logic for reusability.

```python
# policy_pro/api/validators/lead_validator.py

import frappe
from frappe import _

class LeadValidator:
    """Lead document validation"""

    @staticmethod
    def validate_mandatory_fields(doc):
        """Validate required fields"""
        mandatory = ['lead_name', 'company_name']
        for field in mandatory:
            if not doc.get(field):
                frappe.throw(f"Field {field} is required")

    @staticmethod
    def validate_contact_info(doc):
        """Validate at least one contact method"""
        if not doc.get('email_id') and not doc.get('mobile_no'):
            frappe.throw("Either Email or Phone is required")

    @staticmethod
    def validate_callback_date(doc):
        """Validate call-back date if status is Call Back"""
        if doc.status == 'Call Back':
            if not doc.get('custom_call_back_date'):
                frappe.throw("Call Back Date is required")

            if doc.custom_call_back_date < frappe.utils.today():
                frappe.throw("Call Back Date must be in the future")
```

### 2. Utils & Setup (`utils/`)

#### `utils/after_app_install.py` - App Initialization

Runs after app installation to set up roles, permissions, etc.

```python
# policy_pro/utils/after_app_install.py

import frappe
from policy_pro.utils.setup_roles import setup_roles
from policy_pro.utils.setup_permissions import setup_permissions
from policy_pro.utils.setup_email_templates import setup_email_templates

@frappe.whitelist()
def after_install():
    """
    Called when app is first installed
    Set up roles, permissions, and initial data
    """
    frappe.set_user('Administrator')

    # Create roles
    setup_roles()

    # Set permissions
    setup_permissions()

    # Create email templates
    setup_email_templates()

    frappe.db.commit()
    frappe.msgprint("Policy Pro setup completed successfully!")


@frappe.whitelist()
def setup_demo_data():
    """
    Create sample data for testing (optional)
    """
    # Create sample leads
    # Create sample targets
    # Create sample COD documents
    pass
```

#### `utils/setup_roles.py` - Role Creation

```python
# policy_pro/utils/setup_roles.py

import frappe
from frappe import _

def setup_roles():
    """Create required roles"""

    roles_to_create = [
        {
            'role_name': 'Sales User',
            'desk_access': 1,
            'restrict_to_domain': None
        },
        {
            'role_name': 'Sales Manager',
            'desk_access': 1,
            'restrict_to_domain': None
        },
        {
            'role_name': 'Sales Agent',
            'desk_access': 1,
            'restrict_to_domain': None
        }
    ]

    for role_data in roles_to_create:
        if not frappe.db.exists('Role', role_data['role_name']):
            role = frappe.get_doc({
                'doctype': 'Role',
                **role_data
            })
            role.insert(ignore_permissions=True)
            frappe.db.commit()
            print(f"Created role: {role_data['role_name']}")
```

### 3. Custom DocTypes (`policy_pro/custom/`)

JSON files defining custom DocTypes.

```json
// policy_pro/policy_pro/custom/lead.json
{
  "doctype": "Lead",
  "custom": 1,
  "fields": [
    {
      "fieldname": "custom_call_back_date",
      "fieldtype": "Date",
      "label": "Call Back Date",
      "depends_on": "eval:doc.status == 'Call Back'"
    },
    {
      "fieldname": "custom_call_back_time",
      "fieldtype": "Time",
      "label": "Call Back Time",
      "depends_on": "eval:doc.status == 'Call Back'"
    },
    {
      "fieldname": "custom_call_back_notes",
      "fieldtype": "Small Text",
      "label": "Call Back Notes"
    },
    {
      "fieldname": "custom_assigned_agent",
      "fieldtype": "Link",
      "options": "User",
      "label": "Assigned Agent",
      "read_only": 1
    },
    {
      "fieldname": "custom_assignment_date",
      "fieldtype": "Datetime",
      "label": "Assignment Date",
      "read_only": 1
    }
  ],
  "property_setters": [
    {
      "property": "status",
      "value": "Pending\nOpen\nContacted\nInterested\nCall Back\nAlready Purchased Insurance\nNot Interested\nConverted\nWon\nLost"
    }
  ]
}
```

---

## Main App Hooks (`hooks.py`)

Configuration for the Frappe app.

```python
# policy_pro/hooks.py

app_name = "policy_pro"
app_title = "Policy Pro"
app_publisher = "Your Company"
app_description = "CRM and Sales Management"
app_icon = "icon"
app_color = "#4F46E5"
app_email = "support@example.com"
app_url = "https://example.com"
app_version = "0.0.1"

before_install = "policy_pro.api.hooks.before_install"
after_install = "policy_pro.utils.after_app_install.after_install"

# Document event handlers
doc_events = {
    "Lead": {
        "validate": "policy_pro.api.hooks.validate_lead_completeness",
        "after_insert": "policy_pro.api.hooks.assign_lead_to_agent"
    },
    "COD Document": {
        "on_submit": "policy_pro.api.hooks.notify_cod_submission"
    }
}

# Permission query conditions
permission_query_conditions = {
    "Lead": "policy_pro.api.hooks.get_lead_permission_conditions",
    "COD Document": "policy_pro.api.hooks.get_cod_document_permission_conditions"
}

# Fixtures (export documents to file)
fixtures = [
    {
        "doctype": "Custom Field",
        "filters": [["dt", "in", ["Lead", "COD Document"]]]
    },
    {
        "doctype": "Property Setter",
        "filters": [["doc_type", "in", ["Lead", "COD Document"]]]
    }
]

# Website routes
website_route_rules = [
    {"route": "/app/lead", "name": "lead"},
    {"route": "/app/dashboard", "name": "dashboard"}
]
```

---

## Naming Conventions

### Files

```
api/sales.py               # Module APIs
api/hooks.py              # Document events
api/validators/lead_validator.py  # Validation logic
utils/setup_roles.py      # Setup utilities
policy_pro/custom/lead.json  # Custom DocType
```

### Functions

```python
# Public API (whitelisted)
@frappe.whitelist()
def get_leads(status=None, limit=20):
    pass

# Private helper
def calculate_summary(data):
    pass

# Event handler
def validate_lead_completeness(doc, method):
    pass

# Hook function
def get_lead_permission_conditions(user):
    pass
```

### Variables

```python
# Constants
LEAD_STATUSES = ['Open', 'Contacted', 'Won', 'Lost']
DOCUMENT_TYPES = ['Car Mulkiya', 'Driving License', 'Emirates ID']

# Queries
leads = frappe.get_all('Lead', filters={'status': 'Open'})
total = frappe.db.count('Lead')
```

---

## Best Practices

### 1. Error Handling

```python
# ✅ Good - Clear error messages
if not email and not phone:
    frappe.throw(
        _("Either Email or Phone is required"),
        frappe.ValidationError
    )

# ❌ Bad - Generic errors
if not email:
    raise Exception("Invalid email")
```

### 2. Permissions

```python
# ✅ Good - Check roles before sensitive operations
if "Sales Manager" not in frappe.get_roles():
    frappe.throw(_("You don't have permission"))

# ❌ Bad - No permission checks
frappe.get_doc('Lead', lead_id).save()
```

### 3. Database Queries

```python
# ✅ Good - Specific fields and filters
leads = frappe.get_all(
    'Lead',
    filters={'status': 'Open'},
    fields=['name', 'lead_name', 'email_id'],
    limit_page_length=20
)

# ❌ Bad - No filtering or limits
leads = frappe.get_all('Lead')
```

### 4. API Responses

```python
# ✅ Good - Consistent response format
return {
    'status': 'success',
    'message': _("Operation completed"),
    'data': { 'id': lead_id }
}

# ❌ Bad - Inconsistent format
return { 'lead_id': lead_id }
return lead_doc
```

### 5. Logging

```python
# ✅ Good - Log important actions
frappe.logger().info(f"Lead {lead_id} assigned to {agent}")

# ❌ Bad - No logging
lead.save()
```

---

## Testing Backend APIs

### Using Frappe CLI

```bash
# Get leads
bench execute policy_pro.api.sales.get_leads

# Get won leads
bench execute policy_pro.api.sales.get_won_leads

# Get dashboard data
bench execute policy_pro.api.sales.get_sales_dashboard_data
```

### Using cURL

```bash
# Authentication
curl -X POST http://localhost:8000/api/method/frappe.auth.login \
  -d "usr=user@example.com&pwd=password"

# Get leads
curl -X GET "http://localhost:8000/api/method/policy_pro.api.sales.get_leads?status=Open" \
  -b "cookies.txt"

# Assign lead
curl -X POST "http://localhost:8000/api/method/policy_pro.api.sales.assign_lead" \
  -H "Content-Type: application/json" \
  -d '{"lead_name": "LEAD-001", "agent_email": "agent@example.com"}' \
  -b "cookies.txt"
```

---

## Performance Optimization

### Database Query Optimization

```python
# ✅ Use select() to get only needed fields
leads = frappe.get_all(
    'Lead',
    fields=['name', 'lead_name', 'status'],  # Specific fields
    limit_page_length=20
)

# ❌ Get all fields (slower)
leads = frappe.get_all('Lead', limit_page_length=20)
```

### Caching

```python
# ✅ Cache frequently accessed data
@frappe.whitelist(allow_cache=True)
def get_sales_targets(date):
    # This will be cached for 24 hours
    return frappe.get_all('Sales Target')

# Or manually cache
def get_agents():
    return frappe.cache().get_value(
        'sales_agents',
        lambda: frappe.get_all('User', filters={'role': 'Sales Agent'})
    )
```

### Asynchronous Tasks

```python
# ✅ Use async task for heavy operations
frappe.enqueue(
    'policy_pro.api.sales.send_cod_notification',
    queue='long',
    timeout=300,
    cod_id=cod.name
)

def send_cod_notification(cod_id):
    # Heavy operation (email, etc.)
    cod = frappe.get_doc('COD Document', cod_id)
    # Send notifications
```

---

## File Organization Rules

1. **Keep modules focused** - Each file should have single responsibility
2. **Avoid circular imports** - Use import at function level if needed
3. **Use relative imports** - `from policy_pro.api import sales`
4. **Group by feature** - All lead-related code in one module
5. **Separate concerns** - API, validation, helpers in different files

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system design
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API documentation
- [ROLES_PERMISSIONS.md](./ROLES_PERMISSIONS.md) - Permission setup
- [DOCTYPES.md](./DOCTYPES.md) - DocType specifications

---

## Quick Reference

| Task | File | Function |
|---|---|---|
| Add API endpoint | `api/sales.py` | `@frappe.whitelist()` |
| Add validation | `api/validators/` | `validate_*()` |
| Handle document event | `api/hooks.py` | `doc_events` dict |
| Setup on install | `utils/after_app_install.py` | `after_install()` |
| Create custom role | `utils/setup_roles.py` | `setup_roles()` |
| Define DocType | `policy_pro/custom/*.json` | JSON definition |
| Configure app | `hooks.py` | `app_name`, `doc_events`, etc. |

---

## Summary

The backend structure provides:

- **Clear separation of concerns** - API, validation, utilities
- **Reusable components** - Validators, helpers
- **Standardized patterns** - Consistent naming and structure
- **Easy testing** - Isolated functions
- **Scalability** - Easy to add new modules
- **Maintainability** - Clear organization

This enables backend developers to work efficiently on different features while maintaining code quality.
