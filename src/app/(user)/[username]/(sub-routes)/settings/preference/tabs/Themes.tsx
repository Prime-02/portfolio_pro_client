import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { useTheme } from "@/src/app/components/theme/ThemeContext";
import { useCallback } from "react";
import { themePresets } from "@/lib/utilities/indices/Themes";
import { Moon, Sun } from "lucide-react";
import Button from "@/src/app/components/buttons/Buttons";
import { ThemeVariant } from "@/src/app/components/types and interfaces/loaderTypes";


export interface ThemeColors {
  background: string;
  foreground: string;
}

export interface ThemePreset {
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
  accent: string;
  themeVariant?: ThemeVariant;

}


const Themes = () => {
  const {
    applyThemePreset,
    accentColor
  } = useTheme();
  const { isLoading } = useUIStore()

  const applyPreset = useCallback((preset: ThemePreset) => {
    applyThemePreset(preset.light, preset.dark, { color: preset.accent });
  }, [applyThemePreset]);

  return (
    <div className="space-y-6">
      {/* Theme Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themePresets.map((preset) => (
          <div
            key={preset.name}
            className="group transition-all hover:scale-105"
          >
            <div className="space-y-4">
              {/* Light Theme Preview */}
              <div
                className="p-4 rounded-lg border-2 transition-all cursor-pointer"
                style={{
                  backgroundColor: preset.light.background,
                  borderColor: preset.light.foreground,
                  color: preset.light.foreground,
                }}
                onClick={() => {
                  if (accentColor.color === preset.accent) return
                  applyPreset(preset)
                }}
              >
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  {preset.name} Light
                </h4>
                <div className="space-y-2">
                  <p className="text-sm">Sample text content</p>
                  <button
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: preset.accent,
                      color: preset.dark.foreground,
                    }}
                  >
                    Button
                  </button>
                  <div
                    className="p-2 rounded border text-xs"
                    style={{
                      borderColor: preset.light.foreground,
                      backgroundColor: `${preset.light.foreground}10`,
                    }}
                  >
                    Content area
                  </div>
                </div>
              </div>

              {/* Dark Theme Preview */}
              <div
                className="p-4 rounded-lg border-2 transition-all cursor-pointer"
                style={{
                  backgroundColor: preset.dark.background,
                  borderColor: preset.dark.foreground,
                  color: preset.dark.foreground,
                }}
                onClick={() => applyPreset(preset)}
              >
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  {preset.name} Dark
                </h4>
                <div className="space-y-2">
                  <p className="text-sm">Sample text content</p>
                  <button
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: preset.accent,
                      color: preset.dark.foreground,
                    }}
                  >
                    Button
                  </button>
                  <div
                    className="p-2 rounded border text-xs"
                    style={{
                      borderColor: preset.dark.foreground,
                      backgroundColor: `${preset.dark.foreground}10`,
                    }}
                  >
                    Content area
                  </div>
                </div>
              </div>

              <Button
                text={accentColor.color === preset.accent ? "Applied" : `Apply ${preset.name} Theme`}
                onClick={() => {
                  if (accentColor.color === preset.accent) {
                    return;
                  }
                  applyPreset(preset)
                }}
                customColor={preset.accent}
                loading={isLoading("updating_user_settings")}
                disabled={isLoading("updating_user_settings")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Themes;