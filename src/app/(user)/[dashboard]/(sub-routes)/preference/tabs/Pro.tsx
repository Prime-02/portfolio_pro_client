import { useTheme } from "@/app/components/theme/ThemeContext ";
import { Crown, Zap, Sun, Moon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useGlobalState } from "@/app/globalStateProvider";
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { toast } from "@/app/components/toastify/Toastify";
import ThemeImportExport from "./ThemeImportExport";
import Button from "@/app/components/buttons/Buttons";
import { Textinput } from "@/app/components/inputs/Textinput";

export interface ThemeProps {
  name: string;
  primary_theme: string | null;
  secondary_theme: string | null;
  accent: string | null;
  primary_theme_dark: string;
  secondary_theme_dark: string | null;
}

const Pro = () => {
  const {
    lightTheme,
    darkTheme,
    accentColor,
    // setAccentColor,
    // setLightTheme,
    // setDarkTheme,
  } = useTheme();
  const { accessToken, loading, setLoading } = useGlobalState();

  const [themeData, setThemeData] = useState({
    name: "",
    primary_theme: lightTheme.background,
    secondary_theme: lightTheme.foreground,
    accent: accentColor.color,
    primary_theme_dark: darkTheme.background,
    secondary_theme_dark: darkTheme.foreground,
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Sync themeData with context values on mount and context changes
  useEffect(() => {
    setThemeData({
      name: themeData.name, // Keep the name as user input
      primary_theme: lightTheme.background,
      secondary_theme: lightTheme.foreground,
      accent: accentColor.color,
      primary_theme_dark: darkTheme.background,
      secondary_theme_dark: darkTheme.foreground,
    });
  }, [lightTheme, darkTheme, accentColor]);

  // // Hex color validation
  // const isValidHex = (color: string): boolean => {
  //   if (!color) return true; // Allow empty values
  //   const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  //   return hexRegex.test(color);
  // };

  // // Apply theme changes to context
  // const applyThemeChanges = () => {
  //   // Validate all hex colors first
  //   const errors: { [key: string]: string } = {};

  //   if (themeData.primary_theme && !isValidHex(themeData.primary_theme)) {
  //     errors.primary_theme = "Invalid hex color format";
  //   }
  //   if (themeData.secondary_theme && !isValidHex(themeData.secondary_theme)) {
  //     errors.secondary_theme = "Invalid hex color format";
  //   }
  //   if (themeData.accent && !isValidHex(themeData.accent)) {
  //     errors.accent = "Invalid hex color format";
  //   }
  //   if (
  //     themeData.primary_theme_dark &&
  //     !isValidHex(themeData.primary_theme_dark)
  //   ) {
  //     errors.primary_theme_dark = "Invalid hex color format";
  //   }
  //   if (
  //     themeData.secondary_theme_dark &&
  //     !isValidHex(themeData.secondary_theme_dark)
  //   ) {
  //     errors.secondary_theme_dark = "Invalid hex color format";
  //   }

  //   setValidationErrors(errors);

  //   // Only apply if no validation errors
  //   if (Object.keys(errors).length === 0) {
  //     if (themeData.primary_theme && themeData.secondary_theme) {
  //       setLightTheme({
  //         background: themeData.primary_theme,
  //         foreground: themeData.secondary_theme,
  //       });
  //     }

  //     if (themeData.primary_theme_dark && themeData.secondary_theme_dark) {
  //       setDarkTheme({
  //         background: themeData.primary_theme_dark,
  //         foreground: themeData.secondary_theme_dark,
  //       });
  //     }

  //     if (themeData.accent) {
  //       setAccentColor({ color: themeData.accent });
  //     }

  //     toast.success("Theme applied successfully!", { title: "Success" });
  //   }
  // };

  const uploadTheme = async () => {
    // Validate before uploading
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix validation errors before uploading", {
        title: "Validation Error",
      });
      return;
    }

    if (!themeData.name.trim()) {
      toast.error("Please provide a theme name", { title: "Missing Name" });
      return;
    }

    setLoading("uploading_theme");
    try {
      const uploadRes: ThemeProps = await PostAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/themes`,
        data: themeData,
      });
      if (uploadRes) {
        toast.success(
          "Theme uploaded, head over to the themes page to view all",
          {
            title: "Success",
          }
        );
      }
    } catch (error) {
      console.log("Error uploading theme: ", error);
      toast.error("Failed to upload theme", { title: "Error" });
    } finally {
      setLoading("uploading_theme");
    }
  };

  const handleInputChange = (field: keyof typeof themeData, value: string) => {
    setThemeData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const renderHexInput = (label: string, field: keyof typeof themeData) => (
    <div>
      <Textinput
        labelBgHexIntensity={1}
        label={label}
        type="text"
        value={themeData[field]}
        onChange={(e) => handleInputChange(field, e)}
        className={`${validationErrors[field] ? "border-red-500" : ""}`}
        error={validationErrors[field]}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Theme Import/Export Component */}
      <ThemeImportExport
        onImportSuccess={() => {
          // Refresh themeData after import
          setThemeData({
            name: "",
            primary_theme: lightTheme.background,
            secondary_theme: lightTheme.foreground,
            accent: accentColor.color,
            primary_theme_dark: darkTheme.background,
            secondary_theme_dark: darkTheme.foreground,
          });
        }}
      />

      {/* Theme Configuration */}
      <div className="space-y-6">
        {/* Upload Theme Button */}
        <div className="flex justify-end">
          <Button
            onClick={uploadTheme}
            disabled={loading.includes("uploading_theme")}
            className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            text="Save This Theme"
            loading={loading.includes("uploading_theme")}
          />
        </div>

        {/* Theme Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Theme Name</label>
          <Textinput
            type="text"
            value={themeData.name}
            onChange={(e) => handleInputChange("name", e)}
            label="My Custom Theme"
            labelBgHexIntensity={1}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Light Theme */}
          <div className="p-6 rounded-lg border border-opacity-20">
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
          <div className="p-6 rounded-lg border border-opacity-20">
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

      {/* Pro Features CTA */}
      <div
        className="p-6 rounded-lg border-2"
        style={{
          backgroundColor: `${accentColor.color}10`,
          borderColor: accentColor.color,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="p-2 rounded-full"
            style={{ backgroundColor: `${accentColor.color}20` }}
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
