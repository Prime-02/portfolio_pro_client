import { useUIStore } from '@/lib/stores/ui/useUIStore'
import { useUserAccountStore } from '@/lib/stores/user/useUserAccountStore'
import { useUserSettings } from '@/lib/stores/user/useUserSettings'
import OAuthButton from '@/src/app/(auth)/user-auth/[platform]/platforms/OAuthButton'
import Button from '@/src/app/components/buttons/Buttons'
import Switch from '@/src/app/components/inputs/Switch'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'

const LinkedInSkeleton = () => {
    return (
        <div className="w-full space-y-3 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-[var(--foreground)]/30 rounded-lg" />
                    <div className="space-y-2">
                        <div className="h-5 w-24 bg-[var(--foreground)]/30 rounded" />
                        <div className="h-3 w-20 bg-[var(--foreground)]/30 rounded" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-16 bg-[var(--foreground)]/30 rounded hidden sm:block" />
                    <div className="h-9 w-24 bg-[var(--foreground)]/30 rounded-lg" />
                </div>
            </div>
        </div>
    )
}

const LinkedIn = ({ linkedinData }: { linkedinData: Record<string, any> }) => {
    const { toggleLinkedInActions, isLoadingLinkedPlatforms } = useUserAccountStore()
    const { userInfo, localUpdateUserInfo } = useUserSettings()
    const { setLoading, isLoading } = useUIStore()
    const [manage, setManage] = useState(false)


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

    const handleToggleAllowLinkedInPostActions = async (value: boolean) => {
        setLoading("toggling_post_action", true)
        try {
            const postActionsRes = await toggleLinkedInActions()
            localUpdateUserInfo({ allow_linkedin_post_actions: postActionsRes })
        } catch (error) {
            console.error('Failed to toggle LinkedIn post actions:', error)
            // Revert the switch on error
            localUpdateUserInfo({ allow_linkedin_post_actions: !value })
        } finally {
            setLoading("toggling_post_action", false)
        }
    }

    const handleManageClick = async () => {
        setManage(!manage)
    }

    if (isLoadingLinkedPlatforms) {
        return <LinkedInSkeleton />
    }

    return (
        <div className="w-full space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30">
                <div className="flex items-center gap-2">
                    <Image className='w-12 h-12 object-contain' src="/socials/linkedin/in-logo/LI-In-Bug.png" alt="LinkedIn" />
                    <div>
                        <p className="text-base font-league-600 text-foreground">LinkedIn</p>
                        <p className="text-xs text-gray-400 font-league-400">{tokenInfo.text}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {linkedinData?.sub && (
                        <span className="text-xs text-gray-500 hidden sm:block">ID: {linkedinData.sub}</span>
                    )}
                    {
                        tokenInfo.status === "disconnected" ? <OAuthButton
                            provider="linkedin"
                            redirect={true}
                        /> :
                            <Button
                                onClick={handleManageClick}
                                text={manage ? 'Close' : 'Manage'}
                                size='sm'
                                disabled={tokenInfo.status === 'disconnected'}
                            />
                    }
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
            {manage && (
                <div className="flex flex-wrap gap-2">
                    {tokenInfo.status !== 'active' ? (
                        <OAuthButton
                            provider="linkedin"
                            redirect={true}
                        />
                    ) : (
                        <div className='w-full flex items-center justify-between flex-wrap gap-3'>
                            <p className='text-sm font-bold'>
                                {`Automatically share new Portfolio Pro posts to your LinkedIn profile.`}
                            </p>
                            <Switch
                                isSwitched={(userInfo?.allow_linkedin_post_actions || false)}
                                onSwitch={handleToggleAllowLinkedInPostActions}
                                showDescriptionOn="hover"
                                direction="right"
                                disabled={isLoading("toggling_post_action")}
                                loading={isLoading("toggling_post_action")}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Additional settings when connected */}
            {manage && tokenInfo.status === 'active' && (
                <div className="pt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className={`w-2 h-2 rounded-full ${tokenInfo.color}`}></div>
                        <span>Auto-posting is {(userInfo?.allow_linkedin_post_actions || false) ? 'enabled' : 'disabled'}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LinkedIn