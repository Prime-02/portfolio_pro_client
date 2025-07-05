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
} from "@/app/components/types and interfaces/loaderTypes";
import ThemeControlPanel from "./ThemeControlPanel";

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
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
  defaultThemeVariant?: ThemeVariant;
  defaultLightTheme?: Theme;
  defaultDarkTheme?: Theme;
  defaultAccentColor?: Accent;
  defaultLoader?: LoaderInput;
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
}: ThemeProviderProps) => {
  // State for theme configurations
  const [lightTheme, setLightTheme] = useState<Theme>(initialLightTheme);
  const [darkTheme, setDarkTheme] = useState<Theme>(initialDarkTheme);
  const [accentColor, setAccentColor] = useState<Accent>(initialAccentColor);
  const [loader, _setLoader] = useState<Loader>(() => {
    if (typeof initialLoader === "string") {
      return initialLoader as Loader; // Cast to Loader if it's a string
    }
    return initialLoader.style as Loader; // Cast to Loader if it's an object
  });

  const setLoader = useCallback((input: LoaderInput) => {
    const newLoader = typeof input === "string" ? input : input.style;
    _setLoader(newLoader as Loader);
  }, []);

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
