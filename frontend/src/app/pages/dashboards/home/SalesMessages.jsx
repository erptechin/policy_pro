// Import Dependencies
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

// Local Imports
import { Card } from "components/ui";
import { getSalesTargetSummary } from "utils/apis";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export function SalesMessages() {
  const { isAuthenticated } = useAuthContext();

  // Fetch sales target summary data
  const { data, isLoading } = useQuery({
    queryKey: ["sales-target-summary"],
    queryFn: () => getSalesTargetSummary(),
    enabled: isAuthenticated,
  });

  const todayDeals = data?.todayDeals ?? 0;
  const todayRevenue = data?.todayRevenue ?? 0;
  const salesTargetData = data?.salesTargetData ?? [];

  // Format revenue target with 'k' suffix for thousands
  const formatRevenueTarget = (value) => {
    if (value === 0) return "0";
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-4">
      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Today's Deals Card */}
        <Card className="p-6 bg-blue-600 border-0">
          <div className="text-white">
            <p className="text-4xl font-bold mb-2">
              {isLoading ? "..." : todayDeals}
            </p>
            <p className="text-sm opacity-90">Today&apos;s Deals</p>
          </div>
        </Card>

        {/* Today's Revenue Card */}
        <Card className="p-6 bg-orange-500 border-0">
          <div className="text-white">
            <p className="text-4xl font-bold mb-2">
              {isLoading ? "..." : todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm opacity-90">Today&apos;s Revenue (AED)</p>
          </div>
        </Card>
      </div>

      {/* Sales Target Summary Table */}
      <Card className="p-0 overflow-hidden">
        {/* Green Banner Header */}
        <div className="bg-green-600 px-4 py-3 sm:px-5">
          <h2 className="text-lg font-semibold text-white">
            Sales Target Summary Today
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-dark-300">
              Loading sales target data...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-dark-200 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-dark-200 uppercase">
                    Total Deals
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-dark-200 uppercase">
                    Sales Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-dark-200 uppercase">
                    Revenue Mode
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-500">
                {salesTargetData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-dark-300">
                      No sales data available
                    </td>
                  </tr>
                ) : (
                  salesTargetData.map((agent, index) => (
                    <tr
                      key={agent.user_name || index}
                      className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-dark-100">
                        {agent.name}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {agent.totalDeals}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-dark-100">
                        {agent.salesTarget}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                        {agent.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
