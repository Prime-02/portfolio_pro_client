"use client";

import React, { useState, useRef, ReactNode } from "react";
import { Zap, Info } from "lucide-react";
import SideBar from "@/app/(user)/components/SideBar";
import Themes from "./tabs/Themes";
import Loaders from "./tabs/Loaders";
import Pro from "./tabs/Pro";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { tabConfig } from "@/app/components/utilities/indices/Themes";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";

export interface ThemeColors {
  background: string;
  foreground: string;
}

export interface ThemePreset {
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
  accent: string;
}

interface ThemeControlPanelProp {
  component?: ReactNode;
}

const ThemeControlPanel = ({ component }: ThemeControlPanelProp) => {
  const [activeTab, setActiveTab] = useState<string>("themes");
  const { theme, themeVariant, accentColor } = useTheme();

  const loaderRef = useRef<HTMLDivElement>(null);

  const currentTab = tabConfig.find((tab) => tab.key === activeTab);

  return (
    <div className="min-h-screen rounded-3xl border flex transition-colors duration-300">
      <div className="relative">
        <SideBar
          activeTab={activeTab}
          themeVariant={themeVariant}
          accentColor={accentColor}
          theme={theme}
          tabConfig={tabConfig}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 mx-auto w-full overflow-auto">
        {/* Tab Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center gap-3 mb-2">
            <div className="flex items-center justify-start gap-x-2">
              {currentTab && <currentTab.icon className="w-5 h-5" />}
              <h2 className="text-2xl font-bold">
                {currentTab?.label}
                {activeTab === "pro" && (
                  <span className="ml-2 text-yellow-600">
                    <Zap size={20} />
                  </span>
                )}
              </h2>
            </div>
            {component} 
          </div>
          <div
            className="flex items-start gap-3 p-3 rounded-lg bg-opacity-10"
            style={{ backgroundColor: `${theme.foreground}05` }}
          >
            <Info className="w-4 h-4 mt-0.5 opacity-60" />
            <p className="text-sm opacity-80">{currentTab?.helpText}</p>
          </div>
        </div>

        {/* Tab Content */}
        <div
          className="space-y-6 p-4 min-w-md rounded-xl"
          style={{
            backgroundColor: getColorShade(theme.background, 5),
          }}
        >
          {activeTab === "themes" && <Themes />}

          {activeTab === "loaders" && <Loaders loaderRef={loaderRef} />}

          {activeTab === "pro" && <Pro />}
        </div>
      </div>
    </div>
  );
};

export default ThemeControlPanel;
