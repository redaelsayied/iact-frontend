import { useState } from 'react'
import Button from '@/components/ui/Button'
import { useAuth } from '@/auth'
import useTranslation from '@/utils/hooks/useTranslation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import { HiOutlineUser, HiOutlineDevicePhoneMobile, HiOutlineAtSymbol, HiOutlineLockClosed } from 'react-icons/hi2'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
}

type SignUpFormSchema = {
    firstName: string
    lastName: string
    mobileNumber: string
    email: string
    password: string
}

const validationSchema: ZodType<SignUpFormSchema> = z.object({
    firstName: z.string({ required_error: 'Please enter your first name' }).min(1, { message: 'Please enter your first name' }),
    lastName: z.string({ required_error: 'Please enter your last name' }).min(1, { message: 'Please enter your last name' }),
    mobileNumber: z.string({ required_error: 'Please enter your mobile number' }).min(1, { message: 'Please enter your mobile number' }),
    email: z.string({ required_error: 'Please enter your email' }).email({ message: 'Invalid email' }),
    password: z.string({ required_error: 'Password Required' }).min(6, { message: 'Password Required' }),
})

const PasswordWithXxxIcon = () => (
    <div className="flex flex-col items-center justify-center text-slate-400 min-w-[20px] select-none">
        <HiOutlineLockClosed className="text-[17px]" />
        <span className="text-[7px] font-mono font-bold tracking-tighter -mt-1 text-slate-400">xxx</span>
    </div>
)

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, setMessage } = props

    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [showPassword, setShowPassword] = useState<boolean>(false)
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
        const { firstName, lastName, password, email, mobileNumber } = values
        const userName = `${firstName} ${lastName}`.trim()

        if (!disableSubmit) {
            setSubmitting(true)
            const result = await signUp({ userName, firstName, lastName, password, email, mobileNumber })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }

            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSignUp)}>
                {/* Row 1: First Name & Last Name with User Icon */}
                <div className="mb-5">
                    <div className="flex items-center">
                        <div className="me-3 flex-shrink-0 text-slate-400 text-xl pb-1">
                            <HiOutlineUser />
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {/* First Name Field */}
                            <div className={`border-b ${errors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus-within:border-primary'} py-2.5 transition-colors`}>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder={t('auth.firstName', 'First Name')}
                                            autoComplete="off"
                                            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm p-0"
                                            {...field}
                                        />
                                    )}
                                />
                            </div>

                            {/* Last Name Field */}
                            <div className={`border-b ${errors.lastName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus-within:border-primary'} py-2.5 transition-colors`}>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder={t('auth.lastName', 'Last Name')}
                                            autoComplete="off"
                                            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm p-0"
                                            {...field}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    {(errors.firstName?.message || errors.lastName?.message) && (
                        <span className="text-xs text-red-500 mt-1 block ms-8">
                            {errors.firstName?.message ? t(errors.firstName.message, errors.firstName.message) : t(errors.lastName?.message || '', errors.lastName?.message || '')}
                        </span>
                    )}
                </div>

                {/* Row 2: Mobile Number Field */}
                <div className="mb-5">
                    <div className={`flex items-center border-b ${errors.mobileNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus-within:border-primary'} py-2.5 transition-colors`}>
                        <div className="me-3 flex-shrink-0 text-slate-400 text-xl">
                            <HiOutlineDevicePhoneMobile />
                        </div>
                        <Controller
                            name="mobileNumber"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="text"
                                    placeholder={t('auth.mobileNumber', 'Mobile Number')}
                                    autoComplete="off"
                                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm p-0"
                                    {...field}
                                />
                            )}
                        />
                    </div>
                    {errors.mobileNumber?.message && (
                        <span className="text-xs text-red-500 mt-1 block">{t(errors.mobileNumber.message, errors.mobileNumber.message)}</span>
                    )}
                </div>

                {/* Row 3: Email Field */}
                <div className="mb-5">
                    <div className={`flex items-center border-b ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus-within:border-primary'} py-2.5 transition-colors`}>
                        <div className="me-3 flex-shrink-0 text-slate-400 text-xl">
                            <HiOutlineAtSymbol />
                        </div>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="email"
                                    placeholder={t('auth.email', 'Email')}
                                    autoComplete="off"
                                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm p-0"
                                    {...field}
                                />
                            )}
                        />
                    </div>
                    {errors.email?.message && (
                        <span className="text-xs text-red-500 mt-1 block">{t(errors.email.message, errors.email.message)}</span>
                    )}
                </div>

                {/* Row 4: Password Field */}
                <div className="mb-8">
                    <div className={`flex items-center border-b ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700 focus-within:border-primary'} py-2.5 transition-colors`}>
                        <div className="me-3 flex-shrink-0">
                            <PasswordWithXxxIcon />
                        </div>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={t('auth.password', 'Password')}
                                    autoComplete="off"
                                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm p-0"
                                    {...field}
                                />
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="ms-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            {showPassword ? <HiOutlineEyeOff className="text-lg" /> : <HiOutlineEye className="text-lg" />}
                        </button>
                    </div>
                    {errors.password?.message && (
                        <span className="text-xs text-red-500 mt-1 block">{t(errors.password.message, errors.password.message)}</span>
                    )}
                </div>

                {/* Next Button */}
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold py-3 rounded-lg shadow-md transition-all border-none hover:border-none focus:border-none"
                >
                    {isSubmitting
                        ? t('auth.creatingAccount', 'Creating Account...')
                        : t('auth.next', 'Next')}
                </Button>
            </form>
        </div>
    )
}

export default SignUpForm

