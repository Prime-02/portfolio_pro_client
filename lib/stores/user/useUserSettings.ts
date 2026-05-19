// src/stores/useUserSettings.ts

import { create } from "zustand";
import { api, isAuthenticated } from "@/lib/client/api";
import { systemLanguages } from "@/lib/utilities/indices/DropDownItems";
import {
  findMatch,
  isValidHexColorStrict,
} from "@/lib/utilities/syncFunctions/syncs";
import {
  ProfileSettings,
  defaultSettings,
} from "@/src/app/components/theme/ThemeContext ";
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
  layout_style: ProfileSettings | Record<string, unknown> | string | null;
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

  // ── Draft State (unsaved changes) ──────────────────────────────────────
  draftSettings: Partial<UserSettingsBase> | null;
  savedSnapshot: Partial<UserSettingsBase> | null;

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

  // ── Draft Management ───────────────────────────────────────────────────
  setDraftField: <K extends keyof UserSettingsBase>(
    field: K,
    value: UserSettingsBase[K],
  ) => void;
  setDraftSettings: (draft: Partial<UserSettingsBase>) => void;
  resetDraft: () => void;

  // In UserSettingsState interface:
  getLightTheme: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => Theme;
  getDarkTheme: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => Theme;
  getAccentColor: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => Accent;
  getLanguage: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => LanguageProps;
  getLayoutSettings: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => ProfileSettings;
  getThemeVariant: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => ThemeVariant;
  getLoader: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => Loader;
  hasUnsavedChanges: (draft?: Partial<UserSettingsBase> | null) => boolean;
  getActiveSettings: () => Partial<UserSettingsBase>;
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
const defaultAccent: Accent = { color: "#05df72" };
const defaultLanguage: LanguageProps = { name: "English", code: "en" };
const defaultLoader: Loader = "spin-loader";

// ── Helper: extract active values (draft overrides persisted) ───────────────
const getActiveValue = <T>(
  draft: Partial<UserSettingsBase> | null,
  persisted: UserSettings | null,
  field: keyof UserSettingsBase,
  fallback: T,
): T => {
  if (
    draft &&
    field in draft &&
    draft[field] !== null &&
    draft[field] !== undefined
  ) {
    return draft[field] as unknown as T;
  }
  if (
    persisted &&
    field in persisted &&
    persisted[field] !== null &&
    persisted[field] !== undefined
  ) {
    return persisted[field] as unknown as T;
  }
  return fallback;
};

// ── Helper: parse layout_style safely ───────────────────────────────────────
const parseLayoutStyle = (
  raw: ProfileSettings | Record<string, unknown> | string | null | undefined,
): ProfileSettings => {
  if (!raw) return defaultSettings;
  if (typeof raw === "object" && "layout" in raw) {
    return Object.assign({}, defaultSettings, raw as ProfileSettings);
  }
  if (typeof raw === "string") {
    try {
      return Object.assign({}, defaultSettings, JSON.parse(raw));
    } catch {
      return defaultSettings;
    }
  }
  return defaultSettings;
};

// ── Helper: resolve loader string ───────────────────────────────────────────
const resolveLoader = (raw: string | null | undefined): Loader => {
  if (raw && typeof raw === "string") return raw as Loader;
  return defaultLoader;
};

// ── Helper: build snapshot from store state ─────────────────────────────────
const buildSnapshot = (
  settings: UserSettings | null,
): Partial<UserSettingsBase> => ({
  language: settings?.language ?? null,
  theme: settings?.theme ?? null,
  primary_theme: settings?.primary_theme ?? null,
  secondary_theme: settings?.secondary_theme ?? null,
  accent: settings?.accent ?? null,
  primary_theme_dark: settings?.primary_theme_dark ?? null,
  secondary_theme_dark: settings?.secondary_theme_dark ?? null,
  layout_style: settings?.layout_style ?? null,
  loader: settings?.loader ?? null,
});

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUserSettings = create<UserSettingsState>()((set, get) => ({
  // ── Initial State ─────────────────────────────────────────────────────
  settings: null,
  profile: null,
  userInfo: null,
  publicProfile: null,
  publicUserInfo: null,
  publicSettings: null,
  draftSettings: null,
  savedSnapshot: null,
  isLoading: false,
  error: null,

  // ═══════════════════════════════════════════════════════════════════════
  // API Actions
  // ═══════════════════════════════════════════════════════════════════════

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<UserSettings>("settings/");
      console.log("Response:", JSON.stringify(response.data, null, 2));
      set({
        settings: response.data,
        isLoading: false,
        // Initialize snapshot for unsaved-changes tracking
        savedSnapshot: buildSnapshot(response.data),
        draftSettings: null,
      });
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
      console.log("Data:", JSON.stringify(data, null, 2));
      console.log("Response:", JSON.stringify(response.data, null, 2));

      const current = get().settings;
      const merged: UserSettings = current
        ? { ...current, ...response.data }
        : (response.data as UserSettings);

      set({
        settings: merged,
        isLoading: false,
        savedSnapshot: buildSnapshot(merged),
        draftSettings: null,
      });
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
      if (profile_picture) {
        formData.append("profile_picture", profile_picture);
      }
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
      if (profile_picture) {
        formData.append("profile_picture", profile_picture);
      }
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
  // Draft Management
  // ═══════════════════════════════════════════════════════════════════════

  setDraftField: (field, value) => {
    const current = get().draftSettings ?? {};
    set({ draftSettings: { ...current, [field]: value } });
  },

  setDraftSettings: (draft) => {
    set({ draftSettings: { ...get().draftSettings, ...draft } });
  },

  resetDraft: () => {
    set({ draftSettings: null });
  },

  hasUnsavedChanges: (draft?: Partial<UserSettingsBase> | null) => {
    const { draftSettings, savedSnapshot } = get();
    const effectiveDraft = draft !== undefined ? draft : draftSettings;
    if (!effectiveDraft) return false;
    if (!savedSnapshot) return true;

    const keys: (keyof UserSettingsBase)[] = [
      "language",
      "theme",
      "primary_theme",
      "secondary_theme",
      "accent",
      "primary_theme_dark",
      "secondary_theme_dark",
      "layout_style",
      "loader",
    ];

    return keys.some((key) => {
      const draftVal = effectiveDraft[key];
      const savedVal = savedSnapshot[key];

      if (key === "layout_style") {
        return JSON.stringify(draftVal) !== JSON.stringify(savedVal);
      }

      return draftVal !== savedVal;
    });
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Derived State Getters
  // ═══════════════════════════════════════════════════════════════════════

  getActiveSettings: () => {
    const { draftSettings, settings } = get();
    const merged: Partial<UserSettingsBase> = { ...settings };

    if (draftSettings) {
      for (const key of Object.keys(
        draftSettings,
      ) as (keyof UserSettingsBase)[]) {
        if (draftSettings[key] !== undefined) {
          (merged as Record<string, unknown>)[key] = draftSettings[key];
        }
      }
    }

    return merged;
  },

  getLightTheme: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => {
    const source = override !== undefined ? override : get().settings;
    const draftSource = draft !== undefined ? draft : get().draftSettings;
    const bg = getActiveValue<string | null>(
      draftSource,
      source,
      "primary_theme",
      defaultLightTheme.background,
    );
    const fg = getActiveValue<string | null>(
      draftSource,
      source,
      "secondary_theme",
      defaultLightTheme.foreground,
    );
    return {
      background: isValidHexColorStrict(bg || "")
        ? bg!
        : defaultLightTheme.background,
      foreground: isValidHexColorStrict(fg || "")
        ? fg!
        : defaultLightTheme.foreground,
    };
  },

  getDarkTheme: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => {
    const source = override !== undefined ? override : get().settings;
    const draftSource = draft !== undefined ? draft : get().draftSettings;
    const bg = getActiveValue<string | null>(
      draftSource,
      source,
      "primary_theme_dark",
      defaultDarkTheme.background,
    );
    const fg = getActiveValue<string | null>(
      draftSource,
      source,
      "secondary_theme_dark",
      defaultDarkTheme.foreground,
    );
    return {
      background: isValidHexColorStrict(bg || "")
        ? bg!
        : defaultDarkTheme.background,
      foreground: isValidHexColorStrict(fg || "")
        ? fg!
        : defaultDarkTheme.foreground,
    };
  },

  getAccentColor: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => {
    const source = override !== undefined ? override : get().settings;
    const draftSource = draft !== undefined ? draft : get().draftSettings;
    const accent = getActiveValue<string | null>(
      draftSource,
      source,
      "accent",
      defaultAccent.color,
    );
    return {
      color: isValidHexColorStrict(accent || "")
        ? accent!
        : defaultAccent.color,
    };
  },

  getThemeVariant: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => {
    const source = override !== undefined ? override : get().settings;
    const draftSource = draft !== undefined ? draft : get().draftSettings;
    const theme = getActiveValue<string | null>(
      draftSource,
      source,
      "theme",
      "system",
    );
    if (theme && ["light", "dark", "system"].includes(theme))
      return theme as ThemeVariant;
    return "system";
  },

  getLayoutSettings: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => {
    const source = override !== undefined ? override : get().settings;
    const draftSource = draft !== undefined ? draft : get().draftSettings;
    const raw = getActiveValue<
      ProfileSettings | Record<string, unknown> | string | null
    >(draftSource, source, "layout_style", defaultSettings);
    return parseLayoutStyle(raw);
  },

  getLoader: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => {
    const source = override !== undefined ? override : get().settings;
    const draftSource = draft !== undefined ? draft : get().draftSettings;
    const raw = getActiveValue<string | null>(
      draftSource,
      source,
      "loader",
      defaultLoader,
    );
    return resolveLoader(raw);
  },

  getLanguage: (
    override?: UserSettings | null,
    draft?: Partial<UserSettingsBase> | null,
  ) => {
    const source = override !== undefined ? override : get().settings;
    const draftSource = draft !== undefined ? draft : get().draftSettings;
    const langCode = getActiveValue<string | null>(
      draftSource,
      source,
      "language",
      defaultLanguage.code,
    );
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
    set({
      publicProfile: null,
      publicUserInfo: null,
      publicSettings: null,
    }),

  reset: () =>
    set({
      settings: null,
      profile: null,
      userInfo: null,
      publicProfile: null,
      publicUserInfo: null,
      publicSettings: null,
      draftSettings: null,
      savedSnapshot: null,
      isLoading: false,
      error: null,
    }),
}));
