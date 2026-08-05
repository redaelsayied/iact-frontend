import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ActionLink from '@/components/shared/ActionLink'
import ForgotPasswordForm from './components/ForgotPasswordForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useTranslation from '@/utils/hooks/useTranslation'
import { useNavigate } from 'react-router-dom'

type ForgotPasswordProps = {
    signInUrl?: string
}

export const ForgotPasswordBase = ({
    signInUrl = '/sign-in',
}: ForgotPasswordProps) => {
    const [emailSent, setEmailSent] = useState(false)
    const [message, setMessage] = useTimeOutMessage()
    const { t } = useTranslation()

    const navigate = useNavigate()

    const handleContinue = () => {
        navigate(signInUrl)
    }

    return (
        <div>
            <div className="mb-6">
                {emailSent ? (
                    <>
                        <h3 className="mb-2">{t('auth.checkEmail', 'Check your email')}</h3>
                        <p className="font-semibold heading-text">
                            {t('auth.emailSentMessage', 'We have sent a password recovery link to your email')}
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="mb-2">{t('auth.forgotPassword', 'Forgot Password')}</h3>
                        <p className="font-semibold heading-text">
                            {t('auth.enterEmailToReset', 'Please enter your email to receive a verification code')}
                        </p>
                    </>
                )}
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <ForgotPasswordForm
                emailSent={emailSent}
                setMessage={setMessage}
                setEmailSent={setEmailSent}
            >
                <Button
                    block
                    variant="solid"
                    type="button"
                    onClick={handleContinue}
                >
                    {t('common.continue', 'Continue')}
                </Button>
            </ForgotPasswordForm>
            <div className="mt-4 text-center">
                <span>{t('auth.backTo', 'Back to')}{' '}</span>
                <ActionLink
                    to={signInUrl}
                    className="heading-text font-bold"
                    themeColor={false}
                >
                    {t('auth.signIn', 'Sign in')}
                </ActionLink>
            </div>
        </div>
    )
}

const ForgotPassword = () => {
    return <ForgotPasswordBase />
}

export default ForgotPassword
