import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api } from "@/lib/client/api";
import type {
  PortfolioProjectBase,
  PortfolioProjectResponse,
  PortfolioProjectCreate,
  PortfolioProjectUpdate,
  PaginatedProjects,
  PaginatedProjectBase,
  ProjectStats,
  LoadingState,
  ErrorState,
  SortField,
  SortDirection,
  PublicProjectsByUsernameFilters,
} from "./types/project.types";

const PAGE_SIZE = 20;

// ============================================================
// HELPERS
// ============================================================

/** Build a FormData payload for project create (multipart) */
function buildCreateFormData(data: PortfolioProjectCreate): FormData {
  const form = new FormData();

  const appendIfDefined = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    if (typeof value === "boolean" || typeof value === "number") {
      form.append(key, String(value));
    } else if (typeof value === "string") {
      form.append(key, value);
    } else if (Array.isArray(value)) {
      form.append(key, JSON.stringify(value));
    } else if (value instanceof File) {
      form.append(key, value);
    } else {
      form.append(key, JSON.stringify(value));
    }
  };

  appendIfDefined("project_name", data.project_name);
  appendIfDefined("project_description", data.project_description);
  appendIfDefined("project_platform", data.project_platform);
  appendIfDefined("project_category", data.project_category);
  appendIfDefined("contribution_description", data.contribution_description);
  appendIfDefined("contribution", data.contribution);
  appendIfDefined("project_url", data.project_url);
  appendIfDefined("is_concept", data.is_concept);
  appendIfDefined("is_completed", data.is_completed);
  appendIfDefined("is_public", data.is_public);
  appendIfDefined("stack", data.stack);
  appendIfDefined("tags", data.tags);
  appendIfDefined("start_date", data.start_date);
  appendIfDefined("end_date", data.end_date);
  appendIfDefined("budget", data.budget);
  appendIfDefined("client_name", data.client_name);
  appendIfDefined("status", data.status);
  appendIfDefined("featured_in", data.featured_in);
  appendIfDefined("other_project_url", data.other_project_url);

  if (data.project_media?.length) {
    data.project_media.forEach((file) => form.append("project_media", file));
  }

  return form;
}

/** Build a FormData payload for project update (multipart) */
function buildUpdateFormData(data: PortfolioProjectUpdate): FormData {
  const form = new FormData();

  const appendIfDefined = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    if (typeof value === "boolean" || typeof value === "number") {
      form.append(key, String(value));
    } else if (typeof value === "string") {
      form.append(key, value);
    } else if (Array.isArray(value)) {
      form.append(key, JSON.stringify(value));
    } else if (value instanceof File) {
      form.append(key, value);
    } else {
      form.append(key, JSON.stringify(value));
    }
  };

  appendIfDefined("project_name", data.project_name);
  appendIfDefined("project_description", data.project_description);
  appendIfDefined("project_category", data.project_category);
  appendIfDefined("project_url", data.project_url);
  appendIfDefined("project_image_url", data.project_image_url);
  appendIfDefined("is_public", data.is_public);
  appendIfDefined("is_completed", data.is_completed);
  appendIfDefined("is_concept", data.is_concept);
  appendIfDefined("stack", data.stack);
  appendIfDefined("tags", data.tags);
  appendIfDefined("start_date", data.start_date);
  appendIfDefined("end_date", data.end_date);
  appendIfDefined("budget", data.budget);
  appendIfDefined("client_name", data.client_name);
  appendIfDefined("status", data.status);
  appendIfDefined("featured_in", data.featured_in);
  appendIfDefined("other_project_url", data.other_project_url);

  // Media slots
  if (data.hero_media) form.append("hero_media", data.hero_media);
  if (data.media_1) form.append("media_1", data.media_1);
  if (data.media_2) form.append("media_2", data.media_2);
  if (data.media_3) form.append("media_3", data.media_3);

  return form;
}

/** Append incoming items, skipping duplicates by id */
function dedupeAppend(
  existing: PortfolioProjectResponse[],
  incoming: PortfolioProjectResponse[],
): PortfolioProjectResponse[] {
  const existingIds = new Set(existing.map((p) => p.id));
  return [...existing, ...incoming.filter((p) => !existingIds.has(p.id))];
}

// ============================================================
// STATE & ACTIONS INTERFACE
// ============================================================

interface ProjectState {
  // Authenticated list
  projects: PortfolioProjectResponse[];
  totalProjects: number;
  projectsPage: number;
  projectsHasMore: boolean;

  // Public / filtered list
  filteredProjects: PortfolioProjectResponse[];
  totalFilteredProjects: number;
  filteredPage: number;
  filteredHasMore: boolean;

  currentProject: PortfolioProjectResponse | null;

  recentProjects: PortfolioProjectBase[];
  totalRecentProjects: number;

  projectStats: ProjectStats | null;

  loading: LoadingState;
  errors: ErrorState;

  // Actions
  fetchMyProjects: (params?: {
    include_public?: boolean;
    query?: string;
    page?: number;
    size?: number;
    sort?: SortField;
    sort_direction?: SortDirection;
    filter_platform?: string;
  }) => Promise<void>;

  fetchProject: (projectId: string) => Promise<PortfolioProjectResponse>;

  fetchProjectsByUser: (
    username: string,
    params?: PublicProjectsByUsernameFilters,
  ) => Promise<void>;

  fetchRecentProjects: (params?: {
    days?: number;
    page?: number;
    size?: number;
  }) => Promise<void>;

  fetchProjectsByStatus: (params?: {
    is_completed?: boolean;
    is_concept?: boolean;
    page?: number;
    size?: number;
  }) => Promise<void>;

  fetchProjectStats: (userId?: string) => Promise<void>;

  createProject: (
    data: PortfolioProjectCreate,
  ) => Promise<PortfolioProjectBase | null>;

  updateProject: (
    projectId: string,
    data: PortfolioProjectUpdate,
  ) => Promise<PortfolioProjectResponse | null>;

  deleteProjectMedia: (
    projectId: string,
    slot: "hero_media" | "media_1" | "media_2" | "media_3",
  ) => Promise<boolean>;

  deleteProjects: (params: {
    project_ids?: string[];
    platform_name?: string;
  }) => Promise<boolean>;

  setCurrentProject: (project: PortfolioProjectResponse | null) => void;
  clearErrors: () => void;
}

// ============================================================
// STORE
// ============================================================

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────
      projects: [],
      totalProjects: 0,
      projectsPage: 1,
      projectsHasMore: false,

      filteredProjects: [],
      totalFilteredProjects: 0,
      filteredPage: 1,
      filteredHasMore: false,

      currentProject: null,
      recentProjects: [],
      totalRecentProjects: 0,
      projectStats: null,
      loading: {},
      errors: {},

      // ── Helpers ────────────────────────────────────────────
      setCurrentProject: (project) => set({ currentProject: project }),
      clearErrors: () => set({ errors: {} }),

      // ── GET /projects/me ───────────────────────────────────
      fetchMyProjects: async (params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchProjects: true },
          errors: { ...s.errors, fetchProjects: null },
        }));
        try {
          const page = params.page ?? 1;
          const size = params.size ?? PAGE_SIZE;

          const query = new URLSearchParams();
          if (params.include_public !== undefined)
            query.set("include_public", String(params.include_public));
          if (params.query) query.set("query", params.query);
          query.set("page", String(page));
          query.set("size", String(size));
          if (params.sort) query.set("sort", params.sort);
          if (params.sort_direction)
            query.set("sort_direction", params.sort_direction);
          if (params.filter_platform)
            query.set("filter_platform", params.filter_platform);

          const { data } = await api.get<PaginatedProjects>(
            `/projects/me?${query.toString()}`,
          );

          const incoming = data.projects;
          const total = data.total;

          set((s) => ({
            projects: page > 1 ? dedupeAppend(s.projects, incoming) : incoming,
            totalProjects: total,
            projectsPage: page,
            projectsHasMore:
              page > 1
                ? s.projects.length + incoming.length < total
                : incoming.length < total,
          }));
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch projects";
          set((s) => ({ errors: { ...s.errors, fetchProjects: message } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, fetchProjects: false } }));
        }
      },

      // ── GET /projects/{project_id} ─────────────────────────
      fetchProject: async (projectId: string) => {
        set((s) => ({
          loading: { ...s.loading, fetchProjectById: true },
          errors: { ...s.errors, fetchProjectById: null },
        }));
        try {
          const { data } = await api.get<PortfolioProjectResponse>(
            `/projects/${projectId}`,
          );
          set((s) => {
            const existingIndex = s.projects.findIndex(
              (p) => p.id === projectId,
            );
            const updatedProjects = [...s.projects];
            if (existingIndex >= 0) {
              updatedProjects[existingIndex] = data;
            } else {
              updatedProjects.push(data);
            }
            return { projects: updatedProjects, currentProject: data };
          });
          return data;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch project";
          set((s) => ({ errors: { ...s.errors, fetchProjectById: message } }));
          throw err;
        } finally {
          set((s) => ({ loading: { ...s.loading, fetchProjectById: false } }));
        }
      },

      // ── GET /projects/users/{username} ─────────────────────
      fetchProjectsByUser: async (username, params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchProjectsByUser: true },
          errors: { ...s.errors, fetchProjectsByUser: null },
        }));
        try {
          // Support page param forwarded through PublicProjectsByUsernameFilters
          const page = (params as { page?: number }).page ?? 1;
          const size = (params as { size?: number }).size ?? PAGE_SIZE;

          const mergedParams = { ...params, page, size };

          const { data } = await api.get<PaginatedProjects>(
            `/projects/user/${username}`,
            { params: mergedParams },
          );

          const incoming = data.projects;
          const total = data.total;

          set((s) => ({
            filteredProjects:
              page > 1 ? dedupeAppend(s.filteredProjects, incoming) : incoming,
            totalFilteredProjects: total,
            filteredPage: page,
            filteredHasMore:
              page > 1
                ? s.filteredProjects.length + incoming.length < total
                : incoming.length < total,
          }));
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch user projects";
          set((s) => ({
            errors: { ...s.errors, fetchProjectsByUser: message },
          }));
        } finally {
          set((s) => ({
            loading: { ...s.loading, fetchProjectsByUser: false },
          }));
        }
      },

      // ── GET /projects/recent ───────────────────────────────
      fetchRecentProjects: async (params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchRecentProjects: true },
          errors: { ...s.errors, fetchRecentProjects: null },
        }));
        try {
          const query = new URLSearchParams();
          if (params.days) query.set("days", String(params.days));
          if (params.page) query.set("page", String(params.page));
          if (params.size) query.set("size", String(params.size));

          const { data } = await api.get<PaginatedProjectBase>(
            `/projects/recent?${query.toString()}`,
          );
          set({
            recentProjects: data.projects,
            totalRecentProjects: data.total,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch recent projects";
          set((s) => ({
            errors: { ...s.errors, fetchRecentProjects: message },
          }));
        } finally {
          set((s) => ({
            loading: { ...s.loading, fetchRecentProjects: false },
          }));
        }
      },

      // ── GET /projects/filter/status ────────────────────────
      fetchProjectsByStatus: async (params = {}) => {
        set((s) => ({
          loading: { ...s.loading, fetchProjectsByStatus: true },
          errors: { ...s.errors, fetchProjectsByStatus: null },
        }));
        try {
          const query = new URLSearchParams();
          if (params.is_completed !== undefined)
            query.set("is_completed", String(params.is_completed));
          if (params.is_concept !== undefined)
            query.set("is_concept", String(params.is_concept));
          if (params.page) query.set("page", String(params.page));
          if (params.size) query.set("size", String(params.size));

          const { data } = await api.get<PaginatedProjects>(
            `/projects/filter/status?${query.toString()}`,
          );
          set({
            filteredProjects: data.projects,
            totalFilteredProjects: data.total,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch projects by status";
          set((s) => ({
            errors: { ...s.errors, fetchProjectsByStatus: message },
          }));
        } finally {
          set((s) => ({
            loading: { ...s.loading, fetchProjectsByStatus: false },
          }));
        }
      },

      // ── GET /projects/stats ────────────────────────────────
      fetchProjectStats: async (userId) => {
        set((s) => ({
          loading: { ...s.loading, fetchProjectStats: true },
          errors: { ...s.errors, fetchProjectStats: null },
        }));
        try {
          const query = new URLSearchParams();
          if (userId) query.set("user_id", userId);

          const { data } = await api.get<ProjectStats>(
            `/projects/stats?${query.toString()}`,
          );
          set({ projectStats: data });
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch project stats";
          set((s) => ({ errors: { ...s.errors, fetchProjectStats: message } }));
        } finally {
          set((s) => ({ loading: { ...s.loading, fetchProjectStats: false } }));
        }
      },

      // ── POST /projects/ ────────────────────────────────────
      createProject: async (data) => {
        set((s) => ({
          loading: { ...s.loading, createProject: true },
          errors: { ...s.errors, createProject: null },
        }));
        try {
          const form = buildCreateFormData(data);
          const { data: created } = await api.post<PortfolioProjectBase>(
            "/projects/",
            form,
            { headers: { "Content-Type": "multipart/form-data" } },
          );
          // Refresh from page 1 so order and counts are correct
          await get().fetchMyProjects({ include_public: true });
          return created;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to create project";
          set((s) => ({ errors: { ...s.errors, createProject: message } }));
          return null;
        } finally {
          set((s) => ({ loading: { ...s.loading, createProject: false } }));
        }
      },

      // ── PUT /projects/{project_id} ─────────────────────────
      updateProject: async (projectId, data) => {
        set((s) => ({
          loading: { ...s.loading, updateProject: true },
          errors: { ...s.errors, updateProject: null },
        }));
        try {
          const form = buildUpdateFormData(data);
          const { data: updated } = await api.put<
            Partial<PortfolioProjectResponse>
          >(`/projects/${projectId}`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          set((s) => ({
            projects: s.projects.map((p) =>
              p.id === projectId ? { ...p, ...updated } : p,
            ),
            currentProject:
              s.currentProject?.id === projectId
                ? { ...s.currentProject, ...updated }
                : s.currentProject,
          }));

          return (
            (get().currentProject?.id === projectId
              ? get().currentProject
              : get().projects.find((p) => p.id === projectId)) ?? null
          );
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to update project";
          set((s) => ({ errors: { ...s.errors, updateProject: message } }));
          return null;
        } finally {
          set((s) => ({ loading: { ...s.loading, updateProject: false } }));
        }
      },

      // ── DELETE /projects/{project_id}/media/{slot} ─────────
      deleteProjectMedia: async (projectId, slot) => {
        set((s) => ({
          loading: { ...s.loading, deleteProjectMedia: true },
          errors: { ...s.errors, deleteProjectMedia: null },
        }));
        try {
          const { data: updated } = await api.delete<
            Partial<PortfolioProjectResponse>
          >(`/projects/${projectId}/media/${slot}`);

          set((s) => ({
            projects: s.projects.map((p) =>
              p.id === projectId ? { ...p, ...updated } : p,
            ),
            currentProject:
              s.currentProject?.id === projectId
                ? { ...s.currentProject, ...updated }
                : s.currentProject,
          }));

          return true;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to delete media";
          set((s) => ({
            errors: { ...s.errors, deleteProjectMedia: message },
          }));
          return false;
        } finally {
          set((s) => ({
            loading: { ...s.loading, deleteProjectMedia: false },
          }));
        }
      },

      // ── DELETE /projects/delete/bulk ───────────────────────
      deleteProjects: async ({ project_ids, platform_name }) => {
        set((s) => ({
          loading: { ...s.loading, deleteProjects: true },
          errors: { ...s.errors, deleteProjects: null },
        }));
        try {
          const query = new URLSearchParams();
          if (platform_name) query.set("platform_name", platform_name);

          await api.delete(`/projects/delete/bulk?${query.toString()}`, {
            data: { project_ids: project_ids ?? [] },
          });

          if (project_ids?.length) {
            set((s) => {
              const next = s.projects.filter(
                (p) => !project_ids.includes(p.id),
              );
              return {
                projects: next,
                totalProjects: s.totalProjects - project_ids.length,
                projectsHasMore:
                  next.length < s.totalProjects - project_ids.length,
              };
            });
          } else {
            // Platform deletion — refresh fully
            await get().fetchMyProjects({ include_public: true });
          }

          return true;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to delete projects";
          set((s) => ({ errors: { ...s.errors, deleteProjects: message } }));
          return false;
        } finally {
          set((s) => ({ loading: { ...s.loading, deleteProjects: false } }));
        }
      },
    }),
    { name: "ProjectStore" },
  ),
);
