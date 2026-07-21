import { useRouting } from '@/lib/hooks/routing/useRouting'
import {
    useGitHubAuthStore,
    useGitHubIntegrations,
    useGitHubInstallationStatus,
    useGitHubUninstall
} from '@/lib/stores/linked_platforms/github/github-auth.store'
import { useGitHubInstallationId } from '@/lib/stores/linked_platforms/github/github-integration.store'
import Button from '@/src/app/components/buttons/Buttons'
import { useTheme } from '@/src/context/ThemeContext'
import { toast } from '@/src/context/Toastify'
import React, { useEffect, useState, useCallback, useMemo } from 'react'

// ============ Types ============

interface GitHubInstallation {
    installation_id: string | null;
    github_username: string;
    github_user_id: number;
    sync_status: 'active' | 'revoked' | 'expired' | 'error';
    display_photo_url?: string;
    profile_url?: string;
    last_synced_at?: string;
    created_at?: string;
    token_scope?: string;
}

// ============ Sub-components ============

const GitHubSkeleton = () => {
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

const GitHubAccountCard = ({
    installation,
    isActive,
    onSelect,
    onDisconnect,
    isDisconnecting,
    onImport
}: {
    installation: GitHubInstallation;
    isActive: boolean;
    onSelect: () => void;
    onDisconnect: () => void;
    isDisconnecting: boolean;
    onImport: () => void;
}) => {
    const { themeVariant } = useTheme()

    const isOrgAccount = installation.profile_url &&
        !installation.profile_url.endsWith(`/${installation.github_username}`)

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
                {installation.display_photo_url ? (
                    <img
                        className='w-9 h-9 rounded-full object-cover flex-shrink-0'
                        src={installation.display_photo_url}
                        alt={installation.github_username}
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-league-600">
                            {(installation.github_username || '?')[0].toUpperCase()}
                        </span>
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-league-600 text-foreground truncate">
                            {installation.github_username || 'Unknown'}
                        </p>
                        {isOrgAccount && (
                            <span className="text-[10px] font-league-500 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                                Organization
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
                {installation.installation_id && (
                    <Button
                        text='Import'
                        variant={isActive ? 'primary' : 'ghost'}
                        onClick={onImport}
                    />
                )}
                <button
                    onClick={onDisconnect}
                    disabled={isDisconnecting}
                    className="p-1.5 text-[var(--foreground)]/30 hover:text-red-500 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                    title={`Disconnect ${installation.github_username}`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

const GitHubHeader = ({
    totalAccounts,
    onConnect,
    isLoading
}: {
    totalAccounts: number;
    onConnect: () => void;
    isLoading: boolean;
}) => {
    const { themeVariant } = useTheme()

    return (
        <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30">
            <div className="flex items-center gap-2">
                <img
                    className='w-10 h-10 object-contain'
                    src={`/socials/github/github-mark/${themeVariant === "dark" ? "github-mark" : "github-mark-white"}.png`}
                    alt="GitHub"
                />
                <div>
                    <p className="text-base font-league-600 text-foreground">GitHub</p>
                    <p className="text-xs text-[var(--foreground)]/60 font-league-400">
                        {totalAccounts > 0
                            ? `${totalAccounts} account${totalAccounts > 1 ? 's' : ''} connected`
                            : 'Not connected'}
                    </p>
                </div>
            </div>

            {totalAccounts > 0 && (
                <Button
                    text='Link Another Account'
                    size='sm'
                    variant='outline'
                    onClick={onConnect}
                    disabled={isLoading}
                />
            )}
        </div>
    )
}

const GitHubEmptyState = ({ onConnect, isLoading }: { onConnect: () => void; isLoading: boolean }) => {
    const { themeVariant } = useTheme()

    return (
        <div className="flex flex-col items-center gap-4 py-6">
            <img
                className='w-16 h-16 object-contain opacity-40'
                src={`/socials/github/github-mark/${themeVariant === "dark" ? "github-mark" : "github-mark-white"}.png`}
                alt="GitHub"
            />
            <div className="text-center space-y-1">
                <p className="text-sm font-league-600 text-foreground">
                    No GitHub accounts connected
                </p>
                <p className="text-xs text-[var(--foreground)]/60 font-league-400 max-w-xs">
                    Connect your GitHub account to import repositories and showcase your projects
                </p>
            </div>
            <Button
                text='Connect GitHub Account'
                size='sm'
                variant='primary'
                onClick={onConnect}
                disabled={isLoading}
            />
        </div>
    )
}

const GitHubError = ({
    error,
    onRetry,
    onConnect
}: {
    error: string;
    onRetry: () => void;
    onConnect: () => void;
}) => {
    const { themeVariant } = useTheme()

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-red-200">
                <div className="flex items-center gap-2">
                    <img
                        className='w-10 h-10 object-contain opacity-50'
                        src={`/socials/github/github-mark/${themeVariant === "dark" ? "github-mark" : "github-mark-white"}.png`}
                        alt="GitHub"
                    />
                    <div>
                        <p className="text-base font-league-600 text-foreground">GitHub</p>
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

const GitHub = () => {
    const { router, setRedirectUrl, pathname } = useRouting()
    const { setActiveInstallationId, activeInstallationId } = useGitHubInstallationId()

    // Auth store hooks
    const { getAuthUrl } = useGitHubAuthStore()
    const {
        getInstallationStatus,
        isLoadingInstallationStatus
    } = useGitHubInstallationStatus()
    const {
        integrations,
        getIntegrations,
        isLoadingIntegrations
    } = useGitHubIntegrations()
    const {
        uninstallApp,
        isUninstalling
    } = useGitHubUninstall()

    const [error, setError] = useState<string | null>(null)
    const [initialFetchDone, setInitialFetchDone] = useState(false)
    const [disconnectingId, setDisconnectingId] = useState<string | null>(null)

    // Filter and validate integrations
    const validIntegrations = useMemo(() => {
        return (integrations || [])
            .filter(i => {
                // Filter out revoked integrations AND integrations with null installation_id
                return i.sync_status !== 'revoked' && i.installation_id != null;
            })
            .map(i => ({
                ...i,
                installation_id: i.installation_id as string, // Type assertion after filtering
            }));
    }, [integrations]);

    // Fetch data on mount
    useEffect(() => {
        fetchStatus()
    }, [])

    const fetchStatus = useCallback(async () => {
        try {
            setError(null)
            await Promise.all([
                getInstallationStatus(),
                getIntegrations()
            ])
            setInitialFetchDone(true)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch GitHub connection status')
            toast.error('Failed to fetch GitHub connection status')
            setInitialFetchDone(true)
        }
    }, [getInstallationStatus, getIntegrations])

    // Set initial active installation
    useEffect(() => {
        if (validIntegrations.length > 0) {
            const currentExists = activeInstallationId &&
                validIntegrations.find(i => i.installation_id === activeInstallationId)

            if (!currentExists) {
                const activeOne = validIntegrations.find(i => i.sync_status === 'active')
                const newActiveId = activeOne?.installation_id || validIntegrations[0].installation_id
                setActiveInstallationId(newActiveId)
                if (newActiveId) {
                    setActiveInstallationId(newActiveId)
                }
            }
        } else {
            setActiveInstallationId(null)
        }
    }, [validIntegrations, activeInstallationId, setActiveInstallationId])

    // Handle connect new account
    const handleConnect = useCallback(async () => {
        try {
            setRedirectUrl(pathname)
            const url = await getAuthUrl()
            if (url) {
                window.location.href = url
            }
        } catch (err: any) {
            toast.error('Failed to initiate GitHub connection')
        }
    }, [getAuthUrl, setRedirectUrl, pathname])

    // Handle disconnect specific installation
    const handleDisconnect = useCallback(async (installationId: string) => {
        if (!installationId) {
            toast.error('Invalid installation')
            return
        }

        try {
            setDisconnectingId(installationId)
            const result = await uninstallApp(installationId)

            if (result.remaining_active_integrations > 0) {
                toast.success('GitHub account removed successfully')
            } else {
                toast.success('All GitHub accounts disconnected')
            }

            if (installationId === activeInstallationId) {
                setActiveInstallationId(null)
            }

            // Refresh status immediately
            await fetchStatus()
        } catch (err: any) {
            toast.error(err.message || 'Failed to disconnect GitHub account')
        } finally {
            setDisconnectingId(null)
        }
    }, [uninstallApp, activeInstallationId, fetchStatus])

    // Handle installation selection
    const handleSelectInstallation = useCallback((id: string) => {
        if (!id) return

        if (id !== activeInstallationId) {
            setActiveInstallationId(id)
            setActiveInstallationId(id)
            const selected = validIntegrations.find(i => i.installation_id === id)
            if (selected) {
                toast.success(`Switched to ${selected.github_username}`)
            }
        }
    }, [validIntegrations, activeInstallationId, setActiveInstallationId])

    // Handle import for specific installation
    const handleImport = useCallback((installationId: string) => {
        if (!installationId) {
            toast.error('Invalid installation')
            return
        }
        setActiveInstallationId(installationId)
        router.push(`account/import/github`)
    }, [setActiveInstallationId, router])

    // Show loading state
    if (!initialFetchDone && (isLoadingInstallationStatus || isLoadingIntegrations)) {
        return <GitHubSkeleton />
    }

    // Error state with no accounts
    if (error && validIntegrations.length === 0 && initialFetchDone) {
        return <GitHubError error={error} onRetry={fetchStatus} onConnect={handleConnect} />
    }

    return (
        <div className="space-y-4">
            {/* Header with account count */}
            <GitHubHeader
                totalAccounts={validIntegrations.length}
                onConnect={handleConnect}
                isLoading={false}
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
                            <GitHubAccountCard
                                key={installation.installation_id}
                                installation={installation}
                                isActive={activeInstallationId === installation.installation_id}
                                onSelect={() => handleSelectInstallation(installation.installation_id)}
                                onDisconnect={() => handleDisconnect(installation.installation_id)}
                                isDisconnecting={disconnectingId === installation.installation_id}
                                onImport={() => handleImport(installation.installation_id)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <GitHubEmptyState onConnect={handleConnect} isLoading={false} />
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
                                ? 'You can switch between accounts to import projects from different GitHub accounts.'
                                : 'Click "Import" to browse and import your GitHub repositories.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default GitHub