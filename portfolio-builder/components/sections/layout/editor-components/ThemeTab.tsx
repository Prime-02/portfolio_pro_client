import { useCallback, useMemo } from "react";
import PortfolioThemePicker, { PortfolioThemeValues } from "@/src/app/components/portfolio/PortfolioThemePicker";
import { PortfolioThemeData } from "@/portfolio-builder/hooks/usePortfolioTheme";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";

interface ThemeTabProps { }

export default function ThemeTab({ }: ThemeTabProps) {
    const portfolioSlug = usePortfolioStore((s) => s.currentPortfolio?.slug);
    const themeData = usePortfolioStore(
        (s) => s.currentPortfolio?.layout?.theme as PortfolioThemeData | undefined,
    );
    const updateThemeLocally = usePortfolioStore((s) => s.updateThemeLocally);

    const themeValues = useMemo((): PortfolioThemeValues => ({
        themeVariant: themeData?.themeVariant ?? "system",
        lightBg: themeData?.lightTheme?.background ?? "#ffffff",
        lightFg: themeData?.lightTheme?.foreground ?? "#0a0a0a",
        darkBg: themeData?.darkTheme?.background ?? "#0a0a0a",
        darkFg: themeData?.darkTheme?.foreground ?? "#ededed",
        accent: themeData?.accent ?? "#737373",
    }), [themeData]);

    // PortfolioThemePicker always calls onChange with the full PortfolioThemeValues
    // object (via `onChange({ ...values, [key]: value })`), so we can map all
    // fields directly — no partial merging or fallback store reads needed.
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
            description="Customize the colors and mode of your portfolio."
        />
    );
}