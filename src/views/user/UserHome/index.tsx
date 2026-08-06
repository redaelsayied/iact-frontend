import { useSessionUser } from '@/store/authStore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Link } from 'react-router-dom'
import { HiOutlineRocketLaunch, HiOutlineUser, HiOutlineSparkles } from 'react-icons/hi2'
import useTranslation from '@/utils/hooks/useTranslation'

const UserHome = () => {
    const sessionUser = useSessionUser((state) => state.user)
    const { t } = useTranslation()

    const userName = sessionUser?.firstName || t('userHome.member')

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] p-4 sm:p-6 text-center">
            <Card className="w-full border border-gray-100 shadow-md p-8 md:p-12 flex flex-col items-center">
                <div className="w-20 h-20 bg-primary-50 text-primary rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                    <HiOutlineRocketLaunch />
                </div>

                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-semibold px-3 py-1 mb-4 flex items-center gap-1.5 text-xs">
                    <HiOutlineSparkles className="text-sm" /> {t('userHome.comingSoon')}
                </Badge>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">
                    {t('userHome.welcome', { name: userName })}
                </h1>

                <p className="text-gray-500 text-base max-w-md mb-8 leading-relaxed">
                    {t('userHome.description')}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link to="/user/profile">
                        <Button variant="solid" icon={<HiOutlineUser />}>
                            {t('userHome.goToProfile')}
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}

export default UserHome
