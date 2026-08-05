import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import OtpInput from '@/components/shared/OtpInput'
import { apiResetPassword } from '@/services/AuthService'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

interface ResetPasswordFormProps extends CommonProps {
    resetComplete: boolean
    setResetComplete?: (complete: boolean) => void
    setMessage?: (message: string) => void
}

type ResetPasswordFormSchema = {
    email: string
    code: string
    newPassword: string
    confirmPassword: string
}

const validationSchema: ZodType<ResetPasswordFormSchema> = z
    .object({
        email: z.string().email({ message: 'Please enter a valid email address' }),
        code: z.string().min(6, { message: 'Please enter the 6-digit OTP code' }),
        newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
        confirmPassword: z.string({ required_error: 'Confirm Password Required' }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Your passwords do not match',
        path: ['confirmPassword'],
    })

const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const initialEmail = searchParams.get('email') || ''

    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { className, setMessage, setResetComplete, resetComplete, children } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ResetPasswordFormSchema>({
        defaultValues: {
            email: initialEmail,
            code: '',
            newPassword: '',
            confirmPassword: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onResetPassword = async (values: ResetPasswordFormSchema) => {
        const { email, code, newPassword } = values

        try {
            setSubmitting(true)
            const resp = await apiResetPassword({
                email,
                code,
                newPassword,
            })
            if (resp && resp.status) {
                setSubmitting(false)
                setResetComplete?.(true)
                setTimeout(() => {
                    navigate('/sign-in')
                }, 2000)
            } else {
                setMessage?.(resp?.message || 'Failed to reset password.')
                setSubmitting(false)
            }
        } catch (errors: unknown) {
            const errorObj = errors as { response?: { data?: { message?: string } }; message?: string }
            setMessage?.(
                errorObj?.response?.data?.message ||
                errorObj.message ||
                'Failed to reset password',
            )
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            {!resetComplete ? (
                <Form onSubmit={handleSubmit(onResetPassword)}>
                    <FormItem
                        label="Email Address"
                        invalid={Boolean(errors.email)}
                        errorMessage={errors.email?.message}
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="6-digit OTP Code"
                        invalid={Boolean(errors.code)}
                        errorMessage={errors.code?.message}
                    >
                        <Controller
                            name="code"
                            control={control}
                            render={({ field }) => (
                                <OtpInput
                                    length={6}
                                    placeholder=""
                                    inputClass="h-[48px]"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="New Password"
                        invalid={Boolean(errors.newPassword)}
                        errorMessage={errors.newPassword?.message}
                    >
                        <Controller
                            name="newPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder="••••••••••••"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Confirm Password"
                        invalid={Boolean(errors.confirmPassword)}
                        errorMessage={errors.confirmPassword?.message}
                    >
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder="Confirm Password"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                        className="mt-4"
                    >
                        {isSubmitting ? 'Submitting...' : 'Reset Password'}
                    </Button>
                </Form>
            ) : (
                <>{children}</>
            )}
        </div>
    )
}

export default ResetPasswordForm
