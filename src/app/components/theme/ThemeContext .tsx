"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  LoaderOptions,
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
import { BASE_URL, V1_BASE_URL } from "../utilities/indices/urls";
import { useToast } from "../toastify/Toastify";

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

// Utility function to validate hex color codes
const isValidHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

// Utility function to validate and sanitize theme
const validateTheme = (theme: Theme, defaultTheme: Theme): Theme => {
  return {
    background: isValidHexColor(theme.background)
      ? theme.background
      : defaultTheme.background,
    foreground: isValidHexColor(theme.foreground)
      ? theme.foreground
      : defaultTheme.foreground,
  };
};

// Utility function to validate accent color
const validateAccentColor = (accent: Accent, defaultAccent: Accent): Accent => {
  return {
    color: isValidHexColor(accent.color) ? accent.color : defaultAccent.color,
  };
};

// Simple debounce utility function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
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
  const {toast} = useToast()
  const [lightTheme, _setLightTheme] = useState<Theme>(initialLightTheme);
  const [darkTheme, _setDarkTheme] = useState<Theme>(initialDarkTheme);
  const [accentColor, _setAccentColor] = useState<Accent>(initialAccentColor);
  const [language, setLanguage] = useState<LanguageProps>(initialLanguage);
  const [loader, _setLoader] = useState<Loader>(() => {
    if (typeof initialLoader === "string") {
      return initialLoader as Loader; // Cast to Loader if it's a string
    }
    return initialLoader.style as Loader; // Cast to Loader if it's an object
  });
  const { accessToken, loading, setLoading } = useGlobalState();

  const setLoader = useCallback((input: LoaderInput) => {
    const newLoader = typeof input === "string" ? input : input.style;
    _setLoader(newLoader as Loader);
  }, []);

  // Track initial values to detect changes
  const [initialSettings, setInitialSettings] = useState<{
    lightTheme: Theme;
    darkTheme: Theme;
    accentColor: Accent;
    loader: Loader;
    language: LanguageProps;
  } | null>(null);

  // Validated theme setters
  const setLightTheme = useCallback(
    (theme: Theme) => {
      const validatedTheme = validateTheme(theme, initialLightTheme);
      _setLightTheme(validatedTheme);
    },
    [initialLightTheme]
  );

  const setDarkTheme = useCallback(
    (theme: Theme) => {
      const validatedTheme = validateTheme(theme, initialDarkTheme);
      _setDarkTheme(validatedTheme);
    },
    [initialDarkTheme]
  );

  // Validated accent color setter
  const setAccentColor = useCallback(
    (accent: Accent) => {
      const validatedAccent = validateAccentColor(accent, initialAccentColor);
      _setAccentColor(validatedAccent);
    },
    [initialAccentColor]
  );

  // Function to check if settings have changed
  const hasSettingsChanged = useCallback(() => {
    if (!initialSettings) return false;

    return (
      lightTheme.background !== initialSettings.lightTheme.background ||
      lightTheme.foreground !== initialSettings.lightTheme.foreground ||
      darkTheme.background !== initialSettings.darkTheme.background ||
      darkTheme.foreground !== initialSettings.darkTheme.foreground ||
      accentColor.color !== initialSettings.accentColor.color ||
      loader !== initialSettings.loader ||
      language.code !== initialSettings.language.code ||
      language.name !== initialSettings.language.name
    );
  }, [lightTheme, darkTheme, accentColor, loader, language, initialSettings]);

  // Function to update settings on server using updateUserSettings
  const updateSettingsOnServer = useCallback(async () => {
    if (!hasSettingsChanged() || !accessToken) return;

    await updateUserSettings();
  }, [hasSettingsChanged, accessToken]);

  // Debounced update function to avoid too many API calls
  const debouncedUpdate = useCallback(debounce(updateSettingsOnServer, 1000), [
    updateSettingsOnServer,
  ]);

  // Effect to trigger update when settings change
  useEffect(() => {
    if (initialSettings && hasSettingsChanged()) {
      debouncedUpdate();
    }
  }, [
    lightTheme,
    darkTheme,
    accentColor,
    loader,
    language,
    initialSettings,
    hasSettingsChanged,
    debouncedUpdate,
  ]);

  // State for the theme variant (light/dark/system)
  const [themeVariant, setThemeVariant] =
    useState<ThemeVariant>(defaultThemeVariant);

  // State for the actual theme values
  const [theme, setTheme] = useState<Theme>(lightTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      document.documentElement.style.setProperty(
        "--background",
        newTheme.background
      );
      document.documentElement.style.setProperty(
        "--foreground",
        newTheme.foreground
      );
      document.documentElement.style.setProperty("--accent", accentColor.color);
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

  // Initialize theme on mount
  useEffect(() => {
    updateTheme(themeVariant);
  }, []); // Only run on mount

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
    document.documentElement.style.setProperty("--accent", accentColor.color);
  }, [accentColor]);

  const toggleThemeVariant = () => {
    setThemeVariant((current) => {
      if (current === "system") return "dark";
      if (current === "dark") return "light";
      return "system";
    });
  };

  const getUserSettings = async () => {
    setLoading("fething_user_settings");
    try {
      const settingsRes = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/settings/`,
        type: "User Settings",
      });
      if (settingsRes) {
        console.log("User Settings: ", settingsRes);

        // Prepare validated settings to use for initialSettings
        let newLightTheme = lightTheme;
        let newDarkTheme = darkTheme;
        let newAccentColor = accentColor;
        let newLoader = loader;
        let newLanguage = language;

        // Validate and set language
        if (settingsRes.language) {
          newLanguage = settingsRes.language;
          setLanguage(settingsRes.language);
        }

        // Validate and set theme
        if (settingsRes.theme) {
          setThemeVariant(settingsRes.theme); // Correct
        }

        // Validate and set light theme
        if (settingsRes.primary_theme && settingsRes.secondary_theme) {
          if (
            isValidHexColor(settingsRes.primary_theme) &&
            isValidHexColor(settingsRes.secondary_theme)
          ) {
            const candidateTheme = {
              background: settingsRes.primary_theme,
              foreground: settingsRes.secondary_theme,
            };
            newLightTheme = candidateTheme;
            setLightTheme(candidateTheme);
          }
        }

        // Validate and set dark theme
        if (
          settingsRes.primary_theme_dark &&
          settingsRes.secondary_theme_dark
        ) {
          if (
            isValidHexColor(settingsRes.primary_theme_dark) &&
            isValidHexColor(settingsRes.secondary_theme_dark)
          ) {
            const candidateTheme = {
              background: settingsRes.primary_theme_dark,
              foreground: settingsRes.secondary_theme_dark,
            };
            newDarkTheme = candidateTheme;
            setDarkTheme(candidateTheme);
          }
        }

        // Validate and set accent color
        if (
          settingsRes.accent_color &&
          isValidHexColor(settingsRes.accent_color)
        ) {
          const candidateAccent = { color: settingsRes.accent_color };
          newAccentColor = candidateAccent;
          setAccentColor(candidateAccent);
        }

        // Set loader
        if (settingsRes.loader) {
          newLoader = settingsRes.loader;
          setLoader(settingsRes.loader);
        }

        // Set initial settings using the validated values
        setInitialSettings({
          lightTheme: newLightTheme,
          darkTheme: newDarkTheme,
          accentColor: newAccentColor,
          loader: newLoader,
          language: newLanguage,
        });
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    } finally {
      setLoading("fething_user_settings");
    }
  };

  // Effect to fetch user settings on mount and when accessToken changes
  useEffect(() => {
    if (accessToken) {
      getUserSettings();
    }
  }, [accessToken]);

  const updateUserSettings = async () => {
    setLoading("updating_user_settings");
    try {
      const updateRes = await UpdateAllData({
        access: accessToken,
        field: {
          language: language,
          theme: themeVariant,
          primary_theme: lightTheme.background,
          secondary_theme: lightTheme.foreground,
          primary_theme_dark: darkTheme.background,
          secondary_theme_dark: darkTheme.foreground,
          accent_color: accentColor.color,
          loader: loader,
        },
        url: `${V1_BASE_URL}/settings/`,
      });
      if (updateRes) {
        // Prepare validated settings to use for initialSettings
        let newLightTheme = lightTheme;
        let newDarkTheme = darkTheme;
        let newAccentColor = accentColor;
        let newLoader = loader;
        let newLanguage = language;

        // Validate and update language
        if (updateRes.language) {
          newLanguage = updateRes.language;
          setLanguage(updateRes.language);
        }

        // Validate and update theme
        if (updateRes.theme) {
          setThemeVariant(updateRes.theme);
        }

        // Validate and update light theme
        if (updateRes.primary_theme && updateRes.secondary_theme) {
          if (
            isValidHexColor(updateRes.primary_theme) &&
            isValidHexColor(updateRes.secondary_theme)
          ) {
            const candidateTheme = {
              background: updateRes.primary_theme,
              foreground: updateRes.secondary_theme,
            };
            newLightTheme = candidateTheme;
            setLightTheme(candidateTheme);
          }
        }

        // Validate and update dark theme
        if (updateRes.primary_theme_dark && updateRes.secondary_theme_dark) {
          if (
            isValidHexColor(updateRes.primary_theme_dark) &&
            isValidHexColor(updateRes.secondary_theme_dark)
          ) {
            const candidateTheme = {
              background: updateRes.primary_theme_dark,
              foreground: updateRes.secondary_theme_dark,
            };
            newDarkTheme = candidateTheme;
            setDarkTheme(candidateTheme);
          }
        }

        // Validate and update accent color
        if (updateRes.accent_color && isValidHexColor(updateRes.accent_color)) {
          const candidateAccent = { color: updateRes.accent_color };
          newAccentColor = candidateAccent;
          setAccentColor(candidateAccent);
        }

        // Update loader
        if (updateRes.loader) {
          newLoader = updateRes.loader;
          setLoader(updateRes.loader);
        }

        // Update initial settings using the validated values
        setInitialSettings({
          lightTheme: newLightTheme,
          darkTheme: newDarkTheme,
          accentColor: newAccentColor,
          loader: newLoader,
          language: newLanguage,
        });
      }
    } catch (error) {
      console.error("Error updating user settings:", error);
    } finally {
      setLoading("updating_user_settings");
    }
  };

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
