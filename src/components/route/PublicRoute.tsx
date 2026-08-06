import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth'

const PublicRoute = () => {
    const { authenticated, user } = useAuth()
    const roles = user?.roles || user?.authority || []
    const isAdmin = roles.some((r) => r.toLowerCase() === 'admin')
    const landingPath = isAdmin ? '/admin/users' : '/user/home'

    return authenticated ? <Navigate replace to={landingPath} /> : <Outlet />
}

export default PublicRoute
