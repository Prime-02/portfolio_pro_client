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

export type VercelSyncStatus = "active" | "revoked" | "expired" | "error";

export interface VercelInstallation {
  id: string;
  platform_username: string;
  platform_user_id: string;
  display_name: string;
  avatar_url: string;
  sync_status: VercelSyncStatus;
  is_primary: boolean;
  last_synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VercelIntegrationInfo {
  id: string;
  platform_username: string;
  platform_user_id: string;
  display_name: string;
  avatar_url: string;
  sync_status: VercelSyncStatus;
  is_primary: boolean;
  last_synced_at?: string;
  created_at?: string;
  updated_at?: string;
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
  vercel_integration?: {
    id: string;
    platform_username: string;
    is_primary: boolean;
    sync_status: string;
  };
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
  integration_id?: string;
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

// Request types
export interface VercelLoginRequest {
  vercel_token: string;
  user_id?: string;
}

export interface VercelLinkRequest {
  vercel_token: string;
  set_as_primary?: boolean;
}

export interface VercelValidateTokenRequest {
  token: string;
}

// Response types for new endpoints
export interface VercelLinkResponse {
  message: string;
  is_new: boolean;
  integration: {
    id: string;
    platform_username: string;
    platform_user_id: string;
    display_name: string;
    avatar_url: string;
    sync_status: string;
    is_primary: boolean;
  };
}

export interface VercelIntegrationsListResponse {
  integrations: VercelIntegrationInfo[];
}

export interface VercelSetPrimaryResponse {
  message: string;
  integration_id: string;
}

export interface VercelUnlinkResponse {
  message: string;
  removed_integration_id: string;
  remaining_integrations: number;
}

// ============ Store State ============

interface VercelIntegrationState {
  // Active Integration State
  activeIntegrationId: string | null;

  // Authentication State
  isAuthenticating: boolean;
  authError: string | null;
  userData: VercelUserCreateResponse | null;

  // Token Validation State
  isValidatingToken: boolean;
  tokenValidationResult: VercelTokenValidationResponse | null;
  tokenValidationError: string | null;

  // Account Linking State
  isLinkingAccount: boolean;
  linkAccountError: string | null;
  linkAccountResult: VercelLinkResponse | null;

  // Integrations List State
  isLoadingIntegrations: boolean;
  integrations: VercelIntegrationInfo[];
  integrationsError: string | null;

  // Set Primary State
  isSettingPrimary: boolean;
  setPrimaryError: string | null;

  // Unlink State
  isUnlinking: boolean;
  unlinkError: string | null;
  unlinkResult: VercelUnlinkResponse | null;

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

  // Actions - Active Integration
  setActiveIntegration: (integrationId: string | null) => void;
  getActiveIntegrationId: () => string | null;

  // Actions - Authentication
  createUserWithVercelToken: (request: VercelLoginRequest) => Promise<void>;

  // Actions - Token Validation
  validateVercelToken: (token: string) => Promise<void>;

  // Actions - Account Management
  linkVercelAccount: (request: VercelLinkRequest) => Promise<void>;
  listVercelIntegrations: () => Promise<void>;
  setPrimaryVercelIntegration: (integrationId: string) => Promise<void>;
  unlinkVercelIntegration: (
    integrationId?: string,
  ) => Promise<VercelUnlinkResponse>;

  // Actions - Projects
  listVercelProjects: (params?: {
    page?: number;
    limit?: number;
    until?: number;
    integration_id?: string;
  }) => Promise<void>;
  importVercelProjects: (
    request: VercelImportRequest,
    integration_id?: string,
  ) => Promise<void>;
  previewVercelImport: (
    request: VercelImportRequest,
    integration_id?: string,
  ) => Promise<void>;
  getVercelProjectDetails: (
    projectId: string,
    integration_id?: string,
  ) => Promise<void>;

  // Utility Actions
  resetAuthState: () => void;
  resetLinkState: () => void;
  resetImportState: () => void;
  resetPreviewState: () => void;
  resetProjectsList: () => void;
  resetIntegrationsList: () => void;
  resetStore: () => void;
}

// ============ Initial State ============

const initialState = {
  activeIntegrationId: null,

  isAuthenticating: false,
  authError: null,
  userData: null,

  isValidatingToken: false,
  tokenValidationResult: null,
  tokenValidationError: null,

  isLinkingAccount: false,
  linkAccountError: null,
  linkAccountResult: null,

  isLoadingIntegrations: false,
  integrations: [],
  integrationsError: null,

  isSettingPrimary: false,
  setPrimaryError: null,

  isUnlinking: false,
  unlinkError: null,
  unlinkResult: null,

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

        // ========== Active Integration Management ==========

        setActiveIntegration: (integrationId: string | null) => {
          set({ activeIntegrationId: integrationId });

          // Persist to localStorage
          if (integrationId) {
            localStorage.setItem("active_vercel_integration_id", integrationId);
          } else {
            localStorage.removeItem("active_vercel_integration_id");
          }
        },

        getActiveIntegrationId: () => {
          const state = get();

          // Return explicitly set active integration if available
          if (state.activeIntegrationId) {
            return state.activeIntegrationId;
          }

          // Fallback to primary integration
          const primaryIntegration = state.integrations.find(
            (integration) => integration.is_primary,
          );

          return primaryIntegration?.id || null;
        },

        // ========== Authentication ==========

        createUserWithVercelToken: async (request: VercelLoginRequest) => {
          set({ isAuthenticating: true, authError: null });

          try {
            const response = await api.post<VercelUserCreateResponse>(
              "/vercel/login",
              request,
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

            // If a vercel integration was returned, set it as active
            if (response.data.vercel_integration?.id) {
              get().setActiveIntegration(response.data.vercel_integration.id);
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

        // ========== Token Validation ==========

        validateVercelToken: async (token: string) => {
          set({ isValidatingToken: true, tokenValidationError: null });

          try {
            const response = await api.post<VercelTokenValidationResponse>(
              "/vercel/validate-token",
              { token } as VercelValidateTokenRequest,
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

        // ========== Account Management ==========

        linkVercelAccount: async (request: VercelLinkRequest) => {
          set({ isLinkingAccount: true, linkAccountError: null });

          try {
            const response = await api.post<VercelLinkResponse>(
              "/vercel/link",
              request,
            );

            set({
              linkAccountResult: response.data,
              isLinkingAccount: false,
            });

            // Refresh integrations list after linking
            await get().listVercelIntegrations();

            // Set the newly linked integration as active
            get().setActiveIntegration(response.data.integration.id);
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to link Vercel account";

            set({
              linkAccountError: errorMessage,
              isLinkingAccount: false,
            });

            throw new Error(errorMessage);
          }
        },

        listVercelIntegrations: async () => {
          set({ isLoadingIntegrations: true, integrationsError: null });

          try {
            const response = await api.get<VercelIntegrationsListResponse>(
              "/vercel/integrations",
            );

            set({
              integrations: response.data.integrations,
              isLoadingIntegrations: false,
            });

            // If no active integration is set, default to primary
            const state = get();
            if (!state.activeIntegrationId) {
              const primaryIntegration = response.data.integrations.find(
                (integration) => integration.is_primary,
              );
              if (primaryIntegration) {
                get().setActiveIntegration(primaryIntegration.id);
              }
            }
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to fetch Vercel integrations";

            set({
              integrationsError: errorMessage,
              isLoadingIntegrations: false,
              integrations: [],
            });

            throw new Error(errorMessage);
          }
        },

        setPrimaryVercelIntegration: async (integrationId: string) => {
          set({ isSettingPrimary: true, setPrimaryError: null });

          try {
            await api.post<VercelSetPrimaryResponse>(
              `/vercel/integrations/${integrationId}/primary`,
            );

            // Refresh integrations list after setting primary
            await get().listVercelIntegrations();

            // Set as active integration
            get().setActiveIntegration(integrationId);

            set({ isSettingPrimary: false });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to set primary integration";

            set({
              setPrimaryError: errorMessage,
              isSettingPrimary: false,
            });

            throw new Error(errorMessage);
          }
        },

        unlinkVercelIntegration: async (integrationId?: string) => {
          set({ isUnlinking: true, unlinkError: null });

          try {
            const params = integrationId
              ? { integration_id: integrationId }
              : {};

            const response = await api.delete<VercelUnlinkResponse>(
              "/vercel/integrations",
              { params },
            );

            set({
              unlinkResult: response.data,
              isUnlinking: false,
            });

            // If the active integration was removed, clear it
            const state = get();
            if (
              state.activeIntegrationId ===
                response.data.removed_integration_id ||
              integrationId === state.activeIntegrationId
            ) {
              get().setActiveIntegration(null);
            }

            // Refresh integrations list after unlinking
            await get().listVercelIntegrations();
            return response.data
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to unlink Vercel integration";

            set({
              unlinkError: errorMessage,
              isUnlinking: false,
            });

            throw new Error(errorMessage);
          }
        },

        // ========== Projects ==========

        listVercelProjects: async (params?: {
          page?: number;
          limit?: number;
          until?: number;
          integration_id?: string;
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

            // Use provided integration_id or get active one
            const activeIntegrationId =
              params?.integration_id || get().getActiveIntegrationId();
            if (activeIntegrationId) {
              queryParams.append("integration_id", activeIntegrationId);
            }

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

        importVercelProjects: async (
          request: VercelImportRequest,
          integration_id?: string,
        ) => {
          set({
            isImporting: true,
            importError: null,
            importRequest: request,
            importResponse: null,
          });

          try {
            // Use provided integration_id or get active one
            const activeIntegrationId =
              integration_id || get().getActiveIntegrationId();
            const params = activeIntegrationId
              ? { integration_id: activeIntegrationId }
              : {};

            const response = await api.post<VercelImportResponse>(
              "/vercel/import",
              request,
              { params },
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

        previewVercelImport: async (
          request: VercelImportRequest,
          integration_id?: string,
        ) => {
          set({ isPreviewing: true, previewError: null });

          try {
            // Use provided integration_id or get active one
            const activeIntegrationId =
              integration_id || get().getActiveIntegrationId();
            const params = activeIntegrationId
              ? { integration_id: activeIntegrationId }
              : {};

            const response = await api.post<VercelPreviewResponse>(
              "/vercel/import/preview",
              request,
              { params },
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

        getVercelProjectDetails: async (
          projectId: string,
          integration_id?: string,
        ) => {
          set({ isLoadingProjectDetails: true, projectDetailsError: null });

          try {
            // Use provided integration_id or get active one
            const activeIntegrationId =
              integration_id || get().getActiveIntegrationId();
            const params = activeIntegrationId
              ? { integration_id: activeIntegrationId }
              : {};

            const response = await api.get<VercelProjectDetails>(
              `/vercel/project/${projectId}`,
              { params },
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

        // ========== Reset Actions ==========

        resetAuthState: () => {
          set({
            isAuthenticating: false,
            authError: null,
            userData: null,
          });
        },

        resetLinkState: () => {
          set({
            isLinkingAccount: false,
            linkAccountError: null,
            linkAccountResult: null,
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

        resetIntegrationsList: () => {
          set({
            isLoadingIntegrations: false,
            integrations: [],
            integrationsError: null,
          });
        },

        resetStore: () => {
          set(initialState);
          localStorage.removeItem("active_vercel_integration_id");
        },
      }),
      {
        name: "vercel-integration-store",
        partialize: (state) => ({
          // Only persist these fields
          userData: state.userData,
          tokenValidationResult: state.tokenValidationResult,
          integrations: state.integrations,
          activeIntegrationId: state.activeIntegrationId,
        }),
      },
    ),
    { name: "VercelIntegrationStore" },
  ),
);

// ============ Selector Hooks ============

export const useVercelActiveIntegration = () => {
  const store = useVercelIntegrationStore();
  return {
    activeIntegrationId: store.activeIntegrationId,
    setActiveIntegration: store.setActiveIntegration,
    getActiveIntegrationId: store.getActiveIntegrationId,
  };
};

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

export const useVercelAccountManagement = () => {
  const store = useVercelIntegrationStore();
  return {
    isLinkingAccount: store.isLinkingAccount,
    linkAccountError: store.linkAccountError,
    linkAccountResult: store.linkAccountResult,
    isLoadingIntegrations: store.isLoadingIntegrations,
    integrations: store.integrations,
    integrationsError: store.integrationsError,
    isSettingPrimary: store.isSettingPrimary,
    setPrimaryError: store.setPrimaryError,
    isUnlinking: store.isUnlinking,
    unlinkError: store.unlinkError,
    unlinkResult: store.unlinkResult,
    linkVercelAccount: store.linkVercelAccount,
    listVercelIntegrations: store.listVercelIntegrations,
    setPrimaryVercelIntegration: store.setPrimaryVercelIntegration,
    unlinkVercelIntegration: store.unlinkVercelIntegration,
    resetLinkState: store.resetLinkState,
    resetIntegrationsList: store.resetIntegrationsList,
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
