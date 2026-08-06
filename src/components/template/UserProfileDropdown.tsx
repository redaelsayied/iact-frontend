import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import {
    HiOutlineUser,
    HiOutlineCog6Tooth,
    HiOutlineArrowRightOnRectangle,
    HiOutlineArrowLeftOnRectangle,
    HiChevronDown,
} from 'react-icons/hi2'
import { useAuth } from '@/auth'
import useTranslation from '@/utils/hooks/useTranslation'
import type { JSX } from 'react'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const _UserDropdown = () => {
    const { avatar, userName, firstName, lastName, email, roles, authority } =
        useSessionUser((state) => state.user)

    const { signOut } = useAuth()
    const { t, i18n } = useTranslation()
    const currentLang =
        typeof i18n === 'object' && i18n?.language ? i18n.language : 'ar'
    const isRtl = currentLang === 'ar'
    const LogoutIcon = isRtl
        ? HiOutlineArrowLeftOnRectangle
        : HiOutlineArrowRightOnRectangle

    const handleSignOut = () => {
        signOut()
    }

    const avatarProps = {
        ...(avatar ? { src: avatar } : { icon: <HiOutlineUser /> }),
    }

    const displayName =
        userName ||
        `${firstName || ''} ${lastName || ''}`.trim() ||
        t('common.anonymous', 'Anonymous')
    const displayEmail = email || t('common.noEmail', 'No email available')

    const userRole = roles?.[0] || authority?.[0] || ''
    const getRoleTitle = (role: string) => {
        if (!role)
            return currentLang === 'ar' ? 'مستخدم المنصة' : 'Platform User'
        const lower = role.toLowerCase()
        if (lower.includes('superadmin') || lower.includes('super_admin')) {
            return currentLang === 'ar' ? 'المسؤول الأعلى للمنصة' : 'Super Admin'
        }
        if (lower.includes('admin')) {
            return currentLang === 'ar' ? 'مسؤول النظام' : 'Administrator'
        }
        return role
    }
    const displayRole = getRoleTitle(userRole)

    const dropdownItemList: DropdownList[] = [
        {
            label: t('common.profile', 'الملف الشخصي'),
            path: '/user/profile',
            icon: <HiOutlineUser />,
        },
        {
            label: t('common.accountSettings', 'إعدادات الحساب'),
            path: '/user/settings',
            icon: <HiOutlineCog6Tooth />,
        },
    ]

    return (
        <Dropdown
            className="flex items-center"
            toggleClassName="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            renderTitle={
                <div className="flex items-center gap-2.5">
                    <Avatar size={36} shape="circle" {...avatarProps} />
                    <div className="hidden sm:flex flex-col text-start ltr:text-left rtl:text-right">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                                {displayName}
                            </span>
                            <HiChevronDown className="text-xs text-gray-500" />
                        </div>
                        <span className="text-xs font-semibold text-primary dark:text-primary-soft leading-tight">
                            {displayRole}
                        </span>
                    </div>
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2.5 px-4 text-start ltr:text-left rtl:text-right">
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-base">
                        {displayName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 dir-ltr">
                        {displayEmail}
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0 py-0"
                >
                    <Link
                        className="flex items-center gap-3 w-full py-2.5 px-4 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        to={item.path}
                    >
                        <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center text-lg shrink-0">
                            {item.icon}
                        </div>
                        <span className="font-bold text-sm">{item.label}</span>
                    </Link>
                </Dropdown.Item>
            ))}
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-3 py-2.5 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                onClick={handleSignOut}
            >
                <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center text-lg shrink-0">
                    <LogoutIcon />
                </div>
                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                    {t('common.signOut', 'تسجيل الخروج')}
                </span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
