import ApiService from './ApiService'
import type { ApiResponse } from '@/@types/api'
import type {
    SignInCredential,
    SignUpCredential,
    VerifyEmailPayload,
    ResendOtpPayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    RefreshTokenPayload,
    LogoutPayload,
    AuthResponse,
    VerifyEmailResponse,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchDataWithAxios<ApiResponse<AuthResponse>>({
        url: '/Auth/login',
        method: 'post',
        data,
    })
}

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchDataWithAxios<ApiResponse>({
        url: '/Auth/register',
        method: 'post',
        data,
    })
}

export async function apiVerifyEmail(data: VerifyEmailPayload) {
    return ApiService.fetchDataWithAxios<ApiResponse<VerifyEmailResponse>>({
        url: '/Auth/verify-email',
        method: 'post',
        data,
    })
}

export async function apiResendOtp(data: ResendOtpPayload) {
    return ApiService.fetchDataWithAxios<ApiResponse>({
        url: '/Auth/resend-otp',
        method: 'post',
        data,
    })
}

export async function apiForgotPassword(data: ForgotPasswordPayload) {
    return ApiService.fetchDataWithAxios<ApiResponse>({
        url: '/Auth/forget-password',
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data: ResetPasswordPayload) {
    return ApiService.fetchDataWithAxios<ApiResponse>({
        url: '/Auth/reset-password',
        method: 'post',
        data,
    })
}

export async function apiRefreshToken(data: RefreshTokenPayload) {
    return ApiService.fetchDataWithAxios<ApiResponse<AuthResponse>>({
        url: '/Auth/refresh-token',
        method: 'post',
        data,
    })
}

export async function apiSignOut(data: LogoutPayload) {
    return ApiService.fetchDataWithAxios<ApiResponse>({
        url: '/Auth/logout',
        method: 'post',
        data,
    })
}
