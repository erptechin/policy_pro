// Import Dependencies
import {
  UserGroupIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

// Local Imports
import { Avatar, Card } from "components/ui";
import { useInfo, useFeachData } from "hooks/useApiHook";

// ----------------------------------------------------------------------

export function Statistics() {
  const [counts, setCounts] = useState({
    leads: 0,
    customers: 0,
    salesOrders: 0,
  });

  // Fetch counts for Leads, Customers, and Sales Orders
  const { data: infoLead } = useInfo({ doctype: "Lead", fields: JSON.stringify(["name"]) });
  const { data: infoCustomer } = useInfo({ doctype: "Customer", fields: JSON.stringify(["name"]) });
  const { data: infoSalesOrder } = useInfo({ doctype: "Sales Order", fields: JSON.stringify(["name"]) });

  const [searchLead, setSearchLead] = useState({ doctype: "Lead", page: 1, page_length: 1, fields: null });
  const [searchCustomer, setSearchCustomer] = useState({ doctype: "Customer", page: 1, page_length: 1, fields: null });
  const [searchSalesOrder, setSearchSalesOrder] = useState({ doctype: "Sales Order", page: 1, page_length: 1, fields: null });

  const { data: dataLead } = useFeachData(searchLead);
  const { data: dataCustomer } = useFeachData(searchCustomer);
  const { data: dataSalesOrder } = useFeachData(searchSalesOrder);

  // Set up fields for count queries
  useEffect(() => {
    if (infoLead?.fields) {
      const fieldnames = infoLead.fields.map(field => field.fieldname);
      setSearchLead(prev => ({ ...prev, fields: JSON.stringify([...fieldnames, "name"]) }));
    }
  }, [infoLead]);

  useEffect(() => {
    if (infoCustomer?.fields) {
      const fieldnames = infoCustomer.fields.map(field => field.fieldname);
      setSearchCustomer(prev => ({ ...prev, fields: JSON.stringify([...fieldnames, "name"]) }));
    }
  }, [infoCustomer]);

  useEffect(() => {
    if (infoSalesOrder?.fields) {
      const fieldnames = infoSalesOrder.fields.map(field => field.fieldname);
      setSearchSalesOrder(prev => ({ ...prev, fields: JSON.stringify([...fieldnames, "name"]) }));
    }
  }, [infoSalesOrder]);

  // Update counts from API responses
  useEffect(() => {
    if (dataLead?.counts !== undefined) {
      setCounts(prev => ({ ...prev, leads: dataLead.counts }));
    }
  }, [dataLead]);

  useEffect(() => {
    if (dataCustomer?.counts !== undefined) {
      setCounts(prev => ({ ...prev, customers: dataCustomer.counts }));
    }
  }, [dataCustomer]);

  useEffect(() => {
    if (dataSalesOrder?.counts !== undefined) {
      setCounts(prev => ({ ...prev, salesOrders: dataSalesOrder.counts }));
    }
  }, [dataSalesOrder]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
        <Card className="p-4.5">
          <div className="flex min-w-0 items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-800 dark:text-dark-100">
                {counts.leads}
              </p>
              <p className="truncate text-xs-plus">Leads</p>
            </div>
            <Avatar
              size={10}
              initialColor="primary"
              classNames={{ display: "mask is-star rounded-none" }}
            >
              <UserGroupIcon className="size-5" />
            </Avatar>
          </div>
        </Card>
        <Card className="p-4.5">
          <div className="flex min-w-0 items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-800 dark:text-dark-100">
                {counts.customers}
              </p>
              <p className="truncate text-xs-plus">Customers</p>
            </div>
            <Avatar
              size={10}
              initialColor="success"
              classNames={{ display: "mask is-star rounded-none" }}
            >
              <UserGroupIcon className="size-5" />
            </Avatar>
          </div>
        </Card>
        <Card className="p-4.5">
          <div className="flex min-w-0 items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-800 dark:text-dark-100">
                {counts.salesOrders}
              </p>
              <p className="truncate text-xs-plus">Sales Orders</p>
            </div>
            <Avatar
              size={10}
              initialColor="info"
              classNames={{ display: "mask is-star rounded-none" }}
            >
              <ShoppingCartIcon className="size-5" />
            </Avatar>
          </div>
        </Card>
    </div>
  );
}
