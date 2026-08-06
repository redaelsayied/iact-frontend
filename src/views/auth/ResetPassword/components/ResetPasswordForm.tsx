import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { apiResetPassword } from '@/services/AuthService'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useTranslation from '@/utils/hooks/useTranslation'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import passwordIcon from '@/assets/icons/password.svg'

interface ResetPasswordFormProps extends CommonProps {
    resetToken: string
    resetComplete: boolean
    setResetComplete?: (complete: boolean) => void
    setMessage?: (message: string) => void
    setIsTokenExpired?: (expired: boolean) => void
}

type ResetPasswordFormSchema = {
    newPassword: string
    confirmPassword: string
}

// Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

const validationSchema: ZodType<ResetPasswordFormSchema> = z
    .object({
        newPassword: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters' })
            .regex(passwordRegex, {
                message:
                    'Password must contain uppercase, lowercase, digit, and special character (!@#$%^&*)',
            }),
        confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const {
        resetToken,
        className,
        setMessage,
        setResetComplete,
        setIsTokenExpired,
        resetComplete,
        children,
    } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ResetPasswordFormSchema>({
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onResetPassword = async (values: ResetPasswordFormSchema) => {
        const { newPassword } = values

        if (!resetToken) {
            setMessage?.(t('auth.noResetToken', 'Reset session expired or token missing.'))
            setIsTokenExpired?.(true)
            return
        }

        try {
            setSubmitting(true)
            setMessage?.('')
            const resp = await apiResetPassword({
                resetToken,
                newPassword,
            })

            if (resp && resp.status) {
                setSubmitting(false)
                setResetComplete?.(true)
            } else {
                const errorMsg = resp?.message || t('auth.passwordResetFailed', 'Failed to reset password.')
                setMessage?.(errorMsg)
                if (
                    errorMsg.toLowerCase().includes('expired') ||
                    errorMsg.toLowerCase().includes('invalid token') ||
                    errorMsg.toLowerCase().includes('token')
                ) {
                    setIsTokenExpired?.(true)
                }
                setSubmitting(false)
            }
        } catch (errors: unknown) {
            const errorObj = errors as { response?: { data?: { message?: string } }; message?: string }
            const errorMsg =
                errorObj?.response?.data?.message ||
                errorObj.message ||
                t('auth.passwordResetFailed', 'Failed to reset password.')

            setMessage?.(errorMsg)
            if (
                errorMsg.toLowerCase().includes('expired') ||
                errorMsg.toLowerCase().includes('invalid token') ||
                errorMsg.toLowerCase().includes('token')
            ) {
                setIsTokenExpired?.(true)
            }
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            {!resetComplete ? (
                <Form onSubmit={handleSubmit(onResetPassword)}>
                    <FormItem
                        label={t('auth.newPassword', 'New Password')}
                        invalid={Boolean(errors.newPassword)}
                        errorMessage={errors.newPassword?.message}
                        className="mb-4"
                    >
                        <Controller
                            name="newPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder="••••••••••••"
                                    className="h-12 bg-surface border-border text-text-primary text-base"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label={t('auth.confirmPassword', 'Confirm Password')}
                        invalid={Boolean(errors.confirmPassword)}
                        errorMessage={errors.confirmPassword?.message}
                        className="mb-6"
                    >
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder={t('auth.confirmPassword', 'Confirm Password')}
                                    className="h-12 bg-surface border-border text-text-primary text-base"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <Button
                        block
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        variant="solid"
                        type="submit"
                        className="h-12 bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-none w-full cursor-pointer"
                    >
                        {isSubmitting
                            ? t('common.loading', 'Submitting...')
                            : t('auth.resetPassword', 'Reset Password')}
                    </Button>
                </Form>
            ) : (
                <>{children}</>
            )}
        </div>
    )
}

export default ResetPasswordForm
