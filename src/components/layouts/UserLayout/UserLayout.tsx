import PostLoginLayout from '../PostLoginLayout'
import type { CommonProps } from '@/@types/common'
import type { LayoutType } from '@/@types/theme'

export interface UserLayoutProps extends CommonProps {
    layoutType: LayoutType
}

const UserLayout = ({ layoutType, children }: UserLayoutProps) => {
    return (
        <div className="user-app-container flex flex-auto flex-col h-full min-h-screen">
            <PostLoginLayout layoutType={layoutType}>{children}</PostLoginLayout>
        </div>
    )
}

export default UserLayout
