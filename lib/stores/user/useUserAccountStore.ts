import { create } from "zustand";
import { api } from "@/lib/client/api";
import type { AxiosError } from "axios";
import { SubscriptionTier } from "../billing/payment-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface UserResponse {
  id: string;
  username: string | null;
  email: string;
  firstname: string | null;
  middlename: string | null;
  lastname: string | null;
  profile_picture: string | null;
  profile_picture_id: string | null;
  phone_number: string | null;
  is_active: boolean;
  allow_linkedin_post_actions: boolean;
  is_superuser: boolean;
  role: string;
  subscription_tier: SubscriptionTier | null;
  subscription_expires: string | null;
}

export interface AdminUserListResponse {
  items: UserResponse[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
}

export interface AdminUserFilters {
  page?: number;
  size?: number;
  is_active?: boolean;
  is_superuser?: boolean;
  role?: string;
  search?: string;
}

// ---------------------------------------------------------------------------
// Linked Platforms Types
// ---------------------------------------------------------------------------

export interface LinkedPlatformsResponse {
  user_id: string;
  linked_platforms: Record<string, Record<string, any>>;
  total_platforms: number;
  platforms_checked: string[];
}

export interface SpecificPlatformResponse {
  user_id: string;
  platform: string;
  linked: boolean;
  data: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Request payload types
// ---------------------------------------------------------------------------

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

interface RequestPasswordResetPayload {
  email: string;
}

interface ResetPasswordPayload {
  reset_token: string;
  new_password: string;
}

interface DeleteAccountPayload {
  password: string;
}

interface AdminUpdateRolePayload {
  role: string;
  is_superuser?: boolean;
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface UserAccountState {
  // Admin user list
  adminUsers: UserResponse[];
  adminUsersMeta: Omit<AdminUserListResponse, "items"> | null;

  // Linked platforms
  linkedPlatforms: LinkedPlatformsResponse | null;
  specificPlatform: SpecificPlatformResponse | null;

  // Loading flags — one per action
  isChangingPassword: boolean;
  isRequestingReset: boolean;
  isResettingPassword: boolean;
  isDeactivating: boolean;
  isReactivating: boolean;
  isTogglingLinkedInActions: boolean;
  isDeleting: boolean;
  isLoadingAdminUsers: boolean;
  isUpdatingRole: boolean;
  isAdminDeactivating: boolean;
  isAdminReactivating: boolean;
  isAdminTogglingLinkedInActions: boolean;
  isAdminDeleting: boolean;
  isLoadingLinkedPlatforms: boolean;
  isLoadingSpecificPlatform: boolean;

  // Error — one per action (null = no error)
  changePasswordError: string | null;
  requestResetError: string | null;
  resetPasswordError: string | null;
  deactivateError: string | null;
  reactivateError: string | null;
  toggleLinkedInActionsError: string | null;
  deleteError: string | null;
  adminUsersError: string | null;
  updateRoleError: string | null;
  adminDeactivateError: string | null;
  adminReactivateError: string | null;
  adminToggleLinkedInActionsError: string | null;
  adminDeleteError: string | null;
  linkedPlatformsError: string | null;
  specificPlatformError: string | null;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface UserAccountActions {
  // Account management
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>;
  requestPasswordReset: (
    payload: RequestPasswordResetPayload,
  ) => Promise<boolean>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<boolean>;
  deactivateAccount: () => Promise<boolean>;
  reactivateAccount: () => Promise<boolean>;
  toggleLinkedInActions: () => Promise<boolean>;
  deleteAccount: (payload: DeleteAccountPayload) => Promise<boolean>;

  // Admin
  fetchAdminUsers: (filters?: AdminUserFilters) => Promise<void>;
  adminUpdateUserRole: (
    userId: string,
    payload: AdminUpdateRolePayload,
  ) => Promise<boolean>;
  adminDeactivateUser: (userId: string) => Promise<boolean>;
  adminReactivateUser: (userId: string) => Promise<boolean>;
  adminToggleLinkedInActions: (userId: string) => Promise<boolean>;
  adminDeleteUser: (userId: string) => Promise<boolean>;

  // Linked platforms
  fetchLinkedPlatforms: () => Promise<void>;
  fetchSpecificPlatform: (platformName: string) => Promise<void>;

  // Utilities
  clearErrors: () => void;
  clearPlatformData: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: UserAccountState = {
  adminUsers: [],
  adminUsersMeta: null,

  linkedPlatforms: null,
  specificPlatform: null,

  isChangingPassword: false,
  isRequestingReset: false,
  isResettingPassword: false,
  isDeactivating: false,
  isReactivating: false,
  isTogglingLinkedInActions: false,
  isDeleting: false,
  isLoadingAdminUsers: false,
  isUpdatingRole: false,
  isAdminDeactivating: false,
  isAdminReactivating: false,
  isAdminTogglingLinkedInActions: false,
  isAdminDeleting: false,
  isLoadingLinkedPlatforms: false,
  isLoadingSpecificPlatform: false,

  changePasswordError: null,
  requestResetError: null,
  resetPasswordError: null,
  deactivateError: null,
  reactivateError: null,
  toggleLinkedInActionsError: null,
  deleteError: null,
  adminUsersError: null,
  updateRoleError: null,
  adminDeactivateError: null,
  adminReactivateError: null,
  adminToggleLinkedInActionsError: null,
  adminDeleteError: null,
  linkedPlatformsError: null,
  specificPlatformError: null,
};

// ---------------------------------------------------------------------------
// Helper — extract a readable message from an Axios error
// ---------------------------------------------------------------------------

function extractErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{
    detail?: string | { msg: string }[];
  }>;
  const detail = axiosError.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
  return "An unexpected error occurred. Please try again.";
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUserAccountStore = create<
  UserAccountState & UserAccountActions
>((set) => ({
  ...initialState,

  // ── Change password ──────────────────────────────────────────────────────

  changePassword: async (payload) => {
    set({ isChangingPassword: true, changePasswordError: null });
    try {
      await api.patch("/me/change-password", payload);
      return true;
    } catch (error) {
      set({ changePasswordError: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isChangingPassword: false });
    }
  },

  // ── Request password reset ───────────────────────────────────────────────

  requestPasswordReset: async (payload) => {
    set({ isRequestingReset: true, requestResetError: null });
    try {
      await api.post("/password-reset/request", payload);
      return true;
    } catch (error) {
      set({ requestResetError: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isRequestingReset: false });
    }
  },

  // ── Confirm password reset ───────────────────────────────────────────────

  resetPassword: async (payload) => {
    set({ isResettingPassword: true, resetPasswordError: null });
    try {
      await api.post("/password-reset/confirm", payload);
      return true;
    } catch (error) {
      set({ resetPasswordError: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  // ── Deactivate own account ───────────────────────────────────────────────

  deactivateAccount: async () => {
    set({ isDeactivating: true, deactivateError: null });
    try {
      await api.patch("/me/deactivate");
      return true;
    } catch (error) {
      set({ deactivateError: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isDeactivating: false });
    }
  },

  // ── Reactivate own account ───────────────────────────────────────────────

  reactivateAccount: async () => {
    set({ isReactivating: true, reactivateError: null });
    try {
      await api.patch("/me/reactivate");
      return true;
    } catch (error) {
      set({ reactivateError: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isReactivating: false });
    }
  },

  // ── Toggle LinkedIn post actions (own account) ───────────────────────────

  toggleLinkedInActions: async () => {
    set({
      isTogglingLinkedInActions: true,
      toggleLinkedInActionsError: null,
    });
    try {
      const { data } = await api.patch<UserResponse>(
        "/me/toggle-linkedin-actions",
      );
      // Update the linkedin post actions status from the response
      set((state) => ({
        adminUsers: state.adminUsers.map((u) =>
          u.id === data.id
            ? {
                ...u,
                allow_linkedin_post_actions: data.allow_linkedin_post_actions,
              }
            : u,
        ),
      }));
      return true;
    } catch (error) {
      set({
        toggleLinkedInActionsError: extractErrorMessage(error),
      });
      return false;
    } finally {
      set({ isTogglingLinkedInActions: false });
    }
  },

  // ── Delete own account ───────────────────────────────────────────────────

  deleteAccount: async (payload) => {
    set({ isDeleting: true, deleteError: null });
    try {
      await api.delete("/me", { data: payload });
      return true;
    } catch (error) {
      set({ deleteError: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isDeleting: false });
    }
  },

  // ── Fetch all linked platforms ───────────────────────────────────────────

  fetchLinkedPlatforms: async () => {
    set({ isLoadingLinkedPlatforms: true, linkedPlatformsError: null });
    try {
      const { data } = await api.get<LinkedPlatformsResponse>(
        "/platforms/linked-platforms",
      );
      set({ linkedPlatforms: data });
    } catch (error) {
      set({ linkedPlatformsError: extractErrorMessage(error) });
    } finally {
      set({ isLoadingLinkedPlatforms: false });
    }
  },

  // ── Fetch specific linked platform ───────────────────────────────────────

  fetchSpecificPlatform: async (platformName: string) => {
    set({
      isLoadingSpecificPlatform: true,
      specificPlatformError: null,
      specificPlatform: null,
    });
    try {
      const { data } = await api.get<SpecificPlatformResponse>(
        `/platforms/linked-platforms/${platformName}`,
      );
      set({ specificPlatform: data });
    } catch (error) {
      set({ specificPlatformError: extractErrorMessage(error) });
    } finally {
      set({ isLoadingSpecificPlatform: false });
    }
  },

  // ── Admin: list users ────────────────────────────────────────────────────

  fetchAdminUsers: async (filters = {}) => {
    set({ isLoadingAdminUsers: true, adminUsersError: null });
    try {
      const { data } = await api.get<AdminUserListResponse>("/admin/users", {
        params: filters,
      });
      const { items, ...meta } = data;
      set({ adminUsers: items, adminUsersMeta: meta });
    } catch (error) {
      set({ adminUsersError: extractErrorMessage(error) });
    } finally {
      set({ isLoadingAdminUsers: false });
    }
  },

  // ── Admin: update user role ──────────────────────────────────────────────

  adminUpdateUserRole: async (userId, payload) => {
    set({ isUpdatingRole: true, updateRoleError: null });
    try {
      const { data } = await api.patch<UserResponse>(
        `/admin/users/${userId}/role`,
        payload,
      );
      // Reflect the update in the local admin user list if present
      set((state) => ({
        adminUsers: state.adminUsers.map((u) =>
          u.id === userId ? { ...u, ...data } : u,
        ),
      }));
      return true;
    } catch (error) {
      set({ updateRoleError: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isUpdatingRole: false });
    }
  },

  // ── Admin: deactivate user ───────────────────────────────────────────────

  adminDeactivateUser: async (userId) => {
    set({ isAdminDeactivating: true, adminDeactivateError: null });
    try {
      await api.patch(`/admin/users/${userId}/deactivate`);
      set((state) => ({
        adminUsers: state.adminUsers.map((u) =>
          u.id === userId ? { ...u, is_active: false } : u,
        ),
      }));
      return true;
    } catch (error) {
      set({ adminDeactivateError: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isAdminDeactivating: false });
    }
  },

  // ── Admin: reactivate user ───────────────────────────────────────────────

  adminReactivateUser: async (userId) => {
    set({ isAdminReactivating: true, adminReactivateError: null });
    try {
      await api.patch(`/admin/users/${userId}/reactivate`);
      set((state) => ({
        adminUsers: state.adminUsers.map((u) =>
          u.id === userId ? { ...u, is_active: true } : u,
        ),
      }));
      return true;
    } catch (error) {
      set({ adminReactivateError: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isAdminReactivating: false });
    }
  },

  // ── Admin: toggle LinkedIn post actions ─────────────────────────────────

  adminToggleLinkedInActions: async (userId) => {
    set({
      isAdminTogglingLinkedInActions: true,
      adminToggleLinkedInActionsError: null,
    });
    try {
      const { data } = await api.patch<UserResponse>(
        `/admin/users/${userId}/toggle-linkedin-actions`,
      );
      // Update the local admin user list with the new linkedin status
      set((state) => ({
        adminUsers: state.adminUsers.map((u) =>
          u.id === userId
            ? {
                ...u,
                allow_linkedin_post_actions: data.allow_linkedin_post_actions,
              }
            : u,
        ),
      }));
      return true;
    } catch (error) {
      set({
        adminToggleLinkedInActionsError: extractErrorMessage(error),
      });
      return false;
    } finally {
      set({ isAdminTogglingLinkedInActions: false });
    }
  },

  // ── Admin: delete user ───────────────────────────────────────────────────

  adminDeleteUser: async (userId) => {
    set({ isAdminDeleting: true, adminDeleteError: null });
    try {
      await api.delete(`/admin/users/${userId}`);
      set((state) => ({
        adminUsers: state.adminUsers.filter((u) => u.id !== userId),
        adminUsersMeta: state.adminUsersMeta
          ? { ...state.adminUsersMeta, total: state.adminUsersMeta.total - 1 }
          : null,
      }));
      return true;
    } catch (error) {
      set({ adminDeleteError: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isAdminDeleting: false });
    }
  },

  // ── Clear all errors ─────────────────────────────────────────────────────

  clearErrors: () =>
    set({
      changePasswordError: null,
      requestResetError: null,
      resetPasswordError: null,
      deactivateError: null,
      reactivateError: null,
      toggleLinkedInActionsError: null,
      deleteError: null,
      adminUsersError: null,
      updateRoleError: null,
      adminDeactivateError: null,
      adminReactivateError: null,
      adminToggleLinkedInActionsError: null,
      adminDeleteError: null,
      linkedPlatformsError: null,
      specificPlatformError: null,
    }),

  // ── Clear platform data ──────────────────────────────────────────────────

  clearPlatformData: () =>
    set({
      linkedPlatforms: null,
      specificPlatform: null,
      linkedPlatformsError: null,
      specificPlatformError: null,
    }),
}));
