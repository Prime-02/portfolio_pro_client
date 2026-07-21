// stores/github-integration.store.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { api } from "@/lib/client/api";

// ============ Types ============

export interface GitHubUserValidationResponse {
  exists: boolean;
  username: string;
  public_repos?: number;
  avatar_url?: string;
  name?: string;
  bio?: string;
  message: string;
}

export interface GitHubImportRequest {
  github_username: string;
  import_all: boolean;
  project_names?: string[];
}

export interface GitHubImportResponse {
  success: boolean;
  message: string;
  total_found: number;
  imported: number;
  skipped: number;
  errors: number;
  pages_fetched?: number;
  github_username: string;
  import_type: "all" | "specific";
  details?: Record<string, any>;
}

export interface GitHubInstallationImportRequest {
  import_all: boolean;
  project_names?: string[];
}

export interface GitHubRepositoryInfo {
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  homepage?: string;
  clone_url?: string;
  ssh_url?: string;
  language?: string;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  created_at?: string;
  updated_at?: string;
  pushed_at?: string;
  size: number;
  archived: boolean;
  disabled: boolean;
  private: boolean;
  has_pages: boolean;
  default_branch?: string;
  permissions?: Record<string, boolean>;
}

export interface GitHubRepositoriesListResponse {
  success: boolean;
  username: string;
  repositories: GitHubRepositoryInfo[];
  total_returned: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface GitHubInstallationRepositoriesResponse {
  success: boolean;
  installation_id: string;
  repositories: GitHubRepositoryInfo[];
  total_count: number;
  total_returned: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface GitHubPreviewResponse {
  success: boolean;
  github_username: string;
  import_type: "all" | "specific";
  total_repositories: number;
  new_projects: GitHubProjectPreview[];
  existing_projects: GitHubProjectPreview[];
  counts: {
    total: number;
    new: number;
    existing: number;
  };
}

export interface GitHubProjectPreview {
  name: string;
  description?: string;
  html_url: string;
  language?: string;
  stars: number;
  updated_at?: string;
  existing_id?: string;
  existing_name?: string;
}

export interface GitHubImportResult {
  success: boolean;
  message: string;
  installation_id?: string;
  import_type?: "all" | "specific";
  total_found: number;
  imported: number;
  skipped: number;
  errors: number;
  pages_fetched?: number;
}

export interface GitHubDuplicateCheckResponse {
  duplicate_found: boolean;
  existing_project?: {
    id: string;
    name: string;
    url: string;
    description?: string;
    summary?: string;
    created_at?: string;
  };
  repo_data: {
    name?: string;
    html_url?: string;
    id?: number;
  };
  message: string;
}

export interface GitHubInstallationTokenResponse {
  success: boolean;
  installation_id: number;
  token_valid: boolean;
  token_length: number;
  token_prefix: string;
  message: string;
}

export interface GitHubSingleImportResponse {
  success: boolean;
  message: string;
  project_id?: string;
  action?:
    | "created_new"
    | "associated_existing"
    | "skipped_existing_association";
  repo_name?: string;
  repo_url?: string;
}

export interface GitHubDeleteResponse {
  success: boolean;
  message: string;
  project_id?: string;
  action?: "deleted";
  repo_name?: string;
  repo_url?: string;
}

export interface GitHubBatchImportResponse {
  success: boolean;
  total_found: number;
  imported: number;
  skipped: number;
  errors: number;
  projects: Array<{
    repo_name: string;
    result: GitHubSingleImportResponse;
  }>;
  error_messages: string[];
}

// ============ Store State ============

interface GitHubIntegrationState {
  // User Validation State
  isValidatingUser: boolean;
  userValidationResult: GitHubUserValidationResponse | null;
  userValidationError: string | null;

  // Repositories List State
  isLoadingRepositories: boolean;
  repositories: GitHubRepositoryInfo[];
  repositoriesPagination: {
    page: number;
    per_page: number;
    has_more: boolean;
  } | null;
  repositoriesError: string | null;

  // Installation Repositories State
  isLoadingInstallationRepos: boolean;
  installationRepositories: GitHubRepositoryInfo[];
  installationReposTotalCount: number;
  installationReposPagination: {
    page: number;
    per_page: number;
    has_more: boolean;
  } | null;
  installationReposError: string | null;

  // Import State (Username-based)
  isImportingByUsername: boolean;
  usernameImportResponse: GitHubImportResponse | null;
  usernameImportError: string | null;

  // Import State (Installation-based)
  isImportingByInstallation: boolean;
  installationImportResponse: {
    status: string;
    message: string;
    import_all: boolean;
    repository_count: number | string;
  } | null;
  installationImportError: string | null;

  // Preview State
  isPreviewing: boolean;
  previewData: GitHubPreviewResponse | null;
  previewError: string | null;

  // Single Repository Import State
  isImportingSingle: boolean;
  singleImportResult: GitHubSingleImportResponse | null;
  singleImportError: string | null;

  // Batch Import State
  isImportingBatch: boolean;
  batchImportResult: GitHubBatchImportResponse | null;
  batchImportError: string | null;

  // Delete State
  isDeleting: boolean;
  deleteResult: GitHubDeleteResponse | null;
  deleteError: string | null;

  // Duplicate Check State
  isCheckingDuplicates: boolean;
  duplicateCheckResult: GitHubDuplicateCheckResponse | null;
  duplicateCheckError: string | null;

  // Installation Token State
  isLoadingInstallationToken: boolean;
  installationTokenData: GitHubInstallationTokenResponse | null;
  installationTokenError: string | null;

  // Actions
  validateGitHubUser: (username: string) => Promise<void>;
  listGitHubRepositories: (params: {
    username: string;
    page?: number;
    per_page?: number;
    sort?: "created" | "updated" | "pushed" | "full_name";
    direction?: "asc" | "desc";
  }) => Promise<void>;
  getInstallationRepositories: (params: {
    page?: number;
    per_page?: number;
  }) => Promise<void>;
  importByUsername: (request: GitHubImportRequest) => Promise<void>;
  importByInstallation: (
    request: GitHubInstallationImportRequest,
  ) => Promise<void>;
  previewImport: (request: GitHubImportRequest) => Promise<void>;
  importSingleRepository: (params: {
    repo_data: Record<string, any>;
    installation_id?: string;
    skip_duplicates?: boolean;
  }) => Promise<void>;
  importMultipleRepositories: (params: {
    repositories: Record<string, any>[];
    installation_id: string;
    skip_duplicates?: boolean;
    commit_batch_size?: number;
  }) => Promise<void>;
  deleteSingleRepository: (params: {
    repo_data: Record<string, any>;
    installation_id?: string;
  }) => Promise<void>;
  checkDuplicateProjects: (repo_data: Record<string, any>) => Promise<void>;
  getInstallationAccessToken: (installation_id: number) => Promise<void>;

  // Utility Actions
  resetUserValidation: () => void;
  resetRepositoriesList: () => void;
  resetInstallationRepos: () => void;
  resetImportState: () => void;
  resetPreviewState: () => void;
  resetDeleteState: () => void;
  resetDuplicateCheck: () => void;
  resetStore: () => void;
}

// ============ Initial State ============

const initialState = {
  isValidatingUser: false,
  userValidationResult: null,
  userValidationError: null,

  isLoadingRepositories: false,
  repositories: [],
  repositoriesPagination: null,
  repositoriesError: null,

  isLoadingInstallationRepos: false,
  installationRepositories: [],
  installationReposTotalCount: 0,
  installationReposPagination: null,
  installationReposError: null,

  isImportingByUsername: false,
  usernameImportResponse: null,
  usernameImportError: null,

  isImportingByInstallation: false,
  installationImportResponse: null,
  installationImportError: null,

  isPreviewing: false,
  previewData: null,
  previewError: null,

  isImportingSingle: false,
  singleImportResult: null,
  singleImportError: null,

  isImportingBatch: false,
  batchImportResult: null,
  batchImportError: null,

  isDeleting: false,
  deleteResult: null,
  deleteError: null,

  isCheckingDuplicates: false,
  duplicateCheckResult: null,
  duplicateCheckError: null,

  isLoadingInstallationToken: false,
  installationTokenData: null,
  installationTokenError: null,
};

// ============ Store Implementation ============

export const useGitHubIntegrationStore = create<GitHubIntegrationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Validate GitHub User
        validateGitHubUser: async (username: string) => {
          set({ isValidatingUser: true, userValidationError: null });

          try {
            const response = await api.get<GitHubUserValidationResponse>(
              `/github/validate-user/${encodeURIComponent(username)}`,
            );

            set({
              userValidationResult: response.data,
              isValidatingUser: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to validate GitHub user";

            set({
              userValidationError: errorMessage,
              isValidatingUser: false,
              userValidationResult: {
                exists: false,
                username,
                message: errorMessage,
              },
            });

            throw new Error(errorMessage);
          }
        },

        // List GitHub Repositories
        listGitHubRepositories: async (params) => {
          set({ isLoadingRepositories: true, repositoriesError: null });

          try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append("page", params.page.toString());
            if (params.per_page)
              queryParams.append("per_page", params.per_page.toString());
            if (params.sort) queryParams.append("sort", params.sort);
            if (params.direction)
              queryParams.append("direction", params.direction);

            const url = `/github/repositories/${encodeURIComponent(params.username)}?${queryParams.toString()}`;
            const response = await api.get<GitHubRepositoriesListResponse>(url);

            set({
              repositories: response.data.repositories,
              repositoriesPagination: {
                page: response.data.page,
                per_page: response.data.per_page,
                has_more: response.data.has_more,
              },
              isLoadingRepositories: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to fetch repositories";

            set({
              repositoriesError: errorMessage,
              isLoadingRepositories: false,
              repositories: [],
              repositoriesPagination: null,
            });

            throw new Error(errorMessage);
          }
        },

        // Get Installation Repositories
        getInstallationRepositories: async (params) => {
          set({
            isLoadingInstallationRepos: true,
            installationReposError: null,
          });

          try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append("page", params.page.toString());
            if (params.per_page)
              queryParams.append("per_page", params.per_page.toString());

            const url = `/github/installations/repositories?${queryParams.toString()}`;
            const response =
              await api.get<GitHubInstallationRepositoriesResponse>(url);

            set({
              installationRepositories: response.data.repositories,
              installationReposTotalCount: response.data.total_count,
              installationReposPagination: {
                page: response.data.page,
                per_page: response.data.per_page,
                has_more: response.data.has_more,
              },
              isLoadingInstallationRepos: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to fetch installation repositories";

            set({
              installationReposError: errorMessage,
              isLoadingInstallationRepos: false,
              installationRepositories: [],
            });

            throw new Error(errorMessage);
          }
        },

        // Import by Username
        importByUsername: async (request: GitHubImportRequest) => {
          set({ isImportingByUsername: true, usernameImportError: null });

          try {
            const response = await api.post<GitHubImportResponse>(
              "/github/import",
              request,
            );

            set({
              usernameImportResponse: response.data,
              isImportingByUsername: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to import GitHub projects";

            set({
              usernameImportError: errorMessage,
              isImportingByUsername: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Import by Installation
        importByInstallation: async (
          request: GitHubInstallationImportRequest,
        ) => {
          set({
            isImportingByInstallation: true,
            installationImportError: null,
          });

          try {
            const response = await api.post<{
              status: string;
              message: string;
              import_all: boolean;
              repository_count: number | string;
            }>("/github/installations/import", request);

            set({
              installationImportResponse: response.data,
              isImportingByInstallation: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to start GitHub import";

            set({
              installationImportError: errorMessage,
              isImportingByInstallation: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Preview Import
        previewImport: async (request: GitHubImportRequest) => {
          set({ isPreviewing: true, previewError: null });

          try {
            const response = await api.post<GitHubPreviewResponse>(
              "/github/import/preview",
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

        // Import Single Repository
        importSingleRepository: async (params) => {
          set({ isImportingSingle: true, singleImportError: null });

          try {
            const queryParams = new URLSearchParams();
            if (params.installation_id)
              queryParams.append("installation_id", params.installation_id);
            if (params.skip_duplicates !== undefined)
              queryParams.append(
                "skip_duplicates",
                params.skip_duplicates.toString(),
              );

            const url = `/github/repositories/import-single?${queryParams.toString()}`;
            const response = await api.post<GitHubSingleImportResponse>(
              url,
              params.repo_data,
            );

            set({
              singleImportResult: response.data,
              isImportingSingle: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to import repository";

            set({
              singleImportError: errorMessage,
              isImportingSingle: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Import Multiple Repositories
        importMultipleRepositories: async (params) => {
          set({ isImportingBatch: true, batchImportError: null });

          try {
            const queryParams = new URLSearchParams();
            queryParams.append("installation_id", params.installation_id);
            if (params.skip_duplicates !== undefined)
              queryParams.append(
                "skip_duplicates",
                params.skip_duplicates.toString(),
              );
            if (params.commit_batch_size)
              queryParams.append(
                "commit_batch_size",
                params.commit_batch_size.toString(),
              );

            const url = `/github/repositories/import-multiple?${queryParams.toString()}`;
            const response = await api.post<GitHubBatchImportResponse>(
              url,
              params.repositories,
            );

            set({
              batchImportResult: response.data,
              isImportingBatch: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to import repositories";

            set({
              batchImportError: errorMessage,
              isImportingBatch: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Delete Single Repository
        deleteSingleRepository: async (params) => {
          set({ isDeleting: true, deleteError: null });

          try {
            const queryParams = new URLSearchParams();
            if (params.installation_id)
              queryParams.append("installation_id", params.installation_id);

            const url = `/github/repositories/delete-single?${queryParams.toString()}`;
            const response = await api.delete<GitHubDeleteResponse>(url, {
              data: params.repo_data,
            });

            set({
              deleteResult: response.data,
              isDeleting: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to delete repository";

            set({
              deleteError: errorMessage,
              isDeleting: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Check Duplicate Projects
        checkDuplicateProjects: async (repo_data: Record<string, any>) => {
          set({ isCheckingDuplicates: true, duplicateCheckError: null });

          try {
            const response = await api.post<GitHubDuplicateCheckResponse>(
              "/github/projects/check-duplicates",
              repo_data,
            );

            set({
              duplicateCheckResult: response.data,
              isCheckingDuplicates: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to check duplicates";

            set({
              duplicateCheckError: errorMessage,
              isCheckingDuplicates: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Get Installation Access Token
        getInstallationAccessToken: async (installation_id: number) => {
          set({
            isLoadingInstallationToken: true,
            installationTokenError: null,
          });

          try {
            const response = await api.post<GitHubInstallationTokenResponse>(
              `/github/installations/${installation_id}/access-token`,
            );

            set({
              installationTokenData: response.data,
              isLoadingInstallationToken: false,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.detail ||
              error.message ||
              "Failed to get installation token";

            set({
              installationTokenError: errorMessage,
              isLoadingInstallationToken: false,
            });

            throw new Error(errorMessage);
          }
        },

        // Reset Actions
        resetUserValidation: () => {
          set({
            isValidatingUser: false,
            userValidationResult: null,
            userValidationError: null,
          });
        },

        resetRepositoriesList: () => {
          set({
            isLoadingRepositories: false,
            repositories: [],
            repositoriesPagination: null,
            repositoriesError: null,
          });
        },

        resetInstallationRepos: () => {
          set({
            isLoadingInstallationRepos: false,
            installationRepositories: [],
            installationReposTotalCount: 0,
            installationReposPagination: null,
            installationReposError: null,
          });
        },

        resetImportState: () => {
          set({
            isImportingByUsername: false,
            usernameImportResponse: null,
            usernameImportError: null,
            isImportingByInstallation: false,
            installationImportResponse: null,
            installationImportError: null,
            isImportingSingle: false,
            singleImportResult: null,
            singleImportError: null,
            isImportingBatch: false,
            batchImportResult: null,
            batchImportError: null,
          });
        },

        resetPreviewState: () => {
          set({
            isPreviewing: false,
            previewData: null,
            previewError: null,
          });
        },

        resetDeleteState: () => {
          set({
            isDeleting: false,
            deleteResult: null,
            deleteError: null,
          });
        },

        resetDuplicateCheck: () => {
          set({
            isCheckingDuplicates: false,
            duplicateCheckResult: null,
            duplicateCheckError: null,
          });
        },

        resetStore: () => {
          set(initialState);
        },
      }),
      {
        name: "github-integration-store",
        partialize: (state) => ({
          // Only persist these fields
          userValidationResult: state.userValidationResult,
          repositoriesPagination: state.repositoriesPagination,
        }),
      },
    ),
    { name: "GitHubIntegrationStore" },
  ),
);

// ============ Selector Hooks ============

export const useGitHubUserValidation = () => {
  const store = useGitHubIntegrationStore();
  return {
    isValidatingUser: store.isValidatingUser,
    userValidationResult: store.userValidationResult,
    userValidationError: store.userValidationError,
    validateGitHubUser: store.validateGitHubUser,
    resetUserValidation: store.resetUserValidation,
  };
};

export const useGitHubRepositories = () => {
  const store = useGitHubIntegrationStore();
  return {
    isLoadingRepositories: store.isLoadingRepositories,
    repositories: store.repositories,
    repositoriesPagination: store.repositoriesPagination,
    repositoriesError: store.repositoriesError,
    listGitHubRepositories: store.listGitHubRepositories,
    resetRepositoriesList: store.resetRepositoriesList,
  };
};

export const useGitHubInstallationRepos = () => {
  const store = useGitHubIntegrationStore();
  return {
    isLoadingInstallationRepos: store.isLoadingInstallationRepos,
    installationRepositories: store.installationRepositories,
    installationReposTotalCount: store.installationReposTotalCount,
    installationReposPagination: store.installationReposPagination,
    installationReposError: store.installationReposError,
    getInstallationRepositories: store.getInstallationRepositories,
    resetInstallationRepos: store.resetInstallationRepos,
  };
};

export const useGitHubImport = () => {
  const store = useGitHubIntegrationStore();
  return {
    isImportingByUsername: store.isImportingByUsername,
    usernameImportResponse: store.usernameImportResponse,
    usernameImportError: store.usernameImportError,
    isImportingByInstallation: store.isImportingByInstallation,
    installationImportResponse: store.installationImportResponse,
    installationImportError: store.installationImportError,
    importByUsername: store.importByUsername,
    importByInstallation: store.importByInstallation,
    resetImportState: store.resetImportState,
  };
};

export const useGitHubPreview = () => {
  const store = useGitHubIntegrationStore();
  return {
    isPreviewing: store.isPreviewing,
    previewData: store.previewData,
    previewError: store.previewError,
    previewImport: store.previewImport,
    resetPreviewState: store.resetPreviewState,
  };
};

export const useGitHubSingleImport = () => {
  const store = useGitHubIntegrationStore();
  return {
    isImportingSingle: store.isImportingSingle,
    singleImportResult: store.singleImportResult,
    singleImportError: store.singleImportError,
    importSingleRepository: store.importSingleRepository,
  };
};

export const useGitHubBatchImport = () => {
  const store = useGitHubIntegrationStore();
  return {
    isImportingBatch: store.isImportingBatch,
    batchImportResult: store.batchImportResult,
    batchImportError: store.batchImportError,
    importMultipleRepositories: store.importMultipleRepositories,
  };
};

export const useGitHubDelete = () => {
  const store = useGitHubIntegrationStore();
  return {
    isDeleting: store.isDeleting,
    deleteResult: store.deleteResult,
    deleteError: store.deleteError,
    deleteSingleRepository: store.deleteSingleRepository,
    resetDeleteState: store.resetDeleteState,
  };
};

export const useGitHubDuplicateCheck = () => {
  const store = useGitHubIntegrationStore();
  return {
    isCheckingDuplicates: store.isCheckingDuplicates,
    duplicateCheckResult: store.duplicateCheckResult,
    duplicateCheckError: store.duplicateCheckError,
    checkDuplicateProjects: store.checkDuplicateProjects,
    resetDuplicateCheck: store.resetDuplicateCheck,
  };
};

export const useGitHubInstallationToken = () => {
  const store = useGitHubIntegrationStore();
  return {
    isLoadingInstallationToken: store.isLoadingInstallationToken,
    installationTokenData: store.installationTokenData,
    installationTokenError: store.installationTokenError,
    getInstallationAccessToken: store.getInstallationAccessToken,
  };
};
