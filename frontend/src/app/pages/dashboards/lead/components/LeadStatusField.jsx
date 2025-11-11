/**
 * LeadStatusField Component
 * Custom status field with available status options for Policy Pro
 */

import React from 'react';
import { Select, Label } from 'components/ui';

/**
 * Lead Status Options
 * Defines all available statuses for a lead
 */
export const LEAD_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', color: 'gray' },
  { value: 'Open', label: 'Open', color: 'blue' },
  { value: 'Contacted', label: 'Contacted', color: 'cyan' },
  { value: 'Interested', label: 'Interested', color: 'green' },
  { value: 'Call Back', label: 'Call Back', color: 'orange' },
  { value: 'Already Purchased Insurance', label: 'Already Purchased Insurance', color: 'purple' },
  { value: 'Not Interested', label: 'Not Interested', color: 'red' },
  { value: 'Converted', label: 'Converted', color: 'emerald' },
  { value: 'Won', label: 'Won', color: 'green' },
  { value: 'Lost', label: 'Lost', color: 'slate' }
];

/**
 * Get color class for status badge
 * @param {string} status - Lead status value
 * @returns {string} Tailwind color class
 */
export const getStatusColor = (status) => {
  const option = LEAD_STATUS_OPTIONS.find(opt => opt.value === status);
  return option?.color || 'gray';
};

/**
 * LeadStatusField Component
 * @param {Object} props - Component props
 * @param {string} props.value - Current status value
 * @param {Function} props.onChange - Change handler
 * @param {Object} props.errors - Validation errors
 * @param {boolean} props.disabled - Whether field is disabled
 */
const LeadStatusField = ({ value, onChange, errors, disabled = false }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="status" className="required">
        Status <span className="text-red-500">*</span>
      </Label>
      <Select
        id="status"
        name="status"
        value={value || 'Open'}
        onChange={onChange}
        disabled={disabled}
        className={errors?.status ? 'border-red-500' : ''}
      >
        <option value="">Select Status</option>
        {LEAD_STATUS_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {errors?.status && (
        <p className="text-sm text-red-500 mt-1">{errors.status}</p>
      )}
    </div>
  );
};

/**
 * StatusBadge Component
 * Displays a colored badge for a lead status
 * @param {Object} props - Component props
 * @param {string} props.status - Status value
 * @param {boolean} props.small - Whether to use small size
 */
export const StatusBadge = ({ status, small = false }) => {
  const option = LEAD_STATUS_OPTIONS.find(opt => opt.value === status);
  const colorClass = option?.color || 'gray';

  const colorMap = {
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-700 dark:text-cyan-100',
    green: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100',
    red: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100',
    slate: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
  };

  const sizeClass = small ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';

  return (
    <span className={`inline-block rounded-full font-medium ${colorMap[colorClass]} ${sizeClass}`}>
      {status}
    </span>
  );
};

export default LeadStatusField;
