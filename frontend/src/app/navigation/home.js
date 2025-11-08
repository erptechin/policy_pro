import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import StatisticIcon from 'assets/nav-icons/statistic.svg?react'
import PeopleIcon from 'assets/nav-icons/people.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_DASHBOARDS = '/dashboards'

const path = (root, item) => `${root}${item}`;

export const dashboards = {
    id: 'dashboards',
    type: NAV_TYPE_ITEM,
    path: path(ROOT_DASHBOARDS, '/home'),
    title: 'Dashboard',
    transKey: 'nav.dashboards.dashboards',
    Icon: DashboardsIcon,
}