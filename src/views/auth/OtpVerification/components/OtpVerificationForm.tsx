import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import OtpInput from '@/components/shared/OtpInput'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/auth'
import useTranslation from '@/utils/hooks/useTranslation'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

interface OtpVerificationFormProps extends CommonProps {
    email: string
    setOtpVerified?: (message: string) => void
    setMessage?: (message: string) => void
}

type OtpFormSchema = {
    otp: string
}

const OTP_LENGTH = 6

const validationSchema: ZodType<OtpFormSchema> = z.object({
    otp: z.string().min(OTP_LENGTH, { message: 'Please enter a 6-digit OTP code' }),
})

const OtpVerificationForm = (props: OtpVerificationFormProps) => {
    const { email, className, setMessage, setOtpVerified } = props
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { verifyEmail } = useAuth()
    const { t } = useTranslation()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<OtpFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const onOtpSend = async (values: OtpFormSchema) => {
        const { otp } = values
        if (!email) {
            setMessage?.('Email is missing. Please try registering again.')
            return
        }

        setSubmitting(true)
        const result = await verifyEmail({ email, otp })
        if (result?.status === 'failed') {
            setMessage?.(result.message)
        } else {
            setOtpVerified?.(result.message || 'Email verified successfully!')
        }
        setSubmitting(false)
    }

    return (
        <div className={`w-full ${className || ''}`}>
            <Form onSubmit={handleSubmit(onOtpSend)}>
                <FormItem
                    invalid={Boolean(errors.otp)}
                    errorMessage={errors.otp?.message}
                    className="mb-2"
                >
                    <Controller
                        name="otp"
                        control={control}
                        render={({ field }) => (
                            <OtpInput
                                placeholder=""
                                className="justify-center lg:justify-start gap-2 sm:gap-3 my-2"
                                inputClass="w-10 sm:w-12 md:w-14 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-lg border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                                length={OTP_LENGTH}
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                {/* Code Expiration Notice */}
                <p className="text-xs sm:text-sm text-text-secondary text-center lg:text-start mb-6 font-medium">
                    {t('auth.codeExpireNotice', 'Your Code Will Expire in 10 Minutes')}
                </p>

                {/* Submit Button */}
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold py-3 sm:py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-base sm:text-lg border-none focus:outline-none cursor-pointer"
                >
                    {isSubmitting
                        ? t('auth.verifying', 'Verifying...')
                        : t('auth.verifyButton', 'Verfiy')}
                </Button>
            </Form>
        </div>
    )
}

export default OtpVerificationForm
