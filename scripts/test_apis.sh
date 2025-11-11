#!/bin/bash

# Phase 1 Backend API Testing Script
# Tests all lead management APIs using curl
# Run with: bash scripts/test_apis.sh

set -e

# Configuration
FRAPPE_URL="http://localhost:8000"
API_PREFIX="api/method/policy_pro.api.sales"
HEADERS="Content-Type: application/json"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
TESTS=()

# Helper functions
print_header() {
    echo ""
    echo "=================================================="
    echo "$1"
    echo "=================================================="
    echo ""
}

print_test() {
    echo -n "Testing: $1... "
}

print_pass() {
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC}"
    echo -e "${RED}Error: $1${NC}"
    ((FAILED++))
}

print_summary() {
    echo ""
    echo "=================================================="
    echo "Test Results: $PASSED passed, $FAILED failed"
    echo "=================================================="
    [ $FAILED -eq 0 ] && echo -e "${GREEN}All tests passed!${NC}" || echo -e "${RED}Some tests failed${NC}"
    echo ""
}

# API Tests

test_create_lead_valid() {
    print_test "Create lead with valid data"

    RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.create_lead" \
        -H "${HEADERS}" \
        -d '{
            "lead_name": "Test Lead '$(date +%s)'",
            "company_name": "Test Company '$(date +%s)'",
            "email_id": "test'$(date +%s)'@example.com",
            "mobile_no": "971-55-123-4567",
            "source": "API Test"
        }')

    if echo "$RESPONSE" | grep -q '"status":"success"'; then
        LEAD_ID=$(echo "$RESPONSE" | grep -o '"lead_id":"[^"]*' | sed 's/"lead_id":"//')
        print_pass
        return 0
    else
        print_fail "$RESPONSE"
        return 1
    fi
}

test_create_lead_missing_name() {
    print_test "Create lead without lead_name (should fail)"

    RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.create_lead" \
        -H "${HEADERS}" \
        -d '{
            "lead_name": "",
            "company_name": "Test Company",
            "email_id": "test@example.com"
        }')

    if echo "$RESPONSE" | grep -q 'Lead Name is required'; then
        print_pass
        return 0
    else
        print_fail "Should reject empty lead name"
        return 1
    fi
}

test_create_lead_missing_company() {
    print_test "Create lead without company_name (should fail)"

    RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.create_lead" \
        -H "${HEADERS}" \
        -d '{
            "lead_name": "Test Lead",
            "company_name": "",
            "email_id": "test@example.com"
        }')

    if echo "$RESPONSE" | grep -q 'Company Name is required'; then
        print_pass
        return 0
    else
        print_fail "Should reject empty company name"
        return 1
    fi
}

test_create_lead_invalid_email() {
    print_test "Create lead with invalid email format (should fail)"

    RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.create_lead" \
        -H "${HEADERS}" \
        -d '{
            "lead_name": "Test Lead",
            "company_name": "Test Company",
            "email_id": "invalid-email"
        }')

    if echo "$RESPONSE" | grep -q 'email\|Email'; then
        print_pass
        return 0
    else
        print_fail "Should reject invalid email"
        return 1
    fi
}

test_get_leads_all() {
    print_test "Retrieve all leads with pagination"

    RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.get_leads" \
        -H "${HEADERS}" \
        -d '{
            "page": 1,
            "limit": 10
        }')

    if echo "$RESPONSE" | grep -q '"status":"success"' && echo "$RESPONSE" | grep -q '"leads"'; then
        print_pass
        return 0
    else
        print_fail "$RESPONSE"
        return 1
    fi
}

test_get_leads_by_status() {
    print_test "Filter leads by status"

    RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.get_leads" \
        -H "${HEADERS}" \
        -d '{
            "status": "Open",
            "page": 1,
            "limit": 10
        }')

    if echo "$RESPONSE" | grep -q '"status":"success"'; then
        print_pass
        return 0
    else
        print_fail "$RESPONSE"
        return 1
    fi
}

test_update_lead_status_won() {
    print_test "Update lead status to Won"

    # First create a lead
    CREATE_RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.create_lead" \
        -H "${HEADERS}" \
        -d '{
            "lead_name": "Test Lead for Update '$(date +%s)'",
            "company_name": "Test Company",
            "email_id": "update@example.com"
        }')

    TEST_LEAD_ID=$(echo "$CREATE_RESPONSE" | grep -o '"lead_id":"[^"]*' | sed 's/"lead_id":"//')

    if [ -z "$TEST_LEAD_ID" ]; then
        print_fail "Could not create test lead"
        return 1
    fi

    # Now update status
    UPDATE_RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.update_lead_status" \
        -H "${HEADERS}" \
        -d "{
            \"lead_id\": \"$TEST_LEAD_ID\",
            \"status\": \"Won\"
        }")

    if echo "$UPDATE_RESPONSE" | grep -q '"status":"success"'; then
        print_pass
        return 0
    else
        print_fail "$UPDATE_RESPONSE"
        return 1
    fi
}

test_update_lead_callback() {
    print_test "Update lead status to Call Back with callback details"

    # Create a lead
    CREATE_RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.create_lead" \
        -H "${HEADERS}" \
        -d '{
            "lead_name": "Test Lead for Callback '$(date +%s)'",
            "company_name": "Test Company",
            "email_id": "callback@example.com"
        }')

    TEST_LEAD_ID=$(echo "$CREATE_RESPONSE" | grep -o '"lead_id":"[^"]*' | sed 's/"lead_id":"//')

    if [ -z "$TEST_LEAD_ID" ]; then
        print_fail "Could not create test lead"
        return 1
    fi

    # Update to Call Back with future date
    TOMORROW=$(date -d "+1 day" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)

    CALLBACK_RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.update_lead_status" \
        -H "${HEADERS}" \
        -d "{
            \"lead_id\": \"$TEST_LEAD_ID\",
            \"status\": \"Call Back\",
            \"callback_date\": \"$TOMORROW\",
            \"callback_time\": \"14:30\",
            \"notes\": \"Follow up test\"
        }")

    if echo "$CALLBACK_RESPONSE" | grep -q '"status":"success"'; then
        print_pass
        return 0
    else
        print_fail "$CALLBACK_RESPONSE"
        return 1
    fi
}

test_past_callback_date() {
    print_test "Reject past callback date (should fail)"

    # Create a lead
    CREATE_RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.create_lead" \
        -H "${HEADERS}" \
        -d '{
            "lead_name": "Test Lead for Past Date '$(date +%s)'",
            "company_name": "Test Company",
            "email_id": "pastdate@example.com"
        }')

    TEST_LEAD_ID=$(echo "$CREATE_RESPONSE" | grep -o '"lead_id":"[^"]*' | sed 's/"lead_id":"//')

    if [ -z "$TEST_LEAD_ID" ]; then
        print_fail "Could not create test lead"
        return 1
    fi

    # Try to set past callback date
    YESTERDAY=$(date -d "-1 day" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)

    RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.update_lead_status" \
        -H "${HEADERS}" \
        -d "{
            \"lead_id\": \"$TEST_LEAD_ID\",
            \"status\": \"Call Back\",
            \"callback_date\": \"$YESTERDAY\",
            \"callback_time\": \"14:30\"
        }")

    if echo "$RESPONSE" | grep -q 'future\|Future'; then
        print_pass
        return 0
    else
        print_fail "Should reject past date: $RESPONSE"
        return 1
    fi
}

test_get_won_leads() {
    print_test "Retrieve Won leads"

    RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.get_won_leads")

    if echo "$RESPONSE" | grep -q '"status":"success"'; then
        print_pass
        return 0
    else
        print_fail "$RESPONSE"
        return 1
    fi
}

test_get_callback_leads() {
    print_test "Retrieve callback leads for date range"

    TODAY=$(date +%Y-%m-%d)
    TOMORROW=$(date -d "+1 day" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)

    RESPONSE=$(curl -s -X POST "${FRAPPE_URL}/${API_PREFIX}.get_call_back_leads" \
        -H "${HEADERS}" \
        -d "{
            \"date_from\": \"$TODAY\",
            \"date_to\": \"$TOMORROW\"
        }")

    if echo "$RESPONSE" | grep -q '"status":"success"'; then
        print_pass
        return 0
    else
        print_fail "$RESPONSE"
        return 1
    fi
}

# Main execution
main() {
    echo ""
    echo "╔════════════════════════════════════════════════╗"
    echo "║  Phase 1 Lead Management - API Testing        ║"
    echo "║  Frappe URL: $FRAPPE_URL"
    echo "╚════════════════════════════════════════════════╝"
    echo ""

    print_header "Testing Lead Creation"
    test_create_lead_valid
    test_create_lead_missing_name
    test_create_lead_missing_company
    test_create_lead_invalid_email

    print_header "Testing Lead Retrieval"
    test_get_leads_all
    test_get_leads_by_status

    print_header "Testing Lead Updates"
    test_update_lead_status_won
    test_update_lead_callback
    test_past_callback_date

    print_header "Testing Special Queries"
    test_get_won_leads
    test_get_callback_leads

    print_summary
}

# Run tests
main
exit $FAILED
