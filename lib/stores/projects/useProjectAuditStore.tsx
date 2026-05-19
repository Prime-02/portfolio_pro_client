import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/client/api";
import type {
    ProjectAudit,
    ProjectAuditCreate,
    AuditActionSummary,
    AuditCount,
    UserAuditStats,
    LoadingState,
    ErrorState,
} from "./types/project.types";

// ============================================================
// STATE & ACTIONS INTERFACE
// ============================================================

interface ProjectAuditState {
    // Data
    auditLogsByProject: Record<string, ProjectAudit[]>;
    auditTotalByProject: Record<string, number>;

    currentAuditLog: ProjectAudit | null;

    userAuditLogs: ProjectAudit[];
    totalUserAuditLogs: number;

    recentActivityByProject: Record<string, ProjectAudit[]>;

    auditCountByProject: Record<string, AuditCount>;
    auditSummaryByProject: Record<string, AuditActionSummary>;

    userAuditStats: UserAuditStats | null;

    // Loading & error
    loading: LoadingState;
    errors: ErrorState;

    // Actions
    fetchAuditLogById: (auditId: string) => Promise<void>;

    fetchProjectAuditLogs: (
        projectId: string,
        params?: { skip?: number; limit?: number; action?: string }
    ) => Promise<void>;

    fetchUserAuditLogs: (params?: {
        skip?: number;
        limit?: number;
        project_id?: string;
        action?: string;
    }) => Promise<void>;

    fetchRecentProjectActivity: (
        projectId: string,
        params?: { limit?: number }
    ) => Promise<void>;

    fetchAuditCount: (
        projectId: string,
        params?: { action?: string }
    ) => Promise<void>;

    fetchAuditSummary: (projectId: string) => Promise<void>;

    fetchUserAuditStats: () => Promise<void>;

    createAuditLog: (data: ProjectAuditCreate) => Promise<ProjectAudit | null>;

    logAction: (data: {
        project_id: string;
        action: string;
        details?: Record<string, unknown>;
    }) => Promise<ProjectAudit | null>;

    bulkCreateAuditLogs: (
        entries: Array<{
            project_id: string;
            action: string;
            details?: Record<string, unknown>;
        }>
    ) => Promise<ProjectAudit[] | null>;

    deleteAuditLog: (auditId: string) => Promise<boolean>;

    clearErrors: () => void;
}

// ============================================================
// STORE
// ============================================================

export const useProjectAuditStore = create<ProjectAuditState>()(
    devtools(
        (set) => ({
            // ── Initial state ──────────────────────────────────────
            auditLogsByProject: {},
            auditTotalByProject: {},
            currentAuditLog: null,
            userAuditLogs: [],
            totalUserAuditLogs: 0,
            recentActivityByProject: {},
            auditCountByProject: {},
            auditSummaryByProject: {},
            userAuditStats: null,
            loading: {},
            errors: {},

            // ── Helpers ────────────────────────────────────────────
            clearErrors: () => set({ errors: {} }),

            // ── GET /project-audit/{audit_id} ──────────────────────
            fetchAuditLogById: async (auditId) => {
                set((s) => ({
                    loading: { ...s.loading, fetchAuditLog: true },
                    errors: { ...s.errors, fetchAuditLog: null },
                }));
                try {
                    const { data } = await api.get<ProjectAudit>(`/project-audit/${auditId}`);
                    set({ currentAuditLog: data });
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to fetch audit log";
                    set((s) => ({ errors: { ...s.errors, fetchAuditLog: message } }));
                } finally {
                    set((s) => ({ loading: { ...s.loading, fetchAuditLog: false } }));
                }
            },

            // ── GET /project-audit/project/{project_id} ────────────
            fetchProjectAuditLogs: async (projectId, params = {}) => {
                set((s) => ({
                    loading: { ...s.loading, fetchProjectAuditLogs: true },
                    errors: { ...s.errors, fetchProjectAuditLogs: null },
                }));
                try {
                    const query = new URLSearchParams();
                    if (params.skip !== undefined) query.set("skip", String(params.skip));
                    if (params.limit !== undefined) query.set("limit", String(params.limit));
                    if (params.action) query.set("action", params.action);

                    const { data } = await api.get<ProjectAudit[]>(
                        `/project-audit/project/${projectId}?${query.toString()}`
                    );

                    set((s) => ({
                        auditLogsByProject: { ...s.auditLogsByProject, [projectId]: data },
                    }));
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to fetch project audit logs";
                    set((s) => ({ errors: { ...s.errors, fetchProjectAuditLogs: message } }));
                } finally {
                    set((s) => ({ loading: { ...s.loading, fetchProjectAuditLogs: false } }));
                }
            },

            // ── GET /project-audit/my-projects ────────────────────
            fetchUserAuditLogs: async (params = {}) => {
                set((s) => ({
                    loading: { ...s.loading, fetchUserAuditLogs: true },
                    errors: { ...s.errors, fetchUserAuditLogs: null },
                }));
                try {
                    const query = new URLSearchParams();
                    if (params.skip !== undefined) query.set("skip", String(params.skip));
                    if (params.limit !== undefined) query.set("limit", String(params.limit));
                    if (params.project_id) query.set("project_id", params.project_id);
                    if (params.action) query.set("action", params.action);

                    const { data } = await api.get<ProjectAudit[]>(
                        `/project-audit/my-projects?${query.toString()}`
                    );
                    set({ userAuditLogs: data, totalUserAuditLogs: data.length });
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to fetch user audit logs";
                    set((s) => ({ errors: { ...s.errors, fetchUserAuditLogs: message } }));
                } finally {
                    set((s) => ({ loading: { ...s.loading, fetchUserAuditLogs: false } }));
                }
            },

            // ── GET /project-audit/project/{project_id}/recent ─────
            fetchRecentProjectActivity: async (projectId, params = {}) => {
                set((s) => ({
                    loading: { ...s.loading, fetchRecentActivity: true },
                    errors: { ...s.errors, fetchRecentActivity: null },
                }));
                try {
                    const query = new URLSearchParams();
                    if (params.limit !== undefined) query.set("limit", String(params.limit));

                    const { data } = await api.get<ProjectAudit[]>(
                        `/project-audit/project/${projectId}/recent?${query.toString()}`
                    );

                    set((s) => ({
                        recentActivityByProject: {
                            ...s.recentActivityByProject,
                            [projectId]: data,
                        },
                    }));
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to fetch recent activity";
                    set((s) => ({ errors: { ...s.errors, fetchRecentActivity: message } }));
                } finally {
                    set((s) => ({ loading: { ...s.loading, fetchRecentActivity: false } }));
                }
            },

            // ── GET /project-audit/project/{project_id}/count ──────
            fetchAuditCount: async (projectId, params = {}) => {
                set((s) => ({
                    loading: { ...s.loading, fetchAuditCount: true },
                    errors: { ...s.errors, fetchAuditCount: null },
                }));
                try {
                    const query = new URLSearchParams();
                    if (params.action) query.set("action", params.action);

                    const { data } = await api.get<AuditCount>(
                        `/project-audit/project/${projectId}/count?${query.toString()}`
                    );

                    set((s) => ({
                        auditCountByProject: {
                            ...s.auditCountByProject,
                            [projectId]: data,
                        },
                    }));
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to fetch audit count";
                    set((s) => ({ errors: { ...s.errors, fetchAuditCount: message } }));
                } finally {
                    set((s) => ({ loading: { ...s.loading, fetchAuditCount: false } }));
                }
            },

            // ── GET /project-audit/project/{project_id}/summary ────
            fetchAuditSummary: async (projectId) => {
                set((s) => ({
                    loading: { ...s.loading, fetchAuditSummary: true },
                    errors: { ...s.errors, fetchAuditSummary: null },
                }));
                try {
                    const { data } = await api.get<AuditActionSummary>(
                        `/project-audit/project/${projectId}/summary`
                    );

                    set((s) => ({
                        auditSummaryByProject: {
                            ...s.auditSummaryByProject,
                            [projectId]: data,
                        },
                    }));
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to fetch audit summary";
                    set((s) => ({ errors: { ...s.errors, fetchAuditSummary: message } }));
                } finally {
                    set((s) => ({ loading: { ...s.loading, fetchAuditSummary: false } }));
                }
            },

            // ── GET /project-audit/my-projects/stats ───────────────
            fetchUserAuditStats: async () => {
                set((s) => ({
                    loading: { ...s.loading, fetchUserAuditStats: true },
                    errors: { ...s.errors, fetchUserAuditStats: null },
                }));
                try {
                    const { data } = await api.get<UserAuditStats>("/project-audit/my-projects/stats");
                    set({ userAuditStats: data });
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to fetch user audit stats";
                    set((s) => ({ errors: { ...s.errors, fetchUserAuditStats: message } }));
                } finally {
                    set((s) => ({ loading: { ...s.loading, fetchUserAuditStats: false } }));
                }
            },

            // ── POST /project-audit/ ───────────────────────────────
            createAuditLog: async (data) => {
                set((s) => ({
                    loading: { ...s.loading, createAuditLog: true },
                    errors: { ...s.errors, createAuditLog: null },
                }));
                try {
                    const { data: auditLog } = await api.post<ProjectAudit>("/project-audit/", data);
                    return auditLog;
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to create audit log";
                    set((s) => ({ errors: { ...s.errors, createAuditLog: message } }));
                    return null;
                } finally {
                    set((s) => ({ loading: { ...s.loading, createAuditLog: false } }));
                }
            },

            // ── POST /project-audit/log ────────────────────────────
            logAction: async (data) => {
                set((s) => ({
                    loading: { ...s.loading, createAuditLog: true },
                    errors: { ...s.errors, createAuditLog: null },
                }));
                try {
                    const { data: auditLog } = await api.post<ProjectAudit>("/project-audit/log", {
                        project_id: data.project_id,
                        action: data.action,
                        details: data.details,
                    });
                    return auditLog;
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to log action";
                    set((s) => ({ errors: { ...s.errors, createAuditLog: message } }));
                    return null;
                } finally {
                    set((s) => ({ loading: { ...s.loading, createAuditLog: false } }));
                }
            },

            // ── POST /project-audit/bulk ───────────────────────────
            bulkCreateAuditLogs: async (entries) => {
                set((s) => ({
                    loading: { ...s.loading, bulkCreateAuditLogs: true },
                    errors: { ...s.errors, bulkCreateAuditLogs: null },
                }));
                try {
                    const { data } = await api.post<ProjectAudit[]>("/project-audit/bulk", entries);
                    return data;
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to bulk create audit logs";
                    set((s) => ({ errors: { ...s.errors, bulkCreateAuditLogs: message } }));
                    return null;
                } finally {
                    set((s) => ({ loading: { ...s.loading, bulkCreateAuditLogs: false } }));
                }
            },

            // ── DELETE /project-audit/{audit_id} ───────────────────
            deleteAuditLog: async (auditId) => {
                set((s) => ({
                    loading: { ...s.loading, deleteAuditLog: true },
                    errors: { ...s.errors, deleteAuditLog: null },
                }));
                try {
                    await api.delete(`/project-audit/${auditId}`);

                    // Remove from all project audit log lists
                    set((s) => {
                        const updated: Record<string, ProjectAudit[]> = {};
                        for (const [projectId, logs] of Object.entries(s.auditLogsByProject)) {
                            updated[projectId] = logs.filter((l) => l.id !== auditId);
                        }
                        return {
                            auditLogsByProject: updated,
                            userAuditLogs: s.userAuditLogs.filter((l) => l.id !== auditId),
                            currentAuditLog:
                                s.currentAuditLog?.id === auditId ? null : s.currentAuditLog,
                        };
                    });

                    return true;
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to delete audit log";
                    set((s) => ({ errors: { ...s.errors, deleteAuditLog: message } }));
                    return false;
                } finally {
                    set((s) => ({ loading: { ...s.loading, deleteAuditLog: false } }));
                }
            },
        }),
        { name: "ProjectAuditStore" }
    )
);