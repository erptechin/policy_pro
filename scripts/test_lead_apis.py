#!/usr/bin/env python3
"""
Phase 1 Backend API Testing Script
Tests all lead management APIs with various scenarios
Run with: python scripts/test_lead_apis.py
"""

import json
import sys
import time
from datetime import datetime, timedelta

# Assuming this is run from frappe bench
try:
    import frappe
except ImportError:
    print("Error: This script must be run from a Frappe bench environment")
    sys.exit(1)

from policy_pro.api.sales import (
    get_leads,
    create_lead,
    update_lead_status,
    get_won_leads,
    get_call_back_leads
)
from policy_pro.api.validators import LeadValidator


class TestResult:
    """Track test results"""
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []

    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ PASS: {test_name}")

    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append((test_name, error))
        print(f"❌ FAIL: {test_name}")
        print(f"   Error: {error}\n")

    def summary(self):
        total = self.passed + self.failed
        print("\n" + "="*60)
        print(f"Test Results: {self.passed}/{total} passed")
        print("="*60)
        if self.errors:
            print("\nFailed Tests:")
            for test_name, error in self.errors:
                print(f"  - {test_name}: {error}")
        return self.failed == 0


class LeadAPITester:
    """Test suite for Lead management APIs"""

    def __init__(self):
        self.results = TestResult()
        self.test_lead_id = None
        self.test_leads = []

    def test_create_lead_valid(self):
        """Test 1: Create lead with all valid data"""
        try:
            response = create_lead(
                lead_name="Test Lead 1",
                company_name="Test Company 1",
                email_id="test1@example.com",
                mobile_no="971-55-123-4567",
                source="API Test"
            )

            assert response.get('status') == 'success', f"Status not success: {response}"
            assert 'data' in response, "No data in response"
            assert 'lead_id' in response['data'], "No lead_id in response"

            self.test_lead_id = response['data']['lead_id']
            self.test_leads.append(self.test_lead_id)
            self.results.add_pass("Create lead with valid data")
            return True
        except Exception as e:
            self.results.add_fail("Create lead with valid data", str(e))
            return False

    def test_create_lead_missing_name(self):
        """Test 2: Create lead without lead_name (should fail)"""
        try:
            response = create_lead(
                lead_name="",
                company_name="Test Company",
                email_id="test@example.com"
            )

            assert response.get('status') == 'error', "Should return error status"
            assert 'Lead Name is required' in response.get('message', ''), "Wrong error message"
            self.results.add_pass("Reject lead without name")
            return True
        except Exception as e:
            self.results.add_fail("Reject lead without name", str(e))
            return False

    def test_create_lead_missing_company(self):
        """Test 3: Create lead without company_name (should fail)"""
        try:
            response = create_lead(
                lead_name="Test Lead",
                company_name="",
                email_id="test@example.com"
            )

            assert response.get('status') == 'error', "Should return error status"
            assert 'Company Name is required' in response.get('message', ''), "Wrong error message"
            self.results.add_pass("Reject lead without company")
            return True
        except Exception as e:
            self.results.add_fail("Reject lead without company", str(e))
            return False

    def test_create_lead_invalid_email(self):
        """Test 4: Create lead with invalid email format"""
        try:
            response = create_lead(
                lead_name="Test Lead",
                company_name="Test Company",
                email_id="invalid-email-format"
            )

            assert response.get('status') == 'error', "Should return error status"
            assert 'email' in response.get('message', '').lower(), "Wrong error message"
            self.results.add_pass("Reject invalid email format")
            return True
        except Exception as e:
            self.results.add_fail("Reject invalid email format", str(e))
            return False

    def test_create_lead_invalid_phone(self):
        """Test 5: Create lead with invalid phone format"""
        try:
            response = create_lead(
                lead_name="Test Lead",
                company_name="Test Company",
                mobile_no="123"
            )

            assert response.get('status') == 'error', "Should return error status"
            assert 'phone' in response.get('message', '').lower() or 'mobile' in response.get('message', '').lower(), \
                f"Wrong error message: {response.get('message')}"
            self.results.add_pass("Reject invalid phone format")
            return True
        except Exception as e:
            self.results.add_fail("Reject invalid phone format", str(e))
            return False

    def test_get_leads_all(self):
        """Test 6: Retrieve all leads with pagination"""
        try:
            response = get_leads(page=1, limit=10)

            assert response.get('status') == 'success', "Status not success"
            assert 'data' in response, "No data in response"
            assert 'leads' in response['data'], "No leads in data"
            assert 'total' in response['data'], "No total count"
            assert 'page' in response['data'], "No page info"
            self.results.add_pass("Retrieve all leads with pagination")
            return True
        except Exception as e:
            self.results.add_fail("Retrieve all leads with pagination", str(e))
            return False

    def test_get_leads_by_status(self):
        """Test 7: Filter leads by status"""
        try:
            # First create a lead with specific status
            test_response = create_lead(
                lead_name="Test Lead Status Filter",
                company_name="Test Company",
                email_id="status@example.com"
            )

            # Now filter by Open status
            response = get_leads(status='Open', page=1, limit=10)

            assert response.get('status') == 'success', "Status not success"
            leads = response['data']['leads']

            # At least one lead should be Open
            open_leads = [l for l in leads if l.get('status') == 'Open']
            assert len(open_leads) > 0, "No Open status leads found"
            self.results.add_pass("Filter leads by status")
            return True
        except Exception as e:
            self.results.add_fail("Filter leads by status", str(e))
            return False

    def test_update_lead_to_callback(self):
        """Test 8: Update lead status to 'Call Back' with callback details"""
        try:
            if not self.test_lead_id:
                self.results.add_fail("Update to callback", "No test lead created")
                return False

            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            response = update_lead_status(
                lead_id=self.test_lead_id,
                status='Call Back',
                callback_date=tomorrow,
                callback_time='14:30',
                notes='Test callback'
            )

            assert response.get('status') == 'success', f"Status not success: {response}"
            self.results.add_pass("Update lead to Call Back status")
            return True
        except Exception as e:
            self.results.add_fail("Update lead to Call Back status", str(e))
            return False

    def test_update_lead_past_callback_date(self):
        """Test 9: Reject callback date in the past"""
        try:
            if not self.test_lead_id:
                self.results.add_fail("Reject past callback date", "No test lead created")
                return False

            yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            response = update_lead_status(
                lead_id=self.test_lead_id,
                status='Call Back',
                callback_date=yesterday,
                callback_time='14:30'
            )

            assert response.get('status') == 'error', f"Should fail for past date: {response}"
            assert 'future' in response.get('message', '').lower(), "Wrong error message"
            self.results.add_pass("Reject past callback date")
            return True
        except Exception as e:
            self.results.add_fail("Reject past callback date", str(e))
            return False

    def test_update_lead_to_won(self):
        """Test 10: Update lead status to 'Won'"""
        try:
            if not self.test_lead_id:
                self.results.add_fail("Update to Won", "No test lead created")
                return False

            response = update_lead_status(
                lead_id=self.test_lead_id,
                status='Won'
            )

            assert response.get('status') == 'success', f"Status not success: {response}"
            self.results.add_pass("Update lead to Won status")
            return True
        except Exception as e:
            self.results.add_fail("Update lead to Won status", str(e))
            return False

    def test_get_won_leads(self):
        """Test 11: Retrieve Won leads"""
        try:
            response = get_won_leads()

            assert response.get('status') == 'success', "Status not success"
            assert 'data' in response, "No data in response"
            # Should be a list or dict with leads
            self.results.add_pass("Retrieve Won leads")
            return True
        except Exception as e:
            self.results.add_fail("Retrieve Won leads", str(e))
            return False

    def test_get_callback_leads(self):
        """Test 12: Retrieve leads with scheduled callbacks"""
        try:
            today = datetime.now().strftime('%Y-%m-%d')
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

            response = get_call_back_leads(
                date_from=today,
                date_to=tomorrow
            )

            assert response.get('status') == 'success', f"Status not success: {response}"
            assert 'data' in response, "No data in response"
            self.results.add_pass("Retrieve callback leads for date range")
            return True
        except Exception as e:
            self.results.add_fail("Retrieve callback leads for date range", str(e))
            return False

    def test_lead_validator_mandatory_fields(self):
        """Test 13: Validator enforces mandatory fields"""
        try:
            # Create a test document with missing fields
            test_doc = frappe.new_doc('Lead')
            test_doc.lead_name = ''
            test_doc.company_name = 'Test'

            # Test validator
            errors = LeadValidator.validate_mandatory_fields(test_doc)

            assert len(errors) > 0, "Should detect missing lead_name"
            assert any('lead_name' in str(e).lower() for e in errors), "Should mention lead_name"
            self.results.add_pass("Validator detects mandatory field errors")
            return True
        except Exception as e:
            self.results.add_fail("Validator detects mandatory field errors", str(e))
            return False

    def test_lead_validator_contact_info(self):
        """Test 14: Validator enforces contact info requirement"""
        try:
            test_doc = frappe.new_doc('Lead')
            test_doc.lead_name = 'Test'
            test_doc.company_name = 'Test'
            test_doc.email = ''
            test_doc.mobile_no = ''
            test_doc.phone = ''

            errors = LeadValidator.validate_contact_info(test_doc)

            assert len(errors) > 0, "Should detect missing contact info"
            self.results.add_pass("Validator detects missing contact information")
            return True
        except Exception as e:
            self.results.add_fail("Validator detects missing contact information", str(e))
            return False

    def run_all_tests(self):
        """Run all test cases"""
        print("\n" + "="*60)
        print("Phase 1 Lead Management - Backend API Tests")
        print("="*60 + "\n")

        # Test 1-5: Create lead scenarios
        print("Testing Lead Creation...")
        self.test_create_lead_valid()
        self.test_create_lead_missing_name()
        self.test_create_lead_missing_company()
        self.test_create_lead_invalid_email()
        self.test_create_lead_invalid_phone()

        # Test 6-7: Read operations
        print("\nTesting Lead Retrieval...")
        self.test_get_leads_all()
        self.test_get_leads_by_status()

        # Test 8-10: Update operations
        print("\nTesting Lead Updates...")
        self.test_update_lead_to_callback()
        self.test_update_lead_past_callback_date()
        self.test_update_lead_to_won()

        # Test 11-12: Special queries
        print("\nTesting Special Queries...")
        self.test_get_won_leads()
        self.test_get_callback_leads()

        # Test 13-14: Validation
        print("\nTesting Validators...")
        self.test_lead_validator_mandatory_fields()
        self.test_lead_validator_contact_info()

        # Cleanup
        self.cleanup_test_leads()

        # Summary
        return self.results.summary()

    def cleanup_test_leads(self):
        """Clean up test data"""
        try:
            for lead_id in self.test_leads:
                frappe.delete_doc('Lead', lead_id)
            frappe.db.commit()
        except Exception as e:
            print(f"⚠️  Warning: Could not cleanup test leads: {e}")


if __name__ == '__main__':
    try:
        frappe.connect()
        tester = LeadAPITester()
        success = tester.run_all_tests()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
