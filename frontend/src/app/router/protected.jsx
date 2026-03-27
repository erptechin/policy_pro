// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards/home" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/home")).default,
              }),
            }
          ],
        },
        {
          path: "sales",
          children: [
            {
              index: true,
              element: <Navigate to="/sales/customer" />,
            },
            {
              path: "customer",
              lazy: async () => ({
                Component: (await import("app/pages/sales/customer"))
                  .default,
              }),
            },
            {
              path: "customer/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/customer/form"))
                  .default,
              }),
            },
            {
              path: "customer/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/customer/form"))
                  .default,
              }),
            },
            {
              path: "leads",
              lazy: async () => ({
                Component: (await import("app/pages/sales/leads"))
                  .default,
              }),
            },
            {
              path: "leads/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/leads/form"))
                  .default,
              }),
            },
            {
              path: "leads/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/leads/form"))
                  .default,
              }),
            },
            {
              path: "sales-order",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-order"))
                  .default,
              }),
            },
            {
              path: "sales-order/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-order/form"))
                  .default,
              }),
            },
            {
              path: "sales-order/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-order/form"))
                  .default,
              }),
            },
            {
              path: "sales-invoice",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-invoice"))
                  .default,
              }),
            },
            {
              path: "sales-invoice/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-invoice/form"))
                  .default,
              }),
            },
            {
              path: "sales-invoice/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-invoice/form"))
                  .default,
              }),
            },
            {
              path: "cod-approval",
              lazy: async () => ({
                Component: (await import("app/pages/sales/cod-approval"))
                  .default,
              }),
            },
            {
              path: "cod-approval/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/cod-approval/form"))
                  .default,
              }),
            },
            {
              path: "cod-approval/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/cod-approval/form"))
                  .default,
              }),
            },
            {
              path: "cod-manager",
              lazy: async () => ({
                Component: (await import("app/pages/sales/cod-manager"))
                  .default,
              }),
            },
            {
              path: "cod-manager/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/cod-manager/form"))
                  .default,
              }),
            },
            {
              path: "cod-manager/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/cod-manager/form"))
                  .default,
              }),
            },
            {
              path: "sales-agent",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-agent"))
                  .default,
              }),
            },
            {
              path: "sales-agent/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-agent/form"))
                  .default,
              }),
            },
            {
              path: "sales-agent/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-agent/form"))
                  .default,
              }),
            },

          ]
        }
      ]
    },
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
            {
              path: "sessions",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Sessions")
                ).default,
              }),
            }
          ],
        },
      ],
    },
  ]
};

export { protectedRoutes };
