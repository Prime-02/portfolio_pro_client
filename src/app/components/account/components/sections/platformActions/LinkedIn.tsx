import { useRouting } from '@/lib/hooks/routing/useRouting'
import { useUserAccountStore } from '@/lib/stores/user/useUserAccountStore'
import { useUserSettings } from '@/lib/stores/user/useUserSettings'
import OAuthButton from '@/src/app/(auth)/user-auth/[platform]/platforms/OAuthButton'
import Button from '@/src/app/components/buttons/Buttons'
import React, { useState } from 'react'

const LinkedIn = ({ linkedinData }: { linkedinData: Record<string, any> }) => {
    const { toggleLinkedInActions } = useUserAccountStore()
    const { userInfo } = useUserSettings()
    const { pathname, redirectUrl, setRedirectUrl } = useRouting()
    const [linkedInActionsAllowed, setLinkedActionsAllowed] = useState(false)

    const getTokenStatus = () => {
        if (!linkedinData?.access_token) return { status: 'disconnected', color: 'bg-red-500', text: 'Not Connected' }
        const expiryDate = new Date(linkedinData.access_token_expires_at)
        const now = new Date()
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24))

        if (daysUntilExpiry <= 0) return { status: 'expired', color: 'bg-red-500', text: 'Expired' }
        if (daysUntilExpiry <= 7) return { status: 'expiring soon', color: 'bg-yellow-500', text: 'Expiring Soon' }
        return { status: 'active', color: 'bg-green-500', text: 'Active' }
    }

    const tokenInfo = getTokenStatus()

    return (
        <div className="w-full space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <img className='w-8 h-8 object-cover' src="/socials/linkedin/in-logo/LI-In-Bug.png" />
                    <div>
                        <p className="text-base font-league-600 text-foreground">LinkedIn</p>
                        <p className="text-xs text-gray-400 font-league-400">{tokenInfo.text}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {linkedinData?.sub && (
                        <span className="text-xs text-gray-500 hidden sm:block">ID: {linkedinData.sub}</span>
                    )}
                    <Button
                        onClick={() => {
                            setLinkedActionsAllowed(!linkedInActionsAllowed)
                            toggleLinkedInActions()
                        }}
                        text={linkedInActionsAllowed ? 'Lock' : 'Manage'}
                        size='sm'
                    />
                </div>
            </div>

            {/* Status Alerts */}
            {tokenInfo.status !== 'active' && tokenInfo.status !== 'disconnected' && (
                <div className={`p-2.5 rounded-lg text-xs font-league-500 ${tokenInfo.status === 'expired'
                    ? 'border border-red-500/30 bg-red-500/10 text-red-400'
                    : 'border border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                    }`}>
                    {tokenInfo.status === 'expired'
                        ? '❌ Your LinkedIn access token has expired. Please reconnect to restore access.'
                        : '⚠️ Your LinkedIn access token is expiring soon. Please refresh your token.'}
                </div>
            )}

            {/* Actions */}
            {linkedInActionsAllowed && (
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => {
                            setRedirectUrl(pathname)
                        }}
                        text='Set redirect'
                        size='sm'
                    />
                    <p><strong>Redirect: </strong> {redirectUrl}</p>
                    <p><strong>Pathname: </strong> {pathname}</p>
                    <OAuthButton
                        provider="linkedin"
                        redirect={true}
                    />
                </div>
            )}
        </div>
    )
}

export default LinkedIn