import SidebarToggle from "@/app/components/buttons/CollapseButton";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  Accent,
  Theme,
  ThemeVariant,
} from "@/app/components/types and interfaces/loaderTypes";
import {
  Monitor,
  Moon,
  Sun,
  Zap,
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
}: SideBarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { setThemeVariant, theme, themeVariant, accentColor } = useTheme();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`min-h-screen h-full flex z-10 left-0 flex-col border-l border-[var(--accent)]/20 transition-all duration-300 rounded-r-3xl ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Collapse Button - Fixed at top */}
      <SidebarToggle className="rotate-180 border-none" onToggle={toggleCollapse} showKeyboardHints={false} isCollapsed={isCollapsed} />

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
