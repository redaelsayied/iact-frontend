import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'userMenu',
        path: '',
        title: 'User Menu',
        translateKey: 'nav.userMenu',
        icon: 'home',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [],
        subMenu: [
            {
                key: 'user.home',
                path: '/user/home',
                title: 'User Home',
                translateKey: 'nav.userHome',
                icon: 'home',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'user.profile',
                path: '/user/profile',
                title: 'My Profile',
                translateKey: 'nav.userProfile',
                icon: 'singleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
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
        ],
    },
]

export default navigationConfig
