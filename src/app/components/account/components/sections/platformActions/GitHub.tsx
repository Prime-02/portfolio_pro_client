import { useRouting } from '@/lib/hooks/routing/useRouting'
import { useUserAccountStore } from '@/lib/stores/user/useUserAccountStore'
import OAuthButton from '@/src/app/(auth)/user-auth/[platform]/platforms/OAuthButton'
import Button from '@/src/app/components/buttons/Buttons'
import { useTheme } from '@/src/context/ThemeContext'
import React from 'react'

const GitHub = ({ gitHubData }: { gitHubData: Record<string, any> }) => {
    const { themeVariant } = useTheme()
    const { router } = useRouting()
    return (
        <div className="flex items-center justify-between pb-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
                <img
                    onClick={() => {
                        console.log(JSON.stringify(gitHubData))
                    }}
                    className='w-12 h-12 object-contain' src={`/socials/github/github-mark/${themeVariant === "dark" ? "github-mark" : "github-mark-white"}.png`} alt="GitHub" />
                <div>
                    <p className="text-base font-league-600 text-foreground">GitHub</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {
                    gitHubData !== undefined ? <Button
                        text='Import Your Projects'
                        size='sm' onClick={() => {
                            router.push("import/github")
                        }} /> : <OAuthButton
                        provider="github"
                        redirect={true}
                    />
                }
            </div>
        </div>
    )
}

export default GitHub
