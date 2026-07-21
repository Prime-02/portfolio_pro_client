// src/stores/useAuthStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, tokenStore } from "@/lib/client/api";
import { PathUtil } from "@/lib/utilities/syncFunctions/syncs";
import { useSessionsStore } from "./useSessionsStore";
import { useCertifications } from "../certifications/useCertifications";
import { useEducation } from "../education/useEducation";
import { useExperiencesStore } from "../experiences/useExperience";
import { useSkills } from "../skills/useSkills";
import { useSocialLinks } from "../social_links/useSocialLinks";
import { useTestimonialsStore } from "../testimonials/useTestimonial";
import { useUserSettings } from "./useUserSettings";
import { UserResponse } from "./useUserAccountStore";

export const logoutAll = async (revokeSession: boolean = true) => {
  useCertifications.getState().reset();
  useEducation.getState().reset();
  useExperiencesStore.getState().reset();
  useSkills.getState().reset();
  useSocialLinks.getState().reset();
  useTestimonialsStore.getState().reset();
  useUserSettings.getState().reset();
  useUserSettings.getState().reset();
  useSessionsStore.getState().reset();

  if (revokeSession) await useSessionsStore.getState().revokeAllSessions();
};

// ---------------------------------------------------------------------------
// Types — derived from auth.py responses and schemas.py
// ---------------------------------------------------------------------------

export interface SessionData {
  id: string;
  session_token: string;
  refresh_token: string;
  expires_at: string; // ISO datetime
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}

export interface LoginResponse {
  user: UserResponse;
  session: SessionData;
  message: string;
}

export interface DBUser {
  id: string;
  email: string | null;
  username: string | null;
  is_superuser: boolean;
  is_active: boolean;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserDevicesRequest {
  device_name: string | null;
  device_type: string | null;
  last_used: string | null;
  user_id: string | null;
}

export interface AuthTokens {
  session_token: string;
  refresh_token: string;
  expires_at: string;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface AuthState {
  // Data
  user: UserResponse | null;
  session: SessionData | null;
  isAuthenticated: boolean;

  // Loading / error state
  isLoading: boolean;
  error: string | null;

  // Actions — mirroring auth.py endpoints
  login: (email: string, password: string) => Promise<LoginResponse>;
  signup: (payload: SignupPayload) => Promise<DBUser>;
  verifyEmail: (email: string) => Promise<{ message: string }>;
  forgottenPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (
    newPassword: string,
    token: string,
  ) => Promise<{ message: string }>;
  registerDevice: (
    device: Omit<UserDevicesRequest, "user_id" | "last_used">,
  ) => Promise<UserDevicesRequest>;
  logout: (revokeSession?: boolean) => Promise<void>;
  refreshSession: () => Promise<void>;

  // Helpers
  setUser: (user: UserResponse | null) => void;
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Input payloads
// ---------------------------------------------------------------------------

export interface SignupPayload {
  password: string;
  code: string;
  first_name?: string | null;
  last_name?: string | null;
  profile_picture?: string | null;
  profile_picture_id?: string | null;
  id?: string | null;
  image_url?: string | null;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Defaults
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ------------------------------------------------------------------
      // Login — POST /api/v1/auth/login
      // ------------------------------------------------------------------
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const formData = new FormData();
          formData.append("email", email);
          formData.append("password", password);

          const response = await api.post<LoginResponse>(
            "auth/login",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          set({
            user: response.data.user,
            session: response.data.session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return response.data;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      // ------------------------------------------------------------------
      // Signup — POST /api/v1/auth/signup
      // ------------------------------------------------------------------
      signup: async (payload: SignupPayload) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<DBUser>("auth/signup", payload);

          set({ isLoading: false, error: null });
          return response.data;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Signup failed";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      // ------------------------------------------------------------------
      // Verify Email — POST /api/v1/auth/verify-email
      // ------------------------------------------------------------------
      verifyEmail: async (email: string) => {
        set({ isLoading: true, error: null });

        const constructedParameter = PathUtil.buildUrlWithQuery(
          `/auth/verify-email`,
          {
            email: email,
          },
        ).slice(1);

        try {
          const response = await api.post<{ message: string }>(
            constructedParameter,
          );

          set({ isLoading: false, error: null });
          return response.data;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Email verification failed";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      // ------------------------------------------------------------------
      // Forgotten Password — POST /api/v1/auth/forgotten-password
      // ------------------------------------------------------------------
      forgottenPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<{ message: string }>(
            "auth/forgotten-password",
            { email },
          );

          set({ isLoading: false, error: null });
          return response.data;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Forgotten password request failed";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      // ------------------------------------------------------------------
      // Reset Password — POST /api/v1/auth/reset-password
      // Requires existing auth session (current_user dependency)
      // ------------------------------------------------------------------
      resetPassword: async (newPassword: string, token: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<{ message: string }>(
            "auth/reset-password",
            {
              new_password: newPassword,
              token: token, // Add token if provided
            },
          );

          set({ isLoading: false, error: null });
          return response.data;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Password reset failed";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      // ------------------------------------------------------------------
      // Register Device — POST /api/v1/auth/register-device
      // ------------------------------------------------------------------
      registerDevice: async (
        device: Omit<UserDevicesRequest, "user_id" | "last_used">,
      ) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<UserDevicesRequest>(
            "auth/register-device",
            device,
          );

          set({ isLoading: false, error: null });
          return response.data;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Device registration failed";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      // ------------------------------------------------------------------
      // Logout
      // ------------------------------------------------------------------
      logout: async (revokeSession: boolean = true) => {
        await logoutAll(revokeSession);
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          error: null,
        });
        tokenStore.clear();
      },

      // ------------------------------------------------------------------
      // Refresh session manually if needed
      // ------------------------------------------------------------------
      refreshSession: async () => {
        const currentSession = get().session;
        if (!currentSession) return;

        set({ isLoading: true, error: null });

        try {
          // The api client already handles refresh via its interceptor.
          // Call a lightweight authenticated endpoint to trigger refresh if needed
          const response = await api.get<UserResponse>("auth/me");

          // Update session with new tokens from tokenStore
          const sessionToken = tokenStore.getSessionToken();
          const refreshToken = tokenStore.getRefreshToken();
          const expiresAt = tokenStore.getExpiresAt();

          if (sessionToken && refreshToken && expiresAt) {
            set({
              user: response.data,
              session: {
                ...currentSession,
                session_token: sessionToken,
                refresh_token: refreshToken,
                expires_at: expiresAt.toISOString(),
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch {
          // Refresh failed — user will need to log in again
          set({
            isLoading: false,
            error: "Session expired. Please log in again.",
          });
        }
      },

      // ------------------------------------------------------------------
      // Manual setter helpers
      // ------------------------------------------------------------------
      setUser: (user: UserResponse | null) => {
        set({ user, isAuthenticated: !!user });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
