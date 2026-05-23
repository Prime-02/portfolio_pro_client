// src/stores/useUserSettings.ts

import { create } from "zustand";
import { api, isAuthenticated } from "@/lib/client/api";
import { systemLanguages } from "@/lib/utilities/indices/DropDownItems";
import {
  findMatch,
  isValidHexColorStrict,
} from "@/lib/utilities/syncFunctions/syncs";
import {
  Accent,
  LanguageProps,
  Loader,
  Theme,
  ThemeVariant,
} from "@/src/app/components/types and interfaces/loaderTypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserSettingsBase {
  language: string | null;
  theme: string | null;
  primary_theme: string | null;
  secondary_theme: string | null;
  accent: string | null;
  primary_theme_dark: string | null;
  secondary_theme_dark: string | null;
  loader: string | null;
}

export interface UserSettings extends UserSettingsBase {
  owner_id: string | null;
}

export interface UserProfileRequest {
  user_id: string | null;
  github_username: string | null;
  bio: string | null;
  profession: string | null;
  job_title: string | null;
  years_of_experience: number | null;
  website_url: string | null;
  location: string | null;
  open_to_work: boolean | null;
  availability: string | null;
  profile_picture: string | null;
  profile_picture_id: string | null;
}

export interface UserUpdateRequest {
  id: string | null;
  username: string | null;
  firstname: string | null;
  middlename: string | null;
  lastname: string | null;
  email: string | null;
  profile_picture: string | null;
  profile_picture_id: string | null;
  phone_number: string | null;
  is_active: boolean | null;
  role: string | null;
}

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
  role: string;
}

export interface UpdateUserInfoPayload {
  username?: string | null;
  firstname?: string | null;
  middlename?: string | null;
  lastname?: string | null;
  email?: string | null;
  phone_number?: string | null;
  profile_picture?: File | null;
  [key: string]: unknown;
}

export interface UpdateProfilePayload {
  github_username?: string | null;
  bio?: string | null;
  profession?: string | null;
  job_title?: string | null;
  years_of_experience?: number | null;
  website_url?: string | null;
  location?: string | null;
  open_to_work?: boolean | null;
  availability?: string | null;
  profile_picture?: File | null;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface UserSettingsState {
  // ── Persisted Data ─────────────────────────────────────────────────────
  settings: UserSettings | null;
  profile: UserProfileRequest | null;
  userInfo: UserUpdateRequest | null;
  publicProfile: UserProfileRequest | null;
  publicUserInfo: UserResponse | null;
  publicSettings: UserSettings | null;

  // ── Loading / Error ────────────────────────────────────────────────────
  isLoading: boolean;
  error: string | null;

  // ── API Actions ────────────────────────────────────────────────────────
  fetchSettings: () => Promise<UserSettings>;
  updateSettings: (
    data: Partial<UserSettingsBase>,
  ) => Promise<UserSettingsBase>;
  fetchUserInfo: () => Promise<UserUpdateRequest | null>;
  updateUserInfo: (
    payload: UpdateUserInfoPayload,
  ) => Promise<UserUpdateRequest>;
  fetchProfile: () => Promise<UserProfileRequest>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<UserProfileRequest>;
  fetchPublicProfile: (username: string) => Promise<UserProfileRequest>;
  fetchPublicUserInfo: (username: string) => Promise<UserResponse>;
  fetchPublicSettings: (username: string) => Promise<UserSettings>;

  // ── Derived State Getters ──────────────────────────────────────────────
  getLightTheme: (source?: UserSettings | null) => Theme;
  getDarkTheme: (source?: UserSettings | null) => Theme;
  getAccentColor: (source?: UserSettings | null) => Accent;
  getLanguage: (source?: UserSettings | null) => LanguageProps;
  getThemeVariant: (source?: UserSettings | null) => ThemeVariant;
  getLoader: (source?: UserSettings | null) => Loader;

  // ── Helpers ────────────────────────────────────────────────────────────
  clearError: () => void;
  reset: () => void;
  clearPublicData: () => void;
}

// ── Default fallbacks ───────────────────────────────────────────────────────
const defaultLightTheme: Theme = {
  background: "#ffffff",
  foreground: "#171717",
};
const defaultDarkTheme: Theme = {
  background: "#0a0a0a",
  foreground: "#ededed",
};
const defaultAccent: Accent = { color: "#737373" };
const defaultLanguage: LanguageProps = { name: "English", code: "en" };
const defaultLoader: Loader = "spin-loader";

// ── Helper: resolve loader string ───────────────────────────────────────────
const resolveLoader = (raw: string | null | undefined): Loader =>
  raw && typeof raw === "string" ? (raw as Loader) : defaultLoader;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUserSettings = create<UserSettingsState>()((set, get) => ({
  // ── Initial State ──────────────────────────────────────────────────────
  settings: null,
  profile: null,
  userInfo: null,
  publicProfile: null,
  publicUserInfo: null,
  publicSettings: null,
  isLoading: false,
  error: null,

  // ═══════════════════════════════════════════════════════════════════════
  // API Actions
  // ═══════════════════════════════════════════════════════════════════════

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<UserSettings>("settings/");
      set({ settings: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch settings";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  updateSettings: async (data: Partial<UserSettingsBase>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<UserSettingsBase>("settings/", data);
      const current = get().settings;
      const merged: UserSettings = current
        ? { ...current, ...response.data }
        : (response.data as UserSettings);
      set({ settings: merged, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update settings";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchUserInfo: async () => {
    if (!isAuthenticated()) {
      set({ isLoading: false, error: null });
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<UserUpdateRequest>("settings/info");
      set({ userInfo: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch user info";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  updateUserInfo: async (payload: UpdateUserInfoPayload) => {
    set({ isLoading: true, error: null });
    try {
      const { profile_picture, ...rest } = payload;
      const formData = new FormData();
      formData.append("user_data", JSON.stringify(rest));
      if (profile_picture) formData.append("profile_picture", profile_picture);
      const response = await api.put<UserUpdateRequest>(
        "settings/info",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      set({ userInfo: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update user info";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<UserProfileRequest>("settings/profile");
      set({ profile: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch profile";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    set({ isLoading: true, error: null });
    try {
      const { profile_picture, ...rest } = payload;
      const formData = new FormData();
      formData.append("profile_data", JSON.stringify(rest));
      if (profile_picture) formData.append("profile_picture", profile_picture);
      const response = await api.put<UserProfileRequest>(
        "settings/profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      set({ profile: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchPublicProfile: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<UserProfileRequest>(
        `settings/profile/${username}`,
      );
      set({ publicProfile: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch public profile";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchPublicUserInfo: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<UserResponse>(`settings/info/${username}`);
      set({ publicUserInfo: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch public user info";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  fetchPublicSettings: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<UserSettings>(`settings/${username}`);
      set({ publicSettings: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch public settings";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Derived State Getters — read from settings (or publicSettings) directly
  // ═══════════════════════════════════════════════════════════════════════

  getLightTheme: (source?: UserSettings | null) => {
    const s = source !== undefined ? source : get().settings;
    const bg = s?.primary_theme;
    const fg = s?.secondary_theme;
    return {
      background: isValidHexColorStrict(bg || "")
        ? bg!
        : defaultLightTheme.background,
      foreground: isValidHexColorStrict(fg || "")
        ? fg!
        : defaultLightTheme.foreground,
    };
  },

  getDarkTheme: (source?: UserSettings | null) => {
    const s = source !== undefined ? source : get().settings;
    const bg = s?.primary_theme_dark;
    const fg = s?.secondary_theme_dark;
    return {
      background: isValidHexColorStrict(bg || "")
        ? bg!
        : defaultDarkTheme.background,
      foreground: isValidHexColorStrict(fg || "")
        ? fg!
        : defaultDarkTheme.foreground,
    };
  },

  getAccentColor: (source?: UserSettings | null) => {
    const s = source !== undefined ? source : get().settings;
    const accent = s?.accent;
    return {
      color: isValidHexColorStrict(accent || "")
        ? accent!
        : defaultAccent.color,
    };
  },

  getThemeVariant: (source?: UserSettings | null) => {
    const s = source !== undefined ? source : get().settings;
    const theme = s?.theme;
    if (theme && ["light", "dark", "system"].includes(theme))
      return theme as ThemeVariant;
    return "system";
  },

  getLoader: (source?: UserSettings | null) => {
    const s = source !== undefined ? source : get().settings;
    return resolveLoader(s?.loader);
  },

  getLanguage: (source?: UserSettings | null) => {
    const s = source !== undefined ? source : get().settings;
    const langCode = s?.language;
    return (
      findMatch(langCode || "en", systemLanguages, ["code"], true) ||
      defaultLanguage
    );
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════════════════════════

  clearError: () => set({ error: null }),

  clearPublicData: () =>
    set({ publicProfile: null, publicUserInfo: null, publicSettings: null }),

  reset: () =>
    set({
      settings: null,
      profile: null,
      userInfo: null,
      publicProfile: null,
      publicUserInfo: null,
      publicSettings: null,
      isLoading: false,
      error: null,
    }),
}));
