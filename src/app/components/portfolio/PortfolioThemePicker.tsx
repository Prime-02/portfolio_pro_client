import { useEffect, useState } from "react";
import { themePresets } from "@/lib/utilities/indices/Themes";
import ColorPicker from "../inputs/ColorPicker";
import type { ThemeVariant } from "../types and interfaces/loaderTypes";
import { ThemePreset } from "../../(user)/[username]/(sub-routes)/settings/preference/tabs/Themes";
import { hexToRgb } from "@/lib/utilities/syncFunctions/syncs";
import { useTheme } from "../../../context/ThemeContext";
import { UserTheme, useUserThemeStore } from "@/lib/stores/themes/useThemes";

export interface PortfolioThemeValues {
  themeVariant: ThemeVariant;
  lightBg: string;
  lightFg: string;
  darkBg: string;
  darkFg: string;
  accent: string;
}

interface PortfolioThemePickerProps {
  values: PortfolioThemeValues;
  onChange: (values: PortfolioThemeValues) => void; // always full object
  description?: string;
  fetchCustomTheme?: boolean;
}

const PortfolioThemePicker = ({
  values,
  onChange,
  description = "Customize the appearance of your portfolio. Defaults to your current theme settings.",
  fetchCustomTheme = false,
}: PortfolioThemePickerProps) => {
  // Get current app theme context for defaults
  const { lightTheme, darkTheme, accentColor, themeVariant: appThemeVariant } = useTheme();

  const { themes, fetchThemes, isLoading: themesLoading, error: themesError } =
    useUserThemeStore();

  // Detect system dark mode for "system" variant
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Pull the user's saved custom themes in when this picker is asked for them.
  useEffect(() => {
    if (fetchCustomTheme) {
      fetchThemes();
    }
    // fetchThemes identity is stable from the store; only re-run if the flag changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCustomTheme]);

  // Get effective default values from app theme context
  const getDefaultValues = (): PortfolioThemeValues => ({
    themeVariant: appThemeVariant,
    lightBg: lightTheme.background,
    lightFg: lightTheme.foreground,
    darkBg: darkTheme.background,
    darkFg: darkTheme.foreground,
    accent: accentColor.color,
  });

  // Resolve which bg/fg to use for the component's own chrome
  const isDark =
    values.themeVariant === "dark" ||
    (values.themeVariant === "system" && systemDark);
  const chromeBg = isDark ? values.darkBg : values.lightBg;
  const chromeFg = isDark ? values.darkFg : values.lightFg;
  const chromeAccent = values.accent;

  const borderColor = (opacity = 0.15) =>
    `rgba(${hexToRgb(chromeFg)}, ${opacity})`;

  // Always spreads the full current values so every onChange call carries
  // the complete object — ThemeTab can map fields directly without merging.
  const set = (key: keyof PortfolioThemeValues) => (value: string) =>
    onChange({ ...values, [key]: value });

  const setThemeVariant = (variant: ThemeVariant) =>
    onChange({ ...values, themeVariant: variant });

  const handlePresetSelect = (preset: ThemePreset) => {
    onChange({
      // Preserve the currently selected mode unless this preset explicitly
      // specifies one — presets are color palettes, not mode pickers, so
      // selecting one should never silently reset light/dark/system.
      themeVariant:
        (preset as ThemePreset & { themeVariant?: ThemeVariant })
          .themeVariant ?? values.themeVariant,
      lightBg: preset.light.background,
      lightFg: preset.light.foreground,
      darkBg: preset.dark.background,
      darkFg: preset.dark.foreground,
      accent: preset.accent,
    });
  };

  // --- Custom (user-saved) themes ---------------------------------------
  // UserTheme fields are all optional except `name`, so unlike presets we
  // can't assume every field is present. Build only the keys that exist,
  // then spread over `values` so anything the saved theme didn't set
  // (e.g. themeVariant) is left exactly as-is instead of going undefined.
  //
  // Field mapping assumption (inferred from defaultTheme in the store):
  //   primary_theme / primary_theme_dark    -> foreground (text)
  //   secondary_theme / secondary_theme_dark -> background
  // Flip lightFg/lightBg and darkFg/darkBg below if that's backwards.
  const mapUserThemeToPartial = (theme: UserTheme): Partial<PortfolioThemeValues> => {
    const partial: Partial<PortfolioThemeValues> = {};
    if (theme.theme === "light" || theme.theme === "dark" || theme.theme === "system") {
      partial.themeVariant = theme.theme as ThemeVariant;
    }
    if (theme.primary_theme) partial.lightFg = theme.primary_theme;
    if (theme.secondary_theme) partial.lightBg = theme.secondary_theme;
    if (theme.primary_theme_dark) partial.darkFg = theme.primary_theme_dark;
    if (theme.secondary_theme_dark) partial.darkBg = theme.secondary_theme_dark;
    if (theme.accent) partial.accent = theme.accent;
    return partial;
  };

  const handleUserThemeSelect = (theme: UserTheme) => {
    onChange({ ...values, ...mapUserThemeToPartial(theme) });
  };

  const isUserThemeActive = (theme: UserTheme) => {
    const partial = mapUserThemeToPartial(theme);
    const keys = Object.keys(partial) as (keyof PortfolioThemeValues)[];
    return keys.length > 0 && keys.every((key) => partial[key] === values[key]);
  };

  // Reset to app theme defaults
  const handleResetToDefaults = () => {
    onChange(getDefaultValues());
  };

  // Determine if current values match app theme defaults
  const defaults = getDefaultValues();
  const isUsingDefaults =
    values.lightBg === defaults.lightBg &&
    values.lightFg === defaults.lightFg &&
    values.darkBg === defaults.darkBg &&
    values.darkFg === defaults.darkFg &&
    values.accent === defaults.accent;

  const activePresetName = themePresets.find((preset: ThemePreset) => {
    const p = preset as ThemePreset & { themeVariant?: ThemeVariant };
    return (
      (p.themeVariant ?? values.themeVariant) === values.themeVariant &&
      preset.accent === values.accent &&
      preset.light.background === values.lightBg &&
      preset.light.foreground === values.lightFg &&
      preset.dark.background === values.darkBg &&
      preset.dark.foreground === values.darkFg
    );
  })?.name;

  return (
    <div
      className="rounded-lg p-4 space-y-4 transition-colors duration-300"
      style={{
        backgroundColor: chromeBg,
        border: `1px solid ${borderColor(0.15)}`,
      }}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3
            className="text-sm font-medium"
            style={{ color: chromeFg }}
          >
            Portfolio Theme
          </h3>
          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={isUsingDefaults}
            className="text-xs px-2 py-1 rounded-md transition-all"
            style={{
              backgroundColor: isUsingDefaults ? 'transparent' : `${chromeAccent}20`,
              color: isUsingDefaults ? chromeFg : chromeAccent,
              opacity: isUsingDefaults ? 0.4 : 1,
              border: `1px solid ${isUsingDefaults ? 'transparent' : chromeAccent}40`,
              cursor: isUsingDefaults ? 'not-allowed' : 'pointer',
            }}
          >
            {isUsingDefaults ? 'Using App Theme' : 'Reset to App Theme'}
          </button>
        </div>
        <p style={{ color: chromeFg, opacity: 0.5 }} className="text-xs">
          {description}
        </p>
      </div>

      {/* Theme Variant Selector */}
      <div>
        <h4 className="text-xs font-medium mb-2" style={{ color: chromeFg, opacity: 0.7 }}>
          Theme Mode
        </h4>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as ThemeVariant[]).map((variant) => (
            <button
              key={variant}
              type="button"
              onClick={() => setThemeVariant(variant)}
              className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all"
              style={
                values.themeVariant === variant
                  ? {
                    backgroundColor: chromeAccent,
                    color: chromeBg,
                    borderColor: chromeAccent,
                  }
                  : {
                    backgroundColor: "transparent",
                    color: chromeFg,
                    borderColor: borderColor(0.25),
                    opacity: 0.7,
                  }
              }
            >
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-[10px] mt-1.5" style={{ color: chromeFg, opacity: 0.4 }}>
          {values.themeVariant === "system"
            ? "Follows the visitor's system preference"
            : values.themeVariant === "light"
              ? "Always uses light mode"
              : "Always uses dark mode"}
        </p>
      </div>

      {/* Your Custom Themes — kept visually and structurally distinct from
          the built-in Presets grid below, so it's unambiguous which one(s)
          belong to the user. */}
      {fetchCustomTheme && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-xs font-medium" style={{ color: chromeFg, opacity: 0.7 }}>
              Your Themes
            </h4>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${chromeAccent}20`,
                color: chromeAccent,
              }}
            >
              Custom
            </span>
          </div>

          {themesLoading && themes.length === 0 && (
            <p className="text-[11px]" style={{ color: chromeFg, opacity: 0.4 }}>
              Loading your saved themes…
            </p>
          )}

          {!themesLoading && themesError && (
            <p className="text-[11px]" style={{ color: chromeFg, opacity: 0.5 }}>
              {`Couldn't load your saved themes.`}
            </p>
          )}

          {!themesLoading && !themesError && themes.length === 0 && (
            <p className="text-[11px]" style={{ color: chromeFg, opacity: 0.4 }}>
             {` You don't have any saved themes yet.`}
            </p>
          )}

          {themes.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => {
                const active = isUserThemeActive(theme);
                const swatchAccent = theme.accent ?? chromeAccent;
                const swatchLightBg = theme.secondary_theme ?? values.lightBg;
                const swatchDarkBg = theme.secondary_theme_dark ?? values.darkBg;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleUserThemeSelect(theme)}
                    className="relative rounded-lg border-2 p-2.5 transition-all hover:scale-[1.02] text-left flex items-center gap-2"
                    style={{
                      borderColor: active ? chromeAccent : borderColor(0.12),
                      boxShadow: active ? `0 0 0 2px ${chromeAccent}33` : undefined,
                    }}
                  >
                    <div className="flex -space-x-1 flex-shrink-0">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: swatchLightBg, borderColor: borderColor(0.2) }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: swatchDarkBg, borderColor: borderColor(0.2) }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: swatchAccent, borderColor: borderColor(0.2) }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium truncate"
                      style={{ color: chromeFg }}
                    >
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Theme Presets */}
      <div>
        <h4 className="text-xs font-medium mb-2" style={{ color: chromeFg, opacity: 0.7 }}>
          Presets
          {activePresetName && (
            <span style={{ color: chromeAccent }} className="ml-2">
              (Active: {activePresetName})
            </span>
          )}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {themePresets.map((preset: ThemePreset) => {
            const isActive = preset.name === activePresetName;
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className="relative rounded-lg border-2 p-3 transition-all hover:scale-[1.02] text-left"
                style={{
                  borderColor: isActive ? chromeAccent : borderColor(0.12),
                  boxShadow: isActive
                    ? `0 0 0 2px ${chromeAccent}33`
                    : undefined,
                }}
              >
                {/* Light preview strip */}
                <div className="space-y-2 mb-2">
                  <div
                    className="rounded-lg overflow-hidden shadow-sm"
                    style={{ border: `1px solid ${borderColor(0.05)}` }}
                  >
                    <div className="px-4 py-3" style={{ backgroundColor: preset.light.background }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.accent }} />
                        <div className="flex gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-6 h-1.5 rounded"
                              style={{ backgroundColor: preset.light.foreground, opacity: 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 flex-shrink-0"
                          style={{ borderColor: preset.accent, backgroundColor: preset.light.foreground, opacity: 0.1 }}
                        />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2.5 rounded w-3/4" style={{ backgroundColor: preset.light.foreground, opacity: 0.8 }} />
                          <div className="h-1.5 rounded w-full" style={{ backgroundColor: preset.light.foreground, opacity: 0.15 }} />
                          <div className="h-1.5 rounded w-2/3" style={{ backgroundColor: preset.light.foreground, opacity: 0.1 }} />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <div className="flex-1 h-5 rounded-md" style={{ backgroundColor: preset.accent, opacity: 0.9 }} />
                        <div className="flex-1 h-5 rounded-md border" style={{ borderColor: preset.light.foreground, opacity: 0.15 }} />
                      </div>
                    </div>
                  </div>
                  {/* Dark preview strip */}
                  <div
                    className="rounded-lg overflow-hidden shadow-sm"
                    style={{ border: `1px solid ${borderColor(0.05)}` }}
                  >
                    <div className="px-4 py-3" style={{ backgroundColor: preset.dark.background }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.accent }} />
                        <div className="flex gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-6 h-1.5 rounded" style={{ backgroundColor: preset.dark.foreground, opacity: 0.2 }} />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 flex-shrink-0"
                          style={{ borderColor: preset.accent, backgroundColor: preset.dark.foreground, opacity: 0.1 }}
                        />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2.5 rounded w-3/4" style={{ backgroundColor: preset.dark.foreground, opacity: 0.8 }} />
                          <div className="h-1.5 rounded w-full" style={{ backgroundColor: preset.dark.foreground, opacity: 0.15 }} />
                          <div className="h-1.5 rounded w-2/3" style={{ backgroundColor: preset.dark.foreground, opacity: 0.1 }} />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <div className="flex-1 h-5 rounded-md" style={{ backgroundColor: preset.accent, opacity: 0.9 }} />
                        <div className="flex-1 h-5 rounded-md border" style={{ borderColor: preset.dark.foreground, opacity: 0.15 }} />
                      </div>
                    </div>
                  </div>
                </div>
                <span
                  className="block text-xs font-medium text-center truncate"
                  style={{ color: preset.accent }}
                >
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <h4 className="text-xs font-medium mb-2" style={{ color: chromeFg, opacity: 0.7 }}>
          Live Preview
        </h4>
        {/* ... keep your existing live preview JSX exactly as-is ... */}
      </div>

      {/* Manual Color Pickers */}
      <div
        className="pt-4"
        style={{ borderTop: `1px solid ${borderColor(0.1)}` }}
      >
        <h4 className="text-xs font-medium mb-2" style={{ color: chromeFg, opacity: 0.7 }}>
          Manual Adjustment
        </h4>
        <div className="mb-3">
          <label className="block text-xs mb-1" style={{ color: chromeFg, opacity: 0.6 }}>
            Accent Color
          </label>
          <div className="flex items-center gap-3">
            <ColorPicker value={values.accent} onChange={set("accent")} size="sm" />
            <div className="flex-1">
              <div
                className="h-8 rounded-md"
                style={{
                  backgroundColor: values.accent,
                  border: `1px solid ${borderColor(0.2)}`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="mb-3">
          <h5 className="text-xs font-medium mb-1" style={{ color: chromeFg, opacity: 0.5 }}>
            Light Theme Colors
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] mb-1" style={{ color: chromeFg, opacity: 0.6 }}>Background</label>
              <ColorPicker value={values.lightBg} onChange={set("lightBg")} size="sm" />
            </div>
            <div>
              <label className="block text-[10px] mb-1" style={{ color: chromeFg, opacity: 0.6 }}>Foreground</label>
              <ColorPicker value={values.lightFg} onChange={set("lightFg")} size="sm" />
            </div>
          </div>
        </div>
        <div>
          <h5 className="text-xs font-medium mb-1" style={{ color: chromeFg, opacity: 0.5 }}>
            Dark Theme Colors
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] mb-1" style={{ color: chromeFg, opacity: 0.6 }}>Background</label>
              <ColorPicker value={values.darkBg} onChange={set("darkBg")} size="sm" />
            </div>
            <div>
              <label className="block text-[10px] mb-1" style={{ color: chromeFg, opacity: 0.6 }}>Foreground</label>
              <ColorPicker value={values.darkFg} onChange={set("darkFg")} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioThemePicker;