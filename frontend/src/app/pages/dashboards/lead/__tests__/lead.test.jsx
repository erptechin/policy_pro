/**
 * Phase 1 Frontend Tests
 * Test suite for Lead management frontend components
 * Run with: npm test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Component imports
import LeadStatusField, { StatusBadge, LEAD_STATUS_OPTIONS } from '../components/LeadStatusField';
import CallBackSection from '../components/CallBackSection';
import { useLeadValidation } from '../hooks/useLeadValidation';
import { useFetchLeads } from '../hooks/useFetchLeads';

describe('LeadStatusField Component', () => {
  test('renders status field with all options', () => {
    const mockOnChange = jest.fn();
    render(
      <LeadStatusField
        value="Open"
        onChange={mockOnChange}
        errors={{}}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Check that all status options are available
    fireEvent.click(select);
    LEAD_STATUS_OPTIONS.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  test('calls onChange when status is selected', async () => {
    const mockOnChange = jest.fn();
    render(
      <LeadStatusField
        value="Open"
        onChange={mockOnChange}
        errors={{}}
      />
    );

    const select = screen.getByRole('combobox');
    await userEvent.selectOption(select, 'Won');

    expect(mockOnChange).toHaveBeenCalled();
  });

  test('displays error message when provided', () => {
    render(
      <LeadStatusField
        value="Open"
        onChange={jest.fn()}
        errors={{ status: 'Status is required' }}
      />
    );

    expect(screen.getByText('Status is required')).toBeInTheDocument();
  });

  test('renders disabled when disabled prop is true', () => {
    render(
      <LeadStatusField
        value="Open"
        onChange={jest.fn()}
        errors={{}}
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });
});

describe('StatusBadge Component', () => {
  test('renders status badge with correct color for each status', () => {
    const { rerender } = render(<StatusBadge status="Pending" />);
    let badge = screen.getByText('Pending');
    expect(badge).toHaveClass('bg-gray-100');

    rerender(<StatusBadge status="Open" />);
    badge = screen.getByText('Open');
    expect(badge).toHaveClass('bg-blue-100');

    rerender(<StatusBadge status="Call Back" />);
    badge = screen.getByText('Call Back');
    expect(badge).toHaveClass('bg-orange-100');

    rerender(<StatusBadge status="Won" />);
    badge = screen.getByText('Won');
    expect(badge).toHaveClass('bg-green-100');
  });

  test('renders small badge when small prop is true', () => {
    render(<StatusBadge status="Open" small={true} />);
    const badge = screen.getByText('Open');
    expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');
  });

  test('renders regular badge when small prop is false', () => {
    render(<StatusBadge status="Open" small={false} />);
    const badge = screen.getByText('Open');
    expect(badge).toHaveClass('px-3', 'py-2', 'text-sm');
  });
});

describe('CallBackSection Component', () => {
  test('does not render when status is not "Call Back"', () => {
    const { container } = render(
      <CallBackSection
        status="Open"
        formData={{}}
        onChange={jest.fn()}
        errors={{}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders when status is "Call Back"', () => {
    render(
      <CallBackSection
        status="Call Back"
        formData={{}}
        onChange={jest.fn()}
        errors={{}}
      />
    );

    expect(screen.getByText('Callback Information')).toBeInTheDocument();
    expect(screen.getByLabelText(/Callback Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Callback Time/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Callback Notes/)).toBeInTheDocument();
  });

  test('handles date input change', () => {
    const mockOnChange = jest.fn();
    render(
      <CallBackSection
        status="Call Back"
        formData={{ custom_call_back_date: '' }}
        onChange={mockOnChange}
        errors={{}}
      />
    );

    const dateInput = screen.getByLabelText(/Callback Date/);
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  test('displays error messages for callback fields', () => {
    render(
      <CallBackSection
        status="Call Back"
        formData={{}}
        onChange={jest.fn()}
        errors={{
          custom_call_back_date: 'Callback Date is required',
          custom_call_back_time: 'Callback Time is required'
        }}
      />
    );

    expect(screen.getByText('Callback Date is required')).toBeInTheDocument();
    expect(screen.getByText('Callback Time is required')).toBeInTheDocument();
  });

  test('sets minimum date to today', () => {
    render(
      <CallBackSection
        status="Call Back"
        formData={{}}
        onChange={jest.fn()}
        errors={{}}
      />
    );

    const dateInput = screen.getByLabelText(/Callback Date/);
    const today = new Date().toISOString().split('T')[0];
    expect(dateInput).toHaveAttribute('min', today);
  });
});

describe('useLeadValidation Hook', () => {
  test('validates required lead name', () => {
    const { result } = renderHook(() => useLeadValidation());

    const errors = result.current.validateLead({
      lead_name: '',
      company_name: 'Test'
    });

    expect(errors.lead_name).toBe('Lead Name is required');
  });

  test('validates required company name', () => {
    const { result } = renderHook(() => useLeadValidation());

    const errors = result.current.validateLead({
      lead_name: 'Test',
      company_name: ''
    });

    expect(errors.company_name).toBe('Company Name is required');
  });

  test('validates email format', () => {
    const { result } = renderHook(() => useLeadValidation());

    const errors = result.current.validateLead({
      lead_name: 'Test',
      company_name: 'Test',
      email: 'invalid-email'
    });

    expect(errors.email).toBe('Invalid email format');
  });

  test('validates phone format', () => {
    const { result } = renderHook(() => useLeadValidation());

    const errors = result.current.validateLead({
      lead_name: 'Test',
      company_name: 'Test',
      mobile_no: '123'
    });

    expect(errors.mobile_no).toBe('Invalid phone format');
  });

  test('validates callback date for "Call Back" status', () => {
    const { result } = renderHook(() => useLeadValidation());
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const errors = result.current.validateLead({
      lead_name: 'Test',
      company_name: 'Test',
      email: 'test@example.com',
      status: 'Call Back',
      custom_call_back_date: yesterday
    });

    expect(errors.custom_call_back_date).toBe('Callback Date must be in the future');
  });

  test('validates callback time when callback date is set', () => {
    const { result } = renderHook(() => useLeadValidation());
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const errors = result.current.validateLead({
      lead_name: 'Test',
      company_name: 'Test',
      email: 'test@example.com',
      status: 'Call Back',
      custom_call_back_date: tomorrow,
      custom_call_back_time: ''
    });

    expect(errors.custom_call_back_time).toBe('Callback Time is required when Callback Date is set');
  });

  test('isValid returns true for valid data', () => {
    const { result } = renderHook(() => useLeadValidation());

    const isValid = result.current.isValid({
      lead_name: 'Test',
      company_name: 'Test',
      email: 'test@example.com'
    });

    expect(isValid).toBe(true);
  });

  test('isValid returns false for invalid data', () => {
    const { result } = renderHook(() => useLeadValidation());

    const isValid = result.current.isValid({
      lead_name: '',
      company_name: 'Test'
    });

    expect(isValid).toBe(false);
  });

  test('getFieldError returns specific field error', () => {
    const { result } = renderHook(() => useLeadValidation());

    const error = result.current.getFieldError(
      {
        lead_name: '',
        company_name: 'Test'
      },
      'lead_name'
    );

    expect(error).toBe('Lead Name is required');
  });
});

describe('useFetchLeads Hook', () => {
  // Mock API responses
  const mockLeadsResponse = {
    status: 'success',
    data: {
      leads: [
        {
          name: 'LEAD-001',
          lead_name: 'John Doe',
          status: 'Open',
          company_name: 'ACME'
        },
        {
          name: 'LEAD-002',
          lead_name: 'Jane Smith',
          status: 'Call Back',
          company_name: 'Tech Corp'
        }
      ],
      total: 2,
      page: 1
    }
  };

  beforeEach(() => {
    // Mock leadService.getLeads
    jest.mock('../services/leadService', () => ({
      getLeads: jest.fn().mockResolvedValue(mockLeadsResponse)
    }));
  });

  test('fetches leads on mount', async () => {
    const { result } = renderHook(() => useFetchLeads());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.leads).toEqual(mockLeadsResponse.data.leads);
  });

  test('handles pagination', async () => {
    const { result } = renderHook(() => useFetchLeads());

    await waitFor(() => {
      expect(result.current.pagination.page).toBeDefined();
    });

    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.pagination.page).toBe(2);
  });

  test('handles limit changes', async () => {
    const { result } = renderHook(() => useFetchLeads());

    await waitFor(() => {
      expect(result.current.pagination.limit).toBeDefined();
    });

    act(() => {
      result.current.changeLimitPerPage(20);
    });

    expect(result.current.pagination.limit).toBe(20);
    expect(result.current.pagination.page).toBe(1); // Reset to page 1
  });
});

describe('Lead List Integration Tests', () => {
  test('filters leads by status', async () => {
    const { getByDisplayValue, queryAllByText } = render(
      <LeadListIntegration />
    );

    const statusFilter = getByDisplayValue('All Statuses');

    // Change filter to 'Call Back'
    await userEvent.selectOption(statusFilter, 'Call Back');

    // Should display only Call Back leads
    await waitFor(() => {
      const callBackLeads = queryAllByText(/Call Back/);
      expect(callBackLeads.length).toBeGreaterThan(0);
    });
  });

  test('displays callback date and time in list', async () => {
    render(<LeadListIntegration />);

    await waitFor(() => {
      // Look for formatted callback dates
      expect(screen.getByText(/Nov \d{1,2}, 2024/)).toBeInTheDocument();
    });
  });
});

describe('Lead Form End-to-End Tests', () => {
  test('creates lead successfully', async () => {
    const { getByLabelText, getByRole } = render(<LeadForm />);

    const leadNameInput = getByLabelText(/Lead Name/);
    const companyInput = getByLabelText(/Company Name/);
    const emailInput = getByLabelText(/Email/);
    const submitButton = getByRole('button', { name: /Save/i });

    await userEvent.type(leadNameInput, 'New Lead');
    await userEvent.type(companyInput, 'New Company');
    await userEvent.type(emailInput, 'newlead@example.com');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Lead created successfully/i)).toBeInTheDocument();
    });
  });

  test('schedules callback when status is "Call Back"', async () => {
    const { getByLabelText, getByRole, getByText } = render(<LeadForm />);

    const statusSelect = getByLabelText(/Status/);
    await userEvent.selectOption(statusSelect, 'Call Back');

    // Callback section should now be visible
    expect(getByText('Callback Information')).toBeInTheDocument();

    const dateInput = getByLabelText(/Callback Date/);
    const timeInput = getByLabelText(/Callback Time/);

    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    await userEvent.type(dateInput, tomorrow);
    await userEvent.type(timeInput, '14:30');

    const submitButton = getByRole('button', { name: /Save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Callback scheduled/i)).toBeInTheDocument();
    });
  });
});

// Import required testing utilities
import { renderHook, act } from '@testing-library/react';

// Mock components for integration tests
function LeadListIntegration() {
  const { leads } = useFetchLeads();
  const [statusFilter, setStatusFilter] = useState(null);

  const filteredLeads = statusFilter
    ? leads.filter(lead => lead.status === statusFilter)
    : leads;

  return (
    <div>
      <select value={statusFilter || ''} onChange={(e) => setStatusFilter(e.target.value || null)}>
        <option value="">All Statuses</option>
        {LEAD_STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {filteredLeads.map(lead => (
        <div key={lead.name}>
          <span>{lead.lead_name}</span>
          <StatusBadge status={lead.status} />
        </div>
      ))}
    </div>
  );
}

function LeadForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const { validateLead } = useLeadValidation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateLead(formData);

    if (Object.keys(validationErrors).length === 0) {
      // Form is valid, submit
      alert('Lead created successfully');
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        aria-label="Lead Name"
        value={formData.lead_name || ''}
        onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })}
      />
      <input
        aria-label="Company Name"
        value={formData.company_name || ''}
        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
      />
      <input
        aria-label="Email"
        value={formData.email || ''}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <select
        aria-label="Status"
        value={formData.status || ''}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
      >
        <option value="">Select Status</option>
        {LEAD_STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {formData.status === 'Call Back' && (
        <>
          <input
            aria-label="Callback Date"
            type="date"
            value={formData.custom_call_back_date || ''}
            onChange={(e) => setFormData({ ...formData, custom_call_back_date: e.target.value })}
          />
          <input
            aria-label="Callback Time"
            type="time"
            value={formData.custom_call_back_time || ''}
            onChange={(e) => setFormData({ ...formData, custom_call_back_time: e.target.value })}
          />
        </>
      )}

      <button type="submit">Save</button>

      {Object.entries(errors).map(([field, error]) => (
        <p key={field} style={{ color: 'red' }}>{error}</p>
      ))}
    </form>
  );
}

// Add useState import
import { useState } from 'react';
