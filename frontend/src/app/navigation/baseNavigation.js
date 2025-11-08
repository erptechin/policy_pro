import { NAV_TYPE_ITEM, } from "constants/app.constant";
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import StatisticIcon from 'assets/nav-icons/statistic.svg?react'
import PeopleIcon from 'assets/nav-icons/people.svg?react'

export const baseNavigation = [
    {
        id: 'dashboards',
        type: NAV_TYPE_ITEM,
        path: '/dashboards/home',
        title: 'Dashboard',
        transKey: 'nav.dashboards.dashboards',
        Icon: DashboardsIcon,
    },
    {
        id: 'lead',
        type: NAV_TYPE_ITEM,
        path: '/dashboards/lead/add-new',
        title: 'Add Lead',
        transKey: 'nav.lead.lead',
        Icon: StatisticIcon,
    },
    {
        id: 'customer',
        type: NAV_TYPE_ITEM,
        path: '/sales/customer',
        title: 'Customer',
        transKey: 'nav.sales.customer',
        Icon: StatisticIcon,
    },
    {
        id: 'sales-order',
        type: NAV_TYPE_ITEM,
        path: '/sales/sales-order',
        title: 'Sales Order',
        transKey: 'nav.sales.sales-order',
        Icon: StatisticIcon,
    },
    {
        id: 'users',
        type: NAV_TYPE_ITEM,
        path: '/dashboards/users',
        title: 'Users',
        transKey: 'nav.users.users',
        Icon: PeopleIcon,
    }
]
