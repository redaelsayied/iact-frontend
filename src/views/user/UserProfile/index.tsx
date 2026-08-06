import { useState, useEffect, useRef, ChangeEvent } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Avatar from '@/components/ui/Avatar'
import Dialog from '@/components/ui/Dialog'
import Spinner from '@/components/ui/Spinner'
import useTranslation from '@/utils/hooks/useTranslation'
import {
    apiGetMe,
    apiUpdateProfile,
    apiChangeProfileImage,
} from '@/services/UserService'
import { useSessionUser } from '@/store/authStore'
import { useLocaleStore } from '@/store/localeStore'
import { useThemeStore } from '@/store/themeStore'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    HiOutlineUser,
    HiOutlineCamera,
    HiOutlineAcademicCap,
    HiOutlineDocumentText,
    HiOutlineCreditCard,
    HiOutlineQuestionMarkCircle,
    HiChevronRight,
    HiChevronLeft,
} from 'react-icons/hi2'
import type { UserProfileResponse } from '@/@types/user'

// Profile validation schema
const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
})

type ProfileSchemaType = z.infer<typeof profileSchema>

const UserProfile = () => {
    const { t } = useTranslation()
    const currentLang = useLocaleStore((state) => state.currentLang)
    const direction = useThemeStore((state) => state.direction)
    const isRtl = currentLang === 'ar' || direction === 'rtl'

    const sessionUser = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)

    const [profile, setProfile] = useState<UserProfileResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    // Modals state
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const [infoModalTitle, setInfoModalTitle] = useState<string>('')
    const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false)

    // Hidden file input reference for direct avatar click
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form feedback messages
    const [profileSuccess, setProfileSuccess] = useState<string>('')
    const [profileError, setProfileError] = useState<string>('')
    const [avatarSuccess, setAvatarSuccess] = useState<string>('')
    const [avatarError, setAvatarError] = useState<string>('')

    // Submitting states
    const [updatingProfile, setUpdatingProfile] = useState<boolean>(false)
    const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false)

    // Avatar preview
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const renderStatusDot = (status?: number) => {
        switch (status) {
            case 1:
                return (
                    <span className="inline-flex items-center text-amber-600 text-xs font-semibold gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        {t('profile.pendingEmail', 'Pending Email')}
                    </span>
                )
            case 2:
                return (
                    <span className="inline-flex items-center text-blue-600 text-xs font-semibold gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {t('profile.pendingID', 'Pending ID Upload')}
                    </span>
                )
            case 3:
                return (
                    <span className="inline-flex items-center text-purple-600 text-xs font-semibold gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        {t('profile.pendingApproval', 'Pending Review')}
                    </span>
                )
            case 4:
                return (
                    <span className="inline-flex items-center text-emerald-600 text-xs font-semibold gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {t('profile.active', 'Active')}
                    </span>
                )
            case 5:
                return (
                    <span className="inline-flex items-center text-rose-600 text-xs font-semibold gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {t('profile.rejected', 'Rejected')}
                    </span>
                )
            case 6:
                return (
                    <span className="inline-flex items-center text-red-600 text-xs font-semibold gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        {t('profile.suspended', 'Suspended')}
                    </span>
                )
            case 7:
                return (
                    <span className="inline-flex items-center text-gray-700 text-xs font-semibold gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gray-700"></span>
                        {t('profile.locked', 'Locked')}
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center text-gray-500 text-xs font-semibold gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        {t('profile.unknown', 'Unknown')}
                    </span>
                )
        }
    }

    const {
        handleSubmit: handleProfileSubmit,
        control: profileControl,
        reset: resetProfileForm,
        formState: { errors: profileErrors },
    } = useForm<ProfileSchemaType>({
        resolver: zodResolver(profileSchema),
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
            // Handled by interceptor
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onProfileSubmit = async (data: ProfileSchemaType) => {
        setUpdatingProfile(true)
        setProfileSuccess('')
        setProfileError('')
        try {
            const res = await apiUpdateProfile(data)
            if (res?.status) {
                setProfileSuccess(
                    t(
                        'profile.profileUpdateSuccess',
                        'Profile updated successfully.',
                    ),
                )
                setUser({
                    firstName: data.firstName,
                    lastName: data.lastName,
                })
                fetchUserProfile()
                setEditModalOpen(false)
            } else {
                setProfileError(
                    res?.message ||
                        t(
                            'profile.profileUpdateFailed',
                            'Failed to update profile.',
                        ),
                )
            }
        } catch (err: unknown) {
            const errorObj = err as {
                response?: { data?: { message?: string } }
                message?: string
            }
            setProfileError(
                errorObj?.response?.data?.message ||
                    errorObj.message ||
                    t('profile.profileUpdateFailed', 'Profile update failed.'),
            )
        } finally {
            setUpdatingProfile(false)
        }
    }

    // Direct Avatar file selection and instant upload
    const handleAvatarSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const objectUrl = URL.createObjectURL(file)
            setPreviewUrl(objectUrl)
            setAvatarError('')
            setAvatarSuccess('')
            setUploadingAvatar(true)

            try {
                const res = await apiChangeProfileImage(file)
                if (res?.status) {
                    setAvatarSuccess(
                        t(
                            'profile.imageUpdateSuccess',
                            'Profile image updated successfully.',
                        ),
                    )
                    fetchUserProfile()
                } else {
                    setAvatarError(
                        res?.message ||
                            t(
                                'profile.imageUpdateFailed',
                                'Failed to upload profile image.',
                            ),
                    )
                }
            } catch (err: unknown) {
                const errorObj = err as {
                    response?: { data?: { message?: string } }
                    message?: string
                }
                setAvatarError(
                    errorObj?.response?.data?.message ||
                        errorObj.message ||
                        t(
                            'profile.imageUpdateFailed',
                            'Image upload failed.',
                        ),
                )
            } finally {
                setUploadingAvatar(false)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
            }
        }
    }

    const openFeatureModal = (title: string) => {
        setInfoModalTitle(title)
        setInfoModalOpen(true)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[50vh]">
                <Spinner size="40px" />
            </div>
        )
    }

    const displayUser = profile || sessionUser
    const ChevronIcon = isRtl ? HiChevronLeft : HiChevronRight

    const renderProfileForm = () => (
        <div>
            {profileSuccess && (
                <Alert type="success" className="mb-4">
                    {profileSuccess}
                </Alert>
            )}
            {profileError && (
                <Alert type="danger" className="mb-4">
                    {profileError}
                </Alert>
            )}

            <form
                className="flex flex-col gap-4 max-w-lg"
                onSubmit={handleProfileSubmit(onProfileSubmit)}
            >
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.firstName', 'First Name')}
                    </label>
                    <Controller
                        name="firstName"
                        control={profileControl}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder={t('profile.firstName', 'First Name')}
                            />
                        )}
                    />
                    {profileErrors.firstName && (
                        <span className="text-xs text-red-500 mt-1 block">
                            {profileErrors.firstName.message}
                        </span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.lastName', 'Last Name')}
                    </label>
                    <Controller
                        name="lastName"
                        control={profileControl}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder={t('profile.lastName', 'Last Name')}
                            />
                        )}
                    />
                    {profileErrors.lastName && (
                        <span className="text-xs text-red-500 mt-1 block">
                            {profileErrors.lastName.message}
                        </span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.email', 'Email Address')} (
                        {t('profile.readOnly', 'Read-only')})
                    </label>
                    <Input
                        disabled
                        readOnly
                        value={profile?.email || sessionUser.email || ''}
                        className="bg-gray-100 dark:bg-gray-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t('profile.phone', 'Phone Number')} (
                        {t('profile.readOnly', 'Read-only')})
                    </label>
                    <Input
                        disabled
                        readOnly
                        value={
                            profile?.phoneNumber ||
                            sessionUser.phoneNumber ||
                            ''
                        }
                        className="bg-gray-100 dark:bg-gray-700"
                    />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <Button
                        variant="solid"
                        type="submit"
                        loading={updatingProfile}
                        className="bg-[#1b2b65] hover:bg-[#152250] text-white rounded-xl"
                    >
                        {t('profile.saveChanges', 'Save Changes')}
                    </Button>
                </div>
            </form>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto p-2 sm:p-6">
            {/* Hidden File Input for Avatar Direct Upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (Profile Summary Card & Menu List) */}
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-center">
                    <Card className="w-full border border-sky-100/80 dark:border-gray-800 shadow-sm rounded-3xl p-5 sm:p-7 bg-white dark:bg-gray-900">
                        {/* Avatar Upload Feedback Alerts */}
                        {avatarSuccess && (
                            <Alert type="success" className="mb-4">
                                {avatarSuccess}
                            </Alert>
                        )}
                        {avatarError && (
                            <Alert type="danger" className="mb-4">
                                {avatarError}
                            </Alert>
                        )}

                        {/* Header Top Profile Section */}
                        <div className="border border-sky-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center bg-white dark:bg-gray-900 shadow-2xs mb-6">
                            {/* Clickable Avatar Container with Hover Camera Badge */}
                            <div
                                className="relative group cursor-pointer inline-block mb-4"
                                title={t(
                                    'profile.clickToChangePicture',
                                    'Click to change profile picture',
                                )}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Avatar
                                    size={100}
                                    shape="circle"
                                    src={
                                        previewUrl ||
                                        displayUser.profileImageUrl ||
                                        sessionUser.avatar ||
                                        undefined
                                    }
                                    icon={
                                        <HiOutlineUser className="text-4xl" />
                                    }
                                    className="border-2 border-gray-100 shadow-sm group-hover:brightness-90 transition-all"
                                />

                                {/* Dark Hover Overlay with Camera Icon */}
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    {uploadingAvatar ? (
                                        <Spinner
                                            size="24px"
                                            className="text-white"
                                        />
                                    ) : (
                                        <HiOutlineCamera className="text-2xl" />
                                    )}
                                </div>

                                {/* Floating Camera Badge Icon */}
                                <div className="absolute bottom-0 right-0 p-1.5 bg-[#1b2b65] text-white rounded-full shadow-md border-2 border-white text-xs">
                                    {uploadingAvatar ? (
                                        <Spinner
                                            size="14px"
                                            className="text-white"
                                        />
                                    ) : (
                                        <HiOutlineCamera />
                                    )}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-0.5">
                                {displayUser.firstName} {displayUser.lastName}
                            </h3>

                            <p className="text-gray-400 text-sm mb-2 font-normal">
                                {displayUser.email}
                            </p>

                            <div className="mb-4">
                                {renderStatusDot(displayUser.status)}
                            </div>

                            <Button
                                variant="solid"
                                className="bg-[#1b2b65] hover:bg-[#152250] text-white rounded-full px-8 py-2.5 text-sm font-semibold border-none shadow-sm transition-all"
                                onClick={() => setEditModalOpen(true)}
                            >
                                {t('profile.editProfile', 'Edit Profile')}
                            </Button>
                        </div>

                        {/* Navigation Menu Options List */}
                        <div className="flex flex-col">
                            {/* Item 1: Certificates */}
                            <div
                                className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all cursor-pointer border-b border-gray-100 dark:border-gray-800"
                                onClick={() =>
                                    openFeatureModal(
                                        t(
                                            'profile.certificates',
                                            'Certificates',
                                        ),
                                    )
                                }
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center text-xl">
                                        <HiOutlineAcademicCap />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-base">
                                        {t(
                                            'profile.certificates',
                                            'Certificates',
                                        )}
                                    </span>
                                </div>
                                <ChevronIcon className="text-orange-500 text-lg" />
                            </div>

                            {/* Item 2: Invoices */}
                            <div
                                className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all cursor-pointer border-b border-gray-100 dark:border-gray-800"
                                onClick={() =>
                                    openFeatureModal(
                                        t('profile.invoices', 'Invoices'),
                                    )
                                }
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center text-xl">
                                        <HiOutlineDocumentText />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-base">
                                        {t('profile.invoices', 'Invoices')}
                                    </span>
                                </div>
                                <ChevronIcon className="text-orange-500 text-lg" />
                            </div>

                            {/* Item 3: Payment Method */}
                            <div
                                className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all cursor-pointer border-b border-gray-100 dark:border-gray-800"
                                onClick={() =>
                                    openFeatureModal(
                                        t(
                                            'profile.paymentMethod',
                                            'Payment Method',
                                        ),
                                    )
                                }
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center text-xl">
                                        <HiOutlineCreditCard />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-base">
                                        {t(
                                            'profile.paymentMethod',
                                            'Payment Method',
                                        )}
                                    </span>
                                </div>
                                <ChevronIcon className="text-orange-500 text-lg" />
                            </div>

                            {/* Item 4: Help Center */}
                            <div
                                className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all cursor-pointer"
                                onClick={() =>
                                    openFeatureModal(
                                        t('profile.helpCenter', 'Help Center'),
                                    )
                                }
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center text-xl">
                                        <HiOutlineQuestionMarkCircle />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-base">
                                        {t('profile.helpCenter', 'Help Center')}
                                    </span>
                                </div>
                                <ChevronIcon className="text-orange-500 text-lg" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column (Desktop Profile Edit Form Area) */}
                <div className="hidden lg:block lg:col-span-7 xl:col-span-7">
                    <Card className="shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl p-6 bg-white dark:bg-gray-900">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                            {t('profile.personalInfo', 'البيانات الشخصية')}
                        </h3>
                        {renderProfileForm()}
                    </Card>
                </div>
            </div>

            {/* Mobile Edit Profile Dialog */}
            <Dialog
                isOpen={editModalOpen}
                width={550}
                onClose={() => setEditModalOpen(false)}
                onRequestClose={() => setEditModalOpen(false)}
            >
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {t('profile.editProfile', 'تعديل الملف الشخصي')}
                    </h4>
                </div>
                {renderProfileForm()}
            </Dialog>

            {/* Feature Information Modal */}
            <Dialog
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                onRequestClose={() => setInfoModalOpen(false)}
            >
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {infoModalTitle}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    {t(
                        'profile.underDevelopment',
                        'This section is currently under development. Stay tuned for updates!',
                    )}
                </p>
                <div className="flex justify-end">
                    <Button
                        variant="solid"
                        onClick={() => setInfoModalOpen(false)}
                    >
                        {t('profile.close', 'إغلاق')}
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default UserProfile
