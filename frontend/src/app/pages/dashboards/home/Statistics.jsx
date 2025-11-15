// Import Dependencies
import {
  UserGroupIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";

// Local Imports
import { Avatar, Card } from "components/ui";
import { getStatistics } from "utils/apis";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export function Statistics() {
  const { isAuthenticated } = useAuthContext();

  // Fetch statistics data
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["statistics"],
    queryFn: () => getStatistics(),
    enabled: isAuthenticated,
  });

  // Default values if data is not loaded yet
  const counts = {
    leads: statistics?.leads ?? 0,
    customers: statistics?.leadManagers ?? 0,
    leadUsers: statistics?.leadUsers ?? 0,
    salesOrders: statistics?.salesOrders ?? 0,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 lg:gap-6">
      <Card className="p-4.5">
        <div className="flex min-w-0 items-center justify-between">
          <div>
            <p className="text-base font-semibold text-gray-800 dark:text-dark-100">
              {isLoading ? "..." : counts.leads}
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
              {isLoading ? "..." : counts.customers}
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
              {isLoading ? "..." : counts.leadUsers}
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
              {isLoading ? "..." : counts.salesOrders}
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
