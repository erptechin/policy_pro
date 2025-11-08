import PeopleIcon from 'assets/nav-icons/people.svg?react'
import { NAV_TYPE_ITEM } from 'constants/app.constant'

export const users = {
    id: 'users',
    type: NAV_TYPE_ITEM,
    path: '/dashboards/users',
    title: 'Users',
    transKey: 'nav.users.users',
    Icon: PeopleIcon,
}

