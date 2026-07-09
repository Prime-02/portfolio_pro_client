import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { useTheme } from "@/src/app/components/theme/ThemeContext";
import { toast } from "@/src/app/components/toastify/Toastify";
import { useEffect, useState } from "react";
import ThemeImportExport from "./ThemeImportExport";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import Button from "@/src/app/components/buttons/Buttons";
import { Crown, Moon, Sun, Zap, Trash2, Eye } from "lucide-react";
import ColorPicker from "@/src/app/components/inputs/ColorPicker";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useUserThemeStore } from "@/lib/stores/themes/useThemes";
import { Theme } from "@/src/app/components/types and interfaces/loaderTypes";

export interface ThemeProps {
  name: string;
  primary_theme: string | null;
  secondary_theme: string | null;
  accent: string | null;
  primary_theme_dark: string;
  secondary_theme_dark: string | null;
}

// Fallbacks, mirrored from useUserSettings.ts, used only when a saved theme
// record has a null/empty field.
const fallbackLight: Theme = { background: "#ffffff", foreground: "#171717" };
const fallbackDark: Theme = { background: "#0a0a0a", foreground: "#ededed" };

const Pro = () => {
  const {
    lightTheme,
    darkTheme,
    accentColor,
    themeVariant,
    isDarkMode,
    theme,
    applyThemePreset,
  } = useTheme();
  const { isLoading, setLoading } = useUIStore();
  const { userInfo } = useUserSettings();
  const {
    themes,
    createTheme,
    fetchThemes,
    deleteTheme,
    isLoading: themeStoreLoading,
    error,
    clearError,
  } = useUserThemeStore();

  const [themeData, setThemeData] = useState({
    name: "",
    primary_theme: lightTheme.background,
    secondary_theme: lightTheme.foreground,
    accent: accentColor.color,
    primary_theme_dark: darkTheme.background,
    secondary_theme_dark: darkTheme.foreground,
  });

  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewedThemeId, setPreviewedThemeId] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Fetch user's saved themes on mount
  useEffect(() => {
    fetchThemes();
  }, []);

  // Sync themeData with context values on mount and context changes
  useEffect(() => {
    setThemeData((prev) => ({
      ...prev,
      primary_theme: lightTheme.background,
      secondary_theme: lightTheme.foreground,
      accent: accentColor.color,
      primary_theme_dark: darkTheme.background,
      secondary_theme_dark: darkTheme.foreground,
    }));
  }, [lightTheme, darkTheme, accentColor]);

  // Handle store errors
  useEffect(() => {
    if (error) {
      toast.error(error, { title: "Error" });
      clearError();
    }
  }, [error, clearError]);

  const validateTheme = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!themeData.name.trim()) {
      errors.name = "Theme name is required";
    }

    const hexFields = [
      "primary_theme",
      "secondary_theme",
      "accent",
      "primary_theme_dark",
      "secondary_theme_dark",
    ];

    hexFields.forEach((field) => {
      const value = themeData[field as keyof typeof themeData];
      if (value && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
        errors[field] = "Invalid hex color format";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Preview-only application ────────────────────────────────────────────
  // Writes directly to the unified --background/--foreground/--accent CSS
  // vars based on whichever variant (light/dark/system) is currently active.
  // This never touches the theme store or user settings, so it's safe to
  // call for both previewing a draft and reverting back to the real theme.
  const applyPreviewColors = (light: Theme, dark: Theme, accent: string) => {
    if (typeof document === "undefined") return;
    const showDark = themeVariant === "dark" || (themeVariant === "system" && isDarkMode);
    const active = showDark ? dark : light;
    const root = document.documentElement;
    root.style.setProperty("--background", active.background);
    root.style.setProperty("--foreground", active.foreground);
    root.style.setProperty("--accent", accent);
  };

  const handlePreview = () => {
    const light: Theme = {
      background: themeData.primary_theme,
      foreground: themeData.secondary_theme,
    };
    const dark: Theme = {
      background: themeData.primary_theme_dark,
      foreground: themeData.secondary_theme_dark,
    };
    applyPreviewColors(light, dark, themeData.accent);
    setIsPreviewActive(true);
    setPreviewedThemeId(null);
    toast.info("Previewing custom theme", { title: "Preview" });
  };

  const handlePreviewSavedTheme = (theme: typeof themes[0]) => {
    const light: Theme = {
      background: theme.primary_theme || fallbackLight.background,
      foreground: theme.secondary_theme || fallbackLight.foreground,
    };
    const dark: Theme = {
      background: theme.primary_theme_dark || fallbackDark.background,
      foreground: theme.secondary_theme_dark || fallbackDark.foreground,
    };
    applyPreviewColors(light, dark, theme.accent || accentColor.color);
    setIsPreviewActive(true);
    setPreviewedThemeId(theme.id);
    toast.info(`Previewing "${theme.name}"`, { title: "Preview" });
  };

  const handleResetPreview = () => {
    // Replay the real, currently-applied theme from context — not a saved
    // preset — since preview never touched context/settings state at all.
    applyPreviewColors(lightTheme, darkTheme, accentColor.color);
    setIsPreviewActive(false);
    setPreviewedThemeId(null);
  };

  const uploadTheme = async () => {
    if (!validateTheme()) {
      toast.error("Please fix validation errors before uploading", {
        title: "Validation Error",
      });
      return;
    }

    setLoading("uploading_theme", true);
    try {
      // 1. Save as a named preset in the themes store.
      await createTheme({
        name: themeData.name,
        primary_theme: themeData.primary_theme,
        secondary_theme: themeData.secondary_theme,
        accent: themeData.accent,
        primary_theme_dark: themeData.primary_theme_dark,
        secondary_theme_dark: themeData.secondary_theme_dark,
      });

      // 2. Apply it as the active theme + persist to user settings via context.
      applyThemePreset(
        { background: themeData.primary_theme, foreground: themeData.secondary_theme },
        { background: themeData.primary_theme_dark, foreground: themeData.secondary_theme_dark },
        { color: themeData.accent },
      );

      toast.success(
        "Theme uploaded, head over to the themes page to view all",
        {
          title: "Success",
        }
      );

      setThemeData((prev) => ({
        ...prev,
        name: "",
      }));

      // No longer "previewing" — this is now the real applied theme.
      setIsPreviewActive(false);
      setPreviewedThemeId(null);

      // Refresh themes list
      await fetchThemes();
    } catch (error) {
      console.log("Error uploading theme: ", error);
    } finally {
      setLoading("uploading_theme", false);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    try {
      await deleteTheme(themeId);
      toast.success("Theme deleted", { title: "Deleted" });

      // If we were previewing this theme, reset
      if (previewedThemeId === themeId) {
        handleResetPreview();
      }
    } catch (error) {
      console.log("Error deleting theme: ", error);
    }
  };

  const handleInputChange = (field: keyof typeof themeData, value: string) => {
    setThemeData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const renderHexInput = (label: string, field: keyof typeof themeData) => (
    <div className="flex gap-x-3">
      <ColorPicker
        value={themeData[field]}
        onChange={(e) => handleInputChange(field, e)}
      />
      <Textinput
        className={`${validationErrors[field] ? "border-red-500" : ""}`}
        value={themeData[field]}
        onChange={(e) => handleInputChange(field, e)}
        label={label}
      />
    </div>
  );

  const isUploading = isLoading("uploading_theme") || themeStoreLoading;

  return (
    <div className="space-y-8">
      {/* Theme Import/Export Component */}
      {/* <ThemeImportExport
        onImportSuccess={() => {
          setThemeData({
            name: "",
            primary_theme: lightTheme.background,
            secondary_theme: lightTheme.foreground,
            accent: accentColor.color,
            primary_theme_dark: darkTheme.background,
            secondary_theme_dark: darkTheme.foreground,
          });
        }}
      /> */}

      {/* Theme Configuration */}
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {isPreviewActive && (
            <Button
              onClick={handleResetPreview}
              className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
              text="Reset Preview"
              variant="ghost"
            />
          )}
          <Button
            onClick={handlePreview}
            disabled={isUploading}
            className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            text="Preview"
            variant="outline"
            icon2={<Eye className="w-4 h-4" />}
            loading={isUploading}
          />
          <Button
            onClick={uploadTheme}
            disabled={isUploading}
            className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            text="Save & Apply"
            loading={isUploading}
          />
        </div>

        {/* Theme Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Theme Name</label>
          <Textinput
            type="text"
            value={themeData.name}
            onChange={(e) => handleInputChange("name", e)}
            placeholder="My Custom Theme"
            label="Theme Title"
            className={validationErrors.name ? "border-red-500" : ""}
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Light Theme */}
          <div className="p-6 rounded-lg border border-[var(--accent)]/25">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Light Theme
            </h4>
            <div className="space-y-4">
              {renderHexInput("Background Color", "primary_theme")}
              {renderHexInput("Text Color", "secondary_theme")}
            </div>
          </div>

          {/* Dark Theme */}
          <div className="p-6 rounded-lg border border-[var(--accent)]/25">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Dark Theme
            </h4>
            <div className="space-y-4">
              {renderHexInput("Background Color", "primary_theme_dark")}
              {renderHexInput("Text Color", "secondary_theme_dark")}
            </div>
          </div>
        </div>

        {/* Accent Color */}
        <div className="max-w-md">
          {renderHexInput("Accent Color", "accent")}
        </div>
      </div>

      {/* Saved Themes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Saved Themes</h3>
          <span className="text-sm opacity-60">
            {themes.length} theme{themes.length !== 1 ? "s" : ""}
          </span>
        </div>

        {themeStoreLoading && themes.length === 0 ? (
          <div className="p-8 text-center opacity-60">
            <p>Loading themes...</p>
          </div>
        ) : themes.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[var(--accent)]/25 rounded-lg">
            <p className="opacity-60">No saved themes yet.</p>
            <p className="text-sm opacity-40 mt-1">
              Create and save your first theme above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`p-4 rounded-lg border transition-all ${previewedThemeId === theme.id
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20"
                  : "border-[var(--accent)]/25 hover:border-[var(--accent)]/50"
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium truncate">{theme.name}</h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePreviewSavedTheme(theme)}
                      className="p-1.5 rounded-md hover:bg-[var(--accent)]/10 transition-colors"
                      title="Preview theme"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTheme(theme.id)}
                      className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Delete theme"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="flex gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.primary_theme || "#171717" }}
                    title="Light background"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.secondary_theme || "#ffffff" }}
                    title="Light text"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.accent || "#737373" }}
                    title="Accent"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-white/10"
                    style={{ backgroundColor: theme.primary_theme_dark || "#ededed" }}
                    title="Dark background"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-white/10"
                    style={{ backgroundColor: theme.secondary_theme_dark || "#0a0a0a" }}
                    title="Dark text"
                  />
                </div>

                {previewedThemeId === theme.id && (
                  <p className="text-xs opacity-60">Currently previewing</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pro Features CTA */}
      <div
        className="p-6 rounded-lg border-2 border-[var(--accent)] bg-[var(--background)]/10"
      >
        <div className="flex items-start gap-4">
          <div
            className="p-2 rounded-full bg-[var(--background)]/20"
          >
            <Crown className="w-6 h-6" style={{ color: accentColor.color }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Unlock Premium Features
            </h3>
            <p className="mb-4 opacity-80">
              Upgrade to Pro for advanced customization options, unlimited
              themes, and priority support.
            </p>
            <Button text="Upgrade Now" icon2={<Zap />} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pro;