import DualFormsIcon from 'assets/dualicons/forms.svg?react'
import StatisticIcon from 'assets/nav-icons/statistic.svg?react'
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
            Icon: StatisticIcon,
        },
        {
            id: 'sales.employee',
            path: path(ROOT_MASTERS, '/employee'),
            type: NAV_TYPE_ITEM,
            title: 'Employee',
            transKey: 'nav.sales.employee',
            Icon: StatisticIcon,
        },
        {
            id: 'sales.leads',
            path: path(ROOT_MASTERS, '/leads'),
            type: NAV_TYPE_ITEM,
            title: 'Leads',
            transKey: 'nav.sales.leads',
            Icon: StatisticIcon,
        },
        {
            id: 'sales.sales-order',
            path: path(ROOT_MASTERS, '/sales-order'),
            type: NAV_TYPE_ITEM,
            title: 'Sales Order',
            transKey: 'nav.sales.sales-order',
            Icon: StatisticIcon,
        },
    ]
}
