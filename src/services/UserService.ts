import ApiService from './ApiService'
import type { ApiResponse, PaginatedResult } from '@/@types/api'
import type {
    UserProfileResponse,
    UpdateProfilePayload,
    ChangePasswordPayload,
    UserInfoResponse,
    UserFullInfoResponse,
    UserBasicInfoResponse,
    CreateUserPayload,
    UpdateUserPayload,
    UserQueryFilter,
} from '@/@types/user'

export async function apiGetMe() {
    return ApiService.fetchDataWithAxios<ApiResponse<UserProfileResponse>>({
        url: '/me',
        method: 'get',
    })
}

export async function apiUpdateProfile(data: UpdateProfilePayload) {
    return ApiService.fetchDataWithAxios<ApiResponse>({
        url: '/UserAccount/profile',
        method: 'put',
        data,
    })
}

export async function apiChangeProfileImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return ApiService.fetchDataWithAxios<ApiResponse, FormData>({
        url: '/UserAccount/change-ProfileImage',
        method: 'put',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

export async function apiChangePassword(data: ChangePasswordPayload) {
    return ApiService.fetchDataWithAxios<ApiResponse>({
        url: '/UserAccount/change-password',
        method: 'post',
        data,
    })
}

export async function apiGetUsers(params?: UserQueryFilter) {
    return ApiService.fetchDataWithAxios<
        ApiResponse<PaginatedResult<UserInfoResponse>>
    >({
        url: '/Users/all',
        method: 'get',
        params,
    })
}

export async function apiGetUserById(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<UserFullInfoResponse>>({
        url: `/Users/${id}`,
        method: 'get',
    })
}

export async function apiGetUserBasicById(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse<UserBasicInfoResponse>>({
        url: `/Users/${id}/basic`,
        method: 'get',
    })
}

export async function apiCreateUser(data: CreateUserPayload) {
    return ApiService.fetchDataWithAxios<ApiResponse<UserInfoResponse>>({
        url: '/Users',
        method: 'post',
        data,
    })
}

export async function apiUpdateUser(id: string, data: UpdateUserPayload) {
    return ApiService.fetchDataWithAxios<ApiResponse>({
        url: `/Users/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteUser(id: string) {
    return ApiService.fetchDataWithAxios<ApiResponse>({
        url: `/Users/${id}`,
        method: 'delete',
    })
}
