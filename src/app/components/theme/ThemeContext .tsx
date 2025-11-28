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
  settings: ProfileSettings;
  setSettings: (settings: ProfileSettings) => void;
  defaultSettings: ProfileSettings;
  layoutLoaded: boolean;
  setLayoutLoaded: (layoutLoaded: boolean) => void;
  getUserSettings: (url: string | undefined) => void;
  // New properties for save/cancel functionality
  hasUnsavedChanges: boolean;
  showSaveButtons: boolean;
  saveChanges: (customSettings: ProfileSettings) => void;
  cancelChanges: () => void;
  resetToDefaults: () => void;
};

// Settings interface
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

// Default settings
const defaultSettings: ProfileSettings = {
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
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  // Saved state for cancel functionality
  const [savedLightTheme, setSavedLightTheme] =
    useState<Theme>(initialLightTheme);
  const [savedDarkTheme, setSavedDarkTheme] = useState<Theme>(initialDarkTheme);
  const [savedAccentColor, setSavedAccentColor] =
    useState<Accent>(initialAccentColor);
  const [savedLanguage, setSavedLanguage] =
    useState<LanguageProps>(initialLanguage);
  const [savedSettings, setSavedSettings] =
    useState<ProfileSettings>(defaultSettings);
  const [savedThemeVariant, setSavedThemeVariant] =
    useState<ThemeVariant>(defaultThemeVariant);

  const [loader, _setLoader] = useState<Loader>(() => {
    if (typeof initialLoader === "string") {
      return initialLoader as Loader;
    }
    return initialLoader.style as Loader;
  });
  const [savedLoader, setSavedLoader] = useState<Loader>(() => {
    if (typeof initialLoader === "string") {
      return initialLoader as Loader;
    }
    return initialLoader.style as Loader;
  });

  const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);

  // New state for save/cancel functionality
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveButtons, setShowSaveButtons] = useState(false);

  const { accessToken, setLoading, currentUser } = useGlobalState();

  // State for the theme variant (light/dark/system)
  const [themeVariant, setThemeVariant] =
    useState<ThemeVariant>(defaultThemeVariant);

  // State for the actual theme values
  const [theme, setTheme] = useState<Theme>(lightTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Track if initial load is complete to prevent unnecessary API calls
  const initialLoadComplete = useRef(false);
  const isUpdatingSettings = useRef(false);
  const saveButtonsTimeoutRef = useRef<NodeJS.Timeout>(null);

  const setLoader = useCallback((input: LoaderInput) => {
    const newLoader = typeof input === "string" ? input : input.style;
    _setLoader(newLoader as Loader);
  }, []);

  // Function to update saved state (call this after successful save)
  const updateSavedState = useCallback(() => {
    setSavedLightTheme(lightTheme);
    setSavedDarkTheme(darkTheme);
    setSavedAccentColor(accentColor);
    setSavedLanguage(language);
    setSavedSettings(settings);
    setSavedThemeVariant(themeVariant);
    setSavedLoader(loader);
  }, [
    lightTheme,
    darkTheme,
    accentColor,
    language,
    settings,
    themeVariant,
    loader,
  ]);

  // Function to check if there are unsaved changes
  const checkForUnsavedChanges = useCallback(() => {
    const hasChanges =
      JSON.stringify(lightTheme) !== JSON.stringify(savedLightTheme) ||
      JSON.stringify(darkTheme) !== JSON.stringify(savedDarkTheme) ||
      JSON.stringify(accentColor) !== JSON.stringify(savedAccentColor) ||
      JSON.stringify(language) !== JSON.stringify(savedLanguage) ||
      JSON.stringify(settings) !== JSON.stringify(savedSettings) ||
      themeVariant !== savedThemeVariant ||
      loader !== savedLoader;

    return hasChanges;
  }, [
    lightTheme,
    darkTheme,
    accentColor,
    language,
    settings,
    themeVariant,
    loader,
    savedLightTheme,
    savedDarkTheme,
    savedAccentColor,
    savedLanguage,
    savedSettings,
    savedThemeVariant,
    savedLoader,
  ]);

  // Function to show save buttons with timeout
  const showSaveButtonsWithTimeout = useCallback(() => {
    setShowSaveButtons(true);

    // Clear existing timeout
    if (saveButtonsTimeoutRef.current) {
      clearTimeout(saveButtonsTimeoutRef.current);
    }

    // Set new timeout to hide buttons after 5 seconds
    saveButtonsTimeoutRef.current = setTimeout(() => {
      setShowSaveButtons(false);
    }, 15000);
  }, []);

  // Save changes function
  const saveChanges = useCallback(
    async (customSettings: ProfileSettings = settings) => {
      if (!accessToken || isUpdatingSettings.current) return;

      isUpdatingSettings.current = true;
      setLoading("updating_user_settings");

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
            layout_style: customSettings,
          },
          url: `${V1_BASE_URL}/settings/`,
        });

        if (updateRes) {
          // // Update saved state to match current state
          // updateSavedState();

          // Hide save buttons and clear unsaved changes
          setShowSaveButtons(false);
          setHasUnsavedChanges(false);

          // Clear timeout
          if (saveButtonsTimeoutRef.current) {
            clearTimeout(saveButtonsTimeoutRef.current);
          }

          // Optional: Show success toast
          // toast.toast("Settings saved successfully", { type: "success" });
        }
      } catch (error) {
        console.error("Error saving user settings:", error);
        // Optional: Show error toast
        // toast.toast("Failed to save settings", { type: "error" });
      } finally {
        setLoading("updating_user_settings");
        isUpdatingSettings.current = false;
      }
    },
    [
      accessToken,
      language,
      themeVariant,
      lightTheme,
      darkTheme,
      accentColor,
      loader,
      settings,
      setLoading,
      updateSavedState,
    ]
  );

  // Cancel changes function
  const cancelChanges = useCallback(() => {
    // Revert all changes to saved state
    setLightTheme(savedLightTheme);
    setDarkTheme(savedDarkTheme);
    setAccentColor(savedAccentColor);
    setLanguage(savedLanguage);
    setSettings(savedSettings);
    setThemeVariant(savedThemeVariant);
    _setLoader(savedLoader);

    // Hide save buttons and clear unsaved changes
    setShowSaveButtons(false);
    setHasUnsavedChanges(false);

    // Clear timeout
    if (saveButtonsTimeoutRef.current) {
      clearTimeout(saveButtonsTimeoutRef.current);
    }
  }, [
    savedLightTheme,
    savedDarkTheme,
    savedAccentColor,
    savedLanguage,
    savedSettings,
    savedThemeVariant,
    savedLoader,
  ]);

  // Monitor for changes and show save buttons
  useEffect(() => {
    if (initialLoadComplete.current) {
      const hasChanges = checkForUnsavedChanges();
      setHasUnsavedChanges(hasChanges);

      if (hasChanges) {
        showSaveButtonsWithTimeout();
      }
    }
  }, [
    lightTheme,
    darkTheme,
    accentColor,
    language,
    settings,
    themeVariant,
    loader,
    checkForUnsavedChanges,
    showSaveButtonsWithTimeout,
  ]);

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
  }, [themeVariant, updateTheme]);

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

  const getUserSettings = async (url = currentUser) => {
    if (!accessToken || isUpdatingSettings.current) return;
    setLayoutLoaded(false);

    setLoading("fething_user_settings");
    url = currentUser
      ? `${V1_BASE_URL}/settings/${currentUser}`
      : `${V1_BASE_URL}/settings/`;

    try {
      const settingsRes: UserPreferences = await GetAllData({
        access: accessToken,
        url: url,
        type: "User Settings",
      });

      if (settingsRes) {
        let needsUpdate = false;
        console.log("Fetched user settings:", settingsRes);
        const requiredSettings = [
          "language",
          "theme",
          "primary_theme",
          "secondary_theme",
          "primary_theme_dark",
          "secondary_theme_dark",
          "loader",
          "accent",
          "layout_style",
        ];

        // Check if any required setting is missing or falsy
        needsUpdate = requiredSettings.some(
          (setting) => !settingsRes[setting as keyof UserPreferences]
        );

        // Apply settings if they exist
        if (settingsRes.accent && isValidHexColorStrict(settingsRes.accent)) {
          setAccentColor({ color: settingsRes.accent });
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
          setThemeVariant(settingsRes.theme as ThemeVariant);
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

        // Handle layout_style and profile settings
        if (settingsRes.layout_style) {
          try {
            const profileSettings =
              typeof settingsRes.layout_style === "string"
                ? JSON.parse(settingsRes.layout_style)
                : settingsRes.layout_style;

            const mergedSettings = Object.assign(
              {},
              defaultSettings,
              profileSettings
            );
            setLayoutLoaded(true);
            setSettings(mergedSettings);
          } catch (error) {
            console.error("Error parsing layout_style:", error);
            setSettings(defaultSettings);
            needsUpdate = true;
          }
        } else {
          setSettings(defaultSettings);
          needsUpdate = true;
        }

        initialLoadComplete.current = true;

        // Update saved state after loading settings
        setTimeout(() => {
          updateSavedState();
        }, 100);

        // Trigger update if any setting was missing
        if (needsUpdate) {
          // For initial setup, save immediately without showing buttons
          setTimeout(() => {
            saveChanges();
          }, 200);
        }
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
      setSettings(defaultSettings);
      setLightTheme(initialLightTheme);
      setDarkTheme(initialDarkTheme);
      setAccentColor(initialAccentColor);
      setLanguage(initialLanguage);
      setThemeVariant(defaultThemeVariant);
      _setLoader(() => {
        if (typeof initialLoader === "string") {
          return initialLoader as Loader;
        }
        return initialLoader.style as Loader;
      });
      initialLoadComplete.current = true;
      setLayoutLoaded(true);
      setTimeout(() => {
        updateSavedState();
      }, 100);
      setTimeout(() => {
        saveChanges();
      }, 200);
    } finally {
      setLoading("fething_user_settings");
    }
  };

  const resetToDefaults = useCallback(() => {
    // Reset all theme and settings to their initial default values
    setLightTheme(initialLightTheme);
    setDarkTheme(initialDarkTheme);
    setAccentColor(initialAccentColor);
    setLanguage(initialLanguage);
    setThemeVariant(defaultThemeVariant);
    _setLoader(() => {
      if (typeof initialLoader === "string") {
        return initialLoader as Loader;
      }
      return initialLoader.style as Loader;
    });
    setSettings(defaultSettings);

    // Update saved state to match the reset values
    setSavedLightTheme(initialLightTheme);
    setSavedDarkTheme(initialDarkTheme);
    setSavedAccentColor(initialAccentColor);
    setSavedLanguage(initialLanguage);
    setSavedThemeVariant(defaultThemeVariant);
    setSavedLoader(() => {
      if (typeof initialLoader === "string") {
        return initialLoader as Loader;
      }
      return initialLoader.style as Loader;
    });
    setSavedSettings(defaultSettings);
  }, [
    initialLightTheme,
    initialDarkTheme,
    initialAccentColor,
    initialLanguage,
    defaultThemeVariant,
    initialLoader,
    accessToken,
    saveChanges,
  ]);

  // Load user settings on mount when accessToken is available
  useEffect(() => {
    if (accessToken && !initialLoadComplete.current) {
      getUserSettings();
    }
  }, [accessToken, currentUser]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveButtonsTimeoutRef.current) {
        clearTimeout(saveButtonsTimeoutRef.current);
      }
    };
  }, []);

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
        settings,
        setSettings,
        defaultSettings,
        layoutLoaded,
        setLayoutLoaded,
        getUserSettings,
        hasUnsavedChanges,
        showSaveButtons,
        saveChanges,
        cancelChanges,
        resetToDefaults,
      }}
    >
      {children}
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
