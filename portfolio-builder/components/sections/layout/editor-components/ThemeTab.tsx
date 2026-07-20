import { useCallback, useMemo } from "react";
import PortfolioThemePicker, { PortfolioThemeValues } from "@/src/app/components/portfolio/PortfolioThemePicker";
import { PortfolioThemeData } from "@/portfolio-builder/hooks/usePortfolioTheme";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";
import { useTheme } from "@/src/context/ThemeContext";
import { themePresets } from "@/lib/utilities/indices/Themes";

interface ThemeTabProps { }

export default function ThemeTab({ }: ThemeTabProps) {
    const portfolioSlug = usePortfolioStore((s) => s.currentPortfolio?.slug);
    const themeData = usePortfolioStore(
        (s) => s.currentPortfolio?.layout?.theme as PortfolioThemeData | undefined,
    );
    const updateThemeLocally = usePortfolioStore((s) => s.updateThemeLocally);

    // Get current app theme from ThemeContext for default values
    const { lightTheme, darkTheme, accentColor, themeVariant: appThemeVariant } = useTheme();

    const themeValues = useMemo((): PortfolioThemeValues => ({
        themeVariant: themeData?.themeVariant ?? appThemeVariant ?? "system",
        lightBg: themeData?.lightTheme?.background ?? lightTheme.background ?? themePresets[0].light.background,
        lightFg: themeData?.lightTheme?.foreground ?? lightTheme.foreground ?? themePresets[0].light.foreground,
        darkBg: themeData?.darkTheme?.background ?? darkTheme.background ?? themePresets[0].dark.background,
        darkFg: themeData?.darkTheme?.foreground ?? darkTheme.foreground ?? themePresets[0].dark.foreground,
        accent: themeData?.accent ?? accentColor.color ?? themePresets[0].accent,
    }), [themeData, lightTheme, darkTheme, accentColor, appThemeVariant]);

    const handleThemeChange = useCallback((values: PortfolioThemeValues) => {
        if (!portfolioSlug) return;
        updateThemeLocally(portfolioSlug, {
            themeVariant: values.themeVariant,
            lightTheme: {
                background: values.lightBg,
                foreground: values.lightFg,
            },
            darkTheme: {
                background: values.darkBg,
                foreground: values.darkFg,
            },
            accent: values.accent,
        });
    }, [portfolioSlug, updateThemeLocally]);

    return (
        <PortfolioThemePicker
            values={themeValues}
            onChange={handleThemeChange}
            description="Customize the colors and mode of your portfolio. Defaults to your current app theme settings."
            fetchCustomTheme
        />
    );
}