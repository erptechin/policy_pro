# Phase 1 Testing Quick Start Guide

## Overview

This guide provides quick commands to test the Phase 1 Lead Management implementation.

---

## Prerequisites

- Frappe bench environment running
- Policy Pro app installed
- Node.js/npm for frontend testing
- Python environment for backend testing

---

## Backend API Testing

### Option 1: Python Test Suite

Test all 14 backend API scenarios:

```bash
# From frappe bench directory
cd ~/Sites/frappe-bench
bench console

# In the console:
from policy_pro.scripts.test_lead_apis import LeadAPITester
tester = LeadAPITester()
tester.run_all_tests()
```

**What it tests**:
- ✅ Create lead with valid/invalid data
- ✅ Retrieve leads with filters
- ✅ Update lead status
- ✅ Callback date validation
- ✅ Won leads retrieval
- ✅ Callback leads by date range
- ✅ Form validation

**Expected output**: `14/14 tests passed`

---

### Option 2: Bash/cURL Testing

Test APIs directly with curl:

```bash
# From project directory
cd apps/policy_pro

# Run test script
bash scripts/test_apis.sh
```

**What it tests**:
- ✅ Create lead validation
- ✅ Lead retrieval
- ✅ Status updates
- ✅ Callback scheduling
- ✅ Future date validation
- ✅ Special queries

**Expected output**: All tests showing ✓ PASS

---

### Option 3: Manual cURL Testing

Test individual API:

```bash
# Create a lead
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.create_lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "Test Lead",
    "company_name": "Test Corp",
    "email_id": "test@example.com",
    "mobile_no": "971-55-123-4567"
  }'

# Expected response:
# {"message": {"status": "success", "data": {"lead_id": "LEAD-2024-001"}}}
```

---

## Frontend Testing

### Option 1: Jest Component Tests

Test all frontend components and hooks:

```bash
# From frontend directory
cd frontend

# Run tests
npm test

# Run specific test file
npm test -- lead.test.jsx

# Run with coverage
npm test -- --coverage
```

**What it tests**:
- ✅ LeadStatusField component (5 tests)
- ✅ StatusBadge component (3 tests)
- ✅ CallBackSection component (5 tests)
- ✅ useLeadValidation hook (8 tests)
- ✅ useFetchLeads hook (3 tests)
- ✅ End-to-end form submission

**Expected output**: `20+ tests passing`

---

### Option 2: Manual UI Testing

Test features in browser:

```bash
# 1. Start development server
npm start

# 2. Navigate to Lead List
# http://localhost:3000/app/lead

# 3. Test status filter dropdown
# - Select different statuses
# - Verify list updates

# 4. Test callback section
# - Create/Edit lead
# - Set status to "Call Back"
# - Verify callback section appears
# - Set callback date/time
# - Verify saved in list

# 5. Test form validation
# - Leave required fields empty
# - Verify error messages appear
# - Fill correctly
# - Verify form submits
```

---

## Integration Testing

### Test Flow 1: Create and Schedule Callback

```bash
# Step 1: Create Lead
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.create_lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "John Test",
    "company_name": "Test Co",
    "email_id": "john@test.com"
  }'

# Save the lead_id from response

# Step 2: Update Status to Call Back
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.update_lead_status \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "LEAD-2024-001",
    "status": "Call Back",
    "callback_date": "2024-12-25",
    "callback_time": "14:30",
    "notes": "Test callback"
  }'

# Step 3: Verify in List
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.get_leads \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 10
  }'

# Step 4: Verify in UI
# - Open Lead List in browser
# - Filter by "Call Back"
# - Verify callback date displayed
```

### Test Flow 2: Status Progression

```bash
# Create test lead
LEAD_ID="LEAD-2024-001"

# Progress through statuses
for status in "Contacted" "Interested" "Converted" "Won"; do
  curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.update_lead_status \
    -H "Content-Type: application/json" \
    -d "{
      \"lead_id\": \"$LEAD_ID\",
      \"status\": \"$status\"
    }"
  echo "Updated to $status"
  sleep 1
done
```

### Test Flow 3: Filter and Pagination

```bash
# Get all statuses count
for status in "Open" "Contacted" "Interested" "Call Back" "Won"; do
  COUNT=$(curl -s -X POST http://localhost:8000/api/method/policy_pro.api.sales.get_leads \
    -H "Content-Type: application/json" \
    -d "{\"status\": \"$status\"}" | grep -o '"total":[0-9]*' | cut -d: -f2)
  echo "$status: $COUNT leads"
done
```

---

## Validation Testing

### Test Email Validation

```bash
# Valid email - should succeed
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.create_lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "Test",
    "company_name": "Test",
    "email_id": "valid@example.com"
  }'

# Invalid email - should fail
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.create_lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "Test",
    "company_name": "Test",
    "email_id": "invalid-email"
  }'
# Should return: "Invalid email format"
```

### Test Callback Date Validation

```bash
# Past date - should fail
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.update_lead_status \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "LEAD-2024-001",
    "status": "Call Back",
    "callback_date": "2024-11-01",
    "callback_time": "10:00"
  }'
# Should return: "Callback Date must be in the future"

# Future date - should succeed
curl -X POST http://localhost:8000/api/method/policy_pro.api.sales.update_lead_status \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "LEAD-2024-001",
    "status": "Call Back",
    "callback_date": "2024-12-25",
    "callback_time": "10:00"
  }'
# Should succeed
```

---

## Performance Testing

### Load Test: Create Multiple Leads

```bash
# Create 100 leads quickly
for i in {1..100}; do
  curl -s -X POST http://localhost:8000/api/method/policy_pro.api.sales.create_lead \
    -H "Content-Type: application/json" \
    -d "{
      \"lead_name\": \"Lead $i\",
      \"company_name\": \"Company $i\",
      \"email_id\": \"lead$i@example.com\"
    }" > /dev/null &
done

# Measure time:
time bash scripts/test_apis.sh
```

### Load Test: Retrieve with Pagination

```bash
# Test retrieving 1000 leads
for page in {1..50}; do
  curl -s -X POST http://localhost:8000/api/method/policy_pro.api.sales.get_leads \
    -H "Content-Type: application/json" \
    -d "{\"page\": $page, \"limit\": 20}" > /dev/null
  echo "Page $page retrieved"
done
```

---

## Troubleshooting

### API Returns 404

```bash
# Check method exists and is whitelisted
bench console
frappe.call({
    method: 'policy_pro.api.sales.create_lead',
    args: {...}
})
```

### Frontend Tests Fail

```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules
npm install
npm test
```

### Permission Errors

```bash
# Check user role
bench console
frappe.session.user_roles
# Should include: "Sales Manager", "Sales Agent", etc.
```

---

## Test Execution Checklist

- [ ] Run `bash scripts/test_apis.sh` - All tests pass
- [ ] Run `npm test` - All frontend tests pass
- [ ] Create lead manually - Works in UI
- [ ] Filter by status - Shows correct leads
- [ ] Schedule callback - Section appears and saves
- [ ] Update status multiple times - No errors
- [ ] Verify email validation - Rejects invalid emails
- [ ] Verify callback date - Rejects past dates
- [ ] Check permissions - Users see correct data
- [ ] Test pagination - Can navigate pages
- [ ] Check performance - Queries return < 500ms

---

## Test Results Template

```markdown
# Phase 1 Testing Results
Date: [DATE]
Tester: [NAME]

## Backend Testing
- [ ] Python test suite: ✓ 14/14 passed
- [ ] Bash/cURL tests: ✓ All passed
- [ ] Manual API tests: ✓ All passed

## Frontend Testing
- [ ] Jest tests: ✓ 20+ passed
- [ ] Component rendering: ✓ Works
- [ ] Form validation: ✓ Works
- [ ] List filtering: ✓ Works

## Integration Testing
- [ ] Create & schedule callback: ✓ Works
- [ ] Status progression: ✓ Works
- [ ] Pagination: ✓ Works
- [ ] Permissions: ✓ Works

## Performance
- [ ] API response time: < 500ms ✓
- [ ] Form load time: < 1s ✓
- [ ] List pagination: < 500ms ✓

## Validation
- [ ] Email format: ✓ Works
- [ ] Phone format: ✓ Works
- [ ] Callback date: ✓ Works
- [ ] Required fields: ✓ Works

Overall Status: ✅ PASSED
```

---

## What's Next?

After successful testing:

1. **Review Documentation**:
   - Read `docs/PHASE_1_TESTING_GUIDE.md`
   - Check `docs/PHASE_1_SUMMARY.md`

2. **Plan Production Deployment**:
   - Set up staging environment
   - Run full test suite in staging
   - Get sign-off from stakeholders

3. **Prepare for Phase 2**:
   - Review `docs/IMPLEMENTATION.md` for Phase 2 plan
   - Gather feedback for lead assignment features
   - Estimate Phase 2 timeline

---

## Support

For help or issues:

1. Check error messages in `/logs/`
2. Review test output carefully
3. Check browser console (F12)
4. Review documentation files
5. Ask development team

---

## Key Metrics to Validate

| Metric | Target | Actual |
|--------|--------|--------|
| Backend Tests Passed | 14/14 | ☐ |
| Frontend Tests Passed | 20+ | ☐ |
| API Response Time | < 500ms | ☐ |
| Form Load Time | < 1s | ☐ |
| Validation Rules Enforced | 100% | ☐ |
| Permission Control Working | Yes | ☐ |

---

Good luck with testing! 🚀
