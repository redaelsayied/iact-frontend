import { cloneElement } from 'react'
import LanguageSelector from '@/components/template/LanguageSelector'
import type { CommonProps } from '@/@types/common'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="flex h-full p-6 bg-white dark:bg-gray-800 justify-center items-center relative">
            <div className="absolute top-4 ltr:right-4 rtl:left-4 z-10">
                <LanguageSelector />
            </div>
            <div className="flex flex-col justify-center items-center flex-1">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Side
