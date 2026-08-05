import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './components/SignInForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useThemeStore } from '@/store/themeStore'
import useTranslation from '@/utils/hooks/useTranslation'

type SignInProps = {
    signUpUrl?: string
    forgetPasswordUrl?: string
    disableSubmit?: boolean
}

export const SignInBase = ({
    signUpUrl = '/sign-up',
    forgetPasswordUrl = '/forgot-password',
    disableSubmit,
}: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()
    const { t } = useTranslation()

    const mode = useThemeStore((state) => state.mode)

    return (
        <>
            <div className="mb-8 flex justify-center">
                <Logo
                    type="full"
                    mode={mode}
                    className="mx-auto"
                    imgClass="mx-auto"
                    logoWidth={150}
                />
            </div>
            <div className="mb-10 text-center">
                <h2 className="mb-2">{t('auth.welcomeBack', 'Welcome back!')}</h2>
                <p className="font-semibold heading-text">
                    {t('auth.enterCredentials', 'Please enter your credentials to sign in!')}
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignInForm
                disableSubmit={disableSubmit}
                setMessage={setMessage}
                passwordHint={
                    <div className="mb-7 mt-2">
                        <ActionLink
                            to={forgetPasswordUrl}
                            className="font-semibold heading-text mt-2 underline"
                            themeColor={false}
                        >
                            {t('auth.forgotPassword', 'Forgot password')}
                        </ActionLink>
                    </div>
                }
            />
            <div>
                <div className="mt-6 text-center">
                    <span>{t('auth.dontHaveAccount', "Don't have an account yet?")}{' '}</span>
                    <ActionLink
                        to={signUpUrl}
                        className="heading-text font-bold"
                        themeColor={false}
                    >
                        {t('auth.signUp', 'Sign up')}
                    </ActionLink>
                </div>
            </div>
        </>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn
