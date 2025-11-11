/**
 * useLeadValidation Hook
 * Custom validation logic for Lead form
 */

import { useCallback } from 'react';

/**
 * Validate lead form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Errors object with field errors
 */
export const useLeadValidation = () => {
  const validateLead = useCallback((formData) => {
    const errors = {};

    // Validate lead name
    if (!formData.lead_name || formData.lead_name.trim() === '') {
      errors.lead_name = 'Lead Name is required';
    }

    // Validate company name
    if (!formData.company_name || formData.company_name.trim() === '') {
      errors.company_name = 'Company Name is required';
    }

    // Validate at least one contact method
    if (
      (!formData.email || formData.email.trim() === '') &&
      (!formData.mobile_no || formData.mobile_no.trim() === '') &&
      (!formData.phone || formData.phone.trim() === '')
    ) {
      errors.contact = 'Either Email or Phone number is required';
      errors.email = 'Email or Phone is required';
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
    }

    // Validate phone format if provided
    if (formData.mobile_no && formData.mobile_no.trim() !== '') {
      const phoneRegex = /^[0-9+\-\s()]{7,}$/;
      if (!phoneRegex.test(formData.mobile_no)) {
        errors.mobile_no = 'Invalid phone format';
      }
    }

    // Validate callback date if status is "Call Back"
    if (formData.status === 'Call Back') {
      if (!formData.custom_call_back_date || formData.custom_call_back_date === '') {
        errors.custom_call_back_date = 'Callback Date is required when status is "Call Back"';
      } else {
        // Check if date is in future
        const callbackDate = new Date(formData.custom_call_back_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (callbackDate < today) {
          errors.custom_call_back_date = 'Callback Date must be in the future';
        }
      }

      // Validate callback time if date is set
      if (formData.custom_call_back_date && (!formData.custom_call_back_time || formData.custom_call_back_time === '')) {
        errors.custom_call_back_time = 'Callback Time is required when Callback Date is set';
      }
    }

    return errors;
  }, []);

  /**
   * Check if form is valid
   * @param {Object} formData - Form data to validate
   * @returns {boolean} True if form is valid
   */
  const isValid = useCallback((formData) => {
    const errors = validateLead(formData);
    return Object.keys(errors).length === 0;
  }, [validateLead]);

  /**
   * Get error message for a specific field
   * @param {Object} formData - Form data
   * @param {string} fieldName - Field name
   * @returns {string} Error message or empty string
   */
  const getFieldError = useCallback((formData, fieldName) => {
    const errors = validateLead(formData);
    return errors[fieldName] || '';
  }, [validateLead]);

  return {
    validateLead,
    isValid,
    getFieldError
  };
};

export default useLeadValidation;
