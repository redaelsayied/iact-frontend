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
import useTranslation from '@/utils/hooks/useTranslation'
import Tooltip from '@/components/ui/Tooltip'
import {
    HiOutlineMagnifyingGlass,
    HiOutlineUserPlus,
    HiOutlineEye,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineUser,
} from 'react-icons/hi2'
import type { UserInfoResponse, PaginatedResult, UserQueryFilter } from '@/@types/user'

const UsersList = () => {
    const { t } = useTranslation()

    const statusOptions = [
        { value: 0, label: t('userManagement.allStatuses', 'كل الحالات') },
        { value: 1, label: t('userManagement.pendingEmailVerification', 'في انتظار تأكيد البريد الإلكتروني') },
        { value: 2, label: t('userManagement.pendingIdentityVerification', 'في انتظار التحقق من الهوية') },
        { value: 3, label: t('userManagement.pendingApproval', 'في انتظار الموافقة') },
        { value: 4, label: t('userManagement.active', 'نشط') },
        { value: 5, label: t('userManagement.rejected', 'مرفوض') },
        { value: 6, label: t('userManagement.suspended', 'معلق') },
        { value: 7, label: t('userManagement.locked', 'مقفل') },
    ]

    const renderStatusBadge = useCallback(
        (status: number) => {
            switch (status) {
                case 1:
                    return <Badge className="bg-amber-500 text-white">{t('userManagement.pendingEmail', 'في انتظار تأكيد البريد')}</Badge>
                case 2:
                    return <Badge className="bg-blue-500 text-white">{t('userManagement.pendingID', 'في انتظار التحقق من الهوية')}</Badge>
                case 3:
                    return <Badge className="bg-purple-500 text-white">{t('userManagement.pendingReview', 'في انتظار المراجعة')}</Badge>
                case 4:
                    return <Badge className="bg-emerald-500 text-white">{t('userManagement.active', 'نشط')}</Badge>
                case 5:
                    return <Badge className="bg-rose-500 text-white">{t('userManagement.rejected', 'مرفوض')}</Badge>
                case 6:
                    return <Badge className="bg-red-600 text-white">{t('userManagement.suspended', 'معلق')}</Badge>
                case 7:
                    return <Badge className="bg-gray-700 text-white">{t('userManagement.locked', 'مقفل')}</Badge>
                default:
                    return <Badge className="bg-gray-400 text-white">{t('userManagement.unknown', 'غير معروف')}</Badge>
            }
        },
        [t]
    )

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
            setErrorMsg(errorObj?.response?.data?.message || errorObj.message || t('userManagement.failedFetchUsers', 'فشل جلب المستخدمين.'))
            setUsers([])
        } finally {
            setLoading(false)
        }
    }, [pageNumber, pageSize, searchTerm, statusFilter, t])

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
                setSuccessMsg(res.message || t('userManagement.statusUpdated', 'تم تحديث حالة المستخدم بنجاح.'))
                setDeleteModalOpen(false)
                setSelectedUser(null)
                fetchUsers()
            } else {
                setErrorMsg(res?.message || t('userManagement.failedToggleStatus', 'فشل تبديل حالة المستخدم.'))
            }
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
            setErrorMsg(errorObj?.response?.data?.message || errorObj.message || t('userManagement.operationFailed', 'فشلت العملية.'))
        } finally {
            setDeleting(false)
        }
    }

    const columns: ColumnDef<UserInfoResponse>[] = useMemo(
        () => [
            {
                header: t('userManagement.user', 'المستخدم'),
                accessorKey: 'firstName',
                size: 220,
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
                            </div>
                        </div>
                    )
                },
            },
            {
                header: t('userManagement.email', 'البريد الإلكتروني'),
                accessorKey: 'email',
                size: 260,
                cell: (props) => props.row.original.email || '-',
            },
            {
                header: t('userManagement.phone', 'الهاتف'),
                accessorKey: 'phoneNumber',
                size: 150,
                cell: (props) => props.row.original.phoneNumber || '-',
            },
            {
                header: t('userManagement.roles', 'الأدوار'),
                accessorKey: 'roles',
                size: 140,
                cell: (props) => (props.row.original.roles || []).join(', ') || t('userManagement.user', 'المستخدم'),
            },
            {
                header: t('userManagement.status', 'الحالة'),
                accessorKey: 'status',
                size: 150,
                cell: (props) => renderStatusBadge(props.row.original.status),
            },
            {
                header: t('userManagement.actions', 'إجراءات'),
                id: 'action',
                size: 150,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                            <Tooltip title={t('userManagement.viewDetails', 'عرض التفاصيل')}>
                                <Link
                                    to={`/admin/users/${row.id}`}
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/40 transition-all duration-200 hover:scale-110 focus:outline-none"
                                >
                                    <HiOutlineEye className="text-xl" />
                                </Link>
                            </Tooltip>
                            <Tooltip title={t('userManagement.editUser', 'تعديل البيانات')}>
                                <Link
                                    to={`/admin/users/${row.id}/edit`}
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/40 transition-all duration-200 hover:scale-110 focus:outline-none"
                                >
                                    <HiOutlinePencil className="text-xl" />
                                </Link>
                            </Tooltip>
                            <Tooltip title={t('userManagement.deleteUser', 'حذف المستخدم')}>
                                <button
                                    type="button"
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-all duration-200 hover:scale-110 focus:outline-none"
                                    onClick={() => openDeleteDialog(row)}
                                >
                                    <HiOutlineTrash className="text-xl" />
                                </button>
                            </Tooltip>
                        </div>
                    )
                },
            },
        ],
        [t, renderStatusBadge]
    )

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('userManagement.title', 'إدارة المستخدمين')}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {t('userManagement.description', 'عرض المستخدمين والبحث والتصفية والتعديل وتبديل الحالة النشطة لحسابات المستخدمين.')}
                    </p>
                </div>
                <Link to="/admin/users/create">
                    <Button variant="solid" icon={<HiOutlineUserPlus />}>
                        {t('userManagement.createUser', 'إنشاء مستخدم')}
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
                            placeholder={t('userManagement.searchPlaceholder', 'البحث بالاسم الكامل أو البريد الإلكتروني...')}
                            value={searchTerm}
                            prefix={<HiOutlineMagnifyingGlass className="text-lg text-gray-400" />}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            placeholder={t('userManagement.filterByStatus', 'تصفية حسب الحالة')}
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
                title={t('userManagement.toggleUserStatus', 'تبديل حالة المستخدم')}
                confirmText={t('userManagement.confirmToggle', 'تأكيد التبديل')}
                confirmButtonProps={{ loading: deleting, color: 'red-600' }}
                onClose={() => setDeleteModalOpen(false)}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteToggle}
            >
                <p className="text-sm text-gray-600">
                    {t('userManagement.toggleConfirmation', 'هل أنت متأكد من رغبتك في تبديل الحالة النشطة لحساب {name} ({email})؟', {
                        name: `${selectedUser?.firstName} ${selectedUser?.lastName}`,
                        email: selectedUser?.email,
                    })}
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default UsersList
