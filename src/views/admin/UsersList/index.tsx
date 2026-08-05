import { useEffect, useState, useCallback } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'
import Dialog from '@/components/ui/Dialog'
import Alert from '@/components/ui/Alert'
import Pagination from '@/components/ui/Pagination'
import { Link } from 'react-router-dom'
import { apiGetUsers, apiDeleteUser } from '@/services/UserService'
import {
    HiOutlineMagnifyingGlass,
    HiOutlineUserPlus,
    HiOutlineEye,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineUser,
} from 'react-icons/hi2'
import type { UserInfoResponse, PaginatedResult, UserQueryFilter } from '@/@types/user'

const statusOptions = [
    { value: 0, label: 'All Statuses' },
    { value: 1, label: 'Pending Email Verification' },
    { value: 2, label: 'Pending Identity Verification' },
    { value: 3, label: 'Pending Approval' },
    { value: 4, label: 'Active' },
    { value: 5, label: 'Rejected' },
    { value: 6, label: 'Suspended' },
    { value: 7, label: 'Locked' },
]

const renderStatusBadge = (status: number) => {
    switch (status) {
        case 1:
            return <Badge className="bg-amber-500 text-white">Pending Email</Badge>
        case 2:
            return <Badge className="bg-blue-500 text-white">Pending ID</Badge>
        case 3:
            return <Badge className="bg-purple-500 text-white">Pending Review</Badge>
        case 4:
            return <Badge className="bg-emerald-500 text-white">Active</Badge>
        case 5:
            return <Badge className="bg-rose-500 text-white">Rejected</Badge>
        case 6:
            return <Badge className="bg-red-600 text-white">Suspended</Badge>
        case 7:
            return <Badge className="bg-gray-700 text-white">Locked</Badge>
        default:
            return <Badge className="bg-gray-400 text-white">Unknown</Badge>
    }
}

const UsersList = () => {
    const [users, setUsers] = useState<UserInfoResponse[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [errorMsg, setErrorMsg] = useState<string>('')
    const [successMsg, setSuccessMsg] = useState<string>('')

    // Query params
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [pageSize] = useState<number>(10)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [totalCount, setTotalCount] = useState<number>(0)
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<number>(0)

    // Delete/Toggle Dialog
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
    const [selectedUser, setSelectedUser] = useState<UserInfoResponse | null>(null)
    const [deleting, setDeleting] = useState<boolean>(false)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        setErrorMsg('')
        try {
            const params: UserQueryFilter = {
                pageNumber,
                pageSize,
            }
            if (searchTerm.trim()) {
                params.fullName = searchTerm.trim()
            }
            if (statusFilter > 0) {
                params.status = statusFilter
            }

            const res = await apiGetUsers(params)
            if (res?.data) {
                const paginated: PaginatedResult<UserInfoResponse> = res.data
                setUsers(paginated.items || [])
                setTotalPages(paginated.totalPages || 1)
                setTotalCount(paginated.totalCount || 0)
            } else {
                setUsers([])
            }
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
            setErrorMsg(errorObj?.response?.data?.message || errorObj.message || 'Failed to fetch users.')
            setUsers([])
        } finally {
            setLoading(false)
        }
    }, [pageNumber, pageSize, searchTerm, statusFilter])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setPageNumber(1)
    }

    const handleStatusChange = (option: { value: number; label: string } | null) => {
        setStatusFilter(option ? option.value : 0)
        setPageNumber(1)
    }

    const openDeleteDialog = (user: UserInfoResponse) => {
        setSelectedUser(user)
        setDeleteModalOpen(true)
    }

    const confirmDeleteToggle = async () => {
        if (!selectedUser) return
        setDeleting(true)
        setErrorMsg('')
        setSuccessMsg('')
        try {
            const res = await apiDeleteUser(selectedUser.id)
            if (res?.status) {
                setSuccessMsg(res.message || 'User status updated successfully.')
                setDeleteModalOpen(false)
                setSelectedUser(null)
                fetchUsers()
            } else {
                setErrorMsg(res?.message || 'Failed to toggle user status.')
            }
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
            setErrorMsg(errorObj?.response?.data?.message || errorObj.message || 'Operation failed.')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        View, search, filter, edit, and toggle active states of user accounts.
                    </p>
                </div>
                <Link to="/admin/users/create">
                    <Button variant="solid" icon={<HiOutlineUserPlus />}>
                        Create User
                    </Button>
                </Link>
            </div>

            {/* Notifications */}
            {successMsg && <Alert type="success" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
            {errorMsg && <Alert type="danger" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

            {/* Filters Bar */}
            <Card className="shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="w-full md:w-80">
                        <Input
                            placeholder="Search by full name or email..."
                            value={searchTerm}
                            prefix={<HiOutlineMagnifyingGlass className="text-lg text-gray-400" />}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            placeholder="Filter by Status"
                            options={statusOptions}
                            value={statusOptions.find((o) => o.value === statusFilter)}
                            onChange={handleStatusChange}
                        />
                    </div>
                </div>
            </Card>

            {/* Data Table Card */}
            <Card className="shadow-sm border border-gray-100">
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Spinner size="40px" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <HiOutlineUser className="mx-auto text-5xl text-gray-300 mb-2" />
                        <p className="font-semibold text-lg">No users found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search query or filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase bg-gray-50/75">
                                    <th className="py-3 px-4 font-semibold">User</th>
                                    <th className="py-3 px-4 font-semibold">Email</th>
                                    <th className="py-3 px-4 font-semibold">Phone</th>
                                    <th className="py-3 px-4 font-semibold">Roles</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    shape="circle"
                                                    src={user.imageUrl || undefined}
                                                    icon={<HiOutlineUser />}
                                                />
                                                <div>
                                                    <span className="font-semibold text-gray-800 text-sm block">
                                                        {user.firstName} {user.lastName}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-mono">ID: {user.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{user.email || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{user.phoneNumber || '-'}</td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-700">
                                            {(user.roles || []).join(', ') || 'User'}
                                        </td>
                                        <td className="py-3 px-4">{renderStatusBadge(user.status)}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/users/${user.id}`}>
                                                    <Button size="xs" variant="twoTone" icon={<HiOutlineEye />} title="View Details" />
                                                </Link>
                                                <Link to={`/admin/users/${user.id}/edit`}>
                                                    <Button size="xs" variant="default" icon={<HiOutlinePencilSquare />} title="Edit User" />
                                                </Link>
                                                <Button
                                                    size="xs"
                                                    variant="solid"
                                                    color="red-600"
                                                    icon={<HiOutlineTrash />}
                                                    title="Toggle Status / Delete"
                                                    onClick={() => openDeleteDialog(user)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && users.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                            Showing page <strong className="text-gray-800">{pageNumber}</strong> of <strong className="text-gray-800">{totalPages}</strong> ({totalCount} total users)
                        </span>
                        <Pagination
                            currentPage={pageNumber}
                            total={totalPages}
                            onChange={(page) => setPageNumber(page)}
                        />
                    </div>
                )}
            </Card>

            {/* Toggle Status Confirmation Dialog */}
            <Dialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onRequestClose={() => setDeleteModalOpen(false)}
            >
                <h4 className="text-lg font-bold text-gray-800 mb-2">Toggle User Status</h4>
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to toggle the active status of account{' '}
                    <strong className="text-gray-900">{selectedUser?.firstName} {selectedUser?.lastName}</strong> ({selectedUser?.email})?
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="solid" color="red-600" loading={deleting} onClick={confirmDeleteToggle}>
                        Confirm Toggle
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default UsersList
