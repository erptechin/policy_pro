import DualFormsIcon from 'assets/dualicons/forms.svg?react'
import UserIcon from 'assets/nav-icons/user.svg?react'
import PeopleMonitorIcon from 'assets/nav-icons/people-monitor.svg?react'
import MegaphoneIcon from 'assets/nav-icons/megaphone.svg?react'
import OrderTimerIcon from 'assets/nav-icons/order-timer.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_MASTERS = '/sales'

const path = (root, item) => `${root}${item}`;

export const sales = {
    id: 'sales',
    type: NAV_TYPE_ROOT,
    path: '/sales',
    title: 'Sales',
    transKey: 'nav.sales.sales',
    Icon: DualFormsIcon,
    childs: [
        {
            id: 'sales.customer',
            path: path(ROOT_MASTERS, '/customer'),
            type: NAV_TYPE_ITEM,
            title: 'Customer',
            transKey: 'nav.sales.customer',
            Icon: UserIcon,
        },
        {
            id: 'sales.leads',
            path: path(ROOT_MASTERS, '/leads'),
            type: NAV_TYPE_ITEM,
            title: 'Leads',
            transKey: 'nav.sales.leads',
            Icon: MegaphoneIcon,
        },
        {
            id: 'sales.sales-order',
            path: path(ROOT_MASTERS, '/sales-order'),
            type: NAV_TYPE_ITEM,
            title: 'Sales Order',
            transKey: 'nav.sales.sales-order',
            Icon: OrderTimerIcon,
        },
        {
            id: 'sales.cod-approval',
            path: path(ROOT_MASTERS, '/cod-approval'),
            type: NAV_TYPE_ITEM,
            title: 'Sales Order',
            transKey: 'nav.sales.cod-approval',
            Icon: OrderTimerIcon,
        },
        {
            id: 'sales.cod-manager',
            path: path(ROOT_MASTERS, '/cod-manager'),
            type: NAV_TYPE_ITEM,
            title: 'COD Manager',
            transKey: 'nav.sales.cod-manager',
            Icon: PeopleMonitorIcon,
        },
        {
            id: 'sales.sales-agent',
            path: path(ROOT_MASTERS, '/sales-agent'),
            type: NAV_TYPE_ITEM,
            title: 'Sales Agent',
            transKey: 'nav.sales.sales-agent',
            Icon: UserIcon,
        },
    ]
}
