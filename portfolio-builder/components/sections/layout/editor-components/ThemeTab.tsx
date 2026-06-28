import { useCallback, useMemo } from "react";
import PortfolioThemePicker, { PortfolioThemeValues } from "@/src/app/components/portfolio/PortfolioThemePicker";
import {
    injectThemeCSS,
    resolveTheme,
    PortfolioThemeData,
} from "@/portfolio-builder/hooks/usePortfolioTheme";
import { LayoutData } from "@/portfolio-builder/types/layout";

interface ThemeTabProps {
    data: LayoutData;
    onChange: (updated: LayoutData) => void;
}

export default function ThemeTab({ data, onChange }: ThemeTabProps) {
    const themeValues = useMemo((): PortfolioThemeValues => ({
        themeVariant: data.theme?.themeVariant ?? "system",
        lightBg: data.theme?.lightTheme?.background ?? "#ffffff",
        lightFg: data.theme?.lightTheme?.foreground ?? "#0a0a0a",
        darkBg: data.theme?.darkTheme?.background ?? "#0a0a0a",
        darkFg: data.theme?.darkTheme?.foreground ?? "#ededed",
        accent: data.theme?.accent ?? "#737373",
    }), [data.theme]);

    const handleThemeChange = useCallback((theme: PortfolioThemeValues) => {
        const themeData: PortfolioThemeData = {
            themeVariant: theme.themeVariant,
            lightTheme: { background: theme.lightBg, foreground: theme.lightFg },
            darkTheme: { background: theme.darkBg, foreground: theme.darkFg },
            accent: theme.accent,
        };
        // Inject CSS immediately for a live preview — onChange persists to store
        // (debounced at the LayoutController level).
        injectThemeCSS(resolveTheme(themeData));
        onChange({ ...data, theme: themeData });
    }, [data, onChange]);

    const handleResetToDefaults = useCallback(() => {
        const defaults: PortfolioThemeData = {
            themeVariant: "system",
            lightTheme: { background: "#ffffff", foreground: "#0a0a0a" },
            darkTheme: { background: "#0a0a0a", foreground: "#ededed" },
            accent: "#737373",
        };
        injectThemeCSS(resolveTheme(defaults));
        onChange({ ...data, theme: defaults });
    }, [data, onChange]);

    return (
        <PortfolioThemePicker
            values={themeValues}
            onChange={handleThemeChange}
            onResetToCurrent={handleResetToDefaults}
            description="Customize the colors and mode of your portfolio."
        />
    );
}