import { NAV_TYPE_ITEM, } from "constants/app.constant";
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import UserIcon from 'assets/nav-icons/user.svg?react'
import PeopleMonitorIcon from 'assets/nav-icons/people-monitor.svg?react'
import MegaphoneIcon from 'assets/nav-icons/megaphone.svg?react'
import OrderTimerIcon from 'assets/nav-icons/order-timer.svg?react'

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
        id: 'customer',
        type: NAV_TYPE_ITEM,
        path: '/sales/customer',
        title: 'Customer',
        transKey: 'nav.sales.customer',
        Icon: UserIcon,
    },
    {
        id: 'leads',
        type: NAV_TYPE_ITEM,
        path: '/sales/leads',
        title: 'Leads',
        transKey: 'nav.sales.leads',
        Icon: MegaphoneIcon,
    },
    {
        id: 'sales-order',
        type: NAV_TYPE_ITEM,
        path: '/sales/sales-order',
        title: 'Sales Order',
        transKey: 'nav.sales.sales-order',
        Icon: OrderTimerIcon,
    }
]
