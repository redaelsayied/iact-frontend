import { useLocation } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import {
    adminNavigationConfig,
    userNavigationConfig,
} from '@/configs/navigation.config'
import type { NavigationTree } from '@/@types/navigation'

export type AppNavigationResult = {
    navigationTree: NavigationTree[]
    homePath: string
    isAdminArea: boolean
    isUserArea: boolean
}

export function useAppNavigation(): AppNavigationResult {
    const location = useLocation()
    const userAuthority = useSessionUser((state) => state.user.authority) || []

    const isAdminRole = userAuthority.some(
        (role) => role.toLowerCase() === 'admin',
    )
    const isAdminArea = location.pathname.startsWith('/admin')
    const isUserArea = location.pathname.startsWith('/user')

    let navigationTree: NavigationTree[]
    let homePath: string

    if (isAdminArea) {
        navigationTree = adminNavigationConfig
        homePath = '/admin/dashboard'
    } else if (isUserArea) {
        navigationTree = userNavigationConfig
        homePath = '/user/home'
    } else if (isAdminRole) {
        navigationTree = adminNavigationConfig
        homePath = '/admin/dashboard'
    } else {
        navigationTree = userNavigationConfig
        homePath = '/user/home'
    }

    return {
        navigationTree,
        homePath,
        isAdminArea,
        isUserArea,
    }
}

export default useAppNavigation
