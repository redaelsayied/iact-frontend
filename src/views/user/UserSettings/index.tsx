import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Dialog from '@/components/ui/Dialog'
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
    const direction = useThemeStore((state) => state.direction)
    const isRtl = currentLang === 'ar' || direction === 'rtl'

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
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <HiOutlineCog6Tooth className="text-primary dark:text-primary-soft text-2xl" />
                    {t('common.accountSettings', 'إعدادات الحساب')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t(
                        'settings.description',
                        'إدارة كلمة المرور وتفضيلات الحساب الخاصة بك',
                    )}
                </p>
            </div>

            <Card className="shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl p-6 bg-white dark:bg-gray-900">
                <div className="flex flex-col gap-4">
                    {/* Change Password Option Box */}
                    <div
                        className="group flex items-center justify-between p-4 sm:p-5 border border-gray-200/80 dark:border-gray-800 rounded-2xl bg-gray-50/50 hover:bg-primary-subtle/50 dark:bg-gray-800/40 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer shadow-xs"
                        onClick={() => {
                            setPasswordSuccess('')
                            setPasswordError('')
                            setPasswordModalOpen(true)
                        }}
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary dark:bg-gray-700 dark:text-gray-100 flex items-center justify-center text-xl transition-transform group-hover:scale-105">
                                <HiOutlineKey />
                            </div>
                            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100">
                                {t('profile.changePassword', 'تغيير كلمة المرور')}
                            </span>
                        </div>
                        <ChevronIcon className="text-primary dark:text-gray-300 text-lg transition-transform group-hover:rtl:-translate-x-1 group-hover:ltr:translate-x-1" />
                    </div>
                </div>
            </Card>

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
