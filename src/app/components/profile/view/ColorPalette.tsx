// src/app/profile/view/ColorPalette.tsx

import type { UserSettings } from "@/lib/stores/user/useUserSettings";

interface ColorPaletteProps {
    settings: UserSettings;
}

export const ColorPalette = ({ settings }: ColorPaletteProps) => {
    const swatches = [
        { label: "Accent", value: settings.accent, cssVar: "--accent" },
        { label: "Primary", value: settings.primary_theme, cssVar: "--primary_theme" },
        { label: "Secondary", value: settings.secondary_theme, cssVar: "--secondary_theme" },
        { label: "Primary Dark", value: settings.primary_theme_dark, cssVar: "--primary_theme_dark" },
        { label: "Secondary Dark", value: settings.secondary_theme_dark, cssVar: "--secondary_theme_dark" },
    ].filter((s) => s.value);

    if (swatches.length === 0) return null;

    return (
        <div className="pt-4 mt-4 border-t border-(--foreground)/10">
            <p className="text-xs font-league-500 text-(--foreground)/40 uppercase tracking-wider mb-4">Color Palette</p>
            <div className="flex flex-wrap gap-4">
                {swatches.map((swatch) => (
                    <div key={swatch.label} className="flex items-center gap-3 group">
                        <div className="relative">
                            <div
                                className="w-8 h-8 rounded-lg border border-(--foreground)/10 shadow-sm transition-transform group-hover:scale-110"
                                style={{ background: swatch.value ?? undefined }}
                            />
                            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-league-500 text-(--foreground)/70">{swatch.label}</span>
                            <span className="text-[10px] font-mono text-(--foreground)/40">{swatch.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};