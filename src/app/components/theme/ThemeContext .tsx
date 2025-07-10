"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import {
  LoaderInput,
  Loader,
  Theme,
  Accent,
  ThemeVariant,
  LanguageProps,
} from "@/app/components/types and interfaces/loaderTypes";
import ThemeControlPanel from "./ThemeControlPanel";
import { useGlobalState } from "@/app/globalStateProvider";
import {
  GetAllData,
  UpdateAllData,
} from "../utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "../utilities/indices/urls";
import {
  findMatch,
  isValidHexColorStrict,
} from "../utilities/syncFunctions/syncs";
import { UserPreferences } from "../types and interfaces/UserAndProfile";
import { systemLanguages } from "../utilities/indices/DropDownItems";

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
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
  defaultThemeVariant?: ThemeVariant;
  defaultLightTheme?: Theme;
  defaultDarkTheme?: Theme;
  defaultAccentColor?: Accent;
  defaultLoader?: LoaderInput;
  defaultLanguage?: LanguageProps;
};

export const ThemeProvider = ({
  children,
  defaultThemeVariant = "system",
  defaultLightTheme: initialLightTheme = {
    background: "#ffffff",
    foreground: "#171717",
  },
  defaultDarkTheme: initialDarkTheme = {
    background: "#0a0a0a",
    foreground: "#ededed",
  },
  defaultAccentColor: initialAccentColor = {
    color: "#05df72",
  },
  defaultLoader: initialLoader = {
    style: "spin-loader",
  },
  defaultLanguage: initialLanguage = {
    name: "English",
    code: "en",
  },
}: ThemeProviderProps) => {
  // State for theme configurations
  const [lightTheme, setLightTheme] = useState<Theme>(initialLightTheme);
  const [darkTheme, setDarkTheme] = useState<Theme>(initialDarkTheme);
  const [accentColor, setAccentColor] = useState<Accent>(initialAccentColor);
  const [language, setLanguage] = useState<LanguageProps>(initialLanguage);
  const [loader, _setLoader] = useState<Loader>(() => {
    if (typeof initialLoader === "string") {
      return initialLoader as Loader;
    }
    return initialLoader.style as Loader;
  });

  const { accessToken, setLoading } = useGlobalState();

  // State for the theme variant (light/dark/system)
  const [themeVariant, setThemeVariant] =
    useState<ThemeVariant>(defaultThemeVariant);

  // State for the actual theme values
  const [theme, setTheme] = useState<Theme>(lightTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Track if initial load is complete to prevent unnecessary API calls
  const initialLoadComplete = useRef(false);
  const isUpdatingSettings = useRef(false);

  const setLoader = useCallback((input: LoaderInput) => {
    const newLoader = typeof input === "string" ? input : input.style;
    _setLoader(newLoader as Loader);
  }, []);

  // Get system preference - memoized with proper dependencies
  const getSystemTheme = useCallback((): Theme => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? darkTheme
        : lightTheme;
    }
    return lightTheme;
  }, [lightTheme, darkTheme]);

  // Apply theme to DOM and state
  const applyTheme = useCallback(
    (newTheme: Theme, darkMode: boolean) => {
      setTheme(newTheme);
      setIsDarkMode(darkMode);

      // Apply to CSS variables
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty(
          "--background",
          newTheme.background
        );
        document.documentElement.style.setProperty(
          "--foreground",
          newTheme.foreground
        );
        document.documentElement.style.setProperty(
          "--accent",
          accentColor.color
        );
      }
    },
    [accentColor.color]
  );

  // Update theme based on variant
  const updateTheme = useCallback(
    (variant: ThemeVariant) => {
      let newTheme: Theme;
      let darkMode: boolean;

      switch (variant) {
        case "dark":
          newTheme = darkTheme;
          darkMode = true;
          break;
        case "light":
          newTheme = lightTheme;
          darkMode = false;
          break;
        case "system":
        default:
          newTheme = getSystemTheme();
          darkMode = newTheme.background === darkTheme.background;
          break;
      }

      applyTheme(newTheme, darkMode);
    },
    [lightTheme, darkTheme, getSystemTheme, applyTheme]
  );

  useEffect(() => {
    updateTheme(themeVariant);
  }, [themeVariant, updateTheme]); // Now handles updates

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        if (themeVariant === "system") {
          updateTheme("system");
        }
      };
      mediaQuery.addEventListener("change", handler);

      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [themeVariant, updateTheme]);

  // Update theme when variant changes
  useEffect(() => {
    updateTheme(themeVariant);
  }, [themeVariant, updateTheme]);

  // Update theme when light/dark theme configurations change
  useEffect(() => {
    updateTheme(themeVariant);
  }, [lightTheme, darkTheme, updateTheme]);

  // Update accent color in CSS when it changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--accent", accentColor.color);
    }
  }, [accentColor]);

  const toggleThemeVariant = () => {
    setThemeVariant((current) => {
      if (current === "system") return "dark";
      if (current === "dark") return "light";
      return "system";
    });
  };

  const getUserSettings = async () => {
    if (!accessToken || isUpdatingSettings.current) return;

    setLoading("fething_user_settings");
    try {
      const settingsRes: UserPreferences = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/settings/`,
        type: "User Settings",
      });

      if (settingsRes) {
        let needsUpdate = false;
        const requiredSettings = [
          "language",
          "theme",
          "primary_theme",
          "secondary_theme",
          "primary_theme_dark",
          "secondary_theme_dark",
          "loader",
          "accent",
        ];

        // Check if any required setting is missing or falsy
        needsUpdate = requiredSettings.some(
          (setting) => !settingsRes[setting as keyof UserPreferences]
        );

        // Apply settings if they exist
        if (settingsRes.accent && isValidHexColorStrict(settingsRes.accent)) {
          setAccentColor({ color: settingsRes.accent }); // Fixed: was using settingsRes.language
        } else {
          needsUpdate = true;
        }

        if (settingsRes.language) {
          setLanguage(
            findMatch(
              settingsRes.language,
              systemLanguages,
              ["code"],
              true
            ) || { code: "en", name: "English" }
          );
        } else {
          needsUpdate = true;
        }

        if (
          settingsRes.theme &&
          ["light", "dark", "system"].includes(settingsRes.theme)
        ) {
          setThemeVariant(settingsRes.theme as ThemeVariant); // Fixed: was setting theme instead of themeVariant
        } else {
          needsUpdate = true;
        }

        if (
          isValidHexColorStrict(
            settingsRes.primary_theme || lightTheme.background
          ) &&
          isValidHexColorStrict(
            settingsRes.secondary_theme || lightTheme.foreground
          )
        ) {
          setLightTheme({
            background: settingsRes.primary_theme || lightTheme.background,
            foreground: settingsRes.secondary_theme || lightTheme.foreground,
          });
        } else {
          needsUpdate = true;
        }

        if (
          isValidHexColorStrict(
            settingsRes.primary_theme_dark || darkTheme.background
          ) &&
          isValidHexColorStrict(
            settingsRes.secondary_theme_dark || darkTheme.foreground
          )
        ) {
          setDarkTheme({
            background: settingsRes.primary_theme_dark || darkTheme.background,
            foreground:
              settingsRes.secondary_theme_dark || darkTheme.foreground,
          });
        } else {
          needsUpdate = true;
        }

        if (settingsRes.loader) {
          setLoader(settingsRes.loader);
        } else {
          needsUpdate = true;
        }

        initialLoadComplete.current = true;

        // Trigger update if any setting was missing
        if (needsUpdate) {
          updateUserSettings();
        }
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    } finally {
      setLoading("fething_user_settings");
    }
  };

  const updateUserSettings = async () => {
    if (!accessToken || isUpdatingSettings.current) return;

    isUpdatingSettings.current = true;
    setLoading("fething_user_settings");

    try {
      const updateRes: UserPreferences = await UpdateAllData({
        access: accessToken,
        field: {
          language: language.code,
          theme: themeVariant,
          primary_theme: lightTheme.background,
          secondary_theme: lightTheme.foreground,
          accent: accentColor.color,
          primary_theme_dark: darkTheme.background,
          secondary_theme_dark: darkTheme.foreground,
          loader: loader,
        },
        url: `${V1_BASE_URL}/settings/`,
      });

      if (updateRes) {
        // toast.toast("Theme Updated", {
        //   type: "default",
        //   icon: <Palette className="w-5 h-5 text-[var(--accent)]" />,
        //   className:
        //     "border-[var(--accent)] bg-purple-[var(--background)] text-[var(--accent)]",
        //   sound: true,
        //   animation: "scale",
        //   position: "bottom-center",
        //   duration: 1000
        // });
        if (updateRes.language) {
          setLanguage(
            findMatch(updateRes.language, systemLanguages, ["code"], true) || {
              code: "en",
              name: "English",
            }
          );
        }
        if (updateRes.theme) {
          setThemeVariant(updateRes.theme);
        }
        if (updateRes.primary_theme && updateRes.secondary_theme) {
          setLightTheme({
            background: updateRes.primary_theme,
            foreground: updateRes.secondary_theme,
          });
        }
        if (updateRes.primary_theme_dark && updateRes.secondary_theme_dark) {
          setDarkTheme({
            background: updateRes.primary_theme_dark,
            foreground: updateRes.secondary_theme_dark,
          });
        }
        if (updateRes.loader) {
          setLoader(updateRes.loader);
        }
        if (updateRes.accent) {
          setAccentColor({ color: updateRes.accent });
        }
      }
    } catch (error) {
      console.error("Error updating user settings:", error);
    } finally {
      setLoading("fething_user_settings");
      isUpdatingSettings.current = false;
    }
  };

  // Load user settings on mount when accessToken is available
  useEffect(() => {
    if (accessToken && !initialLoadComplete.current) {
      getUserSettings();
    }
  }, [accessToken]);

  // Update settings when values change (but only after initial load)
  // Use primitive values to avoid object reference issues
  useEffect(() => {
    if (
      initialLoadComplete.current &&
      accessToken &&
      !isUpdatingSettings.current
    ) {
      const timeoutId = setTimeout(() => {
        updateUserSettings();
      }, 500); // debounce updates

      return () => clearTimeout(timeoutId);
    }
  }, [
    loader,
    themeVariant,
    lightTheme.background,
    lightTheme.foreground,
    darkTheme.background,
    darkTheme.foreground,
    language.code,
    accentColor.color,
  ]);

  return (
    <ThemeContext.Provider
      value={{
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
      }}
    >
      {children}
      <ThemeControlPanel />
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
