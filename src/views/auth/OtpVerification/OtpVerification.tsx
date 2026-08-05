import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Alert from '@/components/ui/Alert'
import OtpVerificationForm from './components/OtpVerificationForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { apiResendOtp } from '@/services/AuthService'
import { useSessionUser } from '@/store/authStore'

export const OtpVerificationBase = () => {
    const [searchParams] = useSearchParams()
    const storedUserEmail = useSessionUser((state) => state.user.email)
    const email = searchParams.get('email') || storedUserEmail || ''

    const [otpVerified, setOtpVerified] = useTimeOutMessage()
    const [otpResend, setOtpResend] = useTimeOutMessage()
    const [message, setMessage] = useTimeOutMessage()

    const [timer, setTimer] = useState<number>(60)
    const [isResending, setIsResending] = useState<boolean>(false)

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [timer])

    const handleResendOtp = async () => {
        if (timer > 0 || isResending) return
        if (!email) {
            setMessage('Target email address missing.')
            return
        }

        setIsResending(true)
        try {
            const resp = await apiResendOtp({ email })
            if (resp?.status) {
                setOtpResend(resp.message || 'A new OTP has been sent to your email.')
                setTimer(60)
            } else {
                setMessage(resp?.message || 'Failed to resend OTP.')
            }
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
            setMessage(
                errorObj?.response?.data?.message ||
                errorObj.message ||
                'Unable to resend OTP at this time.'
            )
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h3 className="mb-2">OTP Verification</h3>
                <p className="font-semibold heading-text">
                    We have sent a 6-digit One Time Password to{' '}
                    <span className="text-primary font-bold">{email || 'your email'}</span>.
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            {otpResend && (
                <Alert showIcon className="mb-4" type="info">
                    <span className="break-all">{otpResend}</span>
                </Alert>
            )}
            {otpVerified && (
                <Alert showIcon className="mb-4" type="success">
                    <span className="break-all">{otpVerified}</span>
                </Alert>
            )}
            <OtpVerificationForm
                email={email}
                setMessage={setMessage}
                setOtpVerified={setOtpVerified}
            />
            <div className="mt-6 text-center">
                <span className="font-semibold">Didn&apos;t receive OTP? </span>
                <button
                    disabled={timer > 0 || isResending}
                    className={`heading-text font-bold underline ${
                        timer > 0 || isResending
                            ? 'text-gray-400 cursor-not-allowed no-underline'
                            : 'text-primary hover:text-primary-hover'
                    }`}
                    onClick={handleResendOtp}
                >
                    {isResending
                        ? 'Sending...'
                        : timer > 0
                        ? `Resend Code (${timer}s)`
                        : 'Resend OTP'}
                </button>
            </div>
        </div>
    )
}

const OtpVerification = () => {
    return <OtpVerificationBase />
}

export default OtpVerification
