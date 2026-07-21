import { useRouting } from '@/lib/hooks/routing/useRouting'
import {
    useGitHubAuthStore,
    useGitHubIntegrations,
    useGitHubInstallationStatus,
    useGitHubUninstall
} from '@/lib/stores/linked_platforms/github/github-auth.store'
import { useGitHubInstallationId } from '@/lib/stores/linked_platforms/github/github-integration.store'
import OAuthButton from '@/src/app/(auth)/user-auth/[platform]/platforms/OAuthButton'
import Button from '@/src/app/components/buttons/Buttons'
import { useTheme } from '@/src/context/ThemeContext'
import { toast } from '@/src/context/Toastify'
import React, { useEffect, useState, useCallback } from 'react'

// ============ Sub-components ============

const GitHubSkeleton = () => {
    return (
        <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30 animate-pulse">
            <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-[var(--foreground)]/30 rounded-lg" />
                <div className="h-5 w-20 bg-[var(--foreground)]/30 rounded" />
            </div>
            <div className="flex items-center gap-2">
                <div className="h-9 w-36 bg-[var(--foreground)]/30 rounded-lg" />
            </div>
        </div>
    )
}

const GitHubConnected = ({
    installationId,
    githubUsername,
    syncStatus,
    onDisconnect,
    isDisconnecting
}: {
    installationId: string;
    githubUsername: string;
    syncStatus: string;
    onDisconnect: () => void;
    isDisconnecting: boolean;
}) => {
    const { themeVariant } = useTheme()
    const { router } = useRouting()
    const { setActiveInstallationId } = useGitHubInstallationId()

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30">
                <div className="flex items-center gap-2">
                    <img
                        className='w-12 h-12 object-contain'
                        src={`/socials/github/github-mark/${themeVariant === "dark" ? "github-mark" : "github-mark-white"}.png`}
                        alt="GitHub"
                    />
                    <div>
                        <p className="text-base font-league-600 text-foreground">GitHub</p>
                        <p className="text-xs text-[var(--foreground)]/60 font-league-400">
                            Connected as <span className="font-league-600">{githubUsername}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        text='Import Projects'
                        size='sm'
                        variant='primary'
                        onClick={() => {
                            setActiveInstallationId(installationId)
                            router.push(`account/import/github`)
                        }}
                    />
                    <button
                        onClick={onDisconnect}
                        disabled={isDisconnecting}
                        className="text-xs text-red-500 hover:text-red-600 font-league-400 transition-colors disabled:opacity-50 px-2 py-1"
                    >
                        {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-1">
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'active'
                    ? 'bg-green-500 animate-pulse'
                    : syncStatus === 'error'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`} />
                <span className="text-xs text-[var(--foreground)]/60 font-league-400">
                    {syncStatus === 'active'
                        ? 'Connected & Syncing'
                        : syncStatus === 'error'
                            ? 'Connection Error'
                            : 'Connection Paused'}
                </span>
            </div>
        </div>
    )
}

const GitHubDisconnected = ({ onConnect, isLoading }: { onConnect: () => void; isLoading: boolean }) => {
    const { themeVariant } = useTheme()

    return (
        <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30">
            <div className="flex items-center gap-2">
                <img
                    className='w-12 h-12 object-contain opacity-80'
                    src={`/socials/github/github-mark/${themeVariant === "dark" ? "github-mark" : "github-mark-white"}.png`}
                    alt="GitHub"
                />
                <div>
                    <p className="text-base font-league-600 text-foreground">GitHub</p>
                    <p className="text-xs text-[var(--foreground)]/60 font-league-400">
                        Not connected
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {isLoading ? (
                    <div className="h-9 w-36 bg-[var(--foreground)]/20 rounded-lg animate-pulse" />
                ) : (
                    <Button
                        text='Connect GitHub'
                        size='sm'
                        variant='primary'
                        onClick={onConnect}
                    />
                )}
            </div>
        </div>
    )
}

const GitHubError = ({ error, onRetry, onConnect }: { error: string; onRetry: () => void; onConnect: () => void }) => {
    const { themeVariant } = useTheme()

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-3 border-b border-red-200">
                <div className="flex items-center gap-2">
                    <img
                        className='w-12 h-12 object-contain opacity-50'
                        src={`/socials/github/github-mark/${themeVariant === "dark" ? "github-mark" : "github-mark-white"}.png`}
                        alt="GitHub"
                    />
                    <div>
                        <p className="text-base font-league-600 text-foreground">GitHub</p>
                        <p className="text-xs text-red-500 font-league-400">
                            Connection error
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onRetry}
                        className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] font-league-400 transition-colors px-3 py-1 rounded-lg border border-[var(--foreground)]/20 hover:border-[var(--foreground)]/40"
                    >
                        Retry
                    </button>
                    <Button
                        text='Connect'
                        size='sm'
                        variant='outline'
                        onClick={onConnect}
                    />
                </div>
            </div>

            {/* Error Message */}
            <p className="text-xs text-red-400 font-league-400 px-1">
                {error}
            </p>
        </div>
    )
}

const GitHubMultipleInstallations = ({
    installations,
    activeInstallationId,
    onSelectInstallation,
    onDisconnect,
    isDisconnecting,
    onConnect
}: {
    installations: Array<{
        installation_id: string;
        github_username: string;
        sync_status: string;
        github_user_id: number;
    }>;
    activeInstallationId: string | null;
    onSelectInstallation: (id: string) => void;
    onDisconnect: (id: string) => void;
    isDisconnecting: boolean;
    onConnect: () => void;
}) => {
    const { themeVariant } = useTheme()
    const { router } = useRouting()

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30">
                <div className="flex items-center gap-2">
                    <img
                        className='w-12 h-12 object-contain'
                        src={`/socials/github/github-mark/${themeVariant === "dark" ? "github-mark" : "github-mark-white"}.png`}
                        alt="GitHub"
                    />
                    <div>
                        <p className="text-base font-league-600 text-foreground">GitHub</p>
                        <p className="text-xs text-[var(--foreground)]/60 font-league-400">
                            {installations.length} installation{installations.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <Button
                    text='Add Another'
                    size='sm'
                    variant='outline'
                    onClick={onConnect}
                />
            </div>

            {/* Installations List */}
            <div className="space-y-2">
                {installations.map((installation) => (
                    <div
                        key={installation.installation_id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${activeInstallationId === installation.installation_id
                            ? 'border-[var(--foreground)]/30 bg-[var(--foreground)]/5 shadow-sm'
                            : 'border-[var(--foreground)]/10 hover:border-[var(--foreground)]/20 hover:bg-[var(--foreground)]/[0.02]'
                            }`}
                        onClick={() => onSelectInstallation(installation.installation_id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${installation.sync_status === 'active'
                                ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]'
                                : installation.sync_status === 'error'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                                }`} />
                            <div>
                                <p className="text-sm font-league-600 text-foreground">
                                    {installation.github_username}
                                </p>
                                <p className="text-xs text-[var(--foreground)]/40 font-league-400">
                                    ID: {installation.installation_id.slice(0, 8)}... • {installation.sync_status}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                                text='Import'
                                variant='ghost'
                                onClick={() => {
                                    router.push(`account/import/github?installation_id=${installation.installation_id}`)
                                }}
                            />
                            <button
                                onClick={() => onDisconnect(installation.installation_id)}
                                disabled={isDisconnecting}
                                className="text-xs text-red-500 hover:text-red-600 font-league-400 transition-colors disabled:opacity-50 p-1.5 hover:bg-red-50 rounded-md"
                                title="Disconnect this installation"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============ Main Component ============

const GitHub = () => {
    const { setRedirectUrl, pathname } = useRouting()

    // Auth store hooks
    const { getAuthUrl } = useGitHubAuthStore()
    const {
        installationStatus,
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

    const [activeInstallationId, setActiveInstallationId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [initialFetchDone, setInitialFetchDone] = useState(false)

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
        if (integrations.length > 0) {
            // If no active installation set, use the first active one
            if (!activeInstallationId) {
                const activeIntegration = integrations.find(i => i.sync_status === 'active')
                if (activeIntegration) {
                    setActiveInstallationId(activeIntegration.installation_id)
                } else if (integrations[0]) {
                    // Fallback to first integration even if not active
                    setActiveInstallationId(integrations[0].installation_id)
                }
            }
            // Verify current active installation still exists in integrations
            else if (!integrations.find(i => i.installation_id === activeInstallationId)) {
                const activeIntegration = integrations.find(i => i.sync_status === 'active')
                setActiveInstallationId(activeIntegration?.installation_id || integrations[0]?.installation_id || null)
            }
        } else {
            setActiveInstallationId(null)
        }
    }, [integrations, activeInstallationId])

    // Handle connect
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
    }, [getAuthUrl])

    // Handle disconnect
    const handleDisconnect = useCallback(async (installationId?: string) => {
        const idToUninstall = installationId || activeInstallationId

        if (!idToUninstall) {
            toast.error('No installation selected')
            return
        }

        try {
            await uninstallApp(idToUninstall)
            toast.success('GitHub App disconnected successfully')

            // Clear active installation if it was the one disconnected
            if (idToUninstall === activeInstallationId) {
                setActiveInstallationId(null)
            }

            // Refresh status
            await fetchStatus()
        } catch (err: any) {
            toast.error(err.message || 'Failed to disconnect GitHub App')
        }
    }, [uninstallApp, activeInstallationId, fetchStatus])

    // Handle installation selection
    const handleSelectInstallation = useCallback((id: string) => {
        setActiveInstallationId(id)
    }, [])

    // Show loading state only on initial fetch
    if (!initialFetchDone && (isLoadingInstallationStatus || isLoadingIntegrations)) {
        return <GitHubSkeleton />
    }

    // Error state with no integrations loaded
    if (error && integrations.length === 0 && initialFetchDone) {
        return <GitHubError error={error} onRetry={fetchStatus} onConnect={handleConnect} />
    }

    // Multiple installations
    if (integrations.length > 1) {
        return (
            <GitHubMultipleInstallations
                installations={integrations.map(i => ({
                    installation_id: i.installation_id,
                    github_username: i.github_username,
                    sync_status: i.sync_status,
                    github_user_id: i.github_user_id,
                }))}
                activeInstallationId={activeInstallationId}
                onSelectInstallation={handleSelectInstallation}
                onDisconnect={handleDisconnect}
                isDisconnecting={isUninstalling}
                onConnect={handleConnect}
            />
        )
    }

    // Single active installation
    if (integrations.length === 1) {
        const integration = integrations[0]
        if (integration.sync_status === 'active' || integration.sync_status === 'error') {
            return (
                <GitHubConnected
                    installationId={integration.installation_id}
                    githubUsername={integration.github_username}
                    syncStatus={integration.sync_status}
                    onDisconnect={() => handleDisconnect()}
                    isDisconnecting={isUninstalling}
                />
            )
        }

        // Integration exists but not active - show disconnected with info
        return (
            <div className="space-y-2">
                <GitHubDisconnected onConnect={handleConnect} isLoading={false} />
                <p className="text-xs text-amber-500 font-league-400 px-1">
                    Previous connection found but inactive. Reconnect to restore.
                </p>
            </div>
        )
    }

    // Default: Fully disconnected
    return <GitHubDisconnected onConnect={handleConnect} isLoading={false} />
}

export default GitHub