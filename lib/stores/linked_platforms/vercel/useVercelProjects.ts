// stores/vercel-integration.store.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { api } from "@/lib/client/api";

// ============ Types ============

export interface VercelUserInfo {
  id: string;
  email: string;
  firstname: string;
  middlename: string;
  lastname: string;
  profile_picture: string;
  profile_picture_id: string;
  phone_number: string;
  username: string;
  is_active: boolean;
  created_at: string;
  role: string;
  auth_provider: string;
}

export interface VercelUserCreateResponse {
  message: string;
  session_id: string;
  session_token: string;
  refresh_token: string;
  expires_at: string;
  ip_address: string;
  user_agent: string;
  is_new: boolean;
  user: VercelUserInfo;
}

export interface VercelTokenValidationResponse {
  valid: boolean;
  message: string;
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
  created_at?: number;
  team_info?: {
    count: number;
    teams: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  error_code?: string;
}

export interface VercelProjectInfo {
  id: string;
  name: string;
  framework?: string;
  created_at?: number;
  updated_at?: number;
  production_url?: string;
  github_link?: string;
  node_version?: string;
  live: boolean;
  sso_protected: boolean;
  latest_deployment?: {
    id: string;
    ready_state: string;
    url: string;
    created_at: number;
  };
}

export interface VercelProjectPreview {
  id?: string;
  name?: string;
  framework?: string;
  production_url?: string;
  github_link?: string;
  created_at?: number;
  updated_at?: number;
  live?: boolean;
  latest_deployment_state?: string;
  existing_id?: string;
  existing_name?: string;
  existing_url?: string;
}

export interface VercelProjectsListResponse {
  success: boolean;
  projects: VercelProjectInfo[];
  total_returned: number;
  pagination: {
    current_page: number;
    limit: number;
    next?: number;
    prev?: number;
    count?: number;
    has_more: boolean;
  };
}

export interface VercelImportRequest {
  import_all: boolean;
  project_names?: string[];
  max_pages?: number;
}

export interface VercelImportResponse {
  status: "accepted";
  message: string;
  import_all: boolean;
  repository_count: number | string;
}

export interface VercelImportResult {
  success: boolean;
  message: string;
  total_found: number;
  imported: number;
  skipped: number;
  errors: number;
  pages_fetched?: number;
  import_type: "all" | "specific";
  not_found?: string[];
  details?: Record<string, any>;
}

export interface VercelPreviewResponse {
  success: boolean;
  import_type: "all" | "specific";
  total_projects: number;
  new_projects: VercelProjectPreview[];
  existing_projects: VercelProjectPreview[];
  counts: {
    total: number;
    new: number;
    existing: number;
  };
  requested_projects?: string[];
  pagination_info?: {
    max_pages_limit?: number;
    pages_would_fetch?: number;
  };
}

export interface VercelProjectDetails {
  success: boolean;
  project: Record<string, any>;
  recent_deployments: Array<{
    id: string;
    url: string;
    state: string;
    created_at: number;
    creator: string;
    target: string;
  }>;
  deployment_count: number;
}

// ============ Store State ============

interface VercelIntegrationState {
  // Authentication State
  isAuthenticating: boolean;
  authError: string | null;
  userData: VercelUserCreateResponse | null;

  // Token Validation State
  isValidatingToken: boolean;
  tokenValidationResult: VercelTokenValidationResponse | null;
  tokenValidationError: string | null;

  // Projects List State
  isLoadingProjects: boolean;
  projects: VercelProjectInfo[];
  projectsPagination: VercelProjectsListResponse["pagination"] | null;
  projectsError: string | null;

  // Import State
  isImporting: boolean;
  importRequest: VercelImportRequest | null;
  importResponse: VercelImportResponse | null;
  importResult: VercelImportResult | null;
  importError: string | null;

  // Preview State
  isPreviewing: boolean;
  previewData: VercelPreviewResponse | null;
  previewError: string | null;

  // Project Details State
  isLoadingProjectDetails: boolean;
  selectedProjectDetails: VercelProjectDetails | null;
  projectDetailsError: string | null;

  // Actions
  createUserWithVercelToken: (code: string) => Promise<void>;
  validateVercelToken: (token: string) => Promise<void>;
  listVercelProjects: (params?: {
    page?: number;
    limit?: number;
    until?: number;
  }) => Promise<void>;
  importVercelProjects: (request: VercelImportRequest) => Promise<void>;
  previewVercelImport: (request: VercelImportRequest) => Promise<void>;
  getVercelProjectDetails: (projectId: string, token: string) => Promise<void>;

  // Utility Actions
  resetAuthState: () => void;
  resetImportState: () => void;
  resetPreviewState: () => void;
  resetProjectsList: () => void;
  resetStore: () => void;
}

// ============ Initial State ============

const initialState = {
  isAuthenticating: false,
  authError: null,
  userData: null,

  isValidatingToken: false,
  tokenValidationResult: null,
  tokenValidationError: null,

  isLoadingProjects: false,
  projects: [],
  projectsPagination: null,
  projectsError: null,

  isImporting: false,
  importRequest: null,
  importResponse: null,
  importResult: null,
  importError: null,

  isPreviewing: false,
  previewData: null,
  previewError: null,

  isLoadingProjectDetails: false,
  selectedProjectDetails: null,
  projectDetailsError: null,
};

// ============ Store Implementation ============

export const useVercelIntegrationStore = create<VercelIntegrationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Create/Login User with Vercel Token
        createUserWithVercelToken: async (code: string) => {
          set({ isAuthenticating: true, authError: null });

          try {
            const response = await api.get<VercelUserCreateResponse>(
              `/vercel/login?code=${encodeURIComponent(code)}`,
            );

            set({
              userData: response.data,
              isAuthenticating: false,
            });

            // Store tokens in localStorage or cookies if needed
            if (response.data.session_token) {
              localStorage.setItem(
                "session_token",
                response.data.session_token,
              );
              localStorage.setItem(
                "refresh_token",
                response.data.refresh_token,
              );
            }
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to authenticate with Vercel";

            set({
              authError: errorMessage,
              isAuthenticating: false,
              userData: null,
            });

            throw new Error(errorMessage);
          }
        },

        // Validate Vercel Token
        validateVercelToken: async (token: string) => {
          set({ isValidatingToken: true, tokenValidationError: null });

          try {
            const response = await api.post<VercelTokenValidationResponse>(
              "/vercel/validate-token",
              null,
              { params: { token } },
            );

            set({
              tokenValidationResult: response.data,
              isValidatingToken: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to validate token";

            set({
              tokenValidationError: errorMessage,
              isValidatingToken: false,
              tokenValidationResult: {
                valid: false,
                message: errorMessage,
              },
            });

            throw new Error(errorMessage);
          }
        },

        // List Vercel Projects
        listVercelProjects: async (params?: {
          page?: number;
          limit?: number;
          until?: number;
        }) => {
          set({ isLoadingProjects: true, projectsError: null });

          try {
            const queryParams = new URLSearchParams();
            if (params?.page)
              queryParams.append("page", params.page.toString());
            if (params?.limit)
              queryParams.append("limit", params.limit.toString());
            if (params?.until)
              queryParams.append("until", params.until.toString());

            const url = `/vercel/projects${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
            const response = await api.get<VercelProjectsListResponse>(url);

            set({
              projects: response.data.projects,
              projectsPagination: response.data.pagination,
              isLoadingProjects: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to fetch Vercel projects";

            set({
              projectsError: errorMessage,
              isLoadingProjects: false,
              projects: [],
              projectsPagination: null,
            });

            throw new Error(errorMessage);
          }
        },

        // Import Vercel Projects
        importVercelProjects: async (request: VercelImportRequest) => {
          set({
            isImporting: true,
            importError: null,
            importRequest: request,
            importResponse: null,
          });

          try {
            const response = await api.post<VercelImportResponse>(
              "/vercel/import",
              request,
            );

            set({
              importResponse: response.data,
              isImporting: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to import Vercel projects";

            set({
              importError: errorMessage,
              isImporting: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Preview Vercel Import
        previewVercelImport: async (request: VercelImportRequest) => {
          set({ isPreviewing: true, previewError: null });

          try {
            const response = await api.post<VercelPreviewResponse>(
              "/vercel/import/preview",
              request,
            );

            set({
              previewData: response.data,
              isPreviewing: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to preview import";

            set({
              previewError: errorMessage,
              isPreviewing: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Get Vercel Project Details
        getVercelProjectDetails: async (projectId: string, token: string) => {
          set({ isLoadingProjectDetails: true, projectDetailsError: null });

          try {
            const response = await api.get<VercelProjectDetails>(
              `/vercel/project/${projectId}`,
              { params: { token } },
            );

            set({
              selectedProjectDetails: response.data,
              isLoadingProjectDetails: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to fetch project details";

            set({
              projectDetailsError: errorMessage,
              isLoadingProjectDetails: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Reset Actions
        resetAuthState: () => {
          set({
            isAuthenticating: false,
            authError: null,
            userData: null,
          });
        },

        resetImportState: () => {
          set({
            isImporting: false,
            importRequest: null,
            importResponse: null,
            importResult: null,
            importError: null,
          });
        },

        resetPreviewState: () => {
          set({
            isPreviewing: false,
            previewData: null,
            previewError: null,
          });
        },

        resetProjectsList: () => {
          set({
            isLoadingProjects: false,
            projects: [],
            projectsPagination: null,
            projectsError: null,
          });
        },

        resetStore: () => {
          set(initialState);
        },
      }),
      {
        name: "vercel-integration-store",
        partialize: (state) => ({
          // Only persist these fields
          userData: state.userData,
          tokenValidationResult: state.tokenValidationResult,
        }),
      },
    ),
    { name: "VercelIntegrationStore" },
  ),
);

// ============ Selector Hooks ============

export const useVercelAuth = () => {
  const store = useVercelIntegrationStore();
  return {
    isAuthenticating: store.isAuthenticating,
    authError: store.authError,
    userData: store.userData,
    createUserWithVercelToken: store.createUserWithVercelToken,
    resetAuthState: store.resetAuthState,
  };
};

export const useVercelTokenValidation = () => {
  const store = useVercelIntegrationStore();
  return {
    isValidatingToken: store.isValidatingToken,
    tokenValidationResult: store.tokenValidationResult,
    tokenValidationError: store.tokenValidationError,
    validateVercelToken: store.validateVercelToken,
  };
};

export const useVercelProjects = () => {
  const store = useVercelIntegrationStore();
  return {
    isLoadingProjects: store.isLoadingProjects,
    projects: store.projects,
    projectsPagination: store.projectsPagination,
    projectsError: store.projectsError,
    listVercelProjects: store.listVercelProjects,
    resetProjectsList: store.resetProjectsList,
  };
};

export const useVercelImport = () => {
  const store = useVercelIntegrationStore();
  return {
    isImporting: store.isImporting,
    importRequest: store.importRequest,
    importResponse: store.importResponse,
    importResult: store.importResult,
    importError: store.importError,
    importVercelProjects: store.importVercelProjects,
    resetImportState: store.resetImportState,
  };
};

export const useVercelPreview = () => {
  const store = useVercelIntegrationStore();
  return {
    isPreviewing: store.isPreviewing,
    previewData: store.previewData,
    previewError: store.previewError,
    previewVercelImport: store.previewVercelImport,
    resetPreviewState: store.resetPreviewState,
  };
};

export const useVercelProjectDetails = () => {
  const store = useVercelIntegrationStore();
  return {
    isLoadingProjectDetails: store.isLoadingProjectDetails,
    selectedProjectDetails: store.selectedProjectDetails,
    projectDetailsError: store.projectDetailsError,
    getVercelProjectDetails: store.getVercelProjectDetails,
  };
};
