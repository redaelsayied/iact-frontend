import PostLoginLayout from '../PostLoginLayout'
import type { CommonProps } from '@/@types/common'
import type { LayoutType } from '@/@types/theme'

export interface AdminLayoutProps extends CommonProps {
    layoutType: LayoutType
}

const AdminLayout = ({ layoutType, children }: AdminLayoutProps) => {
    return (
        <div className="admin-app-container flex flex-auto flex-col h-full min-h-screen">
            <PostLoginLayout layoutType={layoutType}>{children}</PostLoginLayout>
        </div>
    )
}

export default AdminLayout
