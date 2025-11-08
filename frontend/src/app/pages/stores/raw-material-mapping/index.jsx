import { useState, useEffect } from "react";
import { DataTable } from "app/components/listing/DataTable";
import { useInfo, useFeachData } from "hooks/useApiHook";

const pageName = "Raw Material Mapping List";
const doctype = "Raw Material Mapping";
const fields = ['srno', 'item_name', 'item', 'decimal'];

export default function ListData() {
  const [orders, setOrders] = useState([]);

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
      addNewRoute="add-new"
      storageKey="raw_material_mapping"
      data={orders}
      info={info}
      search={search}
      setSearch={setSearch}
      onDeleteRow={handleDeleteRow}
      onDeleteRows={handleDeleteRows}
    />
  );
}
