import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

const adminNavigationConfig: NavigationTree[] = [
    {
        key: 'adminMenu',
        path: '',
        title: 'Admin Management',
        translateKey: 'nav.adminMenu',
        icon: 'groupMenu',
        type: NAV_ITEM_TYPE_TITLE,
        authority: ['Admin'],
        subMenu: [
            {
                key: 'admin.users',
                path: '/admin/users',
                title: 'Users List',
                translateKey: 'nav.usersList',
                icon: 'groupCollapseMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['Admin'],
                subMenu: [],
            },
        ],
    },
]

export default adminNavigationConfig
