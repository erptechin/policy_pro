// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router";

// Local Imports
import { Avatar, Button, Card } from "components/ui";
import { useInfo, useFeachData } from "hooks/useApiHook";

// ----------------------------------------------------------------------

const doctype = "Sales Order";
const fields = ['customer', 'status', 'total', 'delivery_date', 'po_no'];

export function ClientMessages() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const { data: info } = useInfo({ doctype, fields: JSON.stringify(fields) });
  const [search, setSearch] = useState({ doctype, page: 1, page_length: 5, fields: null });
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

  return (
    <Card className="px-4 pb-4 sm:px-5">
      <div className="flex h-14 min-w-0 items-center justify-between py-3">
        <h2 className="font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Sales Orders
        </h2>
        <ActionMenu />
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between gap-2"
            onClick={() => navigate(`/sales/sales-order/${order.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                size={10}
                name={order.customer || order.id}
                initialColor="auto"
              />
              <div className="min-w-0">
                <div className="flex items-center space-x-2 ">
                  <p className="font-medium text-gray-800 dark:text-dark-100">
                    {order.customer || order.id}
                  </p>
                  {order.status && (
                    <div className="flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-gray-200 px-1.5 text-tiny-plus font-medium leading-none text-gray-800 dark:bg-dark-450 dark:text-white">
                      {order.status}
                    </div>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-dark-300">
                  {order.total ? `Total: ${order.total}` : order.po_no || order.id}
                </p>
              </div>
            </div>
            <a
              href="##"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/sales/sales-order/${order.id}`);
              }}
              className="hover:text-primary-600 focus:text-primary-600 dark:hover:text-primary-400 dark:focus:text-primary-400"
            >
              <ChevronRightIcon className="size-5 ltr:-mr-1 rtl:-ml-1 rtl:rotate-180" />
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActionMenu() {
  const navigate = useNavigate();
  
  return (
    <Menu
      as="div"
      className="relative inline-block text-left ltr:-mr-1.5 rtl:-ml-1.5"
    >
      <MenuButton
        as={Button}
        variant="flat"
        isIcon
        className="size-8 rounded-full"
      >
        <EllipsisHorizontalIcon className="size-5" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <MenuItems className="absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-700 dark:shadow-none ltr:right-0 rtl:left-0">
          <MenuItem>
            {({ focus }) => (
              <button
                onClick={() => navigate('/sales/sales-order')}
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <span>View All</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
