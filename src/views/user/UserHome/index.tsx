import { useSessionUser } from '@/store/authStore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Link } from 'react-router-dom'
import { HiOutlineRocketLaunch, HiOutlineUser, HiOutlineSparkles } from 'react-icons/hi2'

const UserHome = () => {
    const sessionUser = useSessionUser((state) => state.user)

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 max-w-4xl mx-auto text-center">
            <Card className="w-full border border-gray-100 shadow-md p-8 md:p-12 flex flex-col items-center">
                <div className="w-20 h-20 bg-primary-50 text-primary rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                    <HiOutlineRocketLaunch />
                </div>

                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-semibold px-3 py-1 mb-4 flex items-center gap-1.5 text-xs">
                    <HiOutlineSparkles className="text-sm" /> Dashboard Features Coming Soon
                </Badge>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">
                    Welcome, {sessionUser.firstName || 'Member'}!
                </h1>

                <p className="text-gray-500 text-base max-w-md mb-8 leading-relaxed">
                    We are currently building exciting new features for your dashboard home. Stay tuned for upcoming tools, statistics, and course management features!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link to="/user/profile">
                        <Button variant="solid" icon={<HiOutlineUser />}>
                            Go to My Profile
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}

export default UserHome
