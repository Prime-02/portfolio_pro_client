import { useRouting } from '@/lib/hooks/routing/useRouting'
import OAuthButton from '@/src/app/(auth)/user-auth/[platform]/platforms/OAuthButton'
import VercelButton from '@/src/app/(auth)/user-auth/[platform]/platforms/vercel/VercelButton'
import Button from '@/src/app/components/buttons/Buttons'
import { useTheme } from '@/src/context/ThemeContext'
import React from 'react'

const Vercel = ({ vercelData }: { vercelData: Record<string, any> }) => {
    const { themeVariant } = useTheme()
    const { router } = useRouting()
    return (
        <div className="flex items-center justify-between pb-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
                <img
                    onClick={() => {
                        console.log(JSON.stringify(vercelData))
                    }}
                    className='w-12 h-12 object-contain' src={`/socials/vercel/Vercel/icon/${themeVariant !== "dark" ? "dark/vercel-icon-dark" : "light/vercel-icon-light"}.png`} alt="Vercel" />
                <div>
                    <p className="text-base font-league-600 text-foreground">Vercel</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {
                    vercelData !== undefined ? <Button
                        text='Import Your Projects'
                        size='sm' onClick={() => {
                            router.push("import/vercel")
                        }} /> : <VercelButton />
                }
            </div>
        </div>
    )
}

export default Vercel
