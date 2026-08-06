import { useEffect, useState, useCallback, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Alert from '@/components/ui/Alert'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
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
    const [pageSize, setPageSize] = useState<number>(10)
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

    const columns: ColumnDef<UserInfoResponse>[] = useMemo(
        () => [
            {
                header: 'User',
                accessorKey: 'firstName',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar
                                shape="circle"
                                src={row.imageUrl || undefined}
                                icon={<HiOutlineUser />}
                            />
                            <div>
                                <span className="font-semibold text-gray-800 text-sm block">
                                    {row.firstName} {row.lastName}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">ID: {row.id}</span>
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Email',
                accessorKey: 'email',
                cell: (props) => props.row.original.email || '-',
            },
            {
                header: 'Phone',
                accessorKey: 'phoneNumber',
                cell: (props) => props.row.original.phoneNumber || '-',
            },
            {
                header: 'Roles',
                accessorKey: 'roles',
                cell: (props) => (props.row.original.roles || []).join(', ') || 'User',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => renderStatusBadge(props.row.original.status),
            },
            {
                header: '',
                id: 'action',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/users/${row.id}`}>
                                <Button size="xs" variant="twoTone" icon={<HiOutlineEye />} title="View Details" />
                            </Link>
                            <Link to={`/admin/users/${row.id}/edit`}>
                                <Button size="xs" variant="default" icon={<HiOutlinePencilSquare />} title="Edit User" />
                            </Link>
                            <Button
                                size="xs"
                                variant="solid"
                                color="red-600"
                                icon={<HiOutlineTrash />}
                                title="Toggle Status / Delete"
                                onClick={() => openDeleteDialog(row)}
                            />
                        </div>
                    )
                },
            },
        ],
        []
    )

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
                <DataTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    pagingData={{
                        total: totalCount,
                        pageIndex: pageNumber,
                        pageSize: pageSize,
                    }}
                    onPaginationChange={(page) => setPageNumber(page)}
                    onSelectChange={(size) => {
                        setPageSize(size)
                        setPageNumber(1)
                    }}
                />
            </Card>

            {/* Toggle Status Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteModalOpen}
                type="danger"
                title="Toggle User Status"
                confirmText="Confirm Toggle"
                confirmButtonProps={{ loading: deleting, color: 'red-600' }}
                onClose={() => setDeleteModalOpen(false)}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteToggle}
            >
                <p className="text-sm text-gray-600">
                    Are you sure you want to toggle the active status of account{' '}
                    <strong className="text-gray-900">{selectedUser?.firstName} {selectedUser?.lastName}</strong> ({selectedUser?.email})?
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default UsersList
