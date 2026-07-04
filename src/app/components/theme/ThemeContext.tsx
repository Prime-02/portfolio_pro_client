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

// ─── Profile Context Type ───────────────────────────────────────────────────
export type ProfileContext =
  | { kind: "own"; username: string }
  | { kind: "public"; username: string }
  | { kind: "not-found"; username: string }
  | { kind: "unauthenticated"; username: null }
  | { kind: "pending"; username: null };

// ─── Theme Context Type ─────────────────────────────────────────────────────
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
  applyThemePreset: (light: Theme, dark: Theme, accent: Accent) => void;
  layoutLoaded: boolean;
  setLayoutLoaded: (layoutLoaded: boolean) => void;
  getUserSettings: () => void;
  profileContext: ProfileContext;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const store = useUserSettings();
  const router = useRouter();
  const pathname = usePathname();

  const [theme, setTheme] = useState<Theme>({ background: "#ffffff", foreground: "#171717" });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [loadingText, setLoadingText] = useState("Please wait...");
  const [profileContext, setProfileContext] = useState<ProfileContext>({
    kind: "pending",
    username: null
  });

  const [optimisticThemeVariant, setOptimisticThemeVariant] = useState<ThemeVariant | null>(null);
  const [optimisticLightTheme, setOptimisticLightTheme] = useState<Theme | null>(null);
  const [optimisticDarkTheme, setOptimisticDarkTheme] = useState<Theme | null>(null);
  const [optimisticAccentColor, setOptimisticAccentColor] = useState<Accent | null>(null);
  const [optimisticLoader, setOptimisticLoader] = useState<Loader | null>(null);

  const isSaving = useRef(false);

  const { setLoading } = useUIStore();
  const { checkIfOwnProfile, checkUsernameAvailability } = useValidation();
  const { fetchUserInfo } = useUserSettings();

  const usernameInUrl = checkIfOwnProfile()?.username ?? null;
  const userInfo = useUserSettings((s) => s.userInfo);

  const isViewingOwnProfile = useMemo(() => {
    if (!usernameInUrl) return true;
    return userInfo?.username?.toLowerCase() === usernameInUrl.toLowerCase();
  }, [usernameInUrl, userInfo]);

  const settingsSource = isViewingOwnProfile ? store.settings : store.publicSettings;

  const storedLightTheme = useMemo(() => store.getLightTheme(settingsSource), [settingsSource]);
  const storedDarkTheme = useMemo(() => store.getDarkTheme(settingsSource), [settingsSource]);
  const storedAccentColor = useMemo(() => store.getAccentColor(settingsSource), [settingsSource]);
  const language = useMemo(() => store.getLanguage(settingsSource), [settingsSource]);
  const storedLoader = useMemo(() => store.getLoader(settingsSource), [settingsSource]);
  const storedThemeVariant = useMemo(() => store.getThemeVariant(settingsSource), [settingsSource]);

  const themeVariant: ThemeVariant = optimisticThemeVariant ?? storedThemeVariant;
  const lightTheme: Theme = optimisticLightTheme ?? storedLightTheme;
  const darkTheme: Theme = optimisticDarkTheme ?? storedDarkTheme;
  const accentColor: Accent = optimisticAccentColor ?? storedAccentColor;
  const loader: Loader = optimisticLoader ?? storedLoader;

  // ─── Optimistic state sync ──────────────────────────────────────────────────
  useEffect(() => {
    if (optimisticThemeVariant && storedThemeVariant === optimisticThemeVariant) {
      setOptimisticThemeVariant(null);
    }
  }, [storedThemeVariant, optimisticThemeVariant]);

  useEffect(() => {
    if (optimisticLightTheme &&
      storedLightTheme.background === optimisticLightTheme.background &&
      storedLightTheme.foreground === optimisticLightTheme.foreground) {
      setOptimisticLightTheme(null);
    }
  }, [storedLightTheme, optimisticLightTheme]);

  useEffect(() => {
    if (optimisticDarkTheme &&
      storedDarkTheme.background === optimisticDarkTheme.background &&
      storedDarkTheme.foreground === optimisticDarkTheme.foreground) {
      setOptimisticDarkTheme(null);
    }
  }, [storedDarkTheme, optimisticDarkTheme]);

  useEffect(() => {
    if (optimisticAccentColor && storedAccentColor.color === optimisticAccentColor.color) {
      setOptimisticAccentColor(null);
    }
  }, [storedAccentColor, optimisticAccentColor]);

  useEffect(() => {
    if (optimisticLoader && storedLoader === optimisticLoader) {
      setOptimisticLoader(null);
    }
  }, [storedLoader, optimisticLoader]);

  // ─── Theme Application ──────────────────────────────────────────────────────
  const applyTheme = useCallback((newTheme: Theme, darkMode: boolean) => {
    setTheme(newTheme);
    setIsDarkMode(darkMode);
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--background", newTheme.background);
      document.documentElement.style.setProperty("--foreground", newTheme.foreground);
    }
  }, []);

  const getSystemTheme = useCallback((): Theme => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? darkTheme : lightTheme;
    }
    return lightTheme;
  }, [lightTheme, darkTheme]);

  const applyVariant = useCallback((variant: ThemeVariant) => {
    if (variant === "dark") return applyTheme(darkTheme, true);
    if (variant === "light") return applyTheme(lightTheme, false);
    const sys = getSystemTheme();
    return applyTheme(sys, sys.background === darkTheme.background);
  }, [lightTheme, darkTheme, getSystemTheme, applyTheme]);

  useEffect(() => { applyVariant(themeVariant); }, [themeVariant, lightTheme, darkTheme]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--accent", accentColor.color);
    }
  }, [accentColor]);

  useEffect(() => {
    if (typeof window === "undefined" || themeVariant !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyVariant("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeVariant, applyVariant]);

  // ─── Persistence ────────────────────────────────────────────────────────────
  const persist = useCallback(async (patch: Partial<UserSettingsBase>) => {
    if (!isAuthenticated() || isSaving.current) return;
    isSaving.current = true;
    setLoading("updating_user_settings", true);
    try {
      await store.updateSettings(patch);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setLoading("updating_user_settings", false);
      isSaving.current = false;
    }
  }, [store, setLoading]);

  // ─── Theme Setters ──────────────────────────────────────────────────────────
  const setThemeVariant = useCallback((variant: ThemeVariant) => {
    setOptimisticThemeVariant(variant);
    applyVariant(variant);
    persist({ theme: variant });
  }, [applyVariant, persist]);

  const toggleThemeVariant = useCallback(() => {
    const next = themeVariant === "system" ? "dark" : themeVariant === "dark" ? "light" : "system";
    setThemeVariant(next);
  }, [themeVariant, setThemeVariant]);

  const setLightTheme = useCallback((t: Theme) => {
    setOptimisticLightTheme(t);
    if (themeVariant === "light") applyTheme(t, false);
    persist({ primary_theme: t.background, secondary_theme: t.foreground });
  }, [persist, themeVariant, applyTheme]);

  const setDarkTheme = useCallback((t: Theme) => {
    setOptimisticDarkTheme(t);
    if (themeVariant === "dark") applyTheme(t, true);
    persist({ primary_theme_dark: t.background, secondary_theme_dark: t.foreground });
  }, [persist, themeVariant, applyTheme]);

  const setAccentColor = useCallback((accent: Accent) => {
    setOptimisticAccentColor(accent);
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--accent", accent.color);
    }
    persist({ accent: accent.color });
  }, [persist]);

  const setLoader = useCallback((input: LoaderInput) => {
    const resolved = typeof input === "string" ? input : input.style;
    setOptimisticLoader(resolved as Loader);
    persist({ loader: resolved });
  }, [persist]);

  const setLanguage = useCallback((lang: LanguageProps) => {
    persist({ language: lang.code });
  }, [persist]);

  const applyThemePreset = useCallback((light: Theme, dark: Theme, accent: Accent) => {
    setOptimisticLightTheme(light);
    setOptimisticDarkTheme(dark);
    setOptimisticAccentColor(accent);
    if (themeVariant === "light") applyTheme(light, false);
    else if (themeVariant === "dark") applyTheme(dark, true);
    else {
      const prefersDark = typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? dark : light, prefersDark);
    }
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--accent", accent.color);
    }
    persist({
      primary_theme: light.background,
      secondary_theme: light.foreground,
      primary_theme_dark: dark.background,
      secondary_theme_dark: dark.foreground,
      accent: accent.color,
    });
  }, [persist, themeVariant, applyTheme]);

  // ─── getUserSettings - NOW ALSO SETS profileContext ─────────────────────────
  const getUserSettings = useCallback(async () => {
    const authenticated = isAuthenticated();

    // CASE 1: No username in URL (root or non-profile page)
    if (!usernameInUrl) {
      if (authenticated) {
        const currentUserInfo = useUserSettings.getState().userInfo;
        const username = currentUserInfo?.username || "";
        setLoadingText("Fetching your settings...");
        setProfileContext({ kind: "own", username }); // Authenticated user on their own page
        await store.fetchSettings();
      } else {
        setProfileContext({ kind: "unauthenticated", username: null }); // Not logged in
      }
      setLayoutLoaded(true);
      return;
    }

    // CASE 2: Username in URL and user is authenticated
    if (authenticated) {
      const currentUserInfo = useUserSettings.getState().userInfo;
      const isOwnProfile = currentUserInfo?.username?.toLowerCase() === usernameInUrl.toLowerCase();

      // Sub-case 2a: Viewing own profile
      if (isOwnProfile) {
        setLoadingText("Loading your profile settings...");
        setProfileContext({ kind: "own", username: currentUserInfo?.username || usernameInUrl });
        store.clearPublicData();
        await store.fetchSettings();
        setLayoutLoaded(true);
        return;
      }

      // Sub-case 2b: Viewing someone else's profile
      setLoadingText(`Checking profile "${usernameInUrl}"...`);
      const { exists } = await checkUsernameAvailability(usernameInUrl);
      if (exists) {
        setLoadingText("Loading public profile data...");
        setProfileContext({ kind: "public", username: usernameInUrl });
        await Promise.all([
          store.fetchPublicSettings(usernameInUrl),
          store.fetchPublicUserInfo(usernameInUrl),
          store.fetchPublicProfile(usernameInUrl),
        ]);
        setLayoutLoaded(true);
      } else {
        setProfileContext({ kind: "not-found", username: usernameInUrl });
        toast.warning("The profile you attempted to visit does not exist.");
        router.push(`/${currentUserInfo?.username}`);
        setLayoutLoaded(true);
      }
      return;
    }

    // CASE 3: Username in URL and user is NOT authenticated
    setLoadingText(`Checking profile "${usernameInUrl}"...`);
    const { exists } = await checkUsernameAvailability(usernameInUrl);
    if (exists) {
      setLoadingText("Loading public profile data...");
      setProfileContext({ kind: "public", username: usernameInUrl });
      await Promise.all([
        store.fetchPublicSettings(usernameInUrl),
        store.fetchPublicUserInfo(usernameInUrl),
        store.fetchPublicProfile(usernameInUrl),
      ]);
      setLayoutLoaded(true);
    } else {
      setProfileContext({ kind: "not-found", username: usernameInUrl });
      toast.error("This profile does not exist.");
      router.push("/");
      setLayoutLoaded(true);
    }
  }, [usernameInUrl, checkUsernameAvailability, store, router]);

  // ─── Initialization Effect ──────────────────────────────────────────────────
  useEffect(() => {
    if (userInfo && userInfo.username === usernameInUrl) return;

    const init = async () => {
      try {
        if (unprotectedRoutes.some(route => pathname.startsWith(route))) {
          setLoadingText("Loading theme...");
          setProfileContext({ kind: "unauthenticated", username: null }); // Set context for unprotected routes
          setLayoutLoaded(true);
          return;
        }
        setLoadingText("Preparing your layout...");
        setLayoutLoaded(false);
        setProfileContext({ kind: "pending", username: null }); // Reset to pending during initialization

        if (isAuthenticated()) {
          setLoadingText("Fetching user info...");
          await fetchUserInfo();
        }
        await getUserSettings();
      } catch (error) {
        console.error("Initialization error:", error);
        setLoadingText("Loading theme...");
        setProfileContext({ kind: "unauthenticated", username: null }); // Fallback on error
        setLayoutLoaded(true);
      }
    };

    init();
  }, [usernameInUrl, pathname]);

  // ─── Context Value ──────────────────────────────────────────────────────────
  const contextValue = useMemo<ThemeContextType>(() => ({
    theme,
    themeVariant,
    setThemeVariant,
    toggleThemeVariant,
    isDarkMode,
    setLightTheme,
    setDarkTheme,
    lightTheme,
    darkTheme,
    accentColor,
    setAccentColor,
    loader,
    setLoader,
    language,
    setLanguage,
    applyThemePreset,
    layoutLoaded,
    setLayoutLoaded,
    getUserSettings,
    profileContext,
  }), [
    theme,
    themeVariant,
    setThemeVariant,
    toggleThemeVariant,
    isDarkMode,
    setLightTheme,
    setDarkTheme,
    lightTheme,
    darkTheme,
    accentColor,
    setAccentColor,
    loader,
    setLoader,
    language,
    setLanguage,
    applyThemePreset,
    layoutLoaded,
    getUserSettings,
    profileContext,
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {!layoutLoaded ? (
        <div className="w-full h-screen flex-col flex items-center justify-center">
          <PortfolioProLogo scale={0.8} />
          <p>{loadingText}</p>
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};