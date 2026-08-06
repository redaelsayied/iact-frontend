import authRoute from './authRoute'
import othersRoute from './othersRoute'
import adminRoute from './adminRoute'
import userRoute from './userRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const adminRoutes: Routes = [...adminRoute]

export const userRoutes: Routes = [...userRoute]

export const protectedRoutes: Routes = [
    ...adminRoute,
    ...userRoute,
    ...othersRoute,
]

const routesConfig = {
    publicRoutes,
    adminRoutes,
    userRoutes,
    protectedRoutes,
}

export default routesConfig
