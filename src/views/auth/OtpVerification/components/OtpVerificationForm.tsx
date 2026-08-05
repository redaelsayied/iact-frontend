import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import OtpInput from '@/components/shared/OtpInput'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/auth'
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
        <div className={className}>
            <Form onSubmit={handleSubmit(onOtpSend)}>
                <FormItem
                    invalid={Boolean(errors.otp)}
                    errorMessage={errors.otp?.message}
                >
                    <Controller
                        name="otp"
                        control={control}
                        render={({ field }) => (
                            <OtpInput
                                placeholder=""
                                inputClass="h-[58px]"
                                length={OTP_LENGTH}
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
                    {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </Button>
            </Form>
        </div>
    )
}

export default OtpVerificationForm
