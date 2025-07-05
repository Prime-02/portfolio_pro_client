import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeContext ";
import { Settings, Monitor, Sun, Moon } from "lucide-react";

const FloatingThemeControl = () => {
  const { theme, themeVariant, accentColor, toggleThemeVariant } = useTheme();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getThemeIcon = () => {
    switch (themeVariant) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div ref={dropdownRef} className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => toggleThemeVariant()}
        className="w-8 h-8 rounded-full shadow-lg border-2 border-opacity-20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105"
        style={{
          backgroundColor: `${theme.background}f0`,
          borderColor: theme.foreground,
          color: accentColor.color,
        }}
      >
        {getThemeIcon()}
      </button>

      {showDropdown && (
        <div
          className="absolute bottom-14 right-0 w-64 rounded-lg shadow-xl border-2 border-opacity-20 backdrop-blur-sm overflow-hidden"
          style={{
            backgroundColor: `${theme.foreground}f8`,
            borderColor: theme.foreground,
            color: theme.background,
          }}
        >
          {/* Header */}
          <div
            className="p-3 border-b border-opacity-20"
            style={{ borderColor: theme.background }}
          >
            <h3 className="font-semibold text-sm">Theme Controls</h3>
          </div>

          {/* Quick Theme Selector */}
          <div className="p-3 space-y-2">
            <div
              className="flex rounded-lg p-1 border border-opacity-20"
              style={{ borderColor: theme.background }}
            >
              {(["light", "dark", "system"] as const).map((variant) => (
                <button
                  key={variant}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                    themeVariant === variant
                      ? "text-current"
                      : "opacity-60 hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor:
                      themeVariant === variant
                        ? accentColor.color
                        : "transparent",
                    color:
                      themeVariant === variant
                        ? theme.foreground
                        : theme.background,
                  }}
                >
                  {variant === "light" && <Sun className="w-3 h-3" />}
                  {variant === "dark" && <Moon className="w-3 h-3" />}
                  {variant === "system" && <Monitor className="w-3 h-3" />}
                  <span className="capitalize">{variant}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions
          <div
            className="p-3 border-t border-opacity-20"
            style={{ borderColor: theme.foreground }}
          >
            <button
              onClick={() => {
                setShowDropdown(false);
                onOpenFullPanel();
              }}
              className="w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: `${accentColor.color}20`,
                color: accentColor.color,
              }}
            >
              <Settings className="w-3 h-3" />
              Advanced Settings
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default FloatingThemeControl;
