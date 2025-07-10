import React, { useRef } from "react";
import { useTheme } from "./ThemeContext ";
import { Monitor, Sun, Moon } from "lucide-react";

const FloatingThemeControl = () => {
  const { theme, themeVariant, accentColor, toggleThemeVariant } = useTheme();

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
    </div>
  );
};

export default FloatingThemeControl;
