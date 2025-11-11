# Roles & Permissions Guide

## Overview

Policy Pro uses role-based access control (RBAC) with custom permission queries to enforce granular access control.

---

## Role Hierarchy

```
System Manager
├── Company Manager
├── Sales Manager
└── Administrator (ERPNext)

Sales Manager
├── Sales User
└── Sales Agent

Company Manager
└── (Read-only access to sales operations)

CEO
└── (Full read access to all operations)

Sales User
└── (Limited to assigned operations)

Sales Agent
└── (Limited to owned documents)
```

---

## Role Definitions

### 1. System Manager

**Built-in ERPNext role** - Full system access

#### Permissions

| DocType | Read | Write | Create | Delete | Submit | Cancel | Amend |
|---|---|---|---|---|---|---|---|
| Lead | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| COD Document | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lead Assignment Rule | ✓ | ✓ | ✓ | ✓ | | | |
| Sales Order | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sales Invoice | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

### 2. Company Manager

**Purpose**: Approves COD documents, monitors operations

#### Permissions

| DocType | Read | Write | Create | Delete |
|---|---|---|---|---|
| Lead | ✓ | ✗ | ✗ | ✗ |
| COD Document | ✓ | ✓* | ✗ | ✗ |
| Sales Order | ✓ | ✗ | ✗ | ✗ |
| Sales Invoice | ✓ | ✗ | ✗ | ✗ |

**Notes**:
- Can approve/reject COD documents
- Read-only access to leads and orders
- Access to dashboard (read-only)

#### Custom Permissions

```python
# Can approve COD documents
@frappe.whitelist()
def approve_cod_document(cod_id, status, comments):
    if "Company Manager" not in frappe.get_roles():
        frappe.throw("Only Company Manager can approve")
```

---

### 3. CEO

**Purpose**: Final approval authority, full visibility

#### Permissions

| DocType | Read | Write | Create | Delete |
|---|---|---|---|---|
| Lead | ✓ | ✗ | ✗ | ✗ |
| COD Document | ✓ | ✓* | ✗ | ✗ |
| Sales Order | ✓ | ✗ | ✗ | ✗ |
| Sales Invoice | ✓ | ✗ | ✗ | ✗ |
| Dashboard | ✓ | ✗ | ✗ | ✗ |

**Notes**:
- Can approve/reject COD documents (final approval)
- Full visibility to all sales metrics
- Can view all agents' performance

---

### 4. Sales Manager

**Purpose**: Manages sales operations, assigns leads, approves COD

#### Permissions

| DocType | Read | Write | Create | Delete | Submit |
|---|---|---|---|---|---|
| Lead | ✓ | ✓ | ✓ | ✓ | |
| COD Document | ✓ | ✓ | ✓ | ✓ | ✓ |
| Lead Assignment Rule | ✓ | ✓ | ✓ | ✓ | |
| Sales Order | ✓ | ✓ | ✓ | | |
| Sales Invoice | ✓ | ✓ | ✓ | | |
| Dashboard | ✓ | | | | |

#### Capabilities

1. **Lead Management**
   - View all leads (no filter)
   - Edit all lead information
   - Assign/reassign leads
   - Change lead status
   - Set call-back dates and times
   - Add notes to leads

2. **COD Document Management**
   - View all COD documents
   - Create new COD documents
   - Edit COD documents (except approval fields)
   - Approve/reject COD documents
   - Add comments on documents

3. **Dashboard Access**
   - View complete sales dashboard
   - See all agents' metrics
   - Access historical data
   - Export reports

---

### 5. Sales User

**Purpose**: Distributes leads to agents, views won leads

#### Permissions

| DocType | Read | Write | Create | Delete |
|---|---|---|---|---|
| Lead | ✓* | ✗ | ✗ | ✗ |
| COD Document | ✓ | ✗ | ✗ | ✗ |
| Sales Order | ✓ | ✗ | ✗ | ✗ |
| Dashboard | ✓ | ✗ | ✗ | ✗ |

**Notes**:
- Read-only access to all leads
- Special access to assign leads to agents
- Can view won/converted leads only
- Access to dashboard (read-only)

#### Permission Query

```python
# Custom permission for Sales User
def get_lead_permission_query_conditions(user):
    if "Sales User" in frappe.get_roles(user):
        # Sales User can only see won/converted leads
        return "`tabLead`.status IN ('Converted', 'Won')"
    return "1=1"
```

#### Capabilities

1. **Lead Viewing**
   - View all leads with status = "Won" or "Converted"
   - Filter by date, agent, company
   - Sort by status, date
   - Search by customer name

2. **Lead Assignment**
   - Assign leads to sales agents
   - Reassign leads between agents
   - View assignment history
   - Add assignment notes

3. **Limited Dashboard**
   - View summary metrics
   - See agent performance
   - No detailed financial data

---

### 6. Sales Agent

**Purpose**: Creates and manages assigned leads, uploads COD documents

#### Permissions

| DocType | Read | Write | Create | Delete |
|---|---|---|---|---|
| Lead | ✓* | ✓* | ✓ | ✗ |
| COD Document | ✓* | ✓* | ✓ | ✗ |
| Sales Order | ✓ | | | |
| Sales Invoice | ✓ | | | |

**Notes**:
- Can only see/edit leads assigned to them
- Can create new leads
- Can upload COD documents
- Limited dashboard (personal metrics only)

#### Permission Query

```python
# Sales Agent sees only assigned leads
if "Sales Agent" in frappe.get_roles(user):
    return f"`tabLead`.owner = '{user}'"
```

#### Capabilities

1. **Lead Management**
   - Create new leads
   - Edit only assigned leads
   - Update lead status
   - Set call-back dates and times
   - Add notes to assigned leads
   - Cannot delete leads

2. **COD Document Upload**
   - Create COD documents for own sales
   - Upload required documents
   - View approval status
   - Receive notifications

3. **Personal Dashboard**
   - View personal sales metrics
   - See own target vs actual
   - Track personal performance
   - View upcoming call-backs

---

## Role Creation Setup

### Automatic Role Creation

On app installation, roles are automatically created:

```python
# policy_pro/utils/after_app_install.py

def create_roles():
    """Create custom roles for Policy Pro"""
    roles_to_create = [
        {
            "role_name": "Sales User",
            "desk_access": 1,
            "restrict_to_domain": None
        },
        {
            "role_name": "Sales Manager",
            "desk_access": 1,
            "restrict_to_domain": None
        },
        {
            "role_name": "Sales Agent",
            "desk_access": 1,
            "restrict_to_domain": None
        }
    ]

    for role_data in roles_to_create:
        if not frappe.db.exists("Role", role_data["role_name"]):
            role = frappe.get_doc({
                "doctype": "Role",
                **role_data
            })
            role.insert(ignore_permissions=True)
            frappe.db.commit()
```

### Manual Role Assignment

In ERPNext, assign roles to users via:

1. **Setup → Users** → Select User → Add Role
2. Or use bench command:

```bash
bench execute policy_pro.utils.assign_user_role --args='{"user":"user@example.com","role":"Sales Agent"}'
```

---

## DocType-Level Permissions

### Lead Permissions Matrix

```
┌──────────────────┬──────┬───────┬────────┬────────┬─────────┬──────────┐
│ Role             │ Read │ Write │ Create │ Delete │ Assign  │ Approve  │
├──────────────────┼──────┼───────┼────────┼────────┼─────────┼──────────┤
│ System Manager   │  ✓   │   ✓   │   ✓    │   ✓    │    ✓    │    ✓     │
│ Sales Manager    │  ✓   │   ✓   │   ✓    │   ✓    │    ✓    │    ✓     │
│ Sales User       │  ✓*  │   ✗   │   ✗    │   ✗    │    ✓    │    ✗     │
│ Sales Agent      │  ✓*  │   ✓*  │   ✓    │   ✗    │    ✗    │    ✗     │
│ Company Manager  │  ✓   │   ✗   │   ✗    │   ✗    │    ✗    │    ✗     │
│ CEO              │  ✓   │   ✗   │   ✗    │   ✗    │    ✗    │    ✗     │
└──────────────────┴──────┴───────┴────────┴────────┴─────────┴──────────┘

* = Filtered access (permission query applies)
```

### COD Document Permissions Matrix

```
┌──────────────────┬──────┬───────┬────────┬────────┬─────────┐
│ Role             │ Read │ Write │ Create │ Delete │ Approve │
├──────────────────┼──────┼───────┼────────┼────────┼─────────┤
│ System Manager   │  ✓   │   ✓   │   ✓    │   ✓    │    ✓    │
│ Sales Manager    │  ✓   │   ✓   │   ✓    │   ✓    │    ✓    │
│ Sales Agent      │  ✓*  │   ✓*  │   ✓    │   ✗    │    ✗    │
│ Company Manager  │  ✓   │   ✓** │   ✗    │   ✗    │    ✓    │
│ CEO              │  ✓   │   ✓** │   ✗    │   ✗    │    ✓    │
└──────────────────┴──────┴───────┴────────┴────────┼─────────┘

* = Only own documents
** = Approval fields only
```

---

## Field-Level Permissions

### Lead Fields by Role

#### Read-Only Fields (All Roles)

- `name` (ID)
- `creation` (Created date)
- `modified` (Last modified)

#### Company Manager & CEO (Read-Only)

- All lead fields are read-only

#### Sales Manager (Full Edit)

- All fields editable except:
  - `name` (Read-only)
  - `creation` (Read-only)

#### Sales User (No Edit)

- All fields read-only
- Can trigger assignment action (special permission)

#### Sales Agent (Edit Own)

- Can edit:
  - `status`
  - `custom_call_back_date`
  - `custom_call_back_time`
  - `custom_call_back_notes`
- Can read all fields
- Cannot edit:
  - `company_name` (read-only after creation)
  - `lead_name` (read-only after creation)

---

## Custom Permission Functions

### Permission Query Conditions

**Location**: `policy_pro/api/hooks.py`

```python
def get_lead_permission_query_conditions(user):
    """
    Filter leads based on user role
    Returns SQL WHERE clause condition
    """
    roles = frappe.get_roles(user)

    if "Sales User" in roles:
        # Sales User sees only Won/Converted leads
        return "`tabLead`.status IN ('Converted', 'Won')"

    elif "Sales Agent" in roles:
        # Sales Agent sees only assigned leads
        return f"`tabLead`.owner = '{user}'"

    elif "Company Manager" in roles or "CEO" in roles:
        # Managers and CEO see all leads
        return "1=1"

    return "0=1"  # Default: no access


def get_cod_document_permission_query_conditions(user):
    """Filter COD documents based on user role"""
    roles = frappe.get_roles(user)

    if "Sales Agent" in roles:
        # Sales Agent sees only own COD documents
        return f"`tabCOD Document`.sales_agent = '{user}'"

    elif "Sales User" in roles:
        # Sales User sees all COD documents
        return "1=1"

    # All other roles see all
    return "1=1"
```

### Custom API Permissions

```python
@frappe.whitelist()
def assign_lead_to_agent(lead_name, agent_email):
    """
    Assign lead - only Sales User/Manager can do this
    """
    allowed_roles = ["Sales User", "Sales Manager"]
    user_roles = frappe.get_roles()

    if not any(role in user_roles for role in allowed_roles):
        frappe.throw("You don't have permission to assign leads")

    # Process assignment
    lead = frappe.get_doc("Lead", lead_name)
    lead.owner = agent_email
    lead.save(ignore_permissions=True)
    return {"status": "success"}


@frappe.whitelist()
def approve_cod_document(cod_id, status, comments):
    """
    Approve COD - only Company Manager/CEO can do this
    """
    user_roles = frappe.get_roles()

    if "Company Manager" not in user_roles and "CEO" not in user_roles:
        frappe.throw("Only managers can approve COD documents")

    # Process approval
    cod = frappe.get_doc("COD Document", cod_id)
    if "CEO" in user_roles:
        cod.ceo_approval_status = status
    else:
        cod.manager_approval_status = status
    cod.save(ignore_permissions=True)
```

---

## Implementation in Code

### Frappe Hooks Configuration

```python
# policy_pro/hooks.py

permission_query_conditions = {
    "Lead": "policy_pro.api.hooks.get_lead_permission_query_conditions",
    "COD Document": "policy_pro.api.hooks.get_cod_document_permission_query_conditions"
}
```

### Frontend Permission Checks

```jsx
// frontend/src/app/hooks/useAuth.js

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        // Fetch current user roles
        frappe.call({
            method: 'frappe.client.get',
            args: { doctype: 'User', name: frappe.session.user },
            callback: (r) => {
                if (r.message) {
                    setRoles(r.message.roles.map(role => role.role));
                }
            }
        });
    }, []);

    const hasRole = (roleName) => roles.includes(roleName);
    const hasAnyRole = (roleNames) => roleNames.some(r => roles.includes(r));

    return { user, roles, hasRole, hasAnyRole };
};

// Usage in component
const { hasRole } = useAuth();

{hasRole('Sales Manager') && <AssignButton />}
{hasRole('Company Manager') && <ApproveButton />}
```

---

## Testing Permissions

### Test Scenarios

#### 1. Lead Assignment

```python
# Test: Sales User can assign leads
def test_sales_user_can_assign_lead():
    sales_user = create_test_user('sales_user@test.com', ['Sales User'])
    lead = create_test_lead()

    frappe.set_user(sales_user)
    result = frappe.call('policy_pro.api.sales.assign_lead',
        lead_name=lead.name,
        agent_email='agent@test.com'
    )
    assert result['status'] == 'success'

# Test: Sales Agent cannot assign leads
def test_sales_agent_cannot_assign_lead():
    sales_agent = create_test_user('agent@test.com', ['Sales Agent'])
    lead = create_test_lead()

    frappe.set_user(sales_agent)
    with pytest.raises(frappe.exceptions.PermissionError):
        frappe.call('policy_pro.api.sales.assign_lead', ...)
```

#### 2. COD Approval

```python
# Test: Company Manager can approve COD
def test_manager_can_approve_cod():
    manager = create_test_user('manager@test.com', ['Company Manager'])
    cod = create_test_cod()

    frappe.set_user(manager)
    result = frappe.call('policy_pro.api.sales.approve_cod_document',
        cod_id=cod.name,
        status='Approved'
    )
    assert result['status'] == 'success'
```

---

## Security Best Practices

1. **Always Verify Roles**
   - Check user roles before sensitive operations
   - Use `frappe.get_roles()` for role verification

2. **Use Permission Queries**
   - Implement permission queries for data filtering
   - Never rely on frontend checks alone

3. **Validate Ownership**
   - For Sales Agent, verify document ownership
   - Use `ignore_permissions=True` cautiously

4. **Log Sensitive Actions**
   - Log all approvals and assignments
   - Track who approved what and when

5. **API Whitelisting**
   - Only whitelist necessary methods
   - Include role checks in all custom APIs

---

## Troubleshooting

### User Can't See Leads

1. Check user roles: `frappe.get_roles('user@example.com')`
2. Verify permission query: Run custom query manually
3. Clear cache: `frappe.clear_cache()`

### Lead Assignment Not Working

1. Verify both users exist and are Sales Agent
2. Check if leads are assigned already
3. Check assignment rule is active

### COD Approval Failing

1. Verify user has Company Manager/CEO role
2. Check COD document status (must be submitted)
3. Verify all required fields are filled

---

## Summary Table

| Task | Required Role | Method |
|---|---|---|
| Create Lead | Sales Agent | Direct API |
| Edit Lead | Sales Manager, Sales Agent (own) | Direct API |
| Assign Lead | Sales User, Sales Manager | API: assign_lead |
| View Won Leads | Sales User | API: get_won_leads |
| Create COD | Sales Agent | API: create_cod_document |
| Approve COD | Company Manager | API: approve_cod_document |
| Final Approval | CEO | API: approve_cod_document |
| View Dashboard | Sales User, Sales Manager, CEO | API: get_sales_dashboard_data |

---

## Related Documentation

- [API Endpoints](./API_ENDPOINTS.md) - Permission checks in APIs
- [Architecture](./ARCHITECTURE.md) - Permission model overview
- [DocTypes](./DOCTYPES.md) - DocType structure
