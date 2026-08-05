import { useState, useEffect, ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Tabs from '@/components/ui/Tabs'
import Alert from '@/components/ui/Alert'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'
import PasswordInput from '@/components/shared/PasswordInput'
import { apiGetMe, apiUpdateProfile, apiChangeProfileImage, apiChangePassword } from '@/services/UserService'
import { useSessionUser } from '@/store/authStore'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HiOutlineUser, HiOutlineCamera, HiOutlineLockClosed } from 'react-icons/hi2'
import type { UserProfileResponse } from '@/@types/user'

const { TabNav, TabList, TabContent } = Tabs

// Profile validation schema
const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
})

// Password validation schema
const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Confirm password is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

type ProfileSchemaType = z.infer<typeof profileSchema>
type PasswordSchemaType = z.infer<typeof passwordSchema>

const UserProfile = () => {
    const [searchParams] = useSearchParams()
    const initialTab = searchParams.get('tab') || 'profile'
    const [currentTab, setCurrentTab] = useState<string>(initialTab)

    const sessionUser = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)

    const [profile, setProfile] = useState<UserProfileResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    // Form feedback messages
    const [profileSuccess, setProfileSuccess] = useState<string>('')
    const [profileError, setProfileError] = useState<string>('')
    const [avatarSuccess, setAvatarSuccess] = useState<string>('')
    const [avatarError, setAvatarError] = useState<string>('')
    const [passwordSuccess, setPasswordSuccess] = useState<string>('')
    const [passwordError, setPasswordError] = useState<string>('')

    // Submitting states
    const [updatingProfile, setUpdatingProfile] = useState<boolean>(false)
    const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false)
    const [updatingPassword, setUpdatingPassword] = useState<boolean>(false)

    // Avatar preview
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const {
        handleSubmit: handleProfileSubmit,
        control: profileControl,
        reset: resetProfileForm,
        formState: { errors: profileErrors },
    } = useForm<ProfileSchemaType>({
        resolver: zodResolver(profileSchema),
    })

    const {
        handleSubmit: handlePasswordSubmit,
        control: passwordControl,
        reset: resetPasswordForm,
        formState: { errors: passwordErrors },
    } = useForm<PasswordSchemaType>({
        resolver: zodResolver(passwordSchema),
    })

    const fetchUserProfile = async () => {
        setLoading(true)
        try {
            const res = await apiGetMe()
            if (res?.data) {
                setProfile(res.data)
                resetProfileForm({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                })
            }
        } catch {
            // Error interceptor handled
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Profile Submit
    const onProfileSubmit = async (data: ProfileSchemaType) => {
        setUpdatingProfile(true)
        setProfileSuccess('')
        setProfileError('')
        try {
            const res = await apiUpdateProfile(data)
            if (res?.status) {
                setProfileSuccess('Profile updated successfully.')
                setUser({
                    firstName: data.firstName,
                    lastName: data.lastName,
                })
                fetchUserProfile()
            } else {
                setProfileError(res?.message || 'Failed to update profile.')
            }
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
            setProfileError(errorObj?.response?.data?.message || errorObj.message || 'Profile update failed.')
        } finally {
            setUpdatingProfile(false)
        }
    }

    // File input change for Avatar
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
            setAvatarError('')
            setAvatarSuccess('')
        }
    }

    // Avatar Upload Submit
    const onAvatarUpload = async () => {
        if (!selectedFile) return
        setUploadingAvatar(true)
        setAvatarSuccess('')
        setAvatarError('')
        try {
            const res = await apiChangeProfileImage(selectedFile)
            if (res?.status) {
                setAvatarSuccess('Profile image updated successfully.')
                setSelectedFile(null)
                fetchUserProfile()
            } else {
                setAvatarError(res?.message || 'Failed to upload profile image.')
            }
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
            setAvatarError(errorObj?.response?.data?.message || errorObj.message || 'Image upload failed.')
        } finally {
            setUploadingAvatar(false)
        }
    }

    // Password Change Submit
    const onPasswordSubmit = async (data: PasswordSchemaType) => {
        setUpdatingPassword(true)
        setPasswordSuccess('')
        setPasswordError('')
        try {
            const res = await apiChangePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            })
            if (res?.status) {
                setPasswordSuccess('Password changed successfully.')
                resetPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                })
            } else {
                setPasswordError(res?.message || 'Failed to change password.')
            }
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
            setPasswordError(errorObj?.response?.data?.message || errorObj.message || 'Password change failed.')
        } finally {
            setUpdatingPassword(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Spinner size="40px" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Profile & Account Settings</h2>
            
            <Card className="shadow-sm">
                <Tabs value={currentTab} onChange={(val) => setCurrentTab(val)}>
                    <TabList>
                        <TabNav value="profile" icon={<HiOutlineUser />}>
                            Personal Info
                        </TabNav>
                        <TabNav value="avatar" icon={<HiOutlineCamera />}>
                            Profile Picture
                        </TabNav>
                        <TabNav value="password" icon={<HiOutlineLockClosed />}>
                            Change Password
                        </TabNav>
                    </TabList>

                    <div className="p-4">
                        {/* Tab 1: Personal Info */}
                        <TabContent value="profile">
                            {profileSuccess && <Alert type="success" className="mb-4">{profileSuccess}</Alert>}
                            {profileError && <Alert type="danger" className="mb-4">{profileError}</Alert>}
                            
                            <form className="flex flex-col gap-4 max-w-lg" onSubmit={handleProfileSubmit(onProfileSubmit)}>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <Controller
                                        name="firstName"
                                        control={profileControl}
                                        render={({ field }) => <Input {...field} placeholder="First Name" />}
                                    />
                                    {profileErrors.firstName && (
                                        <span className="text-xs text-red-500 mt-1">{profileErrors.firstName.message}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <Controller
                                        name="lastName"
                                        control={profileControl}
                                        render={({ field }) => <Input {...field} placeholder="Last Name" />}
                                    />
                                    {profileErrors.lastName && (
                                        <span className="text-xs text-red-500 mt-1">{profileErrors.lastName.message}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Email (Read-only)
                                    </label>
                                    <Input disabled readOnly value={profile?.email || sessionUser.email || ''} className="bg-gray-100" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Phone Number (Read-only)
                                    </label>
                                    <Input disabled readOnly value={profile?.phoneNumber || sessionUser.phoneNumber || ''} className="bg-gray-100" />
                                </div>

                                <Button
                                    variant="solid"
                                    type="submit"
                                    loading={updatingProfile}
                                    className="mt-2 w-fit"
                                >
                                    Save Changes
                                </Button>
                            </form>
                        </TabContent>

                        {/* Tab 2: Profile Picture Upload */}
                        <TabContent value="avatar">
                            {avatarSuccess && <Alert type="success" className="mb-4">{avatarSuccess}</Alert>}
                            {avatarError && <Alert type="danger" className="mb-4">{avatarError}</Alert>}

                            <div className="flex flex-col items-center gap-6 py-4">
                                <Avatar
                                    size={120}
                                    shape="circle"
                                    src={previewUrl || profile?.profileImageUrl || sessionUser.avatar || undefined}
                                    icon={<HiOutlineUser className="text-4xl" />}
                                    className="border-4 border-gray-100 shadow-md"
                                />

                                <div className="flex flex-col items-center gap-3">
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <span className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold rounded-lg transition-colors">
                                            Choose Image
                                        </span>
                                    </label>

                                    {selectedFile && (
                                        <p className="text-xs text-gray-500 font-mono">
                                            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}

                                    <Button
                                        variant="solid"
                                        loading={uploadingAvatar}
                                        disabled={!selectedFile}
                                        className="mt-2"
                                        onClick={onAvatarUpload}
                                    >
                                        Upload Avatar
                                    </Button>
                                </div>
                            </div>
                        </TabContent>

                        {/* Tab 3: Change Password */}
                        <TabContent value="password">
                            {passwordSuccess && <Alert type="success" className="mb-4">{passwordSuccess}</Alert>}
                            {passwordError && <Alert type="danger" className="mb-4">{passwordError}</Alert>}

                            <form className="flex flex-col gap-4 max-w-lg" onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <Controller
                                        name="currentPassword"
                                        control={passwordControl}
                                        render={({ field }) => <PasswordInput {...field} placeholder="Current Password" />}
                                    />
                                    {passwordErrors.currentPassword && (
                                        <span className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword.message}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <Controller
                                        name="newPassword"
                                        control={passwordControl}
                                        render={({ field }) => <PasswordInput {...field} placeholder="New Password (min 8 chars)" />}
                                    />
                                    {passwordErrors.newPassword && (
                                        <span className="text-xs text-red-500 mt-1">{passwordErrors.newPassword.message}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <Controller
                                        name="confirmPassword"
                                        control={passwordControl}
                                        render={({ field }) => <PasswordInput {...field} placeholder="Confirm New Password" />}
                                    />
                                    {passwordErrors.confirmPassword && (
                                        <span className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword.message}</span>
                                    )}
                                </div>

                                <Button
                                    variant="solid"
                                    type="submit"
                                    loading={updatingPassword}
                                    className="mt-2 w-fit"
                                >
                                    Update Password
                                </Button>
                            </form>
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default UserProfile
