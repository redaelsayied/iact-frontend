import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
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
        key: 'user.changePassword',
        path: '/user/change-password',
        component: lazy(() => import('@/views/user/UserProfile')),
        authority: [],
    },
    {
        key: 'user.changeAvatar',
        path: '/user/change-avatar',
        component: lazy(() => import('@/views/user/UserProfile')),
        authority: [],
    },
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
    ...othersRoute,
]
