import AdminGuard from './AdminGuard'
import UserGuard from './UserGuard'
import PublicRoute from './PublicRoute'
import AuthorityGuard from './AuthorityGuard'
import AppRoute from './AppRoute'
import PageContainer from '@/components/template/PageContainer'
import AdminLayout from '@/components/layouts/AdminLayout'
import UserLayout from '@/components/layouts/UserLayout'
import PreLoginLayout from '@/components/layouts/PreLoginLayout'
import { adminRoutes, userRoutes, publicRoutes } from '@/configs/routes.config'
import othersRoute from '@/configs/routes.config/othersRoute'
import { useAuth } from '@/auth'
import { Routes, Route as RouterRoute, Navigate } from 'react-router-dom'
import type { LayoutType } from '@/@types/theme'
import type { Route as AppRouteType } from '@/@types/routes'

interface ViewsProps {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: LayoutType
}

type AllRoutesProps = ViewsProps

const RootRedirect = () => {
    const { user } = useAuth()
    const roles = user?.roles || user?.authority || []
    const isAdmin = roles.some((r) => r.toLowerCase() === 'admin')
    return <Navigate replace to={isAdmin ? '/admin/users' : '/user/home'} />
}

const AllRoutes = (props: AllRoutesProps) => {
    const { user } = useAuth()

    return (
        <Routes>
            {/* Root Path Redirect */}
            <RouterRoute path="/" element={<UserGuard><RootRedirect /></UserGuard>} />

            {/* Admin Dashboard Application Area */}
            {adminRoutes.map((route: AppRouteType, index: number) => (
                <RouterRoute
                    key={route.key + index}
                    path={route.path}
                    element={
                        <AdminGuard>
                            <AdminLayout>
                                <AuthorityGuard
                                    userAuthority={user.authority}
                                    authority={route.authority}
                                >
                                    <PageContainer {...props} {...route.meta}>
                                        <AppRoute
                                            routeKey={route.key}
                                            component={route.component}
                                            {...route.meta}
                                        />
                                    </PageContainer>
                                </AuthorityGuard>
                            </AdminLayout>
                        </AdminGuard>
                    }
                />
            ))}

            {/* User Website Application Area */}
            {userRoutes.map((route: AppRouteType, index: number) => (
                <RouterRoute
                    key={route.key + index}
                    path={route.path}
                    element={
                        <UserGuard>
                            <UserLayout>
                                <AuthorityGuard
                                    userAuthority={user.authority}
                                    authority={route.authority}
                                >
                                    <PageContainer {...props} {...route.meta}>
                                        <AppRoute
                                            routeKey={route.key}
                                            component={route.component}
                                            {...route.meta}
                                        />
                                    </PageContainer>
                                </AuthorityGuard>
                            </UserLayout>
                        </UserGuard>
                    }
                />
            ))}

            {/* Other System Routes (e.g. Access Denied) */}
            {othersRoute.map((route: AppRouteType, index: number) => (
                <RouterRoute
                    key={route.key + index}
                    path={route.path}
                    element={
                        <UserGuard>
                            <PreLoginLayout>
                                <PageContainer {...props} {...route.meta}>
                                    <AppRoute
                                        routeKey={route.key}
                                        component={route.component}
                                        {...route.meta}
                                    />
                                </PageContainer>
                            </PreLoginLayout>
                        </UserGuard>
                    }
                />
            ))}

            {/* Public Auth Routes */}
            <RouterRoute path="/" element={<PublicRoute />}>
                {publicRoutes.map((route: AppRouteType) => (
                    <RouterRoute
                        key={route.path}
                        path={route.path}
                        element={
                            <PreLoginLayout>
                                <AppRoute
                                    routeKey={route.key}
                                    component={route.component}
                                    {...route.meta}
                                />
                            </PreLoginLayout>
                        }
                    />
                ))}
            </RouterRoute>

            {/* Catch-all fallback */}
            <RouterRoute path="*" element={<Navigate replace to="/" />} />
        </Routes>
    )
}

export default AllRoutes
