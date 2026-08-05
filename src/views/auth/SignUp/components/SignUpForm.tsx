import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
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
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
}

const validationSchema: ZodType<SignUpFormSchema> = z
    .object({
        firstName: z.string({ required_error: 'Please enter your first name' }).min(1, { message: 'Please enter your first name' }),
        lastName: z.string({ required_error: 'Please enter your last name' }).min(1, { message: 'Please enter your last name' }),
        email: z.string({ required_error: 'Please enter your email' }).email({ message: 'Invalid email' }),
        password: z.string({ required_error: 'Password Required' }).min(6, { message: 'Password Required' }),
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
        const { firstName, lastName, password, email } = values
        const userName = `${firstName} ${lastName}`.trim()

        if (!disableSubmit) {
            setSubmitting(true)
            const result = await signUp({ userName, firstName, lastName, password, email })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }

            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignUp)}>
                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormItem
                        label={t('auth.firstName', 'First Name')}
                        invalid={Boolean(errors.firstName)}
                        errorMessage={errors.firstName?.message ? t(errors.firstName.message, errors.firstName.message) : undefined}
                    >
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder={t('auth.firstName', 'First Name')}
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label={t('auth.lastName', 'Last Name')}
                        invalid={Boolean(errors.lastName)}
                        errorMessage={errors.lastName?.message ? t(errors.lastName.message, errors.lastName.message) : undefined}
                    >
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder={t('auth.lastName', 'Last Name')}
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>

                {/* Row 2: Email */}
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

                {/* Row 3: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormItem
                        label={t('auth.password', 'Password')}
                        invalid={Boolean(errors.password)}
                        errorMessage={errors.password?.message ? t(errors.password.message, errors.password.message) : undefined}
                    >
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    type="text"
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
                                <PasswordInput
                                    type="text"
                                    autoComplete="off"
                                    placeholder={t('auth.confirmPassword', 'Confirm Password')}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>

                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    className="mt-2"
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
