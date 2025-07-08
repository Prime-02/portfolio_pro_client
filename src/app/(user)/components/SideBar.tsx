import {
  ThemeContextType,
  useTheme,
} from "@/app/components/theme/ThemeContext ";
import {
  Accent,
  Theme,
  ThemeVariant,
} from "@/app/components/types and interfaces/loaderTypes";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import {
  Monitor,
  Moon,
  Sun,
  Zap,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import React, { useState } from "react";

interface TabConfigItem {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface SideBarProps {
  activeTab?: string;
  setThemeVariant?: (variant: "light" | "dark" | "system") => void;
  themeVariant?: ThemeVariant;
  accentColor?: Accent;
  theme?: Theme;
  tabConfig?: TabConfigItem[];
  setActiveTab?: (tab: string) => void;
}

const SideBar = ({
  activeTab = "",
  tabConfig = [],
  setActiveTab = () => {},
}: ThemeContextType & SideBarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { setThemeVariant, theme, themeVariant, accentColor } = useTheme();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`min-h-screen h-full flex z-10 left-0 flex-col border-r transition-all duration-300 rounded-l-3xl ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      style={{
        backgroundColor: getColorShade(theme.background, 5),
        borderColor: `${theme.foreground}10`,
      }}
    >
      {/* Collapse Button */}
      <div
        className="p-3 border-b"
        style={{ borderColor: `${theme.foreground}10` }}
      >
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg flex items-center justify-center w-full transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 "
          style={{ color: theme.foreground }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <div className="mb-8">
          <h3
            className={`text-sm font-semibold mb-3 text-[var(--foreground)] opacity-80 ${isCollapsed ? "hidden" : "block"}`}
          >
            Quick Mode
          </h3>
          <div className="space-y-5">
            {(["light", "dark", "system"] as const).map((variant) => (
              <button
                key={variant}
                onClick={() => {
                  setThemeVariant(variant);
                  console.log(variant);
                }}
                className={`w-full ${isCollapsed ? "h-8" : "py-2 px-3"} rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isCollapsed ? "justify-center" : ""
                }`}
                style={{
                  backgroundColor:
                    themeVariant === variant
                      ? `${accentColor.color}20`
                      : "transparent",
                  color:
                    themeVariant === variant
                      ? accentColor.color
                      : theme.foreground,
                  opacity: themeVariant === variant ? 1 : 0.7,
                }}
              >
                {variant === "light" && <Sun size={20} />}
                {variant === "dark" && <Moon size={20} />}
                {variant === "system" && <Monitor size={20} />}
                {!isCollapsed && <span className="capitalize">{variant}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1">
          <h3
            className={`text-sm text-[var(--foreground)] font-semibold mb-3 ${isCollapsed ? "hidden" : "block"}`}
          >
            Customization
          </h3>
          <div className="space-y-3">
            {tabConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left  ${isCollapsed ? "h-10" : "py-2 px-3"} rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === tab.key
                    ? "text-current font-medium"
                    : "opacity-60 hover:opacity-80"
                } ${isCollapsed ? "justify-center" : ""}`}
                style={{
                  backgroundColor:
                    activeTab === tab.key
                      ? `${accentColor.color}20`
                      : "transparent",
                  color:
                    activeTab === tab.key
                      ? accentColor.color
                      : theme.foreground,
                }}
              >
                <tab.icon size={20} />
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {tab.label}
                      {tab.key === "pro" && (
                        <Zap className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs opacity-60 mt-0.5">
                      {tab.description}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
