export type SignInCredential = {
    identifier: string
    password: string
}

export type SignUpCredential = {
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
    password: string
}

export type VerifyEmailPayload = {
    email: string
    otp: string
}

export type ResendOtpPayload = {
    email: string
}

export type ForgotPasswordPayload = {
    email: string
}

export type ResetPasswordPayload = {
    email: string
    code: string
    newPassword: string
}

export type RefreshTokenPayload = {
    token: string
    refreshToken: string
}

export type LogoutPayload = {
    token: string
    refreshToken: string
}

export type AuthUserDto = {
    id: string
    firstName: string
    lastName: string
    email: string
    status: number
    roles?: string[]
}

export type AuthResponse = {
    accessToken: string
    refreshToken: string
    expiresIn?: number
    refreshTokenExpiration?: string
    user: AuthUserDto
}

export type VerifyEmailUserDto = {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    status: number
    roles?: string[]
}

export type VerifyEmailResponse = {
    accessToken: string
    refreshToken: string
    user: VerifyEmailUserDto
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
    data?: unknown
}>

export type User = {
    id?: string
    userId?: string | null
    firstName?: string | null
    lastName?: string | null
    userName?: string | null
    email?: string | null
    phoneNumber?: string | null
    status?: number
    authority?: string[]
    roles?: string[]
    avatar?: string | null
    profileImageUrl?: string | null
    identityFileUrl?: string | null
    nationality?: string | null
}

export type Token = {
    accessToken: string
    refreshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
