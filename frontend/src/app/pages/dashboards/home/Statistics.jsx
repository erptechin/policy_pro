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
    leadUsers: 0,
    salesOrders: 0,
  });

  // Fetch counts for Leads, Users, and Sales Orders
  const { data: infoLead } = useInfo({ doctype: "Lead", fields: JSON.stringify(["name"]) });
  const { data: infoUser } = useInfo({ doctype: "User", fields: JSON.stringify(["name"]) });
  const { data: infoSalesOrder } = useInfo({ doctype: "Sales Order", fields: JSON.stringify(["name"]) });

  const [searchLead, setSearchLead] = useState({ doctype: "Lead", page: 1, page_length: 1, fields: null });
  const [searchUser, setSearchUser] = useState({
    doctype: "User",
    page: 1,
    page_length: 1,
    fields: null,
    filters: JSON.stringify([["role_profile_name", "=", "Lead Manager"]])
  });
  const [searchUserLeadUser, setSearchUserLeadUser] = useState({
    doctype: "User",
    page: 1,
    page_length: 1,
    fields: null,
    filters: JSON.stringify([["role_profile_name", "=", "Lead User"]])
  });
  const [searchSalesOrder, setSearchSalesOrder] = useState({ doctype: "Sales Order", page: 1, page_length: 1, fields: null });

  const { data: dataLead } = useFeachData(searchLead);
  const { data: dataUser } = useFeachData(searchUser);
  const { data: dataUserLeadUser } = useFeachData(searchUserLeadUser);
  const { data: dataSalesOrder } = useFeachData(searchSalesOrder);

  // Set up fields for count queries
  useEffect(() => {
    if (infoLead?.fields) {
      const fieldnames = infoLead.fields.map(field => field.fieldname);
      setSearchLead(prev => ({ ...prev, fields: JSON.stringify([...fieldnames, "name"]) }));
    }
  }, [infoLead]);

  useEffect(() => {
    if (infoUser?.fields) {
      const fieldnames = infoUser.fields.map(field => field.fieldname);
      setSearchUser(prev => ({
        ...prev,
        fields: JSON.stringify([...fieldnames, "name"]),
        filters: JSON.stringify([["role_profile_name", "=", "Lead Manager"]])
      }));
    }
  }, [infoUser]);

  useEffect(() => {
    if (infoUser?.fields) {
      const fieldnames = infoUser.fields.map(field => field.fieldname);
      setSearchUserLeadUser(prev => ({
        ...prev,
        fields: JSON.stringify([...fieldnames, "name"]),
        filters: JSON.stringify([["role_profile_name", "=", "Lead User"]])
      }));
    }
  }, [infoUser]);

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
    if (dataUser?.counts !== undefined) {
      setCounts(prev => ({ ...prev, customers: dataUser.counts }));
    }
  }, [dataUser]);

  useEffect(() => {
    if (dataUserLeadUser?.counts !== undefined) {
      setCounts(prev => ({ ...prev, leadUsers: dataUserLeadUser.counts }));
    }
  }, [dataUserLeadUser]);

  useEffect(() => {
    if (dataSalesOrder?.counts !== undefined) {
      setCounts(prev => ({ ...prev, salesOrders: dataSalesOrder.counts }));
    }
  }, [dataSalesOrder]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 lg:gap-6">
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
            <p className="truncate text-xs-plus">Lead Manager</p>
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
              {counts.leadUsers}
            </p>
            <p className="truncate text-xs-plus">Lead User</p>
          </div>
          <Avatar
            size={10}
            initialColor="warning"
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
