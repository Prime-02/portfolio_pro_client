"use client";

import { useState, useCallback, useEffect } from "react";
import { useSessionsStore } from "@/lib/stores/user/useSessionsStore";
import Button from "../buttons/Buttons";
import { toast } from "../toastify/Toastify";
import { MonitorSmartphone, RefreshCcw } from "lucide-react";
import { tokenStore } from "@/lib/client/api";
import { useAuthStore } from "@/lib/stores/user/useAuthStore";
import { useRouter } from "next/navigation";
import { PageHeader } from "../ui/PageHeader";

function Card({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-xl border border-(--foreground)/10 bg-(--background) p-6 ${className}`}
        >
            {children}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="font-league-600 text-xl tracking-tight text-(--foreground)">
            {children}
        </h2>
    );
}

function SectionDesc({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-1 text-sm text-(--foreground)/60">{children}</p>
    );
}

function Badge({
    children,
    variant = "default",
}: {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger";
}) {
    const variants = {
        default: "bg-(--foreground)/10 text-(--foreground)/70",
        success: "bg-(--accent)/15 text-(--accent)",
        warning: "bg-amber-500/15 text-amber-500",
        danger: "bg-red-500/15 text-red-500",
    };
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
        >
            {children}
        </span>
    );
}

function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-(--foreground)/5">
                <svg
                    className="h-5 w-5 text-(--foreground)/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                </svg>
            </div>
            <h3 className="font-league-600 text-sm text-(--foreground)">{title}</h3>
            <p className="mt-1 text-xs text-(--foreground)/50">{description}</p>
        </div>
    );
}

function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    confirmVariant = "danger",
    loading = false,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText: string;
    confirmVariant?: "primary" | "danger";
    loading?: boolean;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-(--background)/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-(--foreground)/10 bg-(--background) p-6 shadow-xl">
                <h3 className="font-league-600 text-lg text-(--foreground)">
                    {title}
                </h3>
                <p className="mt-2 text-sm text-(--foreground)/70">{description}</p>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={loading} text="Cancel" />
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        loading={loading}
                        disabled={loading}
                        text={confirmText}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getBrowserInfo(userAgent: string): { name: string; icon: string } {
    const ua = userAgent.toLowerCase();
    if (ua.includes("chrome") && !ua.includes("edg"))
        return { name: "Chrome", icon: "C" };
    if (ua.includes("safari") && !ua.includes("chrome"))
        return { name: "Safari", icon: "S" };
    if (ua.includes("firefox")) return { name: "Firefox", icon: "F" };
    if (ua.includes("edg")) return { name: "Edge", icon: "E" };
    if (ua.includes("opera") || ua.includes("opr"))
        return { name: "Opera", icon: "O" };
    return { name: "Browser", icon: "B" };
}

function getDeviceInfo(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile")) return "Mobile";
    if (ua.includes("tablet")) return "Tablet";
    return "Desktop";
}

// ── Page Component ─────────────────────────────────────────────────────

export default function SessionsPage() {

    // ── Stores ───────────────────────────────────────────────────────────
    const {
        sessionList,
        sessionTotal,
        activeSession,
        isLoading,
        error,
        fetchSessionList,
        revokeSession,
        revokeAllSessions,
        revokeSpecificSession,
        clearError,
    } = useSessionsStore();

    const { logout } = useAuthStore();

    const router = useRouter()

    // ── Local State ──────────────────────────────────────────────────────
    const [revokeAllModalOpen, setRevokeAllModalOpen] = useState(false);
    const [revokeOneModalOpen, setRevokeOneModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
        null,
    );

    // ── Effects ──────────────────────────────────────────────────────────
    useEffect(() => {
        fetchSessionList(true);
    }, [fetchSessionList]);

    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    // ── Toast for errors ─────────────────────────────────────────────────
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // ── Handlers ───────────────────────────────────────────────────────
    const handleRevokeAll = useCallback(async () => {
        try {
            const result = await revokeAllSessions();
            await logout(false);
            setRevokeAllModalOpen(false);
            toast.success(
                `All sessions revoked (${result.count} session${result.count !== 1 ? "s" : ""})`,
            );
            router.push("/")
        } catch {
            // Error handled by store + toast
        }
    }, [revokeAllSessions]);

    const handleRevokeOne = useCallback(async () => {
        if (!selectedSessionId) return;
        try {
            await revokeSpecificSession(selectedSessionId);
            setRevokeOneModalOpen(false);
            setSelectedSessionId(null);
            toast.success("Session revoked successfully");
        } catch {
            // Error handled by store + toast
        }
    }, [revokeSpecificSession, selectedSessionId]);

    const handleRevokeCurrent = useCallback(async () => {
        try {
            await revokeSession();
            await logout(false);
            toast.success("Current session revoked. Redirecting...");
            setTimeout(() => {
                router.push("/")
            }, 2000);
        } catch {
            // Error handled by store + toast
        }
    }, [revokeSession]);

    const openRevokeOne = useCallback((sessionId: string) => {
        setSelectedSessionId(sessionId);
        setRevokeOneModalOpen(true);
    }, []);

    // ── Derived ────────────────────────────────────────────────────────
    const currentSessionId = tokenStore.getSessionId()

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            {/* Header */}
            <PageHeader
                icon={<MonitorSmartphone />}
                title="Session Management"
                description="Manage your active sessions across all devices"
                action={
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => fetchSessionList(true)}
                            loading={isLoading}
                            disabled={isLoading}
                            text="Refresh"
                            icon={<RefreshCcw />}
                        />

                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setRevokeAllModalOpen(true)}
                            disabled={sessionList.length === 0 || isLoading}
                            text="Revoke All"
                        />
                    </div>
                }
            />

            {/* Active Session Summary */}
            {activeSession && (
                <Card className="mb-6 border-(--accent)/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <SectionTitle>Current Session</SectionTitle>
                                <Badge variant="success">Active</Badge>
                            </div>
                            <SectionDesc>
                                This is the session you are currently using.
                            </SectionDesc>
                        </div>
                        <Button variant="danger" onClick={handleRevokeCurrent} text="Sign Out" />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-(--foreground)/5 p-3">
                            <p className="text-xs text-(--foreground)/50">IP Address</p>
                            <p className="mt-0.5 text-sm font-medium text-(--foreground)">
                                {activeSession.ip_address || "Unknown"}
                            </p>
                        </div>
                        <div className="rounded-lg bg-(--foreground)/5 p-3">
                            <p className="text-xs text-(--foreground)/50">Browser</p>
                            <p className="mt-0.5 text-sm font-medium text-(--foreground)">
                                {getBrowserInfo(activeSession.user_agent).name}
                            </p>
                        </div>
                        <div className="rounded-lg bg-(--foreground)/5 p-3">
                            <p className="text-xs text-(--foreground)/50">Device</p>
                            <p className="mt-0.5 text-sm font-medium text-(--foreground)">
                                {getDeviceInfo(activeSession.user_agent)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--foreground)/40">
                        <span>Created: {formatDate(activeSession.created_at)}</span>
                        <span>Last active: {formatDate(activeSession.last_accessed_at)}</span>
                        <span>
                            Expires: {formatDate(activeSession.expires_at)}
                        </span>
                    </div>
                </Card>
            )}

            {/* All Sessions List */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <SectionTitle>All Active Sessions</SectionTitle>
                        <SectionDesc>
                            {sessionTotal} active session{sessionTotal !== 1 ? "s" : ""} found
                        </SectionDesc>
                    </div>
                </div>

                {isLoading && sessionList.length === 0 ? (
                    <div className="mt-6 space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-lg border border-(--foreground)/5 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-(--foreground)/10" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-32 rounded bg-(--foreground)/10" />
                                        <div className="h-2 w-48 rounded bg-(--foreground)/5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sessionList.length === 0 ? (
                    <EmptyState
                        title="No active sessions"
                        description="There are no active sessions to display."
                    />
                ) : (
                    <div className="mt-5 space-y-3">
                        {sessionList.map((session) => {
                            const isCurrent = session.id === currentSessionId;
                            const browser = getBrowserInfo(session.user_agent);
                            const device = getDeviceInfo(session.user_agent);

                            return (
                                <div
                                    key={session.id}
                                    className={`group flex items-center justify-between rounded-lg border p-4 transition-colors ${isCurrent
                                        ? "border-(--accent)/20 bg-(--accent)/5"
                                        : "border-(--foreground)/5 hover:border-(--foreground)/10"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Browser Icon */}
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-league-700 text-sm ${isCurrent
                                                ? "bg-(--accent)/15 text-(--accent)"
                                                : "bg-(--foreground)/5 text-(--foreground)/40"
                                                }`}
                                        >
                                            {browser.icon}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-(--foreground)">
                                                    {browser.name} on {device}
                                                </span>
                                                {isCurrent && (
                                                    <Badge variant="success">Current</Badge>
                                                )}
                                            </div>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-(--foreground)/40">
                                                <span>{session.ip_address || "Unknown IP"}</span>
                                                <span className="hidden h-1 w-1 rounded-full bg-(--foreground)/20 sm:inline" />
                                                <span>Last active {formatDate(session.last_accessed_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {!isCurrent && (
                                            <Button
                                                variant="ghost"
                                                onClick={() => openRevokeOne(session.id)}
                                                className="opacity-0 group-hover:opacity-100"
                                                text="Revoke"
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Info Card */}
            <div className="mt-6 rounded-lg bg-(--foreground)/5 px-4 py-3 text-sm text-(--foreground)/70">
                <div className="flex items-start gap-3">
                    <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-(--foreground)/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        />
                    </svg>
                    <div>
                        <p className="font-medium text-(--foreground)/80">
                            Session Security
                        </p>
                        <p className="mt-0.5">
                            Revoking a session will immediately log out that device. If you
                            suspect unauthorized access, revoke all sessions and change your
                            password.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                open={revokeAllModalOpen}
                onClose={() => setRevokeAllModalOpen(false)}
                onConfirm={handleRevokeAll}
                title="Revoke All Sessions"
                description="This will sign you out from all devices, including this one. You will need to sign in again."
                confirmText="Revoke All"
                confirmVariant="danger"
                loading={isLoading}
            />

            <ConfirmModal
                open={revokeOneModalOpen}
                onClose={() => {
                    setRevokeOneModalOpen(false);
                    setSelectedSessionId(null);
                }}
                onConfirm={handleRevokeOne}
                title="Revoke Session"
                description="This will immediately sign out that device."
                confirmText="Revoke"
                confirmVariant="danger"
                loading={isLoading}
            />
        </div>
    );
}