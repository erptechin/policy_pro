# Custom DocTypes Reference

## Overview

This document describes all custom and extended DocTypes used in Policy Pro.

---

## 1. Lead (Extended)

**Type**: Standard DocType (Extended)
**Module**: CRM
**Location**: `policy_pro/policy_pro/custom/lead.json`

### Extended Fields

#### Call-Back Management

| Field Name | Type | Label | Options | Mandatory | Depends On |
|---|---|---|---|---|---|
| `custom_call_back_date` | Date | Call Back Date | | No | `eval:doc.status == 'Call Back'` |
| `custom_call_back_time` | Time | Call Back Time | | No | `eval:doc.status == 'Call Back'` |
| `custom_call_back_notes` | Small Text | Call Back Notes | | No | |

#### Assignment Tracking

| Field Name | Type | Label | Options | Mandatory |
|---|---|---|---|---|
| `custom_assigned_agent` | Link | Assigned Agent | User | No |
| `custom_assignment_date` | Datetime | Assignment Date | | No |

### Custom Status Options

```
Pending
Open
Contacted
Interested
Call Back
Already Purchased Insurance
Not Interested
Converted
Won
Lost
```

### Validation Rules

- All mandatory fields must be filled before save:
  - `lead_name` (Customer name)
  - `company_name` (Company name)
  - `email_id` or `mobile_no` (At least one contact method)

- When status is "Call Back":
  - `custom_call_back_date` is required
  - Date must be in the future

- When converting to "Won":
  - All car details must be present

### Document Events

| Event | Handler | Purpose |
|---|---|---|
| `validate` | `validate_lead_completeness()` | Ensure all required fields are filled |
| `after_insert` | `assign_lead_to_agent()` | Auto-assign lead to sales agent |
| `on_update` | `update_assignment_tracking()` | Track assignment changes |

### Permissions

| Role | Read | Write | Create | Delete |
|---|---|---|---|---|
| Sales User | ✓ (filtered) | ✗ | ✗ | ✗ |
| Sales Manager | ✓ | ✓ | ✓ | ✓ |
| Sales Agent | ✓ (assigned) | ✓ (assigned) | ✓ | ✗ |
| Company Manager | ✓ | ✗ | ✗ | ✗ |
| CEO | ✓ | ✗ | ✗ | ✗ |
| System Manager | ✓ | ✓ | ✓ | ✓ |

### Related Documents

- **Link to**: Sales Order, Sales Invoice, Customer, User (for assignment)
- **Child Tables**: None
- **Workflows**: Manual status management + Auto-assignment

### Usage Examples

```python
# Create a new lead
lead = frappe.get_doc({
    "doctype": "Lead",
    "lead_name": "John Doe",
    "company_name": "ABC Corp",
    "email_id": "john@example.com",
    "mobile_no": "+971501234567",
    "status": "Open"
})
lead.insert()

# Set call-back
lead.status = "Call Back"
lead.custom_call_back_date = frappe.utils.add_days(frappe.utils.today(), 3)
lead.custom_call_back_time = "14:30"
lead.custom_call_back_notes = "Follow up on interest"
lead.save()
```

---

## 2. COD Document (New)

**Type**: Standard DocType
**Module**: Selling
**Location**: `policy_pro/policy_pro/custom/cod_document.json`

### Fields

#### Header Fields

| Field Name | Type | Label | Options | Mandatory | Read Only |
|---|---|---|---|---|---|
| `name` | ID | ID | | ✓ | ✓ |
| `status` | Select | Status | Draft, Submitted, Approved | | ✓ |
| `docstatus` | Int | Document Status | | | ✓ |

#### Link Fields

| Field Name | Type | Label | Options | Mandatory |
|---|---|---|---|---|
| `sales_order` | Link | Sales Order | Sales Order | |
| `sales_invoice` | Link | Sales Invoice | Sales Invoice | |
| `customer` | Link | Customer | Customer | ✓ |
| `lead` | Link | Lead | Lead | |
| `sales_agent` | Link | Sales Agent | User | ✓ |

#### Approval Fields

| Field Name | Type | Label | Options | Mandatory |
|---|---|---|---|---|
| `submission_date` | Datetime | Submission Date | | ✓ |
| `manager_approval_status` | Select | Manager Approval | Pending, Approved, Rejected | |
| `manager_approval_date` | Datetime | Manager Approval Date | | |
| `manager_comments` | Text Editor | Manager Comments | | |
| `ceo_approval_status` | Select | CEO Approval | Pending, Approved, Rejected | |
| `ceo_approval_date` | Datetime | CEO Approval Date | | |
| `ceo_comments` | Text Editor | CEO Comments | | |
| `approval_workflow_status` | Select | Overall Status | Pending, Approved, Rejected | ✓ |

#### Child Table: COD Documents

| Field Name | Type | Label | Options | Mandatory |
|---|---|---|---|---|
| `cod_documents` | Table | COD Documents | COD Document Item | ✓ |

### COD Document Item (Child DocType)

**Location**: `policy_pro/policy_pro/custom/cod_document_item.json`

| Field Name | Type | Label | Options | Mandatory |
|---|---|---|---|---|
| `document_type` | Select | Document Type | Car Mulkiya, Driving License, Emirates ID, Invoice, Credit Note, Debit Note, Car Passing | ✓ |
| `file_attachment` | Attach | File Attachment | | ✓ |
| `upload_date` | Datetime | Upload Date | | ✓ |
| `file_size` | Data | File Size | | |
| `status` | Select | Status | Pending, Approved, Rejected | |
| `reviewer_comments` | Small Text | Reviewer Comments | | |

### Workflow States

```
Draft
  ↓ (Submit)
Submitted (pending_manager_approval)
  ↓ (Manager Approve)
pending_ceo_approval
  ↓ (CEO Approve)
Approved
  ↓ (Reject)
Rejected
```

### Document Events

| Event | Handler | Purpose |
|---|---|---|
| `on_submit` | `notify_cod_submission()` | Send email to manager & CEO |
| `on_update_after_submit` | `check_approval_completion()` | Check if both approvals done |
| `after_insert` | `set_submission_date()` | Set submission timestamp |

### Permissions

| Role | Read | Write | Create | Delete | Submit |
|---|---|---|---|---|---|
| Sales Agent | ✓ (own) | ✓ (own) | ✓ | ✗ | ✓ |
| Sales Manager | ✓ | ✓ | ✓ | ✓ | ✓ |
| Company Manager | ✓ | ✓ (approval only) | ✗ | ✗ | ✗ |
| CEO | ✓ | ✓ (approval only) | ✗ | ✗ | ✗ |
| System Manager | ✓ | ✓ | ✓ | ✓ | ✓ |

### Custom Methods

#### 1. Approve Document

```python
@frappe.whitelist()
def approve_cod_document(cod_id, approver_role, status, comments):
    """Approve/reject COD document"""
    cod = frappe.get_doc("COD Document", cod_id)

    if approver_role == "Company Manager":
        cod.manager_approval_status = status
        cod.manager_comments = comments
        cod.manager_approval_date = frappe.utils.now()
    elif approver_role == "CEO":
        cod.ceo_approval_status = status
        cod.ceo_comments = comments
        cod.ceo_approval_date = frappe.utils.now()

    cod.save(ignore_permissions=True)
    return {"status": "success"}
```

#### 2. Get Approval Status

```python
@frappe.whitelist()
def get_cod_approval_status(cod_id):
    """Get detailed approval status"""
    cod = frappe.db.get_value(
        "COD Document",
        cod_id,
        [
            "manager_approval_status",
            "ceo_approval_status",
            "approval_workflow_status"
        ],
        as_dict=True
    )
    return cod
```

### Related Documents

- **Sales Order**: One COD Document per Sales Order
- **Customer**: Always required
- **Lead**: Optional, for tracking lead conversion
- **User (Sales Agent)**: Who uploaded the COD

### Email Templates Required

1. **COD Submission Notification**
   - To: Manager, CEO
   - Content: Lead name, customer name, documents pending review
   - Action: Link to approve/reject

2. **COD Approval Notification**
   - To: Sales Agent
   - Content: Approval status, comments
   - Action: View approved COD

---

## 3. Lead Assignment Rule (Optional)

**Type**: Standard DocType
**Location**: `policy_pro/policy_pro/custom/lead_assignment_rule.json`

### Purpose

Configuration for automatic lead assignment to sales agents based on rules.

### Fields

| Field Name | Type | Label | Options | Mandatory |
|---|---|---|---|---|
| `rule_name` | Data | Rule Name | | ✓ |
| `assignment_method` | Select | Assignment Method | Round Robin, Territory-based, Skill-based, Load Balancing | ✓ |
| `territory` | Link | Territory | Territory | |
| `sales_agent` | Link | Sales Agent | User | ✓ |
| `priority` | Int | Priority | | |
| `max_leads_per_day` | Int | Max Leads Per Day | | |
| `is_active` | Check | Active | | ✓ |
| `source_filter` | Select | Lead Source | Website, Phone, Email, Walk-in, Referral | |

### Assignment Methods

1. **Round Robin**: Distribute leads equally among agents
2. **Territory-based**: Assign based on customer location
3. **Skill-based**: Assign based on agent skills/expertise
4. **Load Balancing**: Assign to agent with least leads

### Usage

```python
def get_assignment_rule(lead_doc):
    """Get applicable assignment rule for lead"""
    rules = frappe.get_all(
        "Lead Assignment Rule",
        filters={
            "is_active": 1,
            "assignment_method": ["in", ["Round Robin", "Territory-based"]],
            "source_filter": ["in", [lead_doc.source, None]]
        },
        order_by="priority desc"
    )

    if rules:
        return apply_assignment_logic(lead_doc, rules[0])
    return None
```

---

## 4. Sales Dashboard Config (Optional)

**Type**: Single DocType
**Location**: `policy_pro/policy_pro/custom/sales_dashboard_config.json`

### Purpose

Centralized configuration for dashboard display settings.

### Fields

| Field Name | Type | Label |
|---|---|---|
| `enable_real_time_updates` | Check | Enable Real-Time Updates |
| `dashboard_refresh_interval` | Int | Refresh Interval (seconds) |
| `quote_rotation_enabled` | Check | Enable Daily Quotes |
| `enable_agent_photos` | Check | Show Agent Photos |
| `currency` | Link | Currency |
| `fiscal_year` | Link | Default Fiscal Year |

---

## Database Schema Summary

### Lead Extensions

```sql
ALTER TABLE `tabLead` ADD COLUMN `custom_call_back_date` DATE;
ALTER TABLE `tabLead` ADD COLUMN `custom_call_back_time` TIME;
ALTER TABLE `tabLead` ADD COLUMN `custom_call_back_notes` LONGTEXT;
ALTER TABLE `tabLead` ADD COLUMN `custom_assigned_agent` VARCHAR(255);
ALTER TABLE `tabLead` ADD COLUMN `custom_assignment_date` DATETIME;
```

### New Tables

```sql
CREATE TABLE `tabCOD Document` (
  `name` VARCHAR(255) PRIMARY KEY,
  `sales_order` VARCHAR(255),
  `sales_invoice` VARCHAR(255),
  `customer` VARCHAR(255),
  `lead` VARCHAR(255),
  `sales_agent` VARCHAR(255),
  `submission_date` DATETIME,
  `manager_approval_status` VARCHAR(50),
  `manager_approval_date` DATETIME,
  `manager_comments` LONGTEXT,
  `ceo_approval_status` VARCHAR(50),
  `ceo_approval_date` DATETIME,
  `ceo_comments` LONGTEXT,
  `approval_workflow_status` VARCHAR(50),
  `docstatus` INT,
  `creation` DATETIME,
  `modified` DATETIME,
  KEY `sales_order` (`sales_order`),
  KEY `customer` (`customer`)
);

CREATE TABLE `tabCOD Document Item` (
  `name` VARCHAR(255) PRIMARY KEY,
  `parent` VARCHAR(255),
  `document_type` VARCHAR(100),
  `file_attachment` VARCHAR(255),
  `upload_date` DATETIME,
  `file_size` VARCHAR(100),
  `status` VARCHAR(50),
  `reviewer_comments` TEXT,
  FOREIGN KEY (`parent`) REFERENCES `tabCOD Document`(`name`)
);
```

---

## Best Practices

### When Creating Leads

1. Always fill mandatory fields
2. Use consistent company naming
3. Set appropriate source
4. Add tags for better filtering
5. Use email or phone (preferably both)

### When Creating COD Documents

1. Ensure all required documents are uploaded
2. Use clear document type labels
3. Attach high-quality scans
4. Add relevant comments for approval
5. Follow naming conventions for files

### Workflow Best Practices

1. Always use document events for automation
2. Log important actions
3. Send notifications at critical steps
4. Validate data before submission
5. Maintain audit trail for approvals

---

## Related Documentation

- [API Endpoints](./API_ENDPOINTS.md) - How to interact with these DocTypes
- [Roles & Permissions](./ROLES_PERMISSIONS.md) - Who can access what
- [Architecture](./ARCHITECTURE.md) - How DocTypes fit in the system
