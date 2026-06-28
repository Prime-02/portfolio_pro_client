// portfolio-builder/hooks/usePortfolioTheme.ts

"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemeColors {
  background: string;
  foreground: string;
}

export interface PortfolioThemeData {
  themeVariant: "system" | "light" | "dark";
  lightTheme: ThemeColors;
  darkTheme: ThemeColors;
  accent: string;
}

export interface ResolvedTheme {
  background: string;
  foreground: string;
  accent: string;
  isDark: boolean;
}

// ---------------------------------------------------------------------------
// CSS Variable Injection
// ---------------------------------------------------------------------------

const CSS_VAR_PREFIX = "--pb-";

function setCSSVariable(name: string, value: string) {
  document.documentElement.style.setProperty(`${CSS_VAR_PREFIX}${name}`, value);
}

function removeCSSVariable(name: string) {
  document.documentElement.style.removeProperty(`${CSS_VAR_PREFIX}${name}`);
}

/**
 * Injects resolved theme values as CSS custom properties on :root.
 * All portfolio-builder components read from these variables.
 */
export function injectThemeCSS(theme: ResolvedTheme) {
  setCSSVariable("background", theme.background);
  setCSSVariable("foreground", theme.foreground);
  setCSSVariable("accent", theme.accent);
}

/**
 * Clears all portfolio-builder theme CSS variables.
 */
export function clearThemeCSS() {
  ["background", "foreground", "accent"].forEach(removeCSSVariable);
}

// ---------------------------------------------------------------------------
// Resolution Logic
// ---------------------------------------------------------------------------

/**
 * Resolves a PortfolioThemeData object into a flat ResolvedTheme,
 * respecting the themeVariant and system preference.
 * Exported so other modules (e.g. LayoutEditor) can inject CSS directly.
 */
export function resolveTheme(data: PortfolioThemeData | null): ResolvedTheme {
  if (!data) {
    // Default dark fallback
    return {
      background: "#0a0a0a",
      foreground: "#ededed",
      accent: "#737373",
      isDark: true,
    };
  }

  let resolved: ThemeColors;
  let isDark: boolean;

  switch (data.themeVariant) {
    case "light":
      resolved = data.lightTheme;
      isDark = false;
      break;
    case "dark":
      resolved = data.darkTheme;
      isDark = true;
      break;
    case "system":
    default: {
      const prefersLight =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: light)").matches;
      resolved = prefersLight ? data.lightTheme : data.darkTheme;
      isDark = !prefersLight;
      break;
    }
  }

  return {
    background: resolved.background,
    foreground: resolved.foreground,
    accent: data.accent,
    isDark,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePortfolioTheme(
  themeData: PortfolioThemeData | null,
): ResolvedTheme {
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolveTheme(themeData),
  );

  const updateTheme = useCallback(() => {
    const next = resolveTheme(themeData);
    setResolved(next);
    injectThemeCSS(next);
  }, [themeData]);

  useEffect(() => {
    updateTheme();

    // Listen for system preference changes when in "system" mode
    if (themeData?.themeVariant === "system" && typeof window !== "undefined") {
      const mql = window.matchMedia("(prefers-color-scheme: light)");
      const handler = () => updateTheme();
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
  }, [themeData, updateTheme]);

  return resolved;
}
