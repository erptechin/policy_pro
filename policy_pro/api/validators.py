"""
Validation functions for custom DocTypes
"""

import frappe
from frappe import _
from frappe.utils import getdate


class LeadValidator:
    """Lead document validation"""

    @staticmethod
    def validate_mandatory_fields(doc):
        """Validate required fields for Lead"""
        mandatory_fields = {
            'lead_name': _('Lead Name'),
            'company_name': _('Company Name')
        }

        for field, label in mandatory_fields.items():
            if not doc.get(field):
                frappe.throw(
                    _('Field "{label}" is mandatory').format(label=label),
                    frappe.ValidationError
                )

    @staticmethod
    def validate_contact_info(doc):
        """Validate at least one contact method exists"""
        if not doc.get('email_id') and not doc.get('mobile_no'):
            frappe.throw(
                _('Either Email ID or Mobile No is required'),
                frappe.ValidationError
            )

    @staticmethod
    def validate_callback_date(doc):
        """Validate call-back date if status is 'Call Back'"""
        if doc.status == 'Call Back':
            if not doc.get('custom_call_back_date'):
                frappe.throw(
                    _('Call Back Date is required when status is "Call Back"'),
                    frappe.ValidationError
                )

            # Check if date is in future
            if getdate(doc.custom_call_back_date) < getdate(frappe.utils.today()):
                frappe.throw(
                    _('Call Back Date must be in the future'),
                    frappe.ValidationError
                )

    @staticmethod
    def validate_all(doc):
        """Run all validations"""
        LeadValidator.validate_mandatory_fields(doc)
        LeadValidator.validate_contact_info(doc)
        LeadValidator.validate_callback_date(doc)


class CODValidator:
    """COD Document validation"""

    @staticmethod
    def validate_documents_uploaded(doc):
        """Validate at least one document is uploaded"""
        if not doc.cod_documents:
            frappe.throw(
                _('At least one COD document must be uploaded'),
                frappe.ValidationError
            )

    @staticmethod
    def validate_document_types(doc):
        """Validate all documents have types specified"""
        for item in doc.cod_documents:
            if not item.get('document_type'):
                frappe.throw(
                    _('Document Type is required for all documents'),
                    frappe.ValidationError
                )

    @staticmethod
    def validate_all(doc):
        """Run all validations"""
        CODValidator.validate_documents_uploaded(doc)
        CODValidator.validate_document_types(doc)
