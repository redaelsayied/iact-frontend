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
                key: 'admin.dashboard',
                path: '/admin/dashboard',
                title: 'Admin Dashboard',
                translateKey: 'nav.adminDashboard',
                icon: 'groupSingleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['Admin'],
                subMenu: [],
            },
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
            {
                key: 'admin.profile',
                path: '/admin/profile',
                title: 'Admin Profile',
                translateKey: 'nav.adminProfile',
                icon: 'singleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['Admin'],
                subMenu: [],
            },
            {
                key: 'admin.settings',
                path: '/admin/settings',
                title: 'Account Settings',
                translateKey: 'nav.adminSettings',
                icon: 'singleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['Admin'],
                subMenu: [],
            },
        ],
    },
]

export default adminNavigationConfig
