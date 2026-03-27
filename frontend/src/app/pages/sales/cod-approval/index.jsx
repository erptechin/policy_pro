import { useState, useEffect } from "react";
import { DataTable } from "app/components/listing/DataTable";
import { useInfo, useFeachData } from "hooks/useApiHook";
import { useAuthContext } from "app/contexts/auth/context";

const pageName = "COD Management List";
const doctype = "COD Management";
const fields = ['type', 'posting_date', 'status', 'lead', 'customer', 'car_profile', 'policy_name', 'policy_amount', 'approval_manager'];

export default function ListData() {
  const [orders, setOrders] = useState([]);
  const {  user } = useAuthContext();
  const { data: info } = useInfo({ doctype, fields: JSON.stringify(fields) });
  const [search, setSearch] = useState({ doctype, page: 1, page_length: 10, fields: null });
  const { data } = useFeachData(search);

  useEffect(() => {
    if (info?.fields) {
      const fieldnames = info?.fields.map(field => field.fieldname);
      setSearch(prev => ({ ...prev, fields: JSON.stringify([...fieldnames, "name"]), filters: JSON.stringify([["COD Management", "approval_manager", "=", user.id]]) }));
    }
  }, [info]);

  useEffect(() => {
    if (data?.data) {
      setOrders(data?.data);
    }
  }, [data]);

  const handleDeleteRow = (row) => {
    setOrders((old) =>
      old.filter((oldRow) => oldRow.order_id !== row.original.order_id),
    );
  };

  const handleDeleteRows = (rows) => {
    const rowIds = rows.map((row) => row.original.order_id);
    setOrders((old) => old.filter((row) => !rowIds.includes(row.order_id)));
  };

  return (
    <DataTable
      pageName={pageName}
      doctype={doctype}
      fields={fields}
      addNewRoute={false}
      hideAddNew={true}
      hideDelete={true}
      hideEdit={true}
      storageKey="cod-approval"
      data={orders}
      info={info}
      search={search}
      setSearch={setSearch}
      onDeleteRow={handleDeleteRow}
      onDeleteRows={handleDeleteRows}
    />
  );
}