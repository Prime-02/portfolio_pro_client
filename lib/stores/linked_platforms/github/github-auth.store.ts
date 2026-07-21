// stores/github-auth.store.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { api } from "@/lib/client/api";

// ============ Types ============

export interface GitHubAuthUrlResponse {
  url: string;
}

export interface GitHubUser {
  id: string;
  email: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  profile_picture: string;
  profile_picture_id?: string;
  phone_number?: string;
  username: string;
  is_active: boolean;
  created_at: string;
  role: string;
}

export interface GitHubIntegrationInfo {
  id: string;
  github_username: string;
  github_user_id: number;
  display_photo_url?: string;
  profile_url?: string;
  installation_id: string;
  sync_status: "active" | "revoked" | "expired" | "error";
  token_scope?: string;
  last_synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GitHubSession {
  id: string;
  created_at: string;
  last_accessed_at: string;
  ip_address: string | null;
  user_agent: string;
  expires_at: string;
}

export interface GitHubAuthCallbackResponse {
  message: string;
  session_id: string;
  session_token: string;
  refresh_token: string;
  expires_at: string;
  ip_address: string;
  user_agent: string;
  is_new: boolean;
  linked_to_existing_user: boolean;
  user: GitHubUser;
  github_integration: {
    id: string;
    github_username: string;
    installation_id: string;
    sync_status: string;
  };
}

export interface GitHubInstallationStatus {
  installed: boolean;
  installation_id?: string;
  github_username?: string;
  sync_status?: string;
  last_synced_at?: string;
  integrations?: GitHubIntegrationInfo[];
  message?: string;
}


export interface GitHubUninstallResponse {
  message: string;
  installation_id: string;
  remaining_active_integrations: number;
}

export interface GitHubIntegrationsListResponse {
  integrations: GitHubIntegrationInfo[];
}

export interface GitHubSessionsListResponse {
  sessions: GitHubSession[];
}

export interface GitHubUserProfileResponse {
  user: GitHubUser;
}

// ============ Store State ============

interface GitHubAuthState {
  // Auth URL State
  isLoadingAuthUrl: boolean;
  authUrl: string | null;
  authUrlError: string | null;

  // Callback Processing State
  isProcessingCallback: boolean;
  callbackResponse: GitHubAuthCallbackResponse | null;
  callbackError: string | null;

  // Installation Status State
  isLoadingInstallationStatus: boolean;
  installationStatus: GitHubInstallationStatus | null;
  installationStatusError: string | null;

  // User Profile State
  isLoadingProfile: boolean;
  userProfile: GitHubUserProfileResponse | null;
  profileError: string | null;

  // Sessions State
  isLoadingSessions: boolean;
  sessions: GitHubSession[];
  sessionsError: string | null;

  // Integrations State
  isLoadingIntegrations: boolean;
  integrations: GitHubIntegrationInfo[];
  integrationsError: string | null;

  // Uninstall State
  isUninstalling: boolean;
  uninstallResponse: GitHubUninstallResponse | null;
  uninstallError: string | null;

  // Logout State
  isLoggingOut: boolean;
  logoutMessage: string | null;
  logoutError: string | null;

  // Logout All State
  isLoggingOutAll: boolean;
  logoutAllMessage: string | null;
  logoutAllError: string | null;

  // Webhook Uninstall State
  isProcessingWebhookUninstall: boolean;
  webhookUninstallResponse: { message: string; affected_users: number } | null;
  webhookUninstallError: string | null;

  // Active Session
  activeSession: {
    sessionToken: string | null;
    refreshToken: string | null;
    userId: string | null;
    expiresAt: string | null;
  };

  // Actions
  getAuthUrl: () => Promise<string>;
  processCallback: (
    code: string,
    installationId: string,
    setupAction?: string,
    userId?: string,
  ) => Promise<void>;
  getInstallationStatus: (installationId?: string) => Promise<void>;
  getUserProfile: () => Promise<void>;
  getSessions: () => Promise<void>;
  getIntegrations: () => Promise<void>;
  uninstallApp: (installationId?: string) => Promise<GitHubUninstallResponse>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  processWebhookUninstall: (payload: any) => Promise<void>;
  setActiveSession: (
    session: Partial<GitHubAuthState["activeSession"]>,
  ) => void;
  clearSession: () => void;

  // Utility Actions
  resetAuthState: () => void;
  resetInstallationState: () => void;
  resetStore: () => void;
}

// ============ Initial State ============

const initialState = {
  isLoadingAuthUrl: false,
  authUrl: null,
  authUrlError: null,

  isProcessingCallback: false,
  callbackResponse: null,
  callbackError: null,

  isLoadingInstallationStatus: false,
  installationStatus: null,
  installationStatusError: null,

  isLoadingProfile: false,
  userProfile: null,
  profileError: null,

  isLoadingSessions: false,
  sessions: [],
  sessionsError: null,

  isLoadingIntegrations: false,
  integrations: [],
  integrationsError: null,

  isUninstalling: false,
  uninstallResponse: null,
  uninstallError: null,

  isLoggingOut: false,
  logoutMessage: null,
  logoutError: null,

  isLoggingOutAll: false,
  logoutAllMessage: null,
  logoutAllError: null,

  isProcessingWebhookUninstall: false,
  webhookUninstallResponse: null,
  webhookUninstallError: null,

  activeSession: {
    sessionToken: null,
    refreshToken: null,
    userId: null,
    expiresAt: null,
  },
};

// ============ Store Implementation ============

export const useGitHubAuthStore = create<GitHubAuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Get Auth URL
        getAuthUrl: async () => {
          set({ isLoadingAuthUrl: true, authUrlError: null });

          try {
            const response =
              await api.get<GitHubAuthUrlResponse>("/github-auth/login");

            set({
              authUrl: response.data.url,
              isLoadingAuthUrl: false,
            });

            return response.data.url;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to get GitHub auth URL";

            set({
              authUrlError: errorMessage,
              isLoadingAuthUrl: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Process Callback
        processCallback: async (
          code: string,
          installationId: string,
          setupAction?: string,
          userId?: string,
        ) => {
          set({ isProcessingCallback: true, callbackError: null });

          try {
            const queryParams = new URLSearchParams();
            queryParams.append("code", code);
            queryParams.append("installation_id", installationId);
            if (setupAction) queryParams.append("setup_action", setupAction);
            if (userId) queryParams.append("user_id", userId);

            const url = `/github-auth/callback?${queryParams.toString()}`;
            const response = await api.get<GitHubAuthCallbackResponse>(url);

            // Store session information
            set({
              callbackResponse: response.data,
              isProcessingCallback: false,
              activeSession: {
                sessionToken: response.data.session_token,
                refreshToken: response.data.refresh_token,
                userId: response.data.user.id,
                expiresAt: response.data.expires_at,
              },
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to process GitHub callback";

            set({
              callbackError: errorMessage,
              isProcessingCallback: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Get Installation Status
        getInstallationStatus: async (installationId?: string) => {
          set({
            isLoadingInstallationStatus: true,
            installationStatusError: null,
          });

          try {
            const queryParams = new URLSearchParams();
            if (installationId)
              queryParams.append("installation_id", installationId);

            const url = `/github-auth/installation/status?${queryParams.toString()}`;
            const response = await api.get<GitHubInstallationStatus>(url);

            set({
              installationStatus: response.data,
              isLoadingInstallationStatus: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to check installation status";

            set({
              installationStatusError: errorMessage,
              isLoadingInstallationStatus: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Get User Profile
        getUserProfile: async () => {
          set({ isLoadingProfile: true, profileError: null });

          try {
            const response =
              await api.get<GitHubUserProfileResponse>("/github-auth/me");

            set({
              userProfile: response.data,
              isLoadingProfile: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to get user profile";

            set({
              profileError: errorMessage,
              isLoadingProfile: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Get Sessions
        getSessions: async () => {
          set({ isLoadingSessions: true, sessionsError: null });

          try {
            const response = await api.get<GitHubSessionsListResponse>(
              "/github-auth/sessions",
            );

            set({
              sessions: response.data.sessions,
              isLoadingSessions: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to get sessions";

            set({
              sessionsError: errorMessage,
              isLoadingSessions: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Get Integrations
        getIntegrations: async () => {
          set({ isLoadingIntegrations: true, integrationsError: null });

          try {
            const response = await api.get<GitHubIntegrationsListResponse>(
              "/github-auth/integrations",
            );

            set({
              integrations: response.data.integrations,
              isLoadingIntegrations: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to get integrations";

            set({
              integrationsError: errorMessage,
              isLoadingIntegrations: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Uninstall App
        uninstallApp: async (installationId?: string) => {
          set({ isUninstalling: true, uninstallError: null });

          try {
            const queryParams = new URLSearchParams();
            if (installationId)
              queryParams.append("installation_id", installationId);

            const url = `/github-auth/uninstall?${queryParams.toString()}`;
            const response = await api.post<GitHubUninstallResponse>(url);

            set({
              uninstallResponse: response.data,
              isUninstalling: false,
            });
            return response.data
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to uninstall GitHub App";

            set({
              uninstallError: errorMessage,
              isUninstalling: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Logout
        logout: async () => {
          set({ isLoggingOut: true, logoutError: null });

          try {
            const response = await api.post<{ message: string }>(
              "/github-auth/logout",
            );

            set({
              logoutMessage: response.data.message,
              isLoggingOut: false,
              activeSession: {
                sessionToken: null,
                refreshToken: null,
                userId: null,
                expiresAt: null,
              },
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to logout";

            set({
              logoutError: errorMessage,
              isLoggingOut: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Logout All
        logoutAll: async () => {
          set({ isLoggingOutAll: true, logoutAllError: null });

          try {
            const response = await api.post<{ message: string }>(
              "/github-auth/logout-all",
            );

            set({
              logoutAllMessage: response.data.message,
              isLoggingOutAll: false,
              activeSession: {
                sessionToken: null,
                refreshToken: null,
                userId: null,
                expiresAt: null,
              },
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to logout from all devices";

            set({
              logoutAllError: errorMessage,
              isLoggingOutAll: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Process Webhook Uninstall
        processWebhookUninstall: async (payload: any) => {
          set({
            isProcessingWebhookUninstall: true,
            webhookUninstallError: null,
          });

          try {
            const response = await api.post<{
              message: string;
              affected_users: number;
            }>("/github-auth/webhook/uninstall", payload);

            set({
              webhookUninstallResponse: response.data,
              isProcessingWebhookUninstall: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to process webhook uninstall";

            set({
              webhookUninstallError: errorMessage,
              isProcessingWebhookUninstall: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Set Active Session
        setActiveSession: (session) => {
          set((state) => ({
            activeSession: {
              ...state.activeSession,
              ...session,
            },
          }));
        },

        // Clear Session
        clearSession: () => {
          set({
            activeSession: {
              sessionToken: null,
              refreshToken: null,
              userId: null,
              expiresAt: null,
            },
          });
        },

        // Reset States
        resetAuthState: () => {
          set({
            isLoadingAuthUrl: false,
            authUrl: null,
            authUrlError: null,
            isProcessingCallback: false,
            callbackResponse: null,
            callbackError: null,
          });
        },

        resetInstallationState: () => {
          set({
            isLoadingInstallationStatus: false,
            installationStatus: null,
            installationStatusError: null,
            isUninstalling: false,
            uninstallResponse: null,
            uninstallError: null,
          });
        },

        resetStore: () => {
          set(initialState);
        },
      }),
      {
        name: "github-auth-store",
        partialize: (state) => ({
          // Only persist these fields
          activeSession: state.activeSession,
          installationStatus: state.installationStatus,
          userProfile: state.userProfile,
          integrations: state.integrations,
        }),
      },
    ),
    { name: "GitHubAuthStore" },
  ),
);

// ============ Selector Hooks ============

export const useGitHubAuth = () => {
  const store = useGitHubAuthStore();
  return {
    isLoadingAuthUrl: store.isLoadingAuthUrl,
    authUrl: store.authUrl,
    authUrlError: store.authUrlError,
    getAuthUrl: store.getAuthUrl,
    resetAuthState: store.resetAuthState,
  };
};

export const useGitHubCallback = () => {
  const store = useGitHubAuthStore();
  return {
    isProcessingCallback: store.isProcessingCallback,
    callbackResponse: store.callbackResponse,
    callbackError: store.callbackError,
    processCallback: store.processCallback,
  };
};

export const useGitHubInstallationStatus = () => {
  const store = useGitHubAuthStore();
  return {
    isLoadingInstallationStatus: store.isLoadingInstallationStatus,
    installationStatus: store.installationStatus,
    installationStatusError: store.installationStatusError,
    getInstallationStatus: store.getInstallationStatus,
    resetInstallationState: store.resetInstallationState,
  };
};

export const useGitHubProfile = () => {
  const store = useGitHubAuthStore();
  return {
    isLoadingProfile: store.isLoadingProfile,
    userProfile: store.userProfile,
    profileError: store.profileError,
    getUserProfile: store.getUserProfile,
  };
};

export const useGitHubSessions = () => {
  const store = useGitHubAuthStore();
  return {
    isLoadingSessions: store.isLoadingSessions,
    sessions: store.sessions,
    sessionsError: store.sessionsError,
    getSessions: store.getSessions,
  };
};

export const useGitHubIntegrations = () => {
  const store = useGitHubAuthStore();
  return {
    isLoadingIntegrations: store.isLoadingIntegrations,
    integrations: store.integrations,
    integrationsError: store.integrationsError,
    getIntegrations: store.getIntegrations,
  };
};

export const useGitHubUninstall = () => {
  const store = useGitHubAuthStore();
  return {
    isUninstalling: store.isUninstalling,
    uninstallResponse: store.uninstallResponse,
    uninstallError: store.uninstallError,
    uninstallApp: store.uninstallApp,
  };
};

export const useGitHubLogout = () => {
  const store = useGitHubAuthStore();
  return {
    isLoggingOut: store.isLoggingOut,
    logoutMessage: store.logoutMessage,
    logoutError: store.logoutError,
    isLoggingOutAll: store.isLoggingOutAll,
    logoutAllMessage: store.logoutAllMessage,
    logoutAllError: store.logoutAllError,
    logout: store.logout,
    logoutAll: store.logoutAll,
  };
};

export const useGitHubWebhookUninstall = () => {
  const store = useGitHubAuthStore();
  return {
    isProcessingWebhookUninstall: store.isProcessingWebhookUninstall,
    webhookUninstallResponse: store.webhookUninstallResponse,
    webhookUninstallError: store.webhookUninstallError,
    processWebhookUninstall: store.processWebhookUninstall,
  };
};

export const useGitHubSession = () => {
  const store = useGitHubAuthStore();
  return {
    activeSession: store.activeSession,
    setActiveSession: store.setActiveSession,
    clearSession: store.clearSession,
    isAuthenticated: !!store.activeSession.sessionToken,
  };
};
