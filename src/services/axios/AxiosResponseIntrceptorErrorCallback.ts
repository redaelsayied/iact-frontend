import axios from 'axios'
import appConfig from '@/configs/app.config'
import {
    TOKEN_NAME_IN_STORAGE,
    REFRESH_TOKEN_NAME_IN_STORAGE,
    REQUEST_HEADER_AUTH_KEY,
    TOKEN_TYPE,
} from '@/constants/api.constant'
import { useSessionUser } from '@/store/authStore'
import type { AxiosError, InternalAxiosRequestConfig, AxiosInstance } from 'axios'

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token!)
        }
    })
    failedQueue = []
}

const clearAuthAndRedirect = () => {
    localStorage.removeItem(TOKEN_NAME_IN_STORAGE)
    localStorage.removeItem(REFRESH_TOKEN_NAME_IN_STORAGE)
    useSessionUser.getState().setUser({})
    useSessionUser.getState().setSessionSignedIn(false)
    if (window.location.pathname !== '/sign-in') {
        window.location.href = '/sign-in'
    }
}

export const handleAxiosResponseError = async (
    error: AxiosError,
    axiosInstance: AxiosInstance,
) => {
    const originalRequest = error.config as CustomAxiosRequestConfig

    if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/api/Auth/refresh-token') &&
        !originalRequest.url?.includes('/api/Auth/login')
    ) {
        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            })
                .then((token) => {
                    originalRequest.headers[REQUEST_HEADER_AUTH_KEY] =
                        `${TOKEN_TYPE}${token}`
                    return axiosInstance(originalRequest)
                })
                .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const currentToken =
                localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
            const currentRefreshToken =
                localStorage.getItem(REFRESH_TOKEN_NAME_IN_STORAGE) || ''

            if (!currentRefreshToken) {
                throw new Error('No refresh token available')
            }

            const refreshResponse = await axios.post(
                `${appConfig.apiPrefix}/Auth/refresh-token`,
                {
                    token: currentToken,
                    refreshToken: currentRefreshToken,
                },
            )

            const refreshData = refreshResponse.data
            if (refreshData?.status && refreshData?.data) {
                const { accessToken, refreshToken } = refreshData.data
                localStorage.setItem(TOKEN_NAME_IN_STORAGE, accessToken)
                localStorage.setItem(REFRESH_TOKEN_NAME_IN_STORAGE, refreshToken)

                originalRequest.headers[REQUEST_HEADER_AUTH_KEY] =
                    `${TOKEN_TYPE}${accessToken}`
                processQueue(null, accessToken)
                return axiosInstance(originalRequest)
            } else {
                throw new Error('Refresh token invalid')
            }
        } catch (refreshErr) {
            processQueue(refreshErr, null)
            clearAuthAndRedirect()
            return Promise.reject(refreshErr)
        } finally {
            isRefreshing = false
        }
    }

    return Promise.reject(error)
}

export default handleAxiosResponseError
