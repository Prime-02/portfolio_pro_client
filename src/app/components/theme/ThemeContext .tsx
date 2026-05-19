"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { UserPreferences } from "../types and interfaces/UserAndProfile";
import PortfolioProLogo from "../logo/PortfolioProTextLogo";
import {
  LoaderInput,
  Loader,
  Theme,
  Accent,
  ThemeVariant,
  LanguageProps,
} from "../types and interfaces/loaderTypes";
import { isAuthenticated } from "@/lib/client/api";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { useValidation } from "@/lib/hooks/validation/useValidation";
import { UserSettingsBase, useUserSettings } from "@/lib/stores/user/useUserSettings";
import { toast } from "../toastify/Toastify";
import { usePathname, useRouter } from "next/navigation";
import { unprotectedRoutes } from "@/lib/utilities/indices/NavigationItems";

// ── Types ───────────────────────────────────────────────────────────────────

export type ThemeContextType = {
  theme: Theme;
  themeVariant: ThemeVariant;
  setThemeVariant: (variant: ThemeVariant) => void;
  toggleThemeVariant: () => void;
  isDarkMode: boolean;
  setLightTheme: (theme: Theme) => void;
  setDarkTheme: (theme: Theme) => void;
  lightTheme: Theme;
  darkTheme: Theme;
  accentColor: Accent;
  setAccentColor: (accent: Accent) => void;
  loader: Loader;
  setLoader: (loader: LoaderInput) => void;
  language: LanguageProps;
  setLanguage: (language: LanguageProps) => void;
  settings: ProfileSettings;
  setSettings: (settings: ProfileSettings) => void;
  defaultSettings: ProfileSettings;
  layoutLoaded: boolean;
  setLayoutLoaded: (layoutLoaded: boolean) => void;
  getUserSettings: (url?: string) => void;
  hasUnsavedChanges: boolean;
  showSaveButtons: boolean;
  saveChanges: (customSettings?: Partial<UserPreferences>) => void;
  cancelChanges: () => void;
  resetToDefaults: () => void;
};

export interface ProfileSettings {
  layout: "default" | "compact" | "card" | "minimal" | "showcase";
  showCover: boolean;
  showActions: boolean;
  coverHeight: "h-48" | "h-56" | "h-64" | "h-72" | "h-80";
  profilePictureSize:
  | "w-24 h-24"
  | "w-28 h-28"
  | "w-32 h-32"
  | "w-36 h-36"
  | "w-40 h-40";
  profilePicturePosition: "left" | "center" | "right";
  infoAlignment: "left" | "center" | "right";
  spacing: "compact" | "normal" | "relaxed";
  borderRadius: "none" | "small" | "medium" | "large" | "full";
  showBio: boolean;
  showProfession: boolean;
  showLocation: boolean;
  showWebsite: boolean;
  showExperience: boolean;
  showAvailability: boolean;
  actionButtonStyle: "default" | "outline" | "minimal" | "rounded";
  profileInfoStyle: "default" | "card" | "minimal";
}

export const defaultSettings: ProfileSettings = {
  layout: "default",
  showCover: true,
  showActions: true,
  coverHeight: "h-64",
  profilePictureSize: "w-32 h-32",
  profilePicturePosition: "left",
  infoAlignment: "left",
  spacing: "normal",
  borderRadius: "medium",
  showBio: true,
  showProfession: true,
  showLocation: true,
  showWebsite: true,
  showExperience: true,
  showAvailability: true,
  actionButtonStyle: "default",
  profileInfoStyle: "default",
};

// ── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ── Defaults used for reset ─────────────────────────────────────────────────

const defaultLightTheme: Theme = { background: "#ffffff", foreground: "#171717" };
const defaultDarkTheme: Theme = { background: "#0a0a0a", foreground: "#ededed" };
const defaultAccent: Accent = { color: "#05df72" };
const defaultLanguage: LanguageProps = { name: "English", code: "en" };
const defaultLoader: Loader = "spin-loader";

// ── Provider Props ──────────────────────────────────────────────────────────

type ThemeProviderProps = {
  children: ReactNode;
  defaultThemeVariant?: ThemeVariant;
  defaultLightTheme?: Theme;
  defaultDarkTheme?: Theme;
  defaultAccentColor?: Accent;
  defaultLoader?: LoaderInput;
  defaultLanguage?: LanguageProps;
};

// ── Provider ────────────────────────────────────────────────────────────────

export const ThemeProvider = ({
  children,
  defaultThemeVariant = "system",
  defaultLightTheme: initialLightTheme = defaultLightTheme,
  defaultDarkTheme: initialDarkTheme = defaultDarkTheme,
  defaultAccentColor: initialAccentColor = defaultAccent,
  defaultLoader: initialLoader = { style: "spin-loader" },
  defaultLanguage: initialLanguage = defaultLanguage,
}: ThemeProviderProps) => {
  // ── Store (single source of truth) ──────────────────────────────────────
  const store = useUserSettings();

  const router = useRouter()

  const pathname = usePathname(); // from next/navigation

  // ── UI State (not in store) ─────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>(initialLightTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [showSaveButtons, setShowSaveButtons] = useState(false);


  // ── Refs ────────────────────────────────────────────────────────────────
  const isUpdatingSettings = useRef(false);
  const saveButtonsTimeoutRef = useRef<NodeJS.Timeout>(null);

  const { setLoading } = useUIStore();
  const { checkIfOwnProfile, checkUsernameAvailability } = useValidation();
  const { fetchUserInfo } = useUserSettings()

  const usernameInUrl = checkIfOwnProfile()?.username ?? null;

  const userInfo = useUserSettings((s) => s.userInfo); // reactive subscription

  const isViewingOwnProfile = useMemo(() => {
    if (!usernameInUrl) return true;
    return userInfo?.username?.toLowerCase() === usernameInUrl.toLowerCase();
  }, [usernameInUrl, userInfo]); // now re-evaluates when userInfo loads
  // ── Derived state from store (read directly, no local copies) ───────────
  // The settings source to read from — public when visiting others, own when on own profile
  const settingsSource = isViewingOwnProfile ? store.settings : store.publicSettings;

  const draft = isViewingOwnProfile ? store.draftSettings : null;

  const lightTheme = useMemo(() => store.getLightTheme(settingsSource, draft), [settingsSource, draft]);
  const darkTheme = useMemo(() => store.getDarkTheme(settingsSource, draft), [settingsSource, draft]);
  const accentColor = useMemo(() => store.getAccentColor(settingsSource, draft), [settingsSource, draft]);
  const language = useMemo(() => store.getLanguage(settingsSource, draft), [settingsSource, draft]);
  const settings = useMemo(() => store.getLayoutSettings(settingsSource, draft), [settingsSource, draft]);
  const themeVariant = useMemo(() => store.getThemeVariant(settingsSource, draft), [settingsSource, draft]);
  const loader = useMemo(() => store.getLoader(settingsSource, draft), [settingsSource, draft]);
  const hasUnsavedChanges = useMemo(() => store.hasUnsavedChanges(draft), [draft]);


  // ── Helpers ─────────────────────────────────────────────────────────────

  const resolveLoaderInput = (input: LoaderInput): Loader =>
    (typeof input === "string" ? input : input.style) as Loader;

  const showSaveButtonsWithTimeout = useCallback(() => {
    setShowSaveButtons(true);
    if (saveButtonsTimeoutRef.current) clearTimeout(saveButtonsTimeoutRef.current);
    saveButtonsTimeoutRef.current = setTimeout(() => setShowSaveButtons(false), 15000);
  }, []);

  // ── Show save buttons when unsaved changes detected ─────────────────────
  useEffect(() => {
    if (hasUnsavedChanges) {
      showSaveButtonsWithTimeout();
    }
  }, [hasUnsavedChanges, showSaveButtonsWithTimeout]);

  // ── Theme application (reads from store via derived memo) ───────────────
  const getSystemTheme = useCallback((): Theme => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? darkTheme : lightTheme;
    }
    return lightTheme;
  }, [lightTheme, darkTheme]);

  const applyTheme = useCallback(
    (newTheme: Theme, darkMode: boolean) => {
      setTheme(newTheme);
      setIsDarkMode(darkMode);
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--background", newTheme.background);
        document.documentElement.style.setProperty("--foreground", newTheme.foreground);
        document.documentElement.style.setProperty("--accent", accentColor.color);
      }
    },
    [accentColor.color]
  );

  const updateTheme = useCallback(
    (variant: ThemeVariant) => {
      switch (variant) {
        case "dark":
          return applyTheme(darkTheme, true);
        case "light":
          return applyTheme(lightTheme, false);
        default: {
          const sys = getSystemTheme();
          return applyTheme(sys, sys.background === darkTheme.background);
        }
      }
    },
    [lightTheme, darkTheme, getSystemTheme, applyTheme]
  );

  // ── React to theme changes ──────────────────────────────────────────────
  useEffect(() => {
    updateTheme(themeVariant);
  }, [themeVariant, updateTheme]);

  useEffect(() => {
    updateTheme(themeVariant);
  }, [lightTheme, darkTheme, updateTheme]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--accent", accentColor.color);
    }
  }, [accentColor]);

  // ── System theme listener ───────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (themeVariant === "system") updateTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeVariant, updateTheme]);

  // ── Setter functions → update store draft ────────────────────────────────

  const setThemeVariantFn = useCallback(
    (variant: ThemeVariant) => {
      store.setDraftField("theme", variant);
    },
    [store]
  );

  const toggleThemeVariant = useCallback(() => {
    const current = store.getThemeVariant();
    const next = current === "system" ? "dark" : current === "dark" ? "light" : "system";
    store.setDraftField("theme", next);
  }, [store]);

  const setLightThemeFn = useCallback(
    (theme: Theme) => {
      store.setDraftField("primary_theme", theme.background);
      store.setDraftField("secondary_theme", theme.foreground);
    },
    [store]
  );

  const setDarkThemeFn = useCallback(
    (theme: Theme) => {
      store.setDraftField("primary_theme_dark", theme.background);
      store.setDraftField("secondary_theme_dark", theme.foreground);
    },
    [store]
  );

  const setAccentColorFn = useCallback(
    (accent: Accent) => {
      store.setDraftField("accent", accent.color);
    },
    [store]
  );

  const setLoaderFn = useCallback(
    (input: LoaderInput) => {
      store.setDraftField("loader", resolveLoaderInput(input));
    },
    [store]
  );

  const setLanguageFn = useCallback(
    (lang: LanguageProps) => {
      store.setDraftField("language", lang.code);
    },
    [store]
  );

  const setSettingsFn = useCallback(
    (newSettings: ProfileSettings) => {
      store.setDraftField("layout_style", newSettings);
    },
    [store]
  );

  // ── Save / Cancel / Reset → delegate to store ────────────────────────────

  const saveChanges = useCallback(
    async (customUpdates?: Partial<UserPreferences>) => {
      if (!isAuthenticated() || isUpdatingSettings.current) return;

      isUpdatingSettings.current = true;
      setLoading("updating_user_settings", true);

      try {
        const activeSettings = store.getActiveSettings();

        const payload: Record<string, unknown> = {
          language: customUpdates?.language ?? activeSettings.language ?? language.code,
          theme: customUpdates?.theme ?? activeSettings.theme ?? themeVariant,
          primary_theme:
            customUpdates?.primary_theme ?? activeSettings.primary_theme ?? lightTheme.background,
          secondary_theme:
            customUpdates?.secondary_theme ?? activeSettings.secondary_theme ?? lightTheme.foreground,
          accent: customUpdates?.accent ?? activeSettings.accent ?? accentColor.color,
          primary_theme_dark:
            customUpdates?.primary_theme_dark ??
            activeSettings.primary_theme_dark ??
            darkTheme.background,
          secondary_theme_dark:
            customUpdates?.secondary_theme_dark ??
            activeSettings.secondary_theme_dark ??
            darkTheme.foreground,
          loader: customUpdates?.loader ?? activeSettings.loader ?? loader,
          layout_style: customUpdates?.layout_style ?? activeSettings.layout_style ?? settings,
        };

        await store.updateSettings(payload as Partial<UserSettingsBase>);

        setShowSaveButtons(false);
        if (saveButtonsTimeoutRef.current) clearTimeout(saveButtonsTimeoutRef.current);
      } catch (error) {
        console.error("Error saving user settings:", error);
      } finally {
        setLoading("updating_user_settings", false);
        isUpdatingSettings.current = false;
      }
    },
    [store, language, themeVariant, lightTheme, darkTheme, accentColor, loader, settings, setLoading]
  );

  const cancelChanges = useCallback(() => {
    store.resetDraft();
    setShowSaveButtons(false);
    if (saveButtonsTimeoutRef.current) clearTimeout(saveButtonsTimeoutRef.current);
  }, [store]);

  const resetToDefaults = useCallback(() => {
    store.setDraftSettings({
      language: initialLanguage.code,
      theme: defaultThemeVariant,
      primary_theme: initialLightTheme.background,
      secondary_theme: initialLightTheme.foreground,
      accent: initialAccentColor.color,
      primary_theme_dark: initialDarkTheme.background,
      secondary_theme_dark: initialDarkTheme.foreground,
      loader: resolveLoaderInput(initialLoader),
      layout_style: defaultSettings,
    });
  }, [initialLanguage, defaultThemeVariant, initialLightTheme, initialDarkTheme, initialAccentColor, initialLoader]);

  // ── Fetch settings on mount ─────────────────────────────────────────────


  const getUserSettings = useCallback(async () => {
    const authenticated = isAuthenticated();

    // ── Case: no username in URL at all ──────────────────────────────────
    if (!usernameInUrl) {
      if (authenticated) {
        await store.fetchSettings();
      }
      setLayoutLoaded(true);
      return;
    }

    // ── Case: authenticated visitor ───────────────────────────────────────
    if (authenticated) {
      const currentUserInfo = useUserSettings.getState().userInfo;
      const isOwnProfile =
        currentUserInfo?.username?.toLowerCase() === usernameInUrl.toLowerCase();

      if (isOwnProfile) {
        store.clearPublicData(); // ← clear stale public data first
        await store.fetchSettings();
        setLayoutLoaded(true);
        return;
      }
      // Viewing someone else's profile → validate username first
      const { exists } = await checkUsernameAvailability(usernameInUrl);

      if (exists) {
        await Promise.all([
          store.fetchPublicSettings(usernameInUrl),
          store.fetchPublicUserInfo(usernameInUrl),
          store.fetchPublicProfile(usernameInUrl),
        ]);
        setLayoutLoaded(true);
      } else {
        // Invalid profile → warn and redirect to own profile
        const ownUsername = currentUserInfo?.username;
        toast.warning("The profile you attempted to visit does not exist.");
        router.push(`/${ownUsername}`);
        setLayoutLoaded(true);
      }
      return;
    }

    // ── Case: non-authenticated visitor ──────────────────────────────────
    const { exists } = await checkUsernameAvailability(usernameInUrl);

    if (exists) {
      await Promise.all([
        store.fetchPublicSettings(usernameInUrl),
        store.fetchPublicUserInfo(usernameInUrl),
        store.fetchPublicProfile(usernameInUrl),
      ]);
      setLayoutLoaded(true);
    } else {
      toast.error("This profile does not exist.");
      router.push("/");
      setLayoutLoaded(true);
    }
  }, [usernameInUrl, checkUsernameAvailability, store, router]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Skip if on unprotected route
        if (unprotectedRoutes.some(route => pathname.startsWith(route))) {
          setLayoutLoaded(true);
          return;
        }

        setLayoutLoaded(false);
        if (isAuthenticated()) {
          await fetchUserInfo();
        }
        await getUserSettings();
      } catch (error) {
        console.error("Initialization error:", error);
        setLayoutLoaded(true);
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameInUrl, pathname]);
  // ── Cleanup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (saveButtonsTimeoutRef.current) clearTimeout(saveButtonsTimeoutRef.current);
    };
  }, []);

  // ── Context value (stable via useMemo) ───────────────────────────────────
  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      themeVariant,
      setThemeVariant: setThemeVariantFn,
      toggleThemeVariant,
      isDarkMode,
      setLightTheme: setLightThemeFn,
      setDarkTheme: setDarkThemeFn,
      lightTheme,
      darkTheme,
      accentColor,
      setAccentColor: setAccentColorFn,
      loader,
      setLoader: setLoaderFn,
      language,
      setLanguage: setLanguageFn,
      settings,
      setSettings: setSettingsFn,
      defaultSettings,
      layoutLoaded,
      setLayoutLoaded,
      getUserSettings,
      hasUnsavedChanges,
      showSaveButtons,
      saveChanges,
      cancelChanges,
      resetToDefaults,
    }),
    [
      theme,
      themeVariant,
      setThemeVariantFn,
      toggleThemeVariant,
      isDarkMode,
      setLightThemeFn,
      setDarkThemeFn,
      lightTheme,
      darkTheme,
      accentColor,
      setAccentColorFn,
      loader,
      setLoaderFn,
      language,
      setLanguageFn,
      settings,
      setSettingsFn,
      layoutLoaded,
      getUserSettings,
      hasUnsavedChanges,
      showSaveButtons,
      saveChanges,
      cancelChanges,
      resetToDefaults,
    ]
  );
  return (
    <ThemeContext.Provider value={contextValue}>
      {!layoutLoaded ? (
        <div className="w-full h-screen flex-col flex items-center justify-center">
          <PortfolioProLogo scale={0.8} />
          <p>Loading theme...</p>
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
};


// ── Hook ────────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};