import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Dialog from '@/components/ui/Dialog'
import Switcher from '@/components/ui/Switcher'
import PasswordInput from '@/components/shared/PasswordInput'
import useTranslation from '@/utils/hooks/useTranslation'
import { apiChangePassword } from '@/services/UserService'
import { useLocaleStore } from '@/store/localeStore'
import { useThemeStore } from '@/store/themeStore'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    HiOutlineKey,
    HiOutlineCog6Tooth,
    HiOutlineMoon,
    HiOutlineSun,
    HiOutlineGlobeAlt,
    HiOutlineBell,
    HiOutlineShieldCheck,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi2'

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

type PasswordSchemaType = z.infer<typeof passwordSchema>

const UserSettings = () => {
    const { t } = useTranslation()
    const currentLang = useLocaleStore((state) => state.currentLang)
    const setLang = useLocaleStore((state) => state.setLang)

    const mode = useThemeStore((state) => state.mode)
    const setMode = useThemeStore((state) => state.setMode)
    const direction = useThemeStore((state) => state.direction)
    const isRtl = currentLang === 'ar' || direction === 'rtl'

    // Notification Toggles state
    const [emailNotif, setEmailNotif] = useState<boolean>(true)
    const [securityNotif, setSecurityNotif] = useState<boolean>(true)

    // Modals state
    const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false)

    // Password Form feedback messages & loading
    const [passwordSuccess, setPasswordSuccess] = useState<string>('')
    const [passwordError, setPasswordError] = useState<string>('')
    const [updatingPassword, setUpdatingPassword] = useState<boolean>(false)

    const {
        handleSubmit: handlePasswordSubmit,
        control: passwordControl,
        reset: resetPasswordForm,
        formState: { errors: passwordErrors },
    } = useForm<PasswordSchemaType>({
        resolver: zodResolver(passwordSchema),
    })

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
                setPasswordSuccess(
                    t(
                        'profile.passwordChangeSuccess',
                        'تم تغيير كلمة المرور بنجاح.',
                    ),
                )
                resetPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                })
                setTimeout(() => {
                    setPasswordModalOpen(false)
                    setPasswordSuccess('')
                }, 1500)
            } else {
                setPasswordError(
                    res?.message ||
                        t(
                            'profile.passwordChangeFailed',
                            'فشل تغيير كلمة المرور.',
                        ),
                )
            }
        } catch (err: unknown) {
            const errorObj = err as {
                response?: { data?: { message?: string } }
                message?: string
            }
            setPasswordError(
                errorObj?.response?.data?.message ||
                    errorObj.message ||
                    t(
                        'profile.passwordChangeFailed',
                        'فشل تغيير كلمة المرور.',
                    ),
            )
        } finally {
            setUpdatingPassword(false)
        }
    }

    const ChevronIcon = isRtl ? HiChevronLeft : HiChevronRight

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
            <div className="mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <HiOutlineCog6Tooth className="text-primary dark:text-primary-soft text-2xl" />
                    {t('common.accountSettings', 'إعدادات الحساب')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t(
                        'settings.description',
                        'إدارة كلمة المرور والتفضيلات والإشعارات الخاصة بحسابك',
                    )}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Card 1: Security & Password */}
                <Card className="shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl p-6 bg-white dark:bg-gray-900 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                                <HiOutlineShieldCheck />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                    {t('settings.securityTitle', 'الأمان وكلمة المرور')}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('settings.securitySub', 'حماية الحساب وإدارة الدخول')}
                                </p>
                            </div>
                        </div>

                        <div className="my-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <HiOutlineKey className="text-xl text-primary" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {t('profile.changePassword', 'تغيير كلمة المرور')}
                                </span>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">
                                {t('settings.activeStatus', 'نشط')}
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="solid"
                        className="w-full mt-4 bg-[#1b2b65] hover:bg-[#152250] text-white rounded-xl font-medium"
                        onClick={() => {
                            setPasswordSuccess('')
                            setPasswordError('')
                            setPasswordModalOpen(true)
                        }}
                    >
                        {t('profile.changePassword', 'تغيير كلمة المرور')}
                    </Button>
                </Card>

                {/* Card 2: Appearance & Language */}
                <Card className="shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl p-6 bg-white dark:bg-gray-900 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                                <HiOutlineSun />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                    {t('settings.appearanceTitle', 'المظهر واللغة')}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('settings.appearanceSub', 'تخصيص ثيم الصفحة ولغة العرض')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 my-2">
                            {/* Dark mode option */}
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    {mode === 'dark' ? (
                                        <HiOutlineMoon className="text-xl text-amber-500" />
                                    ) : (
                                        <HiOutlineSun className="text-xl text-amber-500" />
                                    )}
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('settings.darkMode', 'الوضع الداكن')}
                                    </span>
                                </div>
                                <Switcher
                                    checked={mode === 'dark'}
                                    onChange={(checked) =>
                                        setMode(checked ? 'dark' : 'light')
                                    }
                                />
                            </div>

                            {/* Language option */}
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <HiOutlineGlobeAlt className="text-xl text-blue-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('settings.language', 'اللغة (Language)')}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="twoTone"
                                    onClick={() =>
                                        setLang(currentLang === 'ar' ? 'en' : 'ar')
                                    }
                                    className="text-xs font-bold px-3 py-1"
                                >
                                    {currentLang === 'ar' ? 'English' : 'العربية'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Card 3: Notification Settings */}
                <Card className="shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl p-6 bg-white dark:bg-gray-900 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl">
                                <HiOutlineBell />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                    {t('settings.notificationsTitle', 'الإشعارات والتنبيهات')}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('settings.notificationsSub', 'التحكم في تنبيهات البريد الإلكتروني')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 my-2">
                            {/* Email notification toggle */}
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {t('settings.emailNotif', 'إشعارات البريد الإلكتروني')}
                                </span>
                                <Switcher
                                    checked={emailNotif}
                                    onChange={(checked) => setEmailNotif(checked)}
                                />
                            </div>

                            {/* Security alert toggle */}
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {t('settings.securityNotif', 'تنبيهات الأمان والجلسات')}
                                </span>
                                <Switcher
                                    checked={securityNotif}
                                    onChange={(checked) => setSecurityNotif(checked)}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Change Password Popup Dialog Modal */}
            <Dialog
                isOpen={passwordModalOpen}
                width={500}
                onClose={() => setPasswordModalOpen(false)}
                onRequestClose={() => setPasswordModalOpen(false)}
            >
                <div className="p-2">
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary dark:bg-gray-700 dark:text-gray-100 flex items-center justify-center text-xl">
                            <HiOutlineKey />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {t('profile.changePassword', 'تغيير كلمة المرور')}
                        </h4>
                    </div>

                    {passwordSuccess && (
                        <Alert type="success" className="mb-4">
                            {passwordSuccess}
                        </Alert>
                    )}
                    {passwordError && (
                        <Alert type="danger" className="mb-4">
                            {passwordError}
                        </Alert>
                    )}

                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                    >
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                {t(
                                    'profile.currentPassword',
                                    'كلمة المرور الحالية',
                                )}
                            </label>
                            <Controller
                                name="currentPassword"
                                control={passwordControl}
                                render={({ field }) => (
                                    <PasswordInput
                                        {...field}
                                        placeholder={t(
                                            'profile.currentPassword',
                                            'كلمة المرور الحالية',
                                        )}
                                    />
                                )}
                            />
                            {passwordErrors.currentPassword && (
                                <span className="text-xs text-red-500 mt-1 block">
                                    {passwordErrors.currentPassword.message}
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                {t(
                                    'profile.newPassword',
                                    'كلمة المرور الجديدة',
                                )}
                            </label>
                            <Controller
                                name="newPassword"
                                control={passwordControl}
                                render={({ field }) => (
                                    <PasswordInput
                                        {...field}
                                        placeholder={t(
                                            'profile.newPassword',
                                            'كلمة المرور الجديدة',
                                        )}
                                    />
                                )}
                            />
                            {passwordErrors.newPassword && (
                                <span className="text-xs text-red-500 mt-1 block">
                                    {passwordErrors.newPassword.message}
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                {t(
                                    'profile.confirmNewPassword',
                                    'تأكيد كلمة المرور الجديدة',
                                )}
                            </label>
                            <Controller
                                name="confirmPassword"
                                control={passwordControl}
                                render={({ field }) => (
                                    <PasswordInput
                                        {...field}
                                        placeholder={t(
                                            'profile.confirmNewPassword',
                                            'تأكيد كلمة المرور الجديدة',
                                        )}
                                    />
                                )}
                            />
                            {passwordErrors.confirmPassword && (
                                <span className="text-xs text-red-500 mt-1 block">
                                    {passwordErrors.confirmPassword.message}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                variant="plain"
                                onClick={() => setPasswordModalOpen(false)}
                            >
                                {t('common.cancel', 'إلغاء')}
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={updatingPassword}
                                className="px-6"
                            >
                                {t('profile.saveChanges', 'حفظ التغييرات')}
                            </Button>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    )
}

export default UserSettings
