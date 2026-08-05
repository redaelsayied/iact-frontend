import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import { apiGetUserById } from '@/services/UserService'
import {
    HiOutlineArrowLeft,
    HiOutlinePencilSquare,
    HiOutlineUser,
    HiOutlineDocumentText,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineGlobeAlt,
} from 'react-icons/hi2'
import type { UserFullInfoResponse } from '@/@types/user'

const renderStatusBadge = (status: number) => {
    switch (status) {
        case 1:
            return <Badge className="bg-amber-500 text-white">Pending Email Verification</Badge>
        case 2:
            return <Badge className="bg-blue-500 text-white">Pending Identity Document</Badge>
        case 3:
            return <Badge className="bg-purple-500 text-white">Pending Admin Approval</Badge>
        case 4:
            return <Badge className="bg-emerald-500 text-white">Active Account</Badge>
        case 5:
            return <Badge className="bg-rose-500 text-white">Rejected</Badge>
        case 6:
            return <Badge className="bg-red-600 text-white">Suspended</Badge>
        case 7:
            return <Badge className="bg-gray-700 text-white">Locked</Badge>
        default:
            return <Badge className="bg-gray-400 text-white">Unknown Status</Badge>
    }
}

const UserDetails = () => {
    const { id } = useParams<{ id: string }>()
    const [user, setUser] = useState<UserFullInfoResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [errorMsg, setErrorMsg] = useState<string>('')

    useEffect(() => {
        if (!id) return
        setLoading(true)
        apiGetUserById(id)
            .then((res) => {
                if (res?.data) {
                    setUser(res.data)
                } else {
                    setErrorMsg('User details not found.')
                }
            })
            .catch((err: unknown) => {
                const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
                setErrorMsg(errorObj?.response?.data?.message || errorObj.message || 'Failed to load user details.')
            })
            .finally(() => {
                setLoading(false)
            })
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Spinner size="40px" />
            </div>
        )
    }

    if (errorMsg || !user) {
        return (
            <div className="max-w-4xl mx-auto p-4 flex flex-col gap-4">
                <Link to="/admin/users">
                    <Button size="sm" icon={<HiOutlineArrowLeft />}>
                        Back to Users List
                    </Button>
                </Link>
                <Alert type="danger">{errorMsg || 'User not found'}</Alert>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/admin/users">
                        <Button size="sm" variant="default" icon={<HiOutlineArrowLeft />} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {user.firstName} {user.lastName}
                        </h2>
                        <span className="text-xs text-gray-500 font-mono">User ID: {user.id}</span>
                    </div>
                </div>
                <Link to={`/admin/users/${user.id}/edit`}>
                    <Button variant="solid" icon={<HiOutlinePencilSquare />}>
                        Edit User
                    </Button>
                </Link>
            </div>

            {/* Profile Summary Header Card */}
            <Card className="shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Avatar
                            size={80}
                            shape="circle"
                            src={user.imageUrl || undefined}
                            icon={<HiOutlineUser className="text-3xl" />}
                            className="border-2 border-gray-100 shadow-sm"
                        />
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">
                                {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                                    {(user.roles || []).join(', ') || 'User'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>{renderStatusBadge(user.status)}</div>
                </div>
            </Card>

            {/* Detailed Grid Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-800 text-lg mb-4">Contact & Identification</h4>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <HiOutlineEnvelope className="text-xl text-gray-400" />
                            <div>
                                <span className="text-xs text-gray-500 block">Email Address</span>
                                <span className="text-sm font-semibold text-gray-800">{user.email || '-'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <HiOutlinePhone className="text-xl text-gray-400" />
                            <div>
                                <span className="text-xs text-gray-500 block">Phone Number</span>
                                <span className="text-sm font-semibold text-gray-800">{user.phoneNumber || '-'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <HiOutlineGlobeAlt className="text-xl text-gray-400" />
                            <div>
                                <span className="text-xs text-gray-500 block">Nationality</span>
                                <span className="text-sm font-semibold text-gray-800">{user.nationality || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Identity Document Inspection Card */}
                <Card className="shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-800 text-lg mb-4">Verification Documents</h4>
                    {user.filesUrl ? (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl gap-3">
                            <HiOutlineDocumentText className="text-5xl text-primary" />
                            <span className="text-sm font-semibold text-gray-700">Identity Verification File Attached</span>
                            <a
                                href={user.filesUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full text-center"
                            >
                                <Button block variant="twoTone" icon={<HiOutlineDocumentText />}>
                                    View Verification Document
                                </Button>
                            </a>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 border border-gray-100 bg-gray-50 rounded-xl text-center text-gray-400">
                            <HiOutlineDocumentText className="text-4xl mb-2" />
                            <span className="text-sm font-medium text-gray-500">No identity document uploaded</span>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

export default UserDetails
