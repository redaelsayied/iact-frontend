import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import { useAuth } from '@/auth'
import useTranslation from '@/utils/hooks/useTranslation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
}

type SignUpFormSchema = {
    userName: string
    password: string
    email: string
    confirmPassword: string
}

const validationSchema: ZodType<SignUpFormSchema> = z
    .object({
        email: z.string({ required_error: 'Please enter your email' }),
        userName: z.string({ required_error: 'Please enter your name' }),
        password: z.string({ required_error: 'Password Required' }),
        confirmPassword: z.string({
            required_error: 'Confirm Password Required',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password not match',
        path: ['confirmPassword'],
    })

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, setMessage } = props

    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { t } = useTranslation()

    const { signUp } = useAuth()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignUpFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const onSignUp = async (values: SignUpFormSchema) => {
        const { userName, password, email } = values

        if (!disableSubmit) {
            setSubmitting(true)
            const result = await signUp({ userName, password, email })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }

            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignUp)}>
                <FormItem
                    label={t('auth.userName', 'User Name')}
                    invalid={Boolean(errors.userName)}
                    errorMessage={errors.userName?.message ? t(errors.userName.message, errors.userName.message) : undefined}
                >
                    <Controller
                        name="userName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder={t('auth.userName', 'User Name')}
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label={t('auth.email', 'Email')}
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message ? t(errors.email.message, errors.email.message) : undefined}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder={t('auth.email', 'Email')}
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label={t('auth.password', 'Password')}
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message ? t(errors.password.message, errors.password.message) : undefined}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder={t('auth.password', 'Password')}
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label={t('auth.confirmPassword', 'Confirm Password')}
                    invalid={Boolean(errors.confirmPassword)}
                    errorMessage={errors.confirmPassword?.message ? t(errors.confirmPassword.message, errors.confirmPassword.message) : undefined}
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder={t('auth.confirmPassword', 'Confirm Password')}
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
                >
                    {isSubmitting
                        ? t('auth.creatingAccount', 'Creating Account...')
                        : t('auth.signUp', 'Sign Up')}
                </Button>
            </Form>
        </div>
    )
}

export default SignUpForm
