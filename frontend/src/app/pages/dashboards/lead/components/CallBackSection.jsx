/**
 * CallBackSection Component
 * Displays callback scheduling fields for leads
 */

import React from 'react';
import { Input, Textarea, Label } from 'components/ui';

/**
 * CallBackSection - Shows callback date, time, and notes fields
 * Only visible when lead status is "Call Back"
 * @param {Object} props - Component props
 * @param {string} props.status - Current lead status
 * @param {Object} props.formData - Form data object
 * @param {Function} props.onChange - Change handler for form fields
 * @param {Object} props.errors - Validation errors object
 */
const CallBackSection = ({ status, formData, onChange, errors }) => {
  // Only show when status is "Call Back"
  if (status !== 'Call Back') {
    return null;
  }

  const handleDateChange = (e) => {
    onChange({
      target: {
        name: 'custom_call_back_date',
        value: e.target.value
      }
    });
  };

  const handleTimeChange = (e) => {
    onChange({
      target: {
        name: 'custom_call_back_time',
        value: e.target.value
      }
    });
  };

  const handleNotesChange = (e) => {
    onChange({
      target: {
        name: 'custom_call_back_notes',
        value: e.target.value
      }
    });
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4 border border-blue-200 dark:border-blue-800">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200">
        Callback Information
      </h3>

      {/* Callback Date */}
      <div className="space-y-2">
        <Label htmlFor="callback_date" className="required">
          Callback Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="callback_date"
          type="date"
          name="custom_call_back_date"
          value={formData?.custom_call_back_date || ''}
          onChange={handleDateChange}
          min={today}
          className={errors?.custom_call_back_date ? 'border-red-500' : ''}
          required
        />
        {errors?.custom_call_back_date && (
          <p className="text-sm text-red-500 mt-1">
            {errors.custom_call_back_date}
          </p>
        )}
      </div>

      {/* Callback Time */}
      <div className="space-y-2">
        <Label htmlFor="callback_time" className="required">
          Callback Time <span className="text-red-500">*</span>
        </Label>
        <Input
          id="callback_time"
          type="time"
          name="custom_call_back_time"
          value={formData?.custom_call_back_time || ''}
          onChange={handleTimeChange}
          className={errors?.custom_call_back_time ? 'border-red-500' : ''}
          required
        />
        {errors?.custom_call_back_time && (
          <p className="text-sm text-red-500 mt-1">
            {errors.custom_call_back_time}
          </p>
        )}
      </div>

      {/* Callback Notes */}
      <div className="space-y-2">
        <Label htmlFor="callback_notes">
          Callback Notes
        </Label>
        <Textarea
          id="callback_notes"
          name="custom_call_back_notes"
          value={formData?.custom_call_back_notes || ''}
          onChange={handleNotesChange}
          placeholder="Add any notes related to this callback..."
          rows={3}
          className="resize-vertical"
        />
        {errors?.custom_call_back_notes && (
          <p className="text-sm text-red-500 mt-1">
            {errors.custom_call_back_notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default CallBackSection;
