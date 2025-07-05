import { useTheme } from "@/app/components/theme/ThemeContext ";
import { Sun, Moon } from "lucide-react";
import React from "react";
import { ThemePreset } from "../page";

interface ThemesProps {
  themePresets: ThemePreset[];
  applyPreset: (preset: ThemePreset) => void;
}

const Themes = ({ themePresets, applyPreset }: ThemesProps) => {
  const { theme, lightTheme, darkTheme, accentColor } = useTheme();

  return (
    <div className="space-y-6">
      {/* Theme Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themePresets.map((preset) => (
          <div
            key={preset.name}
            className="group cursor-pointer transition-all hover:scale-105"
            onClick={() => applyPreset(preset)}
          >
            <div className="space-y-4">
              {/* Light Theme Preview */}
              <div
                className="p-4 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: preset.light.background,
                  borderColor: preset.light.foreground,
                  color: preset.light.foreground,
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
                className="p-4 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: preset.dark.background,
                  borderColor: preset.dark.foreground,
                  color: preset.dark.foreground,
                }}
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

              {/* Apply Button */}
              <button
                className="w-full p-3 rounded-lg border border-opacity-20 hover:bg-opacity-10 transition-colors font-medium"
                style={{
                  borderColor: theme.foreground,
                  backgroundColor: `${theme.foreground}05`,
                }}
                onClick={() => applyPreset(preset)}
              >
                Apply {preset.name} Theme
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Themes;
