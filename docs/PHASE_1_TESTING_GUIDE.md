# Phase 1 Testing & Integration Guide

## Overview

This guide provides comprehensive testing procedures for Phase 1 implementation of the Policy Pro Lead Management system. It includes backend API testing, frontend component testing, and integration testing steps.

---

## Table of Contents

1. [Backend API Testing](#backend-api-testing)
2. [Frontend Component Testing](#frontend-component-testing)
3. [Integration Testing](#integration-testing)
4. [Validation Testing](#validation-testing)
5. [Deployment Checklist](#deployment-checklist)

---

## Backend API Testing

### Prerequisites

- Frappe bench environment running
- Access to ERPNext database
- Test leads created for validation

### 1. Test Lead Creation API

**Endpoint**: `policy_pro.api.sales.create_lead`

#### Test Case 1.1: Valid Lead Creation

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.create_lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "John Doe",
    "company_name": "ACME Corp",
    "email_id": "john@acme.com",
    "mobile_no": "971-55-123-4567",
    "source": "Website",
    "custom_call_back_date": "2024-11-20"
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Lead created successfully",
  "data": {
    "lead_id": "LEAD-2024-001",
    "lead_name": "John Doe"
  }
}
```

#### Test Case 1.2: Missing Required Fields

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.create_lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "Jane Doe"
  }'
```

**Expected Response**:
```json
{
  "status": "error",
  "message": "Company Name is required",
  "code": 400
}
```

#### Test Case 1.3: Invalid Email Format

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.create_lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "Invalid Email",
    "company_name": "Test Corp",
    "email_id": "invalid-email"
  }'
```

**Expected Response**:
```json
{
  "status": "error",
  "message": "Invalid email format",
  "code": 400
}
```

### 2. Test Get Leads API

**Endpoint**: `policy_pro.api.sales.get_leads`

#### Test Case 2.1: Get All Leads with Pagination

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.get_leads \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 10
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "leads": [
      {
        "name": "LEAD-2024-001",
        "lead_name": "John Doe",
        "status": "Open",
        "company_name": "ACME Corp",
        "email": "john@acme.com",
        "custom_call_back_date": "2024-11-20",
        "custom_call_back_time": "14:30"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 10
  }
}
```

#### Test Case 2.2: Filter by Status

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.get_leads \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Call Back",
    "page": 1,
    "limit": 10
  }'
```

**Expected**: Only leads with "Call Back" status returned

#### Test Case 2.3: Filter by Owner/Agent

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.get_leads \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "agent@example.com",
    "page": 1,
    "limit": 10
  }'
```

**Expected**: Only leads assigned to the specified agent

### 3. Test Update Lead Status API

**Endpoint**: `policy_pro.api.sales.update_lead_status`

#### Test Case 3.1: Update to "Call Back" Status with Callback Details

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.update_lead_status \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "LEAD-2024-001",
    "status": "Call Back",
    "callback_date": "2024-11-25",
    "callback_time": "10:00",
    "notes": "Follow up on insurance inquiry"
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Lead status updated successfully",
  "data": {
    "lead_id": "LEAD-2024-001",
    "status": "Call Back"
  }
}
```

#### Test Case 3.2: Invalid Callback Date (Past Date)

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.update_lead_status \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "LEAD-2024-001",
    "status": "Call Back",
    "callback_date": "2024-11-01",
    "callback_time": "10:00"
  }'
```

**Expected Response**:
```json
{
  "status": "error",
  "message": "Callback Date must be in the future",
  "code": 400
}
```

#### Test Case 3.3: Update to "Won" Status (No Callback Required)

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.update_lead_status \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "LEAD-2024-001",
    "status": "Won"
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Lead status updated successfully"
}
```

### 4. Test Get Won Leads API

**Endpoint**: `policy_pro.api.sales.get_won_leads`

#### Test Case 4.1: Retrieve Won/Converted Leads

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.get_won_leads
```

**Expected Response**:
```json
{
  "status": "success",
  "data": [
    {
      "name": "LEAD-2024-005",
      "lead_name": "Sarah Smith",
      "status": "Won",
      "company_name": "TechCorp"
    }
  ]
}
```

### 5. Test Get Callback Leads API

**Endpoint**: `policy_pro.api.sales.get_call_back_leads`

#### Test Case 5.1: Get Callback Leads for Date Range

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.get_call_back_leads \
  -H "Content-Type: application/json" \
  -d '{
    "date_from": "2024-11-20",
    "date_to": "2024-11-30"
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "leads": [
      {
        "name": "LEAD-2024-001",
        "lead_name": "John Doe",
        "custom_call_back_date": "2024-11-25",
        "custom_call_back_time": "10:00",
        "custom_call_back_notes": "Follow up on inquiry"
      }
    ]
  }
}
```

#### Test Case 5.2: Get Callback Leads for Specific Agent

```bash
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.get_call_back_leads \
  -H "Content-Type: application/json" \
  -d '{
    "agent_email": "agent@example.com"
  }'
```

**Expected**: Only callback leads assigned to the specified agent

---

## Frontend Component Testing

### Prerequisites

- Frontend development server running
- React DevTools installed
- Test user account with Sales Agent role

### 1. Lead Status Field Component

**File**: `frontend/src/app/pages/dashboards/lead/components/LeadStatusField.jsx`

#### Test Case 1.1: Status Options Display

1. Navigate to Lead Form page
2. Click on Status field dropdown
3. Verify all 10 status options appear:
   - Pending
   - Open
   - Contacted
   - Interested
   - Call Back
   - Already Purchased Insurance
   - Not Interested
   - Converted
   - Won
   - Lost

**Expected**: All options visible and selectable

#### Test Case 1.2: Status Badge Colors

1. Navigate to Lead List page
2. Observe status badges in the list
3. Verify color coding:
   - Pending: Gray
   - Open: Blue
   - Contacted: Cyan
   - Interested: Green
   - Call Back: Orange
   - Already Purchased Insurance: Purple
   - Not Interested: Red
   - Converted: Emerald
   - Won: Green
   - Lost: Slate

**Expected**: Each status displays with correct color

### 2. Callback Section Component

**File**: `frontend/src/app/pages/dashboards/lead/components/CallBackSection.jsx`

#### Test Case 2.1: Visibility Based on Status

1. Open Lead Form
2. Set Status to "Call Back"
3. Verify Callback Section appears with blue background
4. Change Status to "Open"
5. Verify Callback Section disappears

**Expected**: Section shown/hidden based on status

#### Test Case 2.2: Date Picker Validation

1. Set Status to "Call Back"
2. Click Callback Date field
3. Try selecting a past date
4. Verify error message: "Date must be in the future"

**Expected**: Past dates disabled in date picker

#### Test Case 2.3: Required Field Validation

1. Set Status to "Call Back"
2. Leave Callback Date empty
3. Click Save
4. Verify error: "Callback Date is required when status is 'Call Back'"

**Expected**: Cannot save without callback date when status is "Call Back"

#### Test Case 2.4: Time Field Requirement

1. Set Status to "Call Back"
2. Enter Callback Date
3. Leave Callback Time empty
4. Click Save
5. Verify error: "Callback Time is required"

**Expected**: Cannot save without callback time

### 3. Lead List View

**File**: `frontend/src/app/pages/dashboards/lead/index.jsx`

#### Test Case 3.1: Status Filter Dropdown

1. Navigate to Lead List page
2. Locate "Filter by Status" dropdown
3. Select different statuses
4. Verify list updates to show only leads with selected status
5. Select "All Statuses"
6. Verify all leads display

**Expected**: Filtering works correctly for all status options

#### Test Case 3.2: Callback Date/Time Column Display

1. Navigate to Lead List page
2. Look for "Callback Date & Time" column
3. For leads with status "Call Back", verify date and time display
4. For other leads, verify "-" displays

**Expected**: Callback info displayed correctly

#### Test Case 3.3: Lead Count Display

1. Navigate to Lead List page
2. Apply status filter
3. Verify count shows correct number of filtered leads

**Expected**: Count updates based on filter

---

## Validation Testing

### Backend Validation Rules

#### Test 1: Lead Name Validation

| Scenario | Input | Expected Result |
|----------|-------|-----------------|
| Empty lead name | "" | Error: "Lead Name is required" |
| Valid lead name | "John Doe" | Accepted |
| Whitespace only | "   " | Error: "Lead Name is required" |

#### Test 2: Company Name Validation

| Scenario | Input | Expected Result |
|----------|-------|-----------------|
| Empty company | "" | Error: "Company Name is required" |
| Valid company | "ACME Corp" | Accepted |
| Whitespace only | "   " | Error: "Company Name is required" |

#### Test 3: Contact Information Validation

| Scenario | Email | Phone | Result |
|----------|-------|-------|--------|
| Both empty | "" | "" | Error: "Email or Phone required" |
| Valid email | "test@example.com" | "" | Accepted |
| Valid phone | "" | "971-55-123-4567" | Accepted |
| Invalid email | "invalid" | "" | Error: "Invalid email format" |
| Invalid phone | "" | "123" | Error: "Invalid phone format" |

#### Test 4: Callback Date Validation

| Scenario | Date | Status | Result |
|----------|------|--------|--------|
| Future date | 2024-12-31 | Call Back | Accepted |
| Past date | 2024-11-01 | Call Back | Error: "Date must be future" |
| Empty date | "" | Call Back | Error: "Date is required" |
| Empty date | "" | Open | Accepted |

### Frontend Validation Rules

#### Test 1: Real-time Error Display

1. Open Lead Form
2. Leave Lead Name empty
3. Click elsewhere on form
4. Verify error message displays below field
5. Enter lead name
6. Verify error disappears

**Expected**: Real-time validation feedback

#### Test 2: Submit Button State

1. Open Lead Form with invalid data
2. Verify Submit button disabled or form won't submit
3. Fill all required fields
4. Verify Submit button enabled

**Expected**: Form submission prevented for invalid data

---

## Integration Testing

### End-to-End Lead Management Flow

#### Test Scenario 1: Create and Schedule Callback

1. **Create Lead**
   - Navigate to "New Lead"
   - Fill: Lead Name, Company, Email
   - Click Save
   - Verify lead created (check list view)

2. **Schedule Callback**
   - Open created lead
   - Set Status to "Call Back"
   - Fill: Callback Date, Callback Time, Notes
   - Click Save
   - Verify changes saved

3. **View in List**
   - Navigate to Lead List
   - Verify status shows as "Call Back" with orange badge
   - Verify callback date/time displayed in column

4. **Verify via API**
   ```bash
   curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.get_leads \
     -H "Content-Type: application/json" \
     -d '{"page": 1, "limit": 10}'
   ```
   - Verify response includes callback fields

#### Test Scenario 2: Status Progression

1. Create lead with status "Open"
2. Update to "Contacted"
3. Update to "Interested"
4. Update to "Call Back" with callback date
5. Update to "Converted"
6. Update to "Won"
7. Verify each status change persists in database

#### Test Scenario 3: Filtering and Search

1. Navigate to Lead List
2. Create 5 test leads with different statuses
3. Filter by "Call Back" - verify shows only Call Back leads
4. Filter by "Won" - verify shows only Won leads
5. Filter by "All Statuses" - verify shows all 5 leads

---

## Performance Testing

### Load Testing

#### Test 1: List Performance with 1000+ Leads

1. Generate test data: 1000+ leads
2. Navigate to Lead List
3. Load time target: < 2 seconds
4. Apply filters: < 500ms response time
5. Pagination: < 500ms per page change

**Tool**: Use browser DevTools Network tab to measure

#### Test 2: Form Loading Performance

1. Open Lead Form for existing lead
2. Load time target: < 1 second
3. Status dropdown open time: < 200ms

---

## Deployment Checklist

- [ ] All backend APIs tested with curl
- [ ] All frontend components render correctly
- [ ] Form validation working (frontend + backend)
- [ ] Status filtering working in list view
- [ ] Callback section shows/hides correctly
- [ ] Callback date validation (past date rejection)
- [ ] Permission checks verified (role-based access)
- [ ] Database backups created
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] API rate limiting working
- [ ] Error logging enabled
- [ ] User training materials prepared
- [ ] Go-live rollback plan documented

---

## Success Criteria

### Backend

- ✅ All 6 lead management APIs functional
- ✅ Validation rules enforced
- ✅ Permission checks working
- ✅ Error messages clear and actionable
- ✅ Logging configured
- ✅ Response times < 500ms

### Frontend

- ✅ Form components render without errors
- ✅ Validation feedback real-time
- ✅ List view filtering responsive
- ✅ Status badges display correctly
- ✅ Callback section conditional rendering works
- ✅ Navigation between pages smooth

### Integration

- ✅ Form submission saves to database
- ✅ List view reflects database changes
- ✅ Filtering works end-to-end
- ✅ Role-based access enforced
- ✅ Callback scheduling functional

---

## Troubleshooting

### Backend Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| API returns 404 | Method not whitelisted | Check @frappe.whitelist() decorator |
| API returns 403 | Permission denied | Verify user role and permission query |
| Validation not working | Validator not called | Check hooks.py configuration |
| Database error | Custom field not created | Run `bench migrate` |

### Frontend Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Component not rendering | Import path incorrect | Verify file path in import |
| State not updating | useState dependency missing | Check useEffect dependencies |
| Validation not showing | Hook not called | Verify useLeadValidation hook usage |
| Filter not working | Status values mismatch | Compare frontend/backend status values |

### Common Error Messages

| Error | Resolution |
|-------|-----------|
| "Lead Name is required" | Ensure lead_name field is not empty |
| "Invalid email format" | Use format: example@domain.com |
| "Callback Date must be in future" | Select tomorrow or later |
| "Method not whitelisted" | Add @frappe.whitelist() to method |
| "Permission denied" | Verify user has Sales User role |

---

## Testing Completion Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Backend Lead | | | |
| Frontend Lead | | | |
| Product Manager | | | |

---

## Next Steps

After successful completion of Phase 1 testing:

1. **Create Release Notes** documenting Phase 1 features
2. **Prepare User Training** materials
3. **Begin Phase 2**: Lead Assignment Automation
4. **Monitor Logs** in production for 24-48 hours
5. **Gather User Feedback** and plan Phase 2 enhancements
