import { useRouting } from '@/lib/hooks/routing/useRouting'
import { useUserAccountStore } from '@/lib/stores/user/useUserAccountStore'
import {
    useVercelIntegrationStore,
    useVercelActiveIntegration,
    VercelIntegrationInfo,
    VercelInstallation,
} from '@/lib/stores/linked_platforms/vercel/vercel-integration.store'
import Button from '@/src/app/components/buttons/Buttons'
import { useTheme } from '@/src/context/ThemeContext'
import { toast } from '@/src/context/Toastify'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import VercelButton from '@/src/app/(auth)/user-auth/[platform]/platforms/vercel/VercelButton'


// ============ Sub-components ============

const VercelSkeleton = () => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30 animate-pulse">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-[var(--foreground)]/30 rounded-lg" />
                    <div className="space-y-2">
                        <div className="h-5 w-20 bg-[var(--foreground)]/30 rounded" />
                        <div className="h-3 w-32 bg-[var(--foreground)]/20 rounded" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-9 w-36 bg-[var(--foreground)]/30 rounded-lg" />
                </div>
            </div>
        </div>
    )
}

const VercelAccountCard = ({
    installation,
    isActive,
    onSelect,
    onDisconnect,
    isDisconnecting,
    onSetPrimary,
    onImport
}: {
    installation: VercelInstallation;
    isActive: boolean;
    onSelect: () => void;
    onDisconnect: () => void;
    isDisconnecting: boolean;
    onSetPrimary: () => void;
    onImport: () => void;
}) => {
    const { themeVariant } = useTheme()

    return (
        <div
            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${isActive
                ? 'border-[var(--foreground)]/30 bg-[var(--foreground)]/5 shadow-sm ring-1 ring-[var(--foreground)]/10'
                : 'border-[var(--foreground)]/10 hover:border-[var(--foreground)]/20 hover:bg-[var(--foreground)]/[0.02]'
                }`}
            onClick={onSelect}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Avatar or Initial */}
                {installation.avatar_url ? (
                    <img
                        className='w-9 h-9 rounded-full object-cover flex-shrink-0'
                        src={installation.avatar_url}
                        alt={installation.display_name || installation.platform_username}
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-league-600">
                            {(installation.display_name || installation.platform_username || 'V')[0].toUpperCase()}
                        </span>
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-league-600 text-foreground truncate">
                            {installation.display_name || installation.platform_username || 'Unknown'}
                        </p>
                        {installation.is_primary && (
                            <span className="text-[10px] font-league-500 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex-shrink-0">
                                Primary
                            </span>
                        )}
                        {isActive && (
                            <span className="text-[10px] font-league-500 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                                Active
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${installation.sync_status === 'active'
                            ? 'bg-green-500'
                            : installation.sync_status === 'error'
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                            }`} />
                        <span className="text-xs text-[var(--foreground)]/40 font-league-400 capitalize truncate">
                            {installation.sync_status || 'unknown'}
                        </span>
                        {installation.platform_username && (
                            <>
                                <span className="text-[var(--foreground)]/20">•</span>
                                <span className="text-xs text-[var(--foreground)]/30 font-league-400 truncate">
                                    @{installation.platform_username}
                                </span>
                            </>
                        )}
                        {installation.last_synced_at && (
                            <>
                                <span className="text-[var(--foreground)]/20">•</span>
                                <span className="text-xs text-[var(--foreground)]/30 font-league-400 truncate">
                                    Synced {new Date(installation.last_synced_at).toLocaleDateString()}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1.5 ml-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {!installation.is_primary && (
                    <button
                        onClick={onSetPrimary}
                        className="px-2 py-1 text-xs rounded-md text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 transition-colors font-league-400"
                        title="Set as primary"
                    >
                        Set Primary
                    </button>
                )}
                <Button
                    text='Import'
                    variant={isActive ? 'primary' : 'ghost'}
                    onClick={onImport}
                    size='sm'
                />
                <Button
                    size='sm'
                    text={`Disconnect ${installation.display_name || installation.platform_username}`}
                    title={`Disconnect ${installation.display_name || installation.platform_username}`}
                    variant='danger'
                    onClick={onDisconnect}
                    disabled={isDisconnecting}
                />
            </div>
        </div>
    )
}

const VercelHeader = ({
    totalAccounts
}: {
    totalAccounts: number;
}) => {
    const { themeVariant } = useTheme()

    return (
        <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30">
            <div className="flex items-center gap-2">
                <img
                    className='w-10 h-10 object-contain'
                    src={`/socials/vercel/Vercel/icon/${themeVariant === "dark" ? "dark/vercel-icon-dark" : "light/vercel-icon-light"}.png`}
                    alt="Vercel"
                />
                <div>
                    <p className="text-base font-league-600 text-foreground">Vercel</p>
                    <p className="text-xs text-[var(--foreground)]/60 font-league-400">
                        {totalAccounts > 0
                            ? `${totalAccounts} account${totalAccounts > 1 ? 's' : ''} connected`
                            : 'Not connected'}
                    </p>
                </div>
            </div>

            {totalAccounts > 0 && (
                <div>
                    <VercelButton
                        text='Link Another Account'
                        icon={<></>}
                        variant='primary'
                    />
                </div>
            )}
        </div>
    )
}

const VercelEmptyState = () => {
    const { themeVariant } = useTheme()

    return (
        <div className="flex flex-col items-center gap-4 py-6">
            <img
                className='w-16 h-16 object-contain opacity-40'
                src={`/socials/vercel/Vercel/icon/${themeVariant === "dark" ? "dark/vercel-icon-dark" : "light/vercel-icon-light"}.png`}
                alt="Vercel"
            />
            <div className="text-center space-y-1">
                <p className="text-sm font-league-600 text-foreground">
                    No Vercel accounts connected
                </p>
                <p className="text-xs text-[var(--foreground)]/60 font-league-400 max-w-xs">
                    Connect your Vercel account to import projects and showcase your deployments
                </p>
            </div>
            <div>
                <VercelButton
                    text='Connect Vercel Account'
                    icon={<></>}
                    variant='primary'
                />
            </div>
        </div>
    )
}

const VercelError = ({
    error,
    onRetry,
}: {
    error: string;
    onRetry: () => void;
}) => {
    const { themeVariant } = useTheme()

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-red-200">
                <div className="flex items-center gap-2">
                    <img
                        className='w-10 h-10 object-contain opacity-50'
                        src={`/socials/vercel/Vercel/icon/${themeVariant === "dark" ? "dark/vercel-icon-dark" : "light/vercel-icon-light"}.png`}
                        alt="Vercel"
                    />
                    <div>
                        <p className="text-base font-league-600 text-foreground">Vercel</p>
                        <p className="text-xs text-red-500 font-league-400">
                            Failed to load accounts
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onRetry}
                        className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] font-league-400 transition-colors px-3 py-1.5 rounded-lg border border-[var(--foreground)]/20 hover:border-[var(--foreground)]/40"
                    >
                        Retry
                    </button>
                </div>
            </div>

            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                <p className="text-xs text-red-600 dark:text-red-400 font-league-400">
                    {error}
                </p>
            </div>
        </div>
    )
}

// ============ Main Component ============

const Vercel = () => {
    const { router, setRedirectUrl, pathname } = useRouting()
    const { isLoadingLinkedPlatforms } = useUserAccountStore()

    const {
        activeIntegrationId,
        setActiveIntegration,
        getActiveIntegrationId,
    } = useVercelActiveIntegration()

    const {
        integrations,
        isLoadingIntegrations,
        integrationsError,
        isSettingPrimary,
        isUnlinking,
        listVercelIntegrations,
        setPrimaryVercelIntegration,
        unlinkVercelIntegration,
    } = useVercelIntegrationStore()

    const [error, setError] = useState<string | null>(null)
    const [initialFetchDone, setInitialFetchDone] = useState(false)
    const [disconnectingId, setDisconnectingId] = useState<string | null>(null)

    // Filter and validate integrations
    const validIntegrations = useMemo(() => {
        return (integrations || [])
            .filter(i => {
                // Filter out revoked integrations and integrations with null id
                return i.sync_status !== 'revoked' && i.id != null;
            })
            .map(i => ({
                ...i,
                id: i.id as string, // Type assertion after filtering
            }));
    }, [integrations]);

    // Fetch data on mount
    useEffect(() => {
        fetchIntegrations()
    }, [])

    const fetchIntegrations = useCallback(async () => {
        try {
            setError(null)
            await listVercelIntegrations()
            setInitialFetchDone(true)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch Vercel connections')
            toast.error('Failed to fetch Vercel connections')
            setInitialFetchDone(true)
        }
    }, [listVercelIntegrations])

    // Set initial active integration
    useEffect(() => {
        if (validIntegrations.length > 0) {
            const currentExists = activeIntegrationId &&
                validIntegrations.find(i => i.id === activeIntegrationId)

            if (!currentExists) {
                const primaryOne = validIntegrations.find(i => i.is_primary)
                const activeOne = validIntegrations.find(i => i.sync_status === 'active')
                const newActiveId = primaryOne?.id || activeOne?.id || validIntegrations[0].id
                setActiveIntegration(newActiveId)
            }
        } else {
            setActiveIntegration(null)
        }
    }, [validIntegrations, activeIntegrationId, setActiveIntegration])


    // Handle disconnect specific integration
    const handleDisconnect = useCallback(async (integrationId: string) => {
        if (!integrationId) {
            toast.error('Invalid integration')
            return
        }

        try {
            setDisconnectingId(integrationId)
            const result = await unlinkVercelIntegration(integrationId)

            if (result.remaining_integrations > 0) {
                toast.success('Vercel account removed successfully')
            } else {
                toast.success('All Vercel accounts disconnected')
            }

            if (integrationId === activeIntegrationId) {
                setActiveIntegration(null)
            }

            // Refresh integrations immediately
            await fetchIntegrations()
        } catch (err: any) {
            toast.error(err.message || 'Failed to disconnect Vercel account')
        } finally {
            setDisconnectingId(null)
        }
    }, [unlinkVercelIntegration, activeIntegrationId, setActiveIntegration, fetchIntegrations])

    // Handle set primary integration
    const handleSetPrimary = useCallback(async (integrationId: string) => {
        if (!integrationId) {
            toast.error('Invalid integration')
            return
        }

        try {
            await setPrimaryVercelIntegration(integrationId)
            toast.success('Primary account updated')
            await fetchIntegrations()
        } catch (err: any) {
            toast.error(err.message || 'Failed to set primary account')
        }
    }, [setPrimaryVercelIntegration, fetchIntegrations])

    // Handle integration selection
    const handleSelectIntegration = useCallback((id: string) => {
        if (!id) return

        if (id !== activeIntegrationId) {
            setActiveIntegration(id)
            const selected = validIntegrations.find(i => i.id === id)
            if (selected) {
                toast.success(`Switched to ${selected.display_name || selected.platform_username}`)
            }
        }
    }, [validIntegrations, activeIntegrationId, setActiveIntegration])

    // Handle import for specific integration
    const handleImport = useCallback((integrationId: string) => {
        if (!integrationId) {
            toast.error('Invalid integration')
            return
        }
        setActiveIntegration(integrationId)
        router.push(`account/import/vercel`)
    }, [setActiveIntegration, router])

    // Show loading state
    if (!initialFetchDone && (isLoadingIntegrations || isLoadingLinkedPlatforms)) {
        return <VercelSkeleton />
    }

    // Error state with no accounts
    if ((error || integrationsError) && validIntegrations.length === 0 && initialFetchDone) {
        return <VercelError
            error={error || integrationsError || 'Unknown error'}
            onRetry={fetchIntegrations}
        />
    }

    return (
        <div className="space-y-4">
            {/* Header with account count */}
            <VercelHeader
                totalAccounts={validIntegrations.length}
            />

            {/* Connected Accounts List */}
            {validIntegrations.length > 0 ? (
                <div className="space-y-2">
                    {/* Section Label */}
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-league-500 text-[var(--foreground)]/40 uppercase tracking-wider">
                            Connected Accounts
                        </p>
                        {validIntegrations.length > 1 && (
                            <p className="text-xs text-[var(--foreground)]/30 font-league-400">
                                Click an account to select it
                            </p>
                        )}
                    </div>

                    {/* Account Cards */}
                    <div className="space-y-1.5">
                        {validIntegrations.map((installation) => (
                            <VercelAccountCard
                                key={installation.id}
                                installation={installation}
                                isActive={activeIntegrationId === installation.id}
                                onSelect={() => handleSelectIntegration(installation.id)}
                                onDisconnect={() => handleDisconnect(installation.id)}
                                isDisconnecting={disconnectingId === installation.id}
                                onSetPrimary={() => handleSetPrimary(installation.id)}
                                onImport={() => handleImport(installation.id)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <VercelEmptyState />
            )}

            {/* Info Footer */}
            {validIntegrations.length > 0 && (
                <div className="pt-3 border-t border-[var(--foreground)]/10">
                    <div className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-[var(--foreground)]/30 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-[var(--foreground)]/40 font-league-400">
                            {validIntegrations.length > 1
                                ? 'You can switch between accounts to import projects from different Vercel accounts.'
                                : 'Click "Import" to browse and import your Vercel projects.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Vercel