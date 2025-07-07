import { useTheme } from "@/app/components/theme/ThemeContext ";
import { 
  Download, 
  Upload, 
  Check, 
  X, 
  Crown, 
  Zap, 
  Sun, 
  Moon 
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { ThemeColors } from "../page";

const Pro = () => {
  const {
    theme,
    lightTheme,
    darkTheme,
    accentColor,
    setAccentColor,
    setLightTheme,
    setDarkTheme,
    setThemeVariant,
    loader,
    setLoader,
    themeVariant,
  } = useTheme();
  
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [exportStatus, setExportStatus] = useState<"idle" | "success">("idle");

  // Clear status messages after 3 seconds
  useEffect(() => {
    if (importStatus !== "idle") {
      const timer = setTimeout(() => setImportStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [importStatus]);

  useEffect(() => {
    if (exportStatus !== "idle") {
      const timer = setTimeout(() => setExportStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [exportStatus]);

  const exportTheme = (): void => {
    try {
      const themeData = {
        lightTheme,
        darkTheme,
        accentColor,
        loader,
        themeVariant,
      };
      const blob = new Blob([JSON.stringify(themeData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "theme-config.json";
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus("success");
    } catch (error) {
      console.error("Error exporting theme:", error);
    }
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === "string") {
            const themeData = JSON.parse(result);
            if (themeData.lightTheme) setLightTheme(themeData.lightTheme);
            if (themeData.darkTheme) setDarkTheme(themeData.darkTheme);
            if (themeData.accentColor) setAccentColor(themeData.accentColor);
            if (themeData.loader) setLoader(themeData.loader);
            if (themeData.themeVariant) setThemeVariant(themeData.themeVariant);
            setImportStatus("success");
          }
        } catch (error) {
          console.error("Error importing theme:", error);
          setImportStatus("error");
        }
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  };

  const isValidColor = (color: string): boolean => {
    const s = new Option().style;
    s.color = color;
    return s.color !== "";
  };

  const handleColorChange = (
    value: string,
    setter: (colors: ThemeColors) => void,
    currentTheme: ThemeColors,
    property: keyof ThemeColors
  ): void => {
    if (isValidColor(value) || value === "") {
      setter({
        ...currentTheme,
        [property]: value,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Messages */}
      {importStatus === "success" && (
        <div className="p-3 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 text-green-600">
          Theme imported successfully!
        </div>
      )}
      {importStatus === "error" && (
        <div className="p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 text-red-600">
          Error importing theme. Please check the file format.
        </div>
      )}
      {exportStatus === "success" && (
        <div className="p-3 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 text-green-600">
          Theme exported successfully!
        </div>
      )}

      {/* Import/Export Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Theme Management</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportTheme}
            className="px-4 py-2 rounded-lg border border-opacity-20 hover:bg-opacity-10 transition-colors flex items-center gap-2"
            style={{
              borderColor: theme.foreground,
              backgroundColor: `${theme.foreground}05`,
            }}
          >
            {exportStatus === "success" ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export Theme
          </button>
          <label
            className="px-4 py-2 rounded-lg border border-opacity-20 hover:bg-opacity-10 transition-colors flex items-center gap-2 cursor-pointer"
            style={{
              borderColor: theme.foreground,
              backgroundColor: `${theme.foreground}05`,
            }}
          >
            {importStatus === "success" ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : importStatus === "error" ? (
              <X className="w-4 h-4 text-red-500" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import Theme
            <input
              type="file"
              accept=".json"
              onChange={importTheme}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Accent Color Customization */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Accent Color</h3>
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-2">
            Custom Color
          </label>
          <div className="flex gap-3">
            <input
              type="color"
              value={accentColor.color}
              onChange={(e) => setAccentColor({ color: e.target.value })}
              className="w-12 h-12 rounded-lg border border-opacity-20"
              style={{ borderColor: theme.foreground }}
            />
            <input
              type="text"
              value={accentColor.color}
              onChange={(e) => setAccentColor({ color: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border border-opacity-20 bg-transparent"
              style={{ borderColor: theme.foreground }}
              placeholder="#05df72"
            />
          </div>
        </div>
      </div>

      {/* Advanced Color Customization */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Advanced Color Customization</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Light Theme */}
          <div
            className="p-6 rounded-lg border border-opacity-20"
            style={{ borderColor: theme.foreground }}
          >
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Light Theme
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Background Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={lightTheme.background}
                    onChange={(e) =>
                      handleColorChange(
                        e.target.value,
                        setLightTheme,
                        lightTheme,
                        "background"
                      )
                    }
                    className="w-12 h-12 rounded-lg border border-opacity-20"
                    style={{ borderColor: theme.foreground }}
                  />
                  <input
                    type="text"
                    value={lightTheme.background}
                    onChange={(e) =>
                      handleColorChange(
                        e.target.value,
                        setLightTheme,
                        lightTheme,
                        "background"
                      )
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-opacity-20 bg-transparent"
                    style={{ borderColor: theme.foreground }}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Text Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={lightTheme.foreground}
                    onChange={(e) =>
                      handleColorChange(
                        e.target.value,
                        setLightTheme,
                        lightTheme,
                        "foreground"
                      )
                    }
                    className="w-12 h-12 rounded-lg border border-opacity-20"
                    style={{ borderColor: theme.foreground }}
                  />
                  <input
                    type="text"
                    value={lightTheme.foreground}
                    onChange={(e) =>
                      handleColorChange(
                        e.target.value,
                        setLightTheme,
                        lightTheme,
                        "foreground"
                      )
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-opacity-20 bg-transparent"
                    style={{ borderColor: theme.foreground }}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dark Theme */}
          <div
            className="p-6 rounded-lg border border-opacity-20"
            style={{ borderColor: theme.foreground }}
          >
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Dark Theme
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Background Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={darkTheme.background}
                    onChange={(e) =>
                      handleColorChange(
                        e.target.value,
                        setDarkTheme,
                        darkTheme,
                        "background"
                      )
                    }
                    className="w-12 h-12 rounded-lg border border-opacity-20"
                    style={{ borderColor: theme.foreground }}
                  />
                  <input
                    type="text"
                    value={darkTheme.background}
                    onChange={(e) =>
                      handleColorChange(
                        e.target.value,
                        setDarkTheme,
                        darkTheme,
                        "background"
                      )
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-opacity-20 bg-transparent"
                    style={{ borderColor: theme.foreground }}
                    placeholder="#1a1a1a"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Text Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={darkTheme.foreground}
                    onChange={(e) =>
                      handleColorChange(
                        e.target.value,
                        setDarkTheme,
                        darkTheme,
                        "foreground"
                      )
                    }
                    className="w-12 h-12 rounded-lg border border-opacity-20"
                    style={{ borderColor: theme.foreground }}
                  />
                  <input
                    type="text"
                    value={darkTheme.foreground}
                    onChange={(e) =>
                      handleColorChange(
                        e.target.value,
                        setDarkTheme,
                        darkTheme,
                        "foreground"
                      )
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-opacity-20 bg-transparent"
                    style={{ borderColor: theme.foreground }}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>
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
            <Crown
              className="w-6 h-6"
              style={{ color: accentColor.color }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Unlock Premium Features
            </h3>
            <p className="mb-4 opacity-80">
              Upgrade to Pro for advanced customization options, unlimited themes, and priority support.
            </p>
            <button
              className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 flex items-center gap-2"
              style={{
                backgroundColor: accentColor.color,
                color: theme.background,
              }}
            >
              Upgrade Now <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pro;