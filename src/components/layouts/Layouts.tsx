import { Suspense } from 'react'
import Loading from '@/components/shared/Loading'
import type { CommonProps } from '@/@types/common'
import { useAuth } from '@/auth'
import { useThemeStore } from '@/store/themeStore'
import { useLocation } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import UserLayout from './UserLayout'
import PreLoginLayout from './PreLoginLayout'

const Layout = ({ children }: CommonProps) => {
    const layoutType = useThemeStore((state) => state.layout.type)
    const { authenticated } = useAuth()
    const location = useLocation()

    const isAdminArea = location.pathname.startsWith('/admin')

    return (
        <Suspense
            fallback={
                <div className="flex flex-auto flex-col h-[100vh]">
                    <Loading loading={true} />
                </div>
            }
        >
            {authenticated ? (
                isAdminArea ? (
                    <AdminLayout layoutType={layoutType}>
                        {children}
                    </AdminLayout>
                ) : (
                    <UserLayout layoutType={layoutType}>
                        {children}
                    </UserLayout>
                )
            ) : (
                <PreLoginLayout>{children}</PreLoginLayout>
            )}
        </Suspense>
    )
}

export default Layout
