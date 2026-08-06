import Logo from '@/components/template/Logo'
import { useThemeStore } from '@/store/themeStore'
import useAppNavigation from '@/utils/hooks/useAppNavigation'
import { Link } from 'react-router-dom'
import type { Mode } from '@/@types/theme'

const HeaderLogo = ({ mode }: { mode?: Mode }) => {
    const defaultMode = useThemeStore((state) => state.mode)
    const { homePath } = useAppNavigation()

    return (
        <Link to={homePath}>
            <Logo
                imgClass="max-h-10"
                mode={mode || defaultMode}
                className="hidden lg:block"
            />
        </Link>
    )
}

export default HeaderLogo
