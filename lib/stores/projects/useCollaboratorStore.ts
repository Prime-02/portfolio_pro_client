import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/client/api";
import type {
  CollaboratorResponse,
  CollaboratorCreate,
  CollaboratorUpdate,
  CollaboratorResponseUpdate,
  PaginatedCollaborators,
  LoadingState,
  ErrorState,
} from "./types/project.types";

// ============================================================
// STATE & ACTIONS INTERFACE
// ============================================================

interface CollaboratorState {
  // Data — keyed by project_id so multiple projects can be cached
  collaboratorsByProject: Record<string, CollaboratorResponse[]>;
  totalByProject: Record<string, number>;

  // Loading & error
  loading: LoadingState;
  errors: ErrorState;

  // Actions
  fetchCollaborators: (
    projectId: string,
    params?: { skip?: number; limit?: number },
  ) => Promise<void>;

  addCollaborator: (
    projectId: string,
    data: CollaboratorCreate,
  ) => Promise<boolean>;

  updateCollaborator: (
    projectId: string,
    username: string,
    data: CollaboratorUpdate,
  ) => Promise<CollaboratorResponseUpdate | null>;

  removeCollaborator: (projectId: string, username: string) => Promise<boolean>;

  clearCollaborators: (projectId?: string) => void;
  clearErrors: () => void;
}

// ============================================================
// STORE
// ============================================================

export const useCollaboratorStore = create<CollaboratorState>()(
  devtools(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────
      collaboratorsByProject: {},
      totalByProject: {},
      loading: {},
      errors: {},

      // ── Helpers ────────────────────────────────────────────
      clearErrors: () => set({ errors: {} }),

      clearCollaborators: (projectId) => {
        if (projectId) {
          set((s) => {
            const next = { ...s.collaboratorsByProject };
            const totals = { ...s.totalByProject };
            delete next[projectId];
            delete totals[projectId];
            return { collaboratorsByProject: next, totalByProject: totals };
          });
        } else {
          set({ collaboratorsByProject: {}, totalByProject: {} });
        }
      },

      // ── GET /projects/{project_id}/collaborators ───────────
      fetchCollaborators: async (projectId, params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchCollaborators: true },
          errors: { ...s.errors, fetchCollaborators: null },
        }));
        try {
          const query = new URLSearchParams();
          if (params.skip !== undefined) query.set("skip", String(params.skip));
          if (params.limit !== undefined)
            query.set("limit", String(params.limit));

          const { data } = await api.get<PaginatedCollaborators>(
            `/projects/${projectId}/collaborators?${query.toString()}`,
          );
          set((s) => ({
            collaboratorsByProject: {
              ...s.collaboratorsByProject,
              [projectId]: data.collaborators,
            },
            totalByProject: {
              ...s.totalByProject,
              [projectId]: data.total,
            },
          }));
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch collaborators";
          set((s) => ({
            errors: { ...s.errors, fetchCollaborators: message },
          }));
        } finally {
          set((s) => ({
            loading: { ...s.loading, fetchCollaborators: false },
          }));
        }
      },

      // ── POST /projects/{project_id}/collaborators ──────────
      addCollaborator: async (projectId, data) => {
        set((s) => ({
          loading: { ...s.loading, addCollaborator: true },
          errors: { ...s.errors, addCollaborator: null },
        }));
        try {
          await api.post(`/projects/${projectId}/collaborators`, data);
          // Refresh collaborator list for this project
          await get().fetchCollaborators(projectId);
          return true;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to add collaborator";
          set((s) => ({ errors: { ...s.errors, addCollaborator: message } }));
          return false;
        } finally {
          set((s) => ({ loading: { ...s.loading, addCollaborator: false } }));
        }
      },

      // ── PUT /projects/{project_id}/collaborators/{username} ─
      updateCollaborator: async (projectId, username, data) => {
        set((s) => ({
          loading: { ...s.loading, updateCollaborator: true },
          errors: { ...s.errors, updateCollaborator: null },
        }));
        try {
          const { data: updatedCollaborator } =
            await api.put<CollaboratorResponseUpdate>(
              `/projects/${projectId}/collaborators/${username}`,
              data,
            );
          // Refresh to reflect updated permissions
          await get().fetchCollaborators(projectId);
          return updatedCollaborator;
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to update collaborator";
          set((s) => ({
            errors: { ...s.errors, updateCollaborator: message },
          }));
          return null;
        } finally {
          set((s) => ({
            loading: { ...s.loading, updateCollaborator: false },
          }));
        }
      },

      // ── DELETE /projects/{project_id}/collaborators/{username}
      removeCollaborator: async (projectId, username) => {
        set((s) => ({
          loading: { ...s.loading, removeCollaborator: true },
          errors: { ...s.errors, removeCollaborator: null },
        }));
        try {
          await api.delete(`/projects/${projectId}/collaborators/${username}`);
          // Optimistically remove from local state
          set((s) => ({
            collaboratorsByProject: {
              ...s.collaboratorsByProject,
              [projectId]: (s.collaboratorsByProject[projectId] ?? []).filter(
                (c) => c.username !== username,
              ),
            },
            totalByProject: {
              ...s.totalByProject,
              [projectId]: Math.max(0, (s.totalByProject[projectId] ?? 1) - 1),
            },
          }));
          return true;
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to remove collaborator";
          set((s) => ({
            errors: { ...s.errors, removeCollaborator: message },
          }));
          return false;
        } finally {
          set((s) => ({
            loading: { ...s.loading, removeCollaborator: false },
          }));
        }
      },
    }),
    { name: "CollaboratorStore" },
  ),
);
