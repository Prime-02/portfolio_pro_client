import React, { useState, useEffect } from "react";
import {
  Download,
  Upload,
  Check,
  X,
  Palette,
} from "lucide-react";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  Theme,
  Accent,
  ThemeVariant,
  Loader,
} from "@/app/components/types and interfaces/loaderTypes";

interface ThemeImportExportProps {
  onImportSuccess?: () => void;
  onExportSuccess?: () => void;
  className?: string;
}

interface DetectedColor {
  hex: string;
  name?: string;
  rgb?: [number, number, number];
  assigned?: "lightBg" | "lightFg" | "darkBg" | "darkFg" | "accent" | null;
}

// Updated JSON types to include undefined
type JSONValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JSONObject
  | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];

// Fixed interfaces to properly extend JSONObject
interface ThemeData extends JSONObject {
  lightTheme?: Theme;
  darkTheme?: Theme;
  accentColor?: Accent;
  loader?: Loader;
  themeVariant?: ThemeVariant;
}

interface ColorItem extends JSONObject {
  hex: string;
  name?: string;
}

// Fixed TailwindColorObject to handle undefined values properly
interface TailwindColorObject {
  DEFAULT?: string;
  [key: string]: string | undefined;
}

const ThemeImportExport: React.FC<ThemeImportExportProps> = ({
  onImportSuccess,
  onExportSuccess,
  className = "",
}) => {
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

  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [exportStatus, setExportStatus] = useState<"idle" | "success">("idle");
  const [detectedColors, setDetectedColors] = useState<DetectedColor[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Color conversion utilities
  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color);
    };
    return rgbToHex(f(0), f(8), f(4));
  };

  const normalizeHex = (hex: string): string => {
    hex = hex.replace(/[^0-9A-Fa-f]/g, "");
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    return hex.length === 6 ? `#${hex}` : "";
  };

  // Detect if a color is light or dark
  const isLightColor = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // Auto-assign colors to theme properties
  const autoAssignColors = (colors: DetectedColor[]): DetectedColor[] => {
    if (colors.length === 0) return colors;

    const assigned = [...colors];

    // Sort by lightness
    const lightColors = assigned.filter((c) => isLightColor(c.hex));
    const darkColors = assigned.filter((c) => !isLightColor(c.hex));

    // Auto-assign based on color properties
    if (lightColors.length > 0) {
      assigned[colors.indexOf(lightColors[0])].assigned = "lightBg";
    }
    if (darkColors.length > 0) {
      assigned[colors.indexOf(darkColors[0])].assigned = "lightFg";
    }
    if (darkColors.length > 1) {
      assigned[colors.indexOf(darkColors[1])].assigned = "darkBg";
    }
    if (lightColors.length > 1) {
      assigned[colors.indexOf(lightColors[1])].assigned = "darkFg";
    }

    // Assign accent color (prefer vibrant colors)
    const unassigned = assigned.filter((c) => !c.assigned);
    if (unassigned.length > 0) {
      assigned[colors.indexOf(unassigned[0])].assigned = "accent";
    }

    return assigned;
  };

  // Parse different file formats
  const parseColorFile = (
    content: string,
    filename: string
  ): DetectedColor[] => {
    const colors: DetectedColor[] = [];
    const fileExt = filename.split(".").pop()?.toLowerCase();

    // Helper function to parse JSON sections safely
    const tryParseJSON = (jsonStr: string): JSONValue | null => {
      try {
        return JSON.parse(jsonStr) as JSONValue;
      } catch {
        return null;
      }
    };

    // Helper function to extract JSON objects/arrays from mixed content
    const extractJSONSections = (text: string): JSONValue[] => {
      const sections: JSONValue[] = [];

      // Find JSON objects
      const objectMatches =
        text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || [];
      objectMatches.forEach((match) => {
        const parsed = tryParseJSON(match);
        if (parsed) sections.push(parsed);
      });

      // Find JSON arrays
      const arrayMatches =
        text.match(/\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\]/g) || [];
      arrayMatches.forEach((match) => {
        const parsed = tryParseJSON(match);
        if (parsed) sections.push(parsed);
      });

      return sections;
    };

    try {
      // First, check if it's a pure JSON file
      if (fileExt === "json") {
        const data = tryParseJSON(content);
        if (data) {
          // Existing theme format
          if (isThemeData(data)) {
            return parseExistingTheme(data);
          }

          // Process JSON data normally
          return processJSONData(data, colors);
        }
      }

      // For mixed content files (like your example), extract all possible formats

      // 1. Extract JSON sections from mixed content
      const jsonSections = extractJSONSections(content);
      jsonSections.forEach((data) => {
        processJSONData(data, colors);
      });

      // 2. XML format
      if (content.includes("<color")) {
        const colorMatches =
          content.match(/<color[^>]*hex="([^"]*)"[^>]*(?:name="([^"]*)")?/g) ||
          content.match(/<color[^>]*name="([^"]*)"[^>]*hex="([^"]*)"/g);
        colorMatches?.forEach((match) => {
          const hexMatch = match.match(/hex="([^"]*)"/);
          const nameMatch = match.match(/name="([^"]*)"/);
          if (hexMatch) {
            const hex = normalizeHex(hexMatch[1]);
            if (hex) {
              colors.push({ hex, name: nameMatch?.[1] });
            }
          }
        });
      }

      // 3. CSV format (lines that are primarily comma-separated hex values)
      const lines = content.split("\n");
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        // Check if line looks like CSV (has commas and no other complex syntax)
        if (
          trimmedLine.includes(",") &&
          !trimmedLine.includes("{") &&
          !trimmedLine.includes("<") &&
          !trimmedLine.includes("//")
        ) {
          const csvColors = trimmedLine.split(",").map((c) => c.trim());
          csvColors.forEach((color) => {
            const hex = normalizeHex(color);
            if (hex) {
              colors.push({ hex });
            }
          });
        }
      });

      // 4. Extract all hex colors from text (including those in comments, URLs, etc.)
      const hexMatches = content.match(/#?[0-9A-Fa-f]{6}\b/g) || [];
      const shortHexMatches = content.match(/#?[0-9A-Fa-f]{3}\b/g) || [];

      [...hexMatches, ...shortHexMatches].forEach((match) => {
        const hex = normalizeHex(match);
        if (hex) {
          colors.push({ hex });
        }
      });

      // 5. Extract RGB values
      const rgbMatches = content.match(
        /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g
      );
      rgbMatches?.forEach((match) => {
        const values = match.match(/\d+/g);
        if (values && values.length === 3) {
          const hex = rgbToHex(
            parseInt(values[0]),
            parseInt(values[1]),
            parseInt(values[2])
          );
          colors.push({ hex });
        }
      });

      // 6. Extract HSL values
      const hslMatches = content.match(
        /hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/g
      );
      hslMatches?.forEach((match) => {
        const values = match.match(/\d+/g);
        if (values && values.length === 3) {
          const hex = hslToHex(
            parseInt(values[0]),
            parseInt(values[1]),
            parseInt(values[2])
          );
          colors.push({ hex });
        }
      });
    } catch (error) {
      console.error("Error parsing color file:", error);

      // Fallback: just extract hex colors if everything else fails
      const fallbackHex = content.match(/#?[0-9A-Fa-f]{6}\b/g) || [];
      fallbackHex.forEach((match) => {
        const hex = normalizeHex(match);
        if (hex) {
          colors.push({ hex });
        }
      });
    }

    // Remove duplicates and take first 10 colors
    const uniqueColors = colors
      .filter(
        (color, index, self) =>
          index === self.findIndex((c) => c.hex === color.hex)
      )
      .slice(0, 10);

    return autoAssignColors(uniqueColors);
  };

  // Type guard for theme data
  const isThemeData = (data: JSONValue): data is ThemeData => {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return false;
    }
    const obj = data as JSONObject;
    return "lightTheme" in obj || "darkTheme" in obj || "accentColor" in obj;
  };

  // Type guard for color item
  const isColorItem = (item: JSONValue): item is ColorItem => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return false;
    }
    const obj = item as JSONObject;
    return typeof obj.hex === "string";
  };

  // Updated type guard for Tailwind color object
  const isTailwindColorObject = (
    value: JSONValue
  ): value is TailwindColorObject => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }
    const obj = value as Record<string, unknown>;
    return (
      typeof obj.DEFAULT === "string" ||
      Object.values(obj).some((v) => typeof v === "string")
    );
  };

  // Helper function to process JSON data
  const processJSONData = (
    data: JSONValue,
    colors: DetectedColor[]
  ): DetectedColor[] => {
    // Extended array format
    if (Array.isArray(data) && data.length > 0 && isColorItem(data[0])) {
      data.forEach((item) => {
        if (isColorItem(item)) {
          const hex = normalizeHex(item.hex);
          if (hex) {
            colors.push({ hex, name: item.name });
          }
        }
      });
    }

    // Object format
    else if (
      typeof data === "object" &&
      data !== null &&
      !Array.isArray(data)
    ) {
      const obj = data as JSONObject;
      Object.entries(obj).forEach(([name, value]) => {
        // Handle nested objects (like Tailwind format)
        if (isTailwindColorObject(value)) {
          if (value.DEFAULT) {
            const hex = normalizeHex(String(value.DEFAULT));
            if (hex) {
              colors.push({ hex, name });
            }
          }
          // Also extract other color variants
          Object.entries(value).forEach(([variant, variantValue]) => {
            if (variant !== "DEFAULT" && typeof variantValue === "string") {
              const variantHex = normalizeHex(variantValue);
              if (variantHex) {
                colors.push({ hex: variantHex, name: `${name}-${variant}` });
              }
            }
          });
        } else if (typeof value === "string") {
          const hex = normalizeHex(value);
          if (hex) {
            colors.push({ hex, name });
          }
        }
      });
    }

    // Simple array
    else if (Array.isArray(data)) {
      data.forEach((item) => {
        if (typeof item === "string") {
          const hex = normalizeHex(item);
          if (hex) {
            colors.push({ hex });
          }
        }
      });
    }

    return colors;
  };

  const parseExistingTheme = (data: ThemeData): DetectedColor[] => {
    // For existing theme format, directly apply and return empty array
    if (data.lightTheme) setLightTheme(data.lightTheme);
    if (data.darkTheme) setDarkTheme(data.darkTheme);
    if (data.accentColor) setAccentColor(data.accentColor);
    if (data.loader) setLoader(data.loader);
    if (data.themeVariant) setThemeVariant(data.themeVariant);
    return [];
  };

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
      const themeData: ThemeData = {
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
      onExportSuccess?.();
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
            const colors = parseColorFile(result, file.name);

            if (colors.length > 0) {
              setDetectedColors(colors);
              setShowColorPicker(true);
              setImportStatus("success");
            } else {
              // Fallback to original JSON theme import
              const parsedData = JSON.parse(result);
              if (isThemeData(parsedData)) {
                if (parsedData.lightTheme) setLightTheme(parsedData.lightTheme);
                if (parsedData.darkTheme) setDarkTheme(parsedData.darkTheme);
                if (parsedData.accentColor)
                  setAccentColor(parsedData.accentColor);
                if (parsedData.loader) setLoader(parsedData.loader);
                if (parsedData.themeVariant)
                  setThemeVariant(parsedData.themeVariant);
                setImportStatus("success");
              }
            }
            onImportSuccess?.();
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

  const assignColor = (
    colorIndex: number,
    assignment: DetectedColor["assigned"]
  ): void => {
    const updatedColors = [...detectedColors];

    // Remove previous assignment of this type
    updatedColors.forEach((color) => {
      if (color.assigned === assignment) {
        color.assigned = null;
      }
    });

    // Assign new color
    updatedColors[colorIndex].assigned = assignment;
    setDetectedColors(updatedColors);
  };

  const applySelectedColors = (): void => {
    const lightBg = detectedColors.find((c) => c.assigned === "lightBg");
    const lightFg = detectedColors.find((c) => c.assigned === "lightFg");
    const darkBg = detectedColors.find((c) => c.assigned === "darkBg");
    const darkFg = detectedColors.find((c) => c.assigned === "darkFg");
    const accent = detectedColors.find((c) => c.assigned === "accent");

    if (lightBg || lightFg) {
      setLightTheme({
        background: lightBg?.hex || lightTheme.background,
        foreground: lightFg?.hex || lightTheme.foreground,
      });
    }

    if (darkBg || darkFg) {
      setDarkTheme({
        background: darkBg?.hex || darkTheme.background,
        foreground: darkFg?.hex || darkTheme.foreground,
      });
    }

    if (accent) {
      setAccentColor({ color: accent.hex });
    }

    setShowColorPicker(false);
    setDetectedColors([]);
  };

  const getAssignmentLabel = (
    assignment: DetectedColor["assigned"]
  ): string => {
    switch (assignment) {
      case "lightBg":
        return "Light Background";
      case "lightFg":
        return "Light Foreground";
      case "darkBg":
        return "Dark Background";
      case "darkFg":
        return "Dark Foreground";
      case "accent":
        return "Accent Color";
      default:
        return "Unassigned";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Messages */}
      {importStatus === "success" && !showColorPicker && (
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

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Detected Colors ({detectedColors.length})
              </h3>
              <button
                onClick={() => setShowColorPicker(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Assign colors to your theme properties. Auto-assignments have been
              made based on color brightness.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {detectedColors.map((color, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <p className="font-mono text-sm">{color.hex}</p>
                      {color.name && (
                        <p className="text-xs text-gray-500">{color.name}</p>
                      )}
                    </div>
                  </div>

                  <select
                    value={color.assigned || ""}
                    onChange={(e) =>
                      assignColor(
                        index,
                        (e.target.value as DetectedColor["assigned"]) || null
                      )
                    }
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="">Unassigned</option>
                    <option value="lightBg">Light Background</option>
                    <option value="lightFg">Light Foreground</option>
                    <option value="darkBg">Dark Background</option>
                    <option value="darkFg">Dark Foreground</option>
                    <option value="accent">Accent Color</option>
                  </select>

                  {color.assigned && (
                    <p className="text-xs text-blue-600 mt-1">
                      → {getAssignmentLabel(color.assigned)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={applySelectedColors}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply Colors
              </button>
              <button
                onClick={() => setShowColorPicker(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Smart Theme Management</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Import themes from JSON, XML, CSV, TXT files, or any file containing
          color codes in various formats (hex, rgb, hsl).
        </p>

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
              accept=".json,.xml,.csv,.txt,.js,.ts"
              onChange={importTheme}
              className="hidden"
            />
          </label>
        </div>

        {/* Supported Formats */}
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            Supported file formats
          </summary>
          <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <p>
              • <strong>JSON:</strong> Theme configs, color objects, arrays
            </p>
            <p>
              • <strong>XML:</strong> Color palette exports
            </p>
            <p>
              • <strong>CSV:</strong> Comma-separated hex values
            </p>
            <p>
              • <strong>TXT:</strong> Any text with hex, RGB, HSL color codes
            </p>
            <p>
              • <strong>Tailwind:</strong> Color configuration files
            </p>
            <p>
              • <strong>Coolors.co:</strong> Exported palettes
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ThemeImportExport;
