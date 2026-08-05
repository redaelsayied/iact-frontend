import Alert from '@/components/ui/Alert'
import SignInForm from './components/SignInForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useTranslation from '@/utils/hooks/useTranslation'
import LanguageSelector from '@/components/template/LanguageSelector'

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

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Header with Language Selector */}
            <div className="flex items-center justify-end mb-6 lg:mb-8">
                <LanguageSelector />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* 3D Illustration: Centered on mobile, Left column on Desktop */}
                <div className="lg:col-span-5 flex justify-center items-center bg-slate-50 dark:bg-gray-800/60 p-6 lg:p-10 rounded-2xl lg:rounded-3xl border border-slate-100 dark:border-gray-700/50">
                    <img
                        src="/img/others/login-3d-card.png"
                        alt="Log In"
                        className="h-44 sm:h-52 lg:h-64 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Form Column */}
                <div className="lg:col-span-7 flex flex-col justify-center px-2 sm:px-6">
                    {/* Title & Subtitle */}
                    <div className="mb-6 text-start">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D1B3E] dark:text-white mb-2">
                            {t('auth.logIn', 'Log In')}
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-300">
                            {t('auth.welcomeBackDetails', 'Welcome Back! Please Enter Your Details')}
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
                        forgetPasswordUrl={forgetPasswordUrl}
                    />

                    <div className="mt-6 text-center lg:text-start">
                        <span className="text-slate-500 text-sm">{t('auth.dontHaveAccount', "Don't have an account?")}{' '}</span>
                        <ActionLink
                            to={signUpUrl}
                            className="text-[#102A71] font-bold text-sm hover:underline"
                            themeColor={false}
                        >
                            {t('auth.signUp', 'Sign up')}
                        </ActionLink>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn

