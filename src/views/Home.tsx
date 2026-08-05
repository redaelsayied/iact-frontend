import useTranslation from '@/utils/hooks/useTranslation'

const Home = () => {
    const { t } = useTranslation()

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-2">
                {t('home.title', 'Home')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
                {t('home.welcome', 'Welcome to Dashboard')}
            </p>
        </div>
    )
}

export default Home
