import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const userRoute: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/user/UserHome')),
        authority: [],
    },
    {
        key: 'user.home',
        path: '/user/home',
        component: lazy(() => import('@/views/user/UserHome')),
        authority: [],
    },
    {
        key: 'user.profile',
        path: '/user/profile',
        component: lazy(() => import('@/views/user/UserProfile')),
        authority: [],
    },
    {
        key: 'user.settings',
        path: '/user/settings',
        component: lazy(() => import('@/views/user/UserSettings')),
        authority: [],
    },
    {
        key: 'user.changePassword',
        path: '/user/change-password',
        component: lazy(() => import('@/views/user/UserSettings')),
        authority: [],
    },
    {
        key: 'user.changeAvatar',
        path: '/user/change-avatar',
        component: lazy(() => import('@/views/user/UserProfile')),
        authority: [],
    },
]

export default userRoute
