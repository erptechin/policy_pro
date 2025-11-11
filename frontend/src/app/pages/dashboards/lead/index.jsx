import { useState, useEffect } from "react";
import { DataTable } from "app/components/listing/DataTable";
import { useInfo, useFeachData } from "hooks/useApiHook";
import { StatusBadge, LEAD_STATUS_OPTIONS } from "./components/LeadStatusField";
import { useNavigate } from "react-router";

const pageName = "Lead List";
const doctype = "Lead";
const fields = [
  'lead_name',
  'status',
  'source',
  'email',
  'phone',
  'company_name',
  'custom_call_back_date',
  'custom_call_back_time',
  'owner'
];

export default function ListData() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const navigate = useNavigate();

  const { data: info } = useInfo({ doctype, fields: JSON.stringify(fields) });
  const [search, setSearch] = useState({ doctype, page: 1, page_length: 10, fields: null });
  const { data } = useFeachData(search);

  useEffect(() => {
    if (info?.fields) {
      const fieldnames = info?.fields.map(field => field.fieldname);
      setSearch(prev => ({ ...prev, fields: JSON.stringify([...fieldnames, "name"]) }));
    }
  }, [info]);

  useEffect(() => {
    if (data?.data) {
      // Apply status filter if selected
      let filteredData = data?.data;
      if (statusFilter) {
        filteredData = filteredData.filter(lead => lead.status === statusFilter);
      }
      setOrders(filteredData);
    }
  }, [data, statusFilter]);

  const handleDeleteRow = (row) => {
    setOrders((old) =>
      old.filter((oldRow) => oldRow.name !== row.original.name),
    );
  };

  const handleDeleteRows = (rows) => {
    const rowIds = rows.map((row) => row.original.name);
    setOrders((old) => old.filter((row) => !rowIds.includes(row.name)));
  };

  // Format callback date and time for display
  const formatCallbackInfo = (date, time) => {
    if (!date) return '-';
    try {
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return time ? `${formattedDate} ${time}` : formattedDate;
    } catch (e) {
      return '-';
    }
  };

  // Enrich data with callback info for display
  const enrichedData = orders.map(lead => ({
    ...lead,
    callback_scheduled: formatCallbackInfo(lead.custom_call_back_date, lead.custom_call_back_time)
  }));

  // Get unique status values for filter dropdown
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...LEAD_STATUS_OPTIONS
  ];

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="px-4 pt-4">
        <div className="flex items-center space-x-3">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-500 dark:bg-dark-800 dark:text-gray-200 dark:hover:border-dark-400"
          >
            {statusOptions.map(option => (
              <option key={option.value || 'all'} value={option.value || ''}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {orders.length} lead{orders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div>
        <DataTable
          pageName={pageName}
          doctype={doctype}
          fields={[...fields, 'callback_scheduled']}
          addNewRoute="add-new"
          storageKey="leads"
          data={enrichedData}
          info={info}
          search={search}
          setSearch={setSearch}
          onDeleteRow={handleDeleteRow}
          onDeleteRows={handleDeleteRows}
        />
      </div>
    </div>
  );
}

