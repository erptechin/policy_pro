// Import Dependencies
import { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";

// Local Imports
import { Avatar, Card } from "components/ui";
import { getSalesReport } from "utils/apis";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export function SalesReport() {
  const { isAuthenticated } = useAuthContext();
  const [salesData, setSalesData] = useState([]);

  // Fetch sales report data
  const { data, isLoading } = useQuery({
    queryKey: ["sales-report"],
    queryFn: () => getSalesReport(),
    enabled: isAuthenticated,
  });

  // Update sales data when API response is received
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setSalesData(data);
    }
  }, [data]);

  // Get top performer (highest total value)
  const topPerformer = useMemo(() => {
    if (salesData.length === 0) return null;
    return salesData[0];
  }, [salesData]);

  return (
    <Card className="p-4 sm:px-5">
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-dark-300">
            Loading sales data...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {salesData.map((agent, index) => {
                const isTopPerformer = topPerformer && agent.name === topPerformer.name;
                return (
                  <div
                    key={agent.user_name || index}
                    className={clsx(
                      "relative rounded-lg border p-4 transition-shadow hover:shadow-md",
                      "border-gray-200 bg-white dark:border-dark-500 dark:bg-dark-700"
                    )}
                  >
                    {isTopPerformer && (
                      <div className="absolute -top-2 -right-2 z-10 flex items-center justify-center bg-yellow-400 rounded-full p-1 shadow-lg">
                        <svg
                          className="h-5 w-5 text-yellow-900"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V7C19 9.76 16.76 12 14 12H13V16H16C16.55 16 17 16.45 17 17S16.55 18 16 18H8C7.45 18 7 17.55 7 17S7.45 16 8 16H11V12H10C7.24 12 5 9.76 5 7V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V7C7 8.66 8.34 10 10 10H14C15.66 10 17 8.66 17 7V6H7Z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Avatar
                        size={12}
                        src={agent.image}
                        alt={agent.name}
                        initialColor="primary"
                        classNames={{ display: "rounded-full" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-base font-semibold text-gray-800 dark:text-dark-50 truncate">
                            {agent.name}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-dark-300 mb-1">Leads</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {agent.leads}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-dark-300 mb-1">Deals</p>
                            <p className="text-lg font-bold text-cyan-500 dark:text-cyan-400">
                              {agent.deals}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-500">
                          <p className="text-xs text-gray-500 dark:text-dark-300 mb-1">Total Value</p>
                          <p className="text-lg font-bold text-orange-500 dark:text-orange-400">
                            {agent.totalValue.toFixed(2)} AED
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {salesData.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500 dark:text-dark-300">
                No sales data available
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
