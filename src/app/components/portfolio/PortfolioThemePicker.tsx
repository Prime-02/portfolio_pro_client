import { themePresets } from "@/lib/utilities/indices/Themes"
import ColorPicker from "../inputs/ColorPicker"

export interface PortfolioThemeValues {
  lightBg: string
  lightFg: string
  darkBg: string
  darkFg: string
  accent: string
}

interface PortfolioThemePickerProps {
  values: PortfolioThemeValues
  onChange: (values: PortfolioThemeValues) => void
  onResetToCurrent: () => void
  onResetToSaved?: () => void
  description?: string
}

const PortfolioThemePicker = ({
  values,
  onChange,
  onResetToCurrent,
  onResetToSaved,
  description = "Customize the appearance of your portfolio. Defaults to your current theme settings.",
}: PortfolioThemePickerProps) => {
  const set = (key: keyof PortfolioThemeValues) => (value: string) =>
    onChange({ ...values, [key]: value })

  const handlePresetSelect = (preset: (typeof themePresets)[number]) => {
    onChange({
      lightBg: preset.light.background,
      lightFg: preset.light.foreground,
      darkBg: preset.dark.background,
      darkFg: preset.dark.foreground,
      accent: preset.accent,
    })
  }

  // Check if current values match a preset
  const activePresetName = themePresets.find(
    (preset) =>
      preset.accent === values.accent &&
      preset.light.background === values.lightBg &&
      preset.light.foreground === values.lightFg &&
      preset.dark.background === values.darkBg &&
      preset.dark.foreground === values.darkFg
  )?.name

  return (
    <div className="border border-[var(--foreground)]/10 rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">Portfolio Theme</h3>
        <p className="text-xs text-[var(--foreground)]/50">{description}</p>
      </div>

      {/* Theme Presets */}
      <div>
        <h4 className="text-xs font-medium text-[var(--foreground)]/70 mb-2">
          Presets
          {activePresetName && (
            <span className="ml-2 text-[var(--accent)]">(Active: {activePresetName})</span>
          )}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {themePresets.map((preset) => {
            const isActive = preset.name === activePresetName
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className={`relative rounded-lg border-2 p-3 transition-all hover:scale-[1.02] text-left ${isActive
                    ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20"
                    : "border-[var(--foreground)]/10 hover:border-[var(--foreground)]/20"
                  }`}
              >
                {/* Portfolio Hero Mockup */}
                <div className="space-y-2 mb-2">
                  {/* Light mode hero */}
                  <div className="rounded-lg overflow-hidden shadow-sm border border-[var(--foreground)]/5">
                    <div
                      className="px-4 py-3"
                      style={{ backgroundColor: preset.light.background }}
                    >
                      {/* Nav bar */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.accent }}
                        />
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

                      {/* Hero content */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 flex-shrink-0"
                          style={{ borderColor: preset.accent, backgroundColor: preset.light.foreground, opacity: 0.1 }}
                        />
                        <div className="flex-1 space-y-1.5">
                          <div
                            className="h-2.5 rounded w-3/4"
                            style={{ backgroundColor: preset.light.foreground, opacity: 0.8 }}
                          />
                          <div
                            className="h-1.5 rounded w-full"
                            style={{ backgroundColor: preset.light.foreground, opacity: 0.15 }}
                          />
                          <div
                            className="h-1.5 rounded w-2/3"
                            style={{ backgroundColor: preset.light.foreground, opacity: 0.1 }}
                          />
                        </div>
                      </div>

                      {/* CTA buttons */}
                      <div className="flex gap-2 mt-3">
                        <div
                          className="flex-1 h-5 rounded-md"
                          style={{ backgroundColor: preset.accent, opacity: 0.9 }}
                        />
                        <div
                          className="flex-1 h-5 rounded-md border"
                          style={{ borderColor: preset.light.foreground, opacity: 0.15 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dark mode hero */}
                  <div className="rounded-lg overflow-hidden shadow-sm border border-[var(--foreground)]/5">
                    <div
                      className="px-4 py-3"
                      style={{ backgroundColor: preset.dark.background }}
                    >
                      {/* Nav bar */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.accent }}
                        />
                        <div className="flex gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-6 h-1.5 rounded"
                              style={{ backgroundColor: preset.dark.foreground, opacity: 0.2 }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Hero content */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 flex-shrink-0"
                          style={{ borderColor: preset.accent, backgroundColor: preset.dark.foreground, opacity: 0.1 }}
                        />
                        <div className="flex-1 space-y-1.5">
                          <div
                            className="h-2.5 rounded w-3/4"
                            style={{ backgroundColor: preset.dark.foreground, opacity: 0.8 }}
                          />
                          <div
                            className="h-1.5 rounded w-full"
                            style={{ backgroundColor: preset.dark.foreground, opacity: 0.15 }}
                          />
                          <div
                            className="h-1.5 rounded w-2/3"
                            style={{ backgroundColor: preset.dark.foreground, opacity: 0.1 }}
                          />
                        </div>
                      </div>

                      {/* CTA buttons */}
                      <div className="flex gap-2 mt-3">
                        <div
                          className="flex-1 h-5 rounded-md"
                          style={{ backgroundColor: preset.accent, opacity: 0.9 }}
                        />
                        <div
                          className="flex-1 h-5 rounded-md border"
                          style={{ borderColor: preset.dark.foreground, opacity: 0.15 }}
                        />
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
            )
          })}
        </div>
      </div>

      {/* Current Theme Preview */}
      <div>
        <h4 className="text-xs font-medium text-[var(--foreground)]/70 mb-2">Live Preview</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--foreground)]/50">Light Mode</span>
            <div
              className="rounded-lg border border-[var(--foreground)]/10 overflow-hidden"
              style={{ backgroundColor: values.lightBg }}
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: values.accent }}
                  />
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-2 rounded"
                        style={{ backgroundColor: values.lightFg, opacity: 0.2 }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full border-2"
                    style={{ borderColor: values.accent, backgroundColor: values.lightFg, opacity: 0.1 }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3 rounded w-3/4"
                      style={{ backgroundColor: values.lightFg, opacity: 0.8 }}
                    />
                    <div
                      className="h-2 rounded w-full"
                      style={{ backgroundColor: values.lightFg, opacity: 0.15 }}
                    />
                    <div
                      className="h-2 rounded w-2/3"
                      style={{ backgroundColor: values.lightFg, opacity: 0.1 }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div
                    className="flex-1 h-7 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: values.accent }}
                  >
                    <span className="text-[10px] font-medium text-white">Primary CTA</span>
                  </div>
                  <div
                    className="flex-1 h-7 rounded-md border flex items-center justify-center"
                    style={{ borderColor: values.lightFg, opacity: 0.2 }}
                  >
                    <span className="text-[10px] font-medium" style={{ color: values.lightFg }}>
                      Secondary
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[var(--foreground)]/50">Dark Mode</span>
            <div
              className="rounded-lg border border-[var(--foreground)]/10 overflow-hidden"
              style={{ backgroundColor: values.darkBg }}
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: values.accent }}
                  />
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-2 rounded"
                        style={{ backgroundColor: values.darkFg, opacity: 0.2 }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full border-2"
                    style={{ borderColor: values.accent, backgroundColor: values.darkFg, opacity: 0.1 }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3 rounded w-3/4"
                      style={{ backgroundColor: values.darkFg, opacity: 0.8 }}
                    />
                    <div
                      className="h-2 rounded w-full"
                      style={{ backgroundColor: values.darkFg, opacity: 0.15 }}
                    />
                    <div
                      className="h-2 rounded w-2/3"
                      style={{ backgroundColor: values.darkFg, opacity: 0.1 }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div
                    className="flex-1 h-7 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: values.accent }}
                  >
                    <span className="text-[10px] font-medium text-white">Primary CTA</span>
                  </div>
                  <div
                    className="flex-1 h-7 rounded-md border flex items-center justify-center"
                    style={{ borderColor: values.darkFg, opacity: 0.2 }}
                  >
                    <span className="text-[10px] font-medium" style={{ color: values.darkFg }}>
                      Secondary
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Color Pickers */}
      <div className="border-t border-[var(--foreground)]/10 pt-4">
        <h4 className="text-xs font-medium text-[var(--foreground)]/70 mb-2">Manual Adjustment</h4>

        {/* Accent Color */}
        <div className="mb-3">
          <label className="block text-xs text-[var(--foreground)]/60 mb-1">Accent Color</label>
          <div className="flex items-center gap-3">
            <ColorPicker value={values.accent} onChange={set("accent")} size="sm" />
            <div className="flex-1">
              <div
                className="h-8 rounded-md border border-[var(--foreground)]/20"
                style={{ backgroundColor: values.accent }}
              />
            </div>
          </div>
        </div>

        {/* Light Theme */}
        <div className="mb-3">
          <h5 className="text-xs font-medium text-[var(--foreground)]/50 mb-1">Light Theme Colors</h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[var(--foreground)]/60 mb-1">Background</label>
              <ColorPicker value={values.lightBg} onChange={set("lightBg")} size="sm" />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--foreground)]/60 mb-1">Foreground</label>
              <ColorPicker value={values.lightFg} onChange={set("lightFg")} size="sm" />
            </div>
          </div>
        </div>

        {/* Dark Theme */}
        <div>
          <h5 className="text-xs font-medium text-[var(--foreground)]/50 mb-1">Dark Theme Colors</h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[var(--foreground)]/60 mb-1">Background</label>
              <ColorPicker value={values.darkBg} onChange={set("darkBg")} size="sm" />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--foreground)]/60 mb-1">Foreground</label>
              <ColorPicker value={values.darkFg} onChange={set("darkFg")} size="sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onResetToCurrent}
          className="text-xs text-[var(--accent)] hover:underline"
        >
          {onResetToSaved ? "Use current theme" : "Reset to current theme defaults"}
        </button>
        {onResetToSaved && (
          <button
            type="button"
            onClick={onResetToSaved}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Reset to saved
          </button>
        )}
      </div>
    </div>
  )
}

export default PortfolioThemePicker