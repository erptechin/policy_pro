/**
 * Lead Service - API calls for Lead management
 * Handles all lead-related API communications with the backend
 */

import frappe from 'frappe-js-sdk';

export const leadService = {
  /**
   * Get all leads with pagination and filters
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by lead status
   * @param {string} params.owner - Filter by assigned agent
   * @param {number} params.page - Page number (1-indexed)
   * @param {number} params.limit - Records per page
   * @returns {Promise<Object>} Response with leads list
   */
  getLeads: async (params = {}) => {
    try {
      const response = await frappe.call({
        method: 'policy_pro.api.sales.get_leads',
        args: {
          status: params.status || null,
          owner: params.owner || null,
          page: params.page || 1,
          limit: params.limit || 20,
          filters: params.filters || null
        }
      });
      return response.message;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  /**
   * Get single lead by ID
   * @param {string} leadId - Lead document ID
   * @returns {Promise<Object>} Lead document data
   */
  getLead: async (leadId) => {
    try {
      const response = await frappe.call({
        method: 'policy_pro.api.sales.get_lead',
        args: { lead_id: leadId }
      });
      return response.message;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }
  },

  /**
   * Create a new lead
   * @param {Object} leadData - Lead information
   * @param {string} leadData.lead_name - Customer name (required)
   * @param {string} leadData.company_name - Company name (required)
   * @param {string} leadData.email_id - Email address
   * @param {string} leadData.mobile_no - Phone number
   * @param {string} leadData.source - Lead source
   * @returns {Promise<Object>} Created lead response
   */
  createLead: async (leadData) => {
    try {
      const response = await frappe.call({
        method: 'policy_pro.api.sales.create_lead',
        args: {
          lead_name: leadData.lead_name,
          company_name: leadData.company_name,
          email_id: leadData.email_id || null,
          mobile_no: leadData.mobile_no || null,
          source: leadData.source || 'Manual',
          ...leadData // Include any additional fields
        }
      });
      return response.message;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  /**
   * Update lead status and callback details
   * @param {Object} params - Update parameters
   * @param {string} params.lead_id - Lead ID (required)
   * @param {string} params.status - New status (required)
   * @param {string} params.callback_date - Callback date (if status='Call Back')
   * @param {string} params.callback_time - Callback time (if status='Call Back')
   * @param {string} params.notes - Callback notes
   * @returns {Promise<Object>} Update response
   */
  updateLeadStatus: async (params) => {
    try {
      const response = await frappe.call({
        method: 'policy_pro.api.sales.update_lead_status',
        args: {
          lead_id: params.lead_id,
          status: params.status,
          callback_date: params.callback_date || null,
          callback_time: params.callback_time || null,
          notes: params.notes || null
        }
      });
      return response.message;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  },

  /**
   * Get won/converted leads
   * @returns {Promise<Object>} Won leads list
   */
  getWonLeads: async () => {
    try {
      const response = await frappe.call({
        method: 'policy_pro.api.sales.get_won_leads'
      });
      return response.message;
    } catch (error) {
      console.error('Error fetching won leads:', error);
      throw error;
    }
  },

  /**
   * Get leads with scheduled callbacks
   * @param {Object} params - Query parameters
   * @param {string} params.date_from - Start date
   * @param {string} params.date_to - End date
   * @param {string} params.agent_email - Filter by agent
   * @returns {Promise<Object>} Callback leads list
   */
  getCallBackLeads: async (params = {}) => {
    try {
      const response = await frappe.call({
        method: 'policy_pro.api.sales.get_call_back_leads',
        args: {
          date_from: params.date_from || null,
          date_to: params.date_to || null,
          agent_email: params.agent_email || null
        }
      });
      return response.message;
    } catch (error) {
      console.error('Error fetching callback leads:', error);
      throw error;
    }
  }
};

export default leadService;
