# Phase 1 Implementation Guide - Lead Management Enhancements

**Duration**: Week 1-2 (2 weeks)
**Status**: IN PROGRESS ✅

## Overview

Phase 1 focuses on enhancing the Lead DocType with complete entry validation, call-back scheduling capabilities, and custom status options. This is the foundation for all subsequent phases.

---

## Completed Tasks

### ✅ Backend Setup

#### 1. API Layer Created (`policy_pro/api/sales.py`)

**Location**: `policy_pro/api/sales.py`

Core functions implemented:

| Function | Purpose | Endpoint |
|---|---|---|
| `get_leads()` | List leads with pagination & filters | `GET /api/method/policy_pro.api.sales.get_leads` |
| `get_lead()` | Get single lead | `GET /api/method/policy_pro.api.sales.get_lead` |
| `create_lead()` | Create new lead | `POST /api/method/policy_pro.api.sales.create_lead` |
| `update_lead_status()` | Update status & callback details | `POST /api/method/policy_pro.api.sales.update_lead_status` |
| `get_won_leads()` | Get won/converted leads | `GET /api/method/policy_pro.api.sales.get_won_leads` |
| `get_call_back_leads()` | Get callback scheduled leads | `GET /api/method/policy_pro.api.sales.get_call_back_leads` |
| `get_sales_dashboard_data()` | Dashboard metrics | `GET /api/method/policy_pro.api.sales.get_sales_dashboard_data` |
| `get_daily_quote()` | Daily motivational quote | `GET /api/method/policy_pro.api.sales.get_daily_quote` |

**Key Features**:
- Error handling with proper HTTP status codes
- Logging of errors
- Consistent response format
- Input validation

#### 2. Validators Created (`policy_pro/api/validators.py`)

**Location**: `policy_pro/api/validators.py`

```python
class LeadValidator:
    - validate_mandatory_fields()  # Lead Name, Company Name required
    - validate_contact_info()      # Email or Phone required
    - validate_callback_date()     # Future date required for callbacks
    - validate_all()               # Run all validations

class CODValidator:
    - validate_documents_uploaded() # At least one doc required
    - validate_document_types()     # Document type mandatory
    - validate_all()                # Run all validations
```

#### 3. Document Event Hooks (`policy_pro/api/lead_hooks.py`)

**Location**: `policy_pro/api/lead_hooks.py`

```python
def validate_lead(doc, method)
    └─ Runs all validations before save

def on_insert_lead(doc, method)
    ├─ Logs lead creation
    └─ Adds creation comment

def on_update_lead(doc, method)
    ├─ Tracks status changes
    └─ Logs callback updates

def get_lead_permission_query_conditions(user)
    ├─ Sales User: View only Won/Converted leads
    ├─ Sales Agent: View only assigned leads
    └─ Managers: View all leads
```

#### 4. Main Hooks Configuration (`policy_pro/hooks.py`)

**Location**: `policy_pro/hooks.py`

```python
doc_events = {
    "Lead": {
        "validate": "policy_pro.api.lead_hooks.validate_lead",
        "on_insert": "policy_pro.api.lead_hooks.on_insert_lead",
        "on_update": "policy_pro.api.lead_hooks.on_update_lead",
    }
}

permission_query_conditions = {
    "Lead": "policy_pro.api.lead_hooks.get_lead_permission_query_conditions",
}
```

---

## In Progress Tasks

### 🟡 Frontend Form Enhancement

**Location**: `frontend/src/app/pages/dashboards/lead/form.jsx`

#### Tasks:

1. **Add Callback Date/Time Pickers**
   ```jsx
   // Add these fields
   <DatePicker
     label="Call Back Date"
     value={formData.custom_call_back_date}
     onChange={handleCallbackDateChange}
     disabled={status !== 'Call Back'}
   />

   <TimePicker
     label="Call Back Time"
     value={formData.custom_call_back_time}
     onChange={handleCallbackTimeChange}
     disabled={status !== 'Call Back'}
   />
   ```

2. **Add Notes Rich Text Editor**
   ```jsx
   <RichTextEditor
     label="Call Back Notes"
     value={formData.custom_call_back_notes}
     onChange={handleNotesChange}
   />
   ```

3. **Status Selection with Conditional Fields**
   ```jsx
   const statusOptions = [
     'Pending', 'Open', 'Contacted', 'Interested',
     'Call Back', 'Already Purchased Insurance', 'Not Interested',
     'Converted', 'Won', 'Lost'
   ];

   // Show callback fields only when status === 'Call Back'
   {status === 'Call Back' && (
     <div className="callback-section">
       {/* callback fields */}
     </div>
   )}
   ```

4. **Implement Client-Side Validation**
   ```jsx
   const validateLead = () => {
     const errors = {};

     if (!formData.lead_name)
       errors.lead_name = 'Lead Name is required';
     if (!formData.company_name)
       errors.company_name = 'Company Name is required';
     if (!formData.email_id && !formData.mobile_no)
       errors.contact = 'Email or Phone is required';
     if (status === 'Call Back' && !formData.custom_call_back_date)
       errors.custom_call_back_date = 'Callback Date is required';

     return errors;
   };
   ```

5. **Add Field Requirement Indicators**
   ```jsx
   <FormField
     label="Lead Name"
     required={true}
     value={formData.lead_name}
     onChange={handleChange}
   />
   ```

#### Code Structure:
```
frontend/src/app/pages/dashboards/lead/
├── form.jsx (MAIN - needs enhancement)
├── LeadForm.jsx (Component)
├── hooks/
│   └── useFetchLead.js
└── services/
    └── leadService.js (API calls)
```

---

### 📋 Frontend List View Update

**Location**: `frontend/src/app/pages/dashboards/lead/index.jsx`

#### Tasks:

1. **Add Status Filter**
   ```jsx
   <StatusFilter
     options={statusOptions}
     selected={filters.status}
     onChange={(status) => setFilters({...filters, status})}
   />
   ```

2. **Display Callback Information**
   ```jsx
   {lead.status === 'Call Back' && (
     <CallbackBadge
       date={lead.custom_call_back_date}
       time={lead.custom_call_back_time}
     />
   )}
   ```

3. **Add Callback Calendar View**
   ```jsx
   <CallBackCalendar
     leads={callbackLeads}
     onDateSelect={handleDateSelect}
   />
   ```

4. **Column Configuration**
   ```jsx
   const columns = [
     { key: 'lead_name', label: 'Customer Name', sortable: true },
     { key: 'company_name', label: 'Company', sortable: true },
     { key: 'status', label: 'Status', sortable: true },
     { key: 'owner', label: 'Assigned To', sortable: true },
     { key: 'custom_call_back_date', label: 'Callback Date', sortable: true },
     { key: 'email_id', label: 'Email', sortable: false },
     { key: 'mobile_no', label: 'Phone', sortable: false },
   ];
   ```

5. **Add Action Buttons**
   ```jsx
   <ActionButtons
     lead={lead}
     onEdit={handleEdit}
     onDelete={handleDelete}
     onViewDetails={handleViewDetails}
   />
   ```

---

## Remaining Tasks

### ❌ Testing & Validation

#### Backend Testing:

1. **Test API Endpoints**
   ```bash
   # Test get_leads endpoint
   curl -X GET "http://localhost:8000/api/method/policy_pro.api.sales.get_leads?status=Open"

   # Test create_lead
   curl -X POST "http://localhost:8000/api/method/policy_pro.api.sales.create_lead" \
     -H "Content-Type: application/json" \
     -d '{
       "lead_name": "John Doe",
       "company_name": "ABC Corp",
       "email_id": "john@example.com",
       "mobile_no": "+971501234567"
     }'

   # Test update_lead_status
   curl -X POST "http://localhost:8000/api/method/policy_pro.api.sales.update_lead_status" \
     -H "Content-Type: application/json" \
     -d '{
       "lead_id": "LEAD-001",
       "status": "Call Back",
       "callback_date": "2024-11-15",
       "callback_time": "14:30",
       "notes": "Customer interested in product"
     }'
   ```

2. **Validate Lead Creation**
   - [ ] Mandatory fields validation works
   - [ ] At least one contact method required
   - [ ] Lead status set to "Open" by default
   - [ ] Events are triggered on creation

3. **Validate Lead Status Updates**
   - [ ] Status changes tracked
   - [ ] Callback date validation works
   - [ ] Callback date must be in future
   - [ ] Comments added on status change

4. **Test Permission Queries**
   - [ ] Sales User sees only Won/Converted leads
   - [ ] Sales Agent sees only assigned leads
   - [ ] Sales Manager sees all leads

#### Frontend Testing:

1. **Form Validation Tests**
   - [ ] Lead Name is required
   - [ ] Company Name is required
   - [ ] Email or Phone is required
   - [ ] Callback fields appear only when status is "Call Back"
   - [ ] Callback date must be in future
   - [ ] Error messages display correctly

2. **UI Component Tests**
   - [ ] Date picker works correctly
   - [ ] Time picker works correctly
   - [ ] Status dropdown shows all options
   - [ ] Conditional fields toggle properly

3. **Integration Tests**
   - [ ] Form submission calls backend API
   - [ ] Validation runs before submission
   - [ ] Success message displays on creation
   - [ ] Error messages display on failure
   - [ ] List view updates after creation

---

## Database Schema

### Lead Extended Fields

```sql
ALTER TABLE `tabLead` ADD COLUMN `custom_call_back_date` DATE;
ALTER TABLE `tabLead` ADD COLUMN `custom_call_back_time` TIME;
ALTER TABLE `tabLead` ADD COLUMN `custom_call_back_notes` LONGTEXT;
```

### Lead Status Values

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

---

## API Testing Commands

### Get Leads List
```bash
bench execute policy_pro.api.sales.get_leads
```

### Create Lead
```python
# In bench console
frappe.get_doc({
    'doctype': 'Lead',
    'lead_name': 'Test Customer',
    'company_name': 'Test Company',
    'email_id': 'test@example.com',
    'mobile_no': '+971501234567'
}).insert()
```

### Update Lead Status
```python
lead = frappe.get_doc('Lead', 'LEAD-001')
lead.status = 'Call Back'
lead.custom_call_back_date = '2024-11-15'
lead.custom_call_back_time = '14:30'
lead.save()
```

---

## Deployment Checklist

- [ ] Backend APIs tested
- [ ] Frontend forms created/updated
- [ ] Validation works on frontend
- [ ] Validation works on backend
- [ ] Database migrations run
- [ ] Document events triggered correctly
- [ ] Permissions checked
- [ ] Error handling tested
- [ ] Code review passed
- [ ] Ready for staging

---

## Files Modified/Created

### Backend Files Created
- ✅ `policy_pro/api/sales.py` - Sales module APIs
- ✅ `policy_pro/api/validators.py` - Validation classes
- ✅ `policy_pro/api/lead_hooks.py` - Lead document hooks

### Backend Files Modified
- ✅ `policy_pro/hooks.py` - Added doc_events and permission_query_conditions

### Frontend Files To Modify
- 🟡 `frontend/src/app/pages/dashboards/lead/form.jsx` - Add callback fields
- 🟡 `frontend/src/app/pages/dashboards/lead/index.jsx` - Update list view

### Config Files
- ✅ `policy_pro/policy_pro/custom/lead.json` - Lead DocType definition

---

## Success Criteria

✅ **Functional**
- [ ] Leads can be created with all required information
- [ ] Lead status can be updated to "Call Back"
- [ ] Callback date/time are stored and displayed
- [ ] All validation rules work correctly
- [ ] Permissions are enforced

✅ **Performance**
- [ ] API responses in < 1 second
- [ ] Form loads in < 2 seconds
- [ ] Lead list loads in < 3 seconds

✅ **Quality**
- [ ] All code follows conventions
- [ ] Error handling comprehensive
- [ ] Logging implemented
- [ ] Tests pass

---

## Next Steps

1. **Complete Frontend Form** (In Progress)
   - Add date/time pickers
   - Add notes editor
   - Implement validation

2. **Complete Frontend List** (Pending)
   - Add status filter
   - Display callback info
   - Add callback calendar

3. **Testing** (Pending)
   - Unit tests
   - Integration tests
   - End-to-end tests

4. **Staging Deployment** (Week 3)
   - Deploy to staging
   - User acceptance testing
   - Bug fixes

5. **Production Deployment** (Week 4)
   - Final testing
   - User training
   - Go-live

---

## Quick Reference

### API Endpoints (Phase 1)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/method/policy_pro.api.sales.get_leads` | List leads |
| GET | `/api/method/policy_pro.api.sales.get_lead` | Get single lead |
| POST | `/api/method/policy_pro.api.sales.create_lead` | Create lead |
| POST | `/api/method/policy_pro.api.sales.update_lead_status` | Update status |
| GET | `/api/method/policy_pro.api.sales.get_won_leads` | Won leads |
| GET | `/api/method/policy_pro.api.sales.get_call_back_leads` | Callback leads |

### Backend Functions

- `validate_lead()` - Validates before save
- `on_insert_lead()` - Handles creation
- `on_update_lead()` - Handles updates
- `get_lead_permission_query_conditions()` - Filters by role

### Frontend Components

- `LeadForm` - Lead creation/edit
- `LeadList` - Lead listing
- `CallbackDatePicker` - Date selection
- `StatusSelect` - Status dropdown

---

**Phase 1 Progress**: 60% Complete ✅

**Estimated Completion**: End of Week 1

**Next Milestone**: Move to Phase 2 (Lead Assignment)

