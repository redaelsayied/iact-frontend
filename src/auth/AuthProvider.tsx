import { useRef, useImperativeHandle, useEffect } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn, apiSignOut, apiSignUp, apiVerifyEmail } from '@/services/AuthService'
import { apiGetMe } from '@/services/UserService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import { extractRolesFromToken } from '@/utils/jwt'
import type {
    SignInCredential,
    SignUpCredential,
    VerifyEmailPayload,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
    Token,
} from '@/@types/auth'
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router-dom'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = ({ ref }: { ref: Ref<IsolatedNavigatorRef> }) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
}

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const { token, refreshToken, setToken } = useToken()

    const authenticated = Boolean(token && signedIn)

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    const getLandingPath = (userObj?: User) => {
        const currentUser = userObj || user
        if (currentUser?.status === 1) {
            return `/verify-email${currentUser.email ? `?email=${encodeURIComponent(currentUser.email)}` : ''}`
        }
        const roles = currentUser?.roles || currentUser?.authority || []
        if (roles.some((r) => r.toLowerCase() === 'admin')) {
            return '/admin/users'
        }
        return '/user/home'
    }

    const redirect = (targetPath?: string) => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        if (redirectUrl) {
            navigatorRef.current?.navigate(redirectUrl)
            return
        }

        const landing = targetPath || getLandingPath()
        navigatorRef.current?.navigate(landing)
    }

    const handleSignIn = (tokens: Token, userObj?: User) => {
        setToken(tokens.accessToken, tokens.refreshToken)
        setSessionSignedIn(true)

        if (userObj) {
            const roles = userObj.roles || userObj.authority || []
            setUser({
                ...userObj,
                authority: roles,
                roles,
            })
        }
    }

    const handleSignOut = () => {
        setToken('')
        setUser({})
        setSessionSignedIn(false)
    }

    // Sync session on mount if authenticated
    useEffect(() => {
        if (authenticated && token) {
            apiGetMe()
                .then((res) => {
                    if (res?.status && res?.data) {
                        const profile = res.data
                        if (profile.status === 6 || profile.status === 7) {
                            handleSignOut()
                            navigatorRef.current?.navigate('/sign-in')
                            return
                        }
                        const tokenRoles = extractRolesFromToken(token)
                        const rawRoles = profile.roles && profile.roles.length > 0
                            ? profile.roles
                            : (user.roles?.length ? user.roles : tokenRoles)
                        const userRoles = rawRoles.length > 0
                            ? rawRoles.map((r) => (r.toLowerCase() === 'admin' ? 'Admin' : r))
                            : ['User']

                        setUser({
                            id: profile.id,
                            userId: profile.id,
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            userName: `${profile.firstName} ${profile.lastName}`,
                            email: profile.email,
                            phoneNumber: profile.phoneNumber,
                            status: profile.status,
                            authority: userRoles,
                            roles: userRoles,
                            profileImageUrl: profile.profileImageUrl,
                            avatar: profile.profileImageUrl,
                            identityFileUrl: profile.identityFileUrl,
                            nationality: profile.nationality,
                        })
                    }
                })
                .catch(() => {
                    // Handled by response interceptor
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authenticated, token])

    const signIn = async (values: SignInCredential): AuthResult => {
        try {
            const resp = await apiSignIn(values)
            if (resp && resp.status && resp.data) {
                const { accessToken, refreshToken, user: authUser } = resp.data
                const tokenRoles = extractRolesFromToken(accessToken)
                const rawRoles = authUser.roles && authUser.roles.length > 0 ? authUser.roles : tokenRoles
                const roles = rawRoles.length > 0
                    ? rawRoles.map((r) => (r.toLowerCase() === 'admin' ? 'Admin' : r))
                    : ['User']

                const updatedUser: User = {
                    id: authUser.id,
                    userId: authUser.id,
                    firstName: authUser.firstName,
                    lastName: authUser.lastName,
                    userName: `${authUser.firstName} ${authUser.lastName}`,
                    email: authUser.email,
                    status: authUser.status,
                    authority: roles,
                    roles,
                }
                handleSignIn({ accessToken, refreshToken }, updatedUser)
                const landing = getLandingPath(updatedUser)
                redirect(landing)
                return {
                    status: 'success',
                    message: resp.message || 'Login successful',
                    data: resp.data,
                }
            }
            return {
                status: 'failed',
                message: resp?.message || 'Invalid credentials',
            }
        } catch (errors: unknown) {
            const err = errors as { response?: { data?: { message?: string } }; message?: string }
            return {
                status: 'failed',
                message: err?.response?.data?.message || err?.message || 'Unable to sign in',
            }
        }
    }

    const signUp = async (values: SignUpCredential): AuthResult => {
        try {
            const resp = await apiSignUp(values)
            if (resp && resp.status) {
                return {
                    status: 'success',
                    message: resp.message || 'OTP has been sent to your email.',
                }
            }
            return {
                status: 'failed',
                message: resp?.message || 'Unable to create account',
            }
        } catch (errors: unknown) {
            const err = errors as { response?: { data?: { message?: string; data?: { errors?: Record<string, string[]> } } }; message?: string }
            const validationErrors = err?.response?.data?.data?.errors
            let errorMsg = err?.response?.data?.message || err?.message || 'Registration failed'
            if (validationErrors) {
                const firstKey = Object.keys(validationErrors)[0]
                if (firstKey && validationErrors[firstKey]?.[0]) {
                    errorMsg = validationErrors[firstKey][0]
                }
            }
            return {
                status: 'failed',
                message: errorMsg,
            }
        }
    }

    const verifyEmail = async (values: VerifyEmailPayload): AuthResult => {
        try {
            const resp = await apiVerifyEmail(values)
            if (resp && resp.status && resp.data) {
                const { accessToken, refreshToken, user: verifyUser } = resp.data
                const tokenRoles = extractRolesFromToken(accessToken)
                const rawRoles = verifyUser.roles && verifyUser.roles.length > 0 ? verifyUser.roles : tokenRoles
                const roles = rawRoles.length > 0
                    ? rawRoles.map((r) => (r.toLowerCase() === 'admin' ? 'Admin' : r))
                    : ['User']

                const updatedUser: User = {
                    id: verifyUser.id,
                    userId: verifyUser.id,
                    firstName: verifyUser.firstName,
                    lastName: verifyUser.lastName,
                    userName: `${verifyUser.firstName} ${verifyUser.lastName}`,
                    email: verifyUser.email,
                    phoneNumber: verifyUser.phoneNumber,
                    status: verifyUser.status,
                    authority: roles,
                    roles: roles,
                }
                handleSignIn({ accessToken, refreshToken }, updatedUser)
                const landing = getLandingPath(updatedUser)
                redirect(landing)
                return {
                    status: 'success',
                    message: resp.message || 'Email verified successfully',
                    data: resp.data,
                }
            }
            return {
                status: 'failed',
                message: resp?.message || 'Invalid OTP code',
            }
        } catch (errors: unknown) {
            const err = errors as { response?: { data?: { message?: string } }; message?: string }
            return {
                status: 'failed',
                message: err?.response?.data?.message || err?.message || 'Verification failed',
            }
        }
    }

    const signOut = async () => {
        try {
            if (token && refreshToken) {
                await apiSignOut({ token, refreshToken })
            }
        } catch {
            // Silence signout network errors
        } finally {
            handleSignOut()
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
        }
    }

    const oAuthSignIn = (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => {
        callback({
            onSignIn: handleSignIn,
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                signUp,
                verifyEmail,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
