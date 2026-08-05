import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { Link } from 'react-router-dom'
import { apiGetUsers } from '@/services/UserService'
import {
    HiOutlineUsers,
    HiOutlineUserPlus,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineLockClosed,
} from 'react-icons/hi2'
import type { PaginatedResult, UserInfoResponse } from '@/@types/user'

const AdminDashboard = () => {
    const [totalUsers, setTotalUsers] = useState<number>(0)
    const [activeUsers, setActiveUsers] = useState<number>(0)
    const [pendingUsers, setPendingUsers] = useState<number>(0)
    const [recentUsers, setRecentUsers] = useState<UserInfoResponse[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        let isMounted = true
        apiGetUsers({ pageNumber: 1, pageSize: 5 })
            .then((res) => {
                if (isMounted && res?.data) {
                    const data: PaginatedResult<UserInfoResponse> = res.data
                    setTotalUsers(data.totalCount || 0)
                    setRecentUsers(data.items || [])
                }
            })
            .catch(() => {})
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        // Fetch active users count
        apiGetUsers({ status: 4, pageNumber: 1, pageSize: 1 })
            .then((res) => {
                if (isMounted && res?.data) {
                    setActiveUsers(res.data.totalCount || 0)
                }
            })
            .catch(() => {})

        // Fetch pending email verification count
        apiGetUsers({ status: 1, pageNumber: 1, pageSize: 1 })
            .then((res) => {
                if (isMounted && res?.data) {
                    setPendingUsers(res.data.totalCount || 0)
                }
            })
            .catch(() => {})

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto p-4">
            {/* Header banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Admin Control Center</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        System User Overview & Access Control Management
                    </p>
                </div>
                <Link to="/admin/users/create">
                    <Button variant="solid" icon={<HiOutlineUserPlus />}>
                        Add New User
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Spinner size="40px" />
                </div>
            ) : (
                <>
                    {/* Stat Widgets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl text-2xl">
                                    <HiOutlineUsers />
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs font-semibold uppercase">Total Users</span>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalUsers}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card className="border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-2xl">
                                    <HiOutlineCheckCircle />
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs font-semibold uppercase">Active Users</span>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{activeUsers}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card className="border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl text-2xl">
                                    <HiOutlineClock />
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs font-semibold uppercase">Pending Verification</span>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{pendingUsers}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card className="border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-2xl">
                                    <HiOutlineLockClosed />
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs font-semibold uppercase">Role Access</span>
                                    <h3 className="text-xl font-bold text-gray-800 mt-1">RBAC Active</h3>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Recent Users Section */}
                    <Card className="border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-800 text-lg">Recent Registered Users</h4>
                            <Link to="/admin/users">
                                <Button size="sm" variant="twoTone">
                                    View All Users
                                </Button>
                            </Link>
                        </div>
                        {recentUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">No users available</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase bg-gray-50">
                                            <th className="py-3 px-4 font-semibold">User</th>
                                            <th className="py-3 px-4 font-semibold">Email</th>
                                            <th className="py-3 px-4 font-semibold">Phone</th>
                                            <th className="py-3 px-4 font-semibold">Roles</th>
                                            <th className="py-3 px-4 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                                <td className="py-3 px-4 font-medium text-gray-800">
                                                    {user.firstName} {user.lastName}
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                                <td className="py-3 px-4 text-gray-600">{user.phoneNumber || '-'}</td>
                                                <td className="py-3 px-4">
                                                    {(user.roles || []).join(', ') || 'User'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Link to={`/admin/users/${user.id}`}>
                                                        <span className="text-primary hover:underline text-xs font-semibold">
                                                            Details
                                                        </span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    )
}

export default AdminDashboard
