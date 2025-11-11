/**
 * useFetchLeads Hook
 * Fetch and manage lead list data
 */

import { useState, useEffect, useCallback } from 'react';
import leadService from '../services/leadService';

/**
 * Hook to fetch leads with filtering and pagination
 * @param {Object} options - Options for fetching
 * @param {string} options.status - Filter by status
 * @param {string} options.owner - Filter by owner/assigned agent
 * @param {number} options.page - Current page (default: 1)
 * @param {number} options.limit - Records per page (default: 20)
 * @returns {Object} Leads data, loading state, error, and pagination info
 */
export const useFetchLeads = (options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: options.page || 1,
    limit: options.limit || 20,
    total: 0
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await leadService.getLeads({
        status: options.status,
        owner: options.owner,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response?.status === 'success') {
        setData(response.data.leads || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
      } else {
        setError(response?.message || 'Failed to fetch leads');
      }
    } catch (err) {
      setError(err.message || 'Error fetching leads');
      console.error('Fetch leads error:', err);
    } finally {
      setLoading(false);
    }
  }, [options.status, options.owner, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const changeLimitPerPage = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return {
    leads: data || [],
    loading,
    error,
    pagination: {
      ...pagination,
      totalPages
    },
    goToPage,
    changeLimitPerPage,
    refetch: fetchLeads
  };
};

/**
 * Hook to fetch won/converted leads
 * @returns {Object} Won leads data, loading state, error
 */
export const useFetchWonLeads = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWonLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await leadService.getWonLeads();

      if (response?.status === 'success') {
        setData(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch won leads');
      }
    } catch (err) {
      setError(err.message || 'Error fetching won leads');
      console.error('Fetch won leads error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWonLeads();
  }, [fetchWonLeads]);

  return {
    wonLeads: data,
    loading,
    error,
    refetch: fetchWonLeads
  };
};

/**
 * Hook to fetch callback scheduled leads
 * @param {Object} options - Options for fetching
 * @param {string} options.dateFrom - Start date
 * @param {string} options.dateTo - End date
 * @param {string} options.agentEmail - Filter by agent email
 * @returns {Object} Callback leads data, loading state, error
 */
export const useFetchCallBackLeads = (options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCallBackLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await leadService.getCallBackLeads({
        date_from: options.dateFrom,
        date_to: options.dateTo,
        agent_email: options.agentEmail
      });

      if (response?.status === 'success') {
        setData(response.data.leads || []);
      } else {
        setError(response?.message || 'Failed to fetch callback leads');
      }
    } catch (err) {
      setError(err.message || 'Error fetching callback leads');
      console.error('Fetch callback leads error:', err);
    } finally {
      setLoading(false);
    }
  }, [options.dateFrom, options.dateTo, options.agentEmail]);

  useEffect(() => {
    fetchCallBackLeads();
  }, [fetchCallBackLeads]);

  return {
    callbackLeads: data,
    loading,
    error,
    refetch: fetchCallBackLeads
  };
};

export default useFetchLeads;
