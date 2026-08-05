import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import { apiForgotPassword } from '@/services/AuthService'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import useTranslation from '@/utils/hooks/useTranslation'
import atIcon from '@/assets/icons/at-11.svg'

interface ForgotPasswordFormProps extends CommonProps {
    emailSent: boolean
    setEmailSent?: (complete: boolean) => void
    setMessage?: (message: string) => void
}

type ForgotPasswordFormSchema = {
    email: string
}

const validationSchema: ZodType<ForgotPasswordFormSchema> = z.object({
    email: z.string().min(3, { message: 'Please enter a valid email' }),
})

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { t } = useTranslation()

    const { className, setMessage, setEmailSent, emailSent, children } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ForgotPasswordFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const onForgotPassword = async (values: ForgotPasswordFormSchema) => {
        const { email } = values

        try {
            setSubmitting(true)
            const resp = await apiForgotPassword({ email })
            if (resp) {
                setSubmitting(false)
                setEmailSent?.(true)
            }
        } catch (errors) {
            setMessage?.(
                typeof errors === 'string' ? errors : 'Some error occurred!',
            )
            setSubmitting(false)
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            {!emailSent ? (
                <Form className="w-full" onSubmit={handleSubmit(onForgotPassword)}>
                    <FormItem
                        invalid={Boolean(errors.email)}
                        errorMessage={errors.email?.message}
                        className="mb-6 w-full"
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder={t('auth.email', 'Email')}
                                    autoComplete="off"
                                    prefix={
                                        <img
                                            src={atIcon}
                                            alt="at"
                                            className="w-5 h-5 opacity-70"
                                        />
                                    }
                                    className="h-12 bg-surface border-border text-text-primary text-base"
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
                        className="h-12 bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-none w-full"
                    >
                        {isSubmitting ? t('common.loading', 'Submitting...') : t('auth.submit', 'Submit')}
                    </Button>
                </Form>
            ) : (
                <>{children}</>
            )}
        </div>
    )
}

export default ForgotPasswordForm
