import { useEffect, useState } from 'react'
import { useSessionUser } from '@/store/authStore'
import { apiGetMe } from '@/services/UserService'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { Link } from 'react-router-dom'
import {
    HiOutlineUser,
    HiOutlineShieldCheck,
    HiOutlineKey,
    HiOutlineEnvelope,
    HiOutlinePhone,
} from 'react-icons/hi2'
import type { UserProfileResponse } from '@/@types/user'

const getStatusBadge = (status?: number) => {
    switch (status) {
        case 1:
            return <Badge className="bg-amber-500 text-white">Pending Email Verification</Badge>
        case 2:
            return <Badge className="bg-blue-500 text-white">Pending Identity Upload</Badge>
        case 3:
            return <Badge className="bg-purple-500 text-white">Pending Approval</Badge>
        case 4:
            return <Badge className="bg-emerald-500 text-white">Active Account</Badge>
        case 5:
            return <Badge className="bg-rose-500 text-white">Verification Rejected</Badge>
        case 6:
            return <Badge className="bg-red-600 text-white">Suspended</Badge>
        case 7:
            return <Badge className="bg-gray-700 text-white">Locked</Badge>
        default:
            return <Badge className="bg-gray-500 text-white">Unknown Status</Badge>
    }
}

const UserHome = () => {
    const sessionUser = useSessionUser((state) => state.user)
    const [profile, setProfile] = useState<UserProfileResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        let isMounted = true
        apiGetMe()
            .then((res) => {
                if (isMounted && res?.data) {
                    setProfile(res.data)
                }
            })
            .catch(() => {})
            .finally(() => {
                if (isMounted) setLoading(false)
            })
        return () => {
            isMounted = false
        }
    }, [])

    const displayUser = profile || sessionUser

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar
                        size={64}
                        shape="circle"
                        src={displayUser.profileImageUrl || sessionUser.avatar || undefined}
                        icon={<HiOutlineUser />}
                        className="border-2 border-white shadow-md"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Welcome back, {displayUser.firstName || sessionUser.firstName || 'User'}!
                        </h2>
                        <p className="text-indigo-100 text-sm mt-1">
                            Member Portal & Account Overview
                        </p>
                    </div>
                </div>
                <div>{getStatusBadge(displayUser.status)}</div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Spinner size="40px" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Account Overview Card */}
                    <Card className="md:col-span-2 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <HiOutlineUser className="text-primary" /> Profile Information
                            </h4>
                            <Link to="/user/profile">
                                <Button size="sm" variant="twoTone">
                                    Edit Profile
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-500 block text-xs">First Name</span>
                                <span className="font-semibold text-gray-800 text-base">
                                    {displayUser.firstName || '-'}
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-500 block text-xs">Last Name</span>
                                <span className="font-semibold text-gray-800 text-base">
                                    {displayUser.lastName || '-'}
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                                <HiOutlineEnvelope className="text-gray-400 text-lg" />
                                <div>
                                    <span className="text-gray-500 block text-xs">Email Address</span>
                                    <span className="font-semibold text-gray-800 text-sm">
                                        {displayUser.email || '-'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                                <HiOutlinePhone className="text-gray-400 text-lg" />
                                <div>
                                    <span className="text-gray-500 block text-xs">Phone Number</span>
                                    <span className="font-semibold text-gray-800 text-sm">
                                        {displayUser.phoneNumber || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Actions Card */}
                    <Card className="shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                            <HiOutlineShieldCheck className="text-primary" /> Quick Settings
                        </h4>
                        <div className="flex flex-col gap-3">
                            <Link to="/user/profile?tab=profile">
                                <Button block variant="default" icon={<HiOutlineUser />}>
                                    Update Profile
                                </Button>
                            </Link>
                            <Link to="/user/profile?tab=password">
                                <Button block variant="default" icon={<HiOutlineKey />}>
                                    Change Password
                                </Button>
                            </Link>
                            <Link to="/user/profile?tab=avatar">
                                <Button block variant="default" icon={<HiOutlineUser />}>
                                    Change Profile Image
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default UserHome
