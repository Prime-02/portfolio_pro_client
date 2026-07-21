import { useRouting } from '@/lib/hooks/routing/useRouting'
import { useUserAccountStore } from '@/lib/stores/user/useUserAccountStore'
import OAuthButton from '@/src/app/(auth)/user-auth/[platform]/platforms/OAuthButton'
import Button from '@/src/app/components/buttons/Buttons'
import { useTheme } from '@/src/context/ThemeContext'
import React from 'react'


const VercelSkeleton = () => {
    return (
        <div className='flex flex-col w-full space-y-3 animate-pulse'>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-[var(--foreground)]/30 rounded-lg" />
                    <div className="h-5 w-16 bg-[var(--foreground)]/30 rounded" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-9 w-44 bg-[var(--foreground)]/30 rounded-lg" />
                </div>
            </div>
            <div className="h-4 w-96 bg-[var(--foreground)]/30 rounded" />
        </div>
    )
}

const Vercel = ({ vercelData }: { vercelData: Record<string, any> }) => {
    const { themeVariant } = useTheme()
    const { router } = useRouting()
    const { isLoadingLinkedPlatforms } = useUserAccountStore()

    if (isLoadingLinkedPlatforms) {
        return <VercelSkeleton />
    }

    return (
        <div className='flex flex-col w-full space-y-3'>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30">
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
                                router.push("account/import/vercel")
                            }} /> : <OAuthButton
                            buttonText='Link Your Vercel Account'
                            provider="vercel"
                            redirect={true}
                        />
                    }
                </div>
            </div>
            {
                vercelData === undefined &&
                <p className='text-sm text-amber-400'>
                    <strong>Note: </strong>
                    Newly created projects will be automatically imported on Portfolio Pro
                </p>
            }
        </div>
    )
}

export default Vercel