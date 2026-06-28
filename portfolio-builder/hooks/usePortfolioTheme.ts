// portfolio-builder/hooks/usePortfolioTheme.ts

"use client";

import { useEffect, useCallback } from "react";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";

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
 * Exported so other modules (e.g. ThemeTab) can inject CSS directly.
 */
export function resolveTheme(data: PortfolioThemeData | null): ResolvedTheme {
  if (!data) {
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
// Hook — reads directly from the store, no props needed.
// CSS is injected whenever the store's theme changes, including local-only
// updates from ThemeToggle / ThemeTab before the user hits "Save Layout".
// ---------------------------------------------------------------------------

export function usePortfolioTheme(): ResolvedTheme {
  // Granular selector — only re-renders when layout.theme actually changes.
  const themeData = usePortfolioStore(
    (s) =>
      (s.currentPortfolio?.layout?.theme as PortfolioThemeData | undefined) ??
      null,
  );

  const injectAndResolve = useCallback(() => {
    const resolved = resolveTheme(themeData);
    injectThemeCSS(resolved);
    return resolved;
  }, [themeData]);

  // Re-inject whenever themeData changes (covers toggle + tab changes).
  useEffect(() => {
    injectAndResolve();

    // Keep CSS in sync when the OS switches light/dark while variant === "system"
    if (themeData?.themeVariant === "system" && typeof window !== "undefined") {
      const mql = window.matchMedia("(prefers-color-scheme: light)");
      const handler = () => injectAndResolve();
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
  }, [themeData, injectAndResolve]);

  return resolveTheme(themeData);
}
