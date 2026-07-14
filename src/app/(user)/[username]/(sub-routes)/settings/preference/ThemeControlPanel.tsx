"use client";

import React, { useState, useRef, ReactNode } from "react";
import { Zap, Info } from "lucide-react";
import Themes from "./tabs/Themes";
import Loaders from "./tabs/Loaders";
import Pro from "./tabs/Pro";
import { useTheme } from "@/src/app/components/theme/ThemeContext";
import { tabConfig } from "@/lib/utilities/indices/Themes";
import SideBar from "@/src/app/(user)/components/SideBar";

interface ThemeControlPanelProp {
  component?: ReactNode;
}

const ThemeControlPanel = ({ component }: ThemeControlPanelProp) => {
  const [activeTab, setActiveTab] = useState<string>("themes");
  const { theme, themeVariant, accentColor } = useTheme();

  // const loaderRef = useRef<HTMLDivElement>(null);

  const currentTab = tabConfig.find((tab) => tab.key === activeTab);

  return (
    <div className={`min-h-screen border-r max-w-6xl mx-auto relative  border-[var(--accent)]/20 flex transition-colors duration-300`}>
      {/* Main Content */}
      <div className="flex-1 p-6 mx-auto w-full overflow-auto">
        {/* Tab Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              {currentTab && (
                <div
                  className="flex items-center justify-center w-10 h-10 bg-[var(--background)]/10 rounded-lg"
                >
                  <currentTab.icon className="w-5 h-5 text-[var(--foreground)]" />
                </div>
              )}
              <h2 className="text-2xl font-bold tracking-tight">
                {currentTab?.label}
                {activeTab === "pro" && (
                  <span className="inline-flex items-center justify-center ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                    <Zap size={14} className="mr-1" />
                    <span className="text-xs font-semibold">PRO</span>
                  </span>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {component}
            </div>
          </div>

          <div
            className="flex items-start gap-3 p-4 rounded-xl border bg-[var(--background)]/5 border-[var(--accent)]/10 "
          >
            <div
              className="flex-shrink-0 p-1.5 rounded-lg bg-[var(--background)]/10"
            >
              <Info className="w-4 h-4 opacity-70" />
            </div>
            <p className="text-sm leading-relaxed opacity-80">{currentTab?.helpText}</p>
          </div>
        </div>
        {/* Tab Content */}
        <div className="space-y-6 p-4 min-w-md rounded-xl shadow-xl">
          {activeTab === "themes" && <Themes />}

          {/* {activeTab === "loaders" && <Loaders loaderRef={loaderRef} />} */}

          {activeTab === "pro" && <Pro />}
        </div>
      </div>
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
    </div>
  );
};

export default ThemeControlPanel;
