import ShoppingCartIcon from 'assets/nav-icons/shopping-cart.svg?react'
import { NAV_TYPE_ITEM } from 'constants/app.constant'

export const salesOrder = {
    id: 'sales-order',
    type: NAV_TYPE_ITEM,
    path: '/sales/sales-order',
    title: 'Sales Order',
    transKey: 'nav.sales.sales-order',
    Icon: ShoppingCartIcon,
}

