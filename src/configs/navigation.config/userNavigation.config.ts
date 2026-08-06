import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

const userNavigationConfig: NavigationTree[] = [
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
            {
                key: 'user.settings',
                path: '/user/settings',
                title: 'Account Settings',
                translateKey: 'nav.userSettings',
                icon: 'singleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
]

export default userNavigationConfig
