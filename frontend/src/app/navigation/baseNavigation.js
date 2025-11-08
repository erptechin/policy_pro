import { NAV_TYPE_ITEM, } from "constants/app.constant";
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import PeoplePlusIcon from 'assets/nav-icons/people-plus.svg?react'
import PeopleIcon from 'assets/nav-icons/people.svg?react'
import ShoppingCartIcon from 'assets/nav-icons/shopping-cart.svg?react'
import UserIcon from 'assets/nav-icons/user.svg?react'

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
        Icon: PeoplePlusIcon,
    },
    {
        id: 'customer',
        type: NAV_TYPE_ITEM,
        path: '/sales/customer',
        title: 'Customer',
        transKey: 'nav.sales.customer',
        Icon: PeopleIcon,
    },
    {
        id: 'sales-order',
        type: NAV_TYPE_ITEM,
        path: '/sales/sales-order',
        title: 'Sales Order',
        transKey: 'nav.sales.sales-order',
        Icon: ShoppingCartIcon,
    },
    {
        id: 'users',
        type: NAV_TYPE_ITEM,
        path: '/dashboards/users',
        title: 'Users',
        transKey: 'nav.users.users',
        Icon: UserIcon,
    }
]
