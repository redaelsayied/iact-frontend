import appConfig from '@/configs/app.config'
import {
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
    TOKEN_NAME_IN_STORAGE,
} from '@/constants/api.constant'
import cookiesStorage from '@/utils/cookiesStorage'
import { useLocaleStore } from '@/store/localeStore'
import type { InternalAxiosRequestConfig } from 'axios'

const AxiosRequestIntrceptorConfigCallback = (
    config: InternalAxiosRequestConfig,
) => {
    const storageStrategy = appConfig.accessTokenPersistStrategy
    let accessToken = ''

    if (storageStrategy === 'localStorage') {
        accessToken = localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    } else if (storageStrategy === 'sessionStorage') {
        accessToken = sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    } else {
        accessToken = (cookiesStorage.getItem(TOKEN_NAME_IN_STORAGE) as string) || ''
    }

    if (!accessToken) {
        accessToken = localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    }

    if (accessToken) {
        config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${accessToken}`
    }

    // Attach Accept-Language header based on current locale store
    const currentLang = useLocaleStore.getState()?.currentLang || appConfig.locale || 'en'
    config.headers['Accept-Language'] = currentLang

    return config
}

export default AxiosRequestIntrceptorConfigCallback
