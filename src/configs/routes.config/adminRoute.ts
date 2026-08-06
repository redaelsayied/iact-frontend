import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const adminRoute: Routes = [
    {
        key: 'admin.dashboard',
        path: '/admin/dashboard',
        component: lazy(() => import('@/views/admin/AdminDashboard')),
        authority: ['Admin'],
    },
    {
        key: 'admin.users',
        path: '/admin/users',
        component: lazy(() => import('@/views/admin/UsersList')),
        authority: ['Admin'],
    },
    {
        key: 'admin.users.create',
        path: '/admin/users/create',
        component: lazy(() => import('@/views/admin/UserForm')),
        authority: ['Admin'],
    },
    {
        key: 'admin.users.edit',
        path: '/admin/users/:id/edit',
        component: lazy(() => import('@/views/admin/UserForm')),
        authority: ['Admin'],
    },
    {
        key: 'admin.users.details',
        path: '/admin/users/:id',
        component: lazy(() => import('@/views/admin/UserDetails')),
        authority: ['Admin'],
    },
    {
        key: 'admin.profile',
        path: '/admin/profile',
        component: lazy(() => import('@/views/user/UserProfile')),
        authority: ['Admin'],
    },
    {
        key: 'admin.settings',
        path: '/admin/settings',
        component: lazy(() => import('@/views/user/UserSettings')),
        authority: ['Admin'],
    },
    {
        key: 'admin.changePassword',
        path: '/admin/change-password',
        component: lazy(() => import('@/views/user/UserSettings')),
        authority: ['Admin'],
    },
    {
        key: 'admin.changeAvatar',
        path: '/admin/change-avatar',
        component: lazy(() => import('@/views/user/UserProfile')),
        authority: ['Admin'],
    },
]

export default adminRoute
