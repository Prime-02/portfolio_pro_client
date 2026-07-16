"use client";

import React, { useState, useRef, ReactNode } from "react";
import { Zap, Info } from "lucide-react";
import Themes from "./tabs/Themes";
import Loaders from "./tabs/Loaders";
import Pro from "./tabs/Pro";
import { useTheme } from "@/src/app/components/theme/ThemeContext";
import { tabConfig } from "@/lib/utilities/indices/Themes";
import SideBar from "@/src/app/(user)/components/SideBar";
import { PageHeader } from "@/src/app/components/ui/PageHeader";

interface ThemeControlPanelProp {
  component?: ReactNode;
}

const ThemeControlPanel = ({ component }: ThemeControlPanelProp) => {
  const [activeTab, setActiveTab] = useState<string>("themes");
  const { theme, themeVariant, accentColor } = useTheme();

  // const loaderRef = useRef<HTMLDivElement>(null);

  const currentTab = tabConfig.find((tab) => tab.key === activeTab);

  return (
    <div className="min-h-screen border-r max-w-6xl mx-auto relative border-[var(--accent)]/20 flex transition-colors duration-300">
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 p-6 mx-auto w-full overflow-auto">
        {/* Tab Header */}
        <div className="mb-8">
          <PageHeader
            icon={currentTab && (
              <div className="flex items-center justify-center w-10 h-10 bg-[var(--background)]/10 rounded-lg">
                <currentTab.icon />
              </div>
            )}
            title={currentTab?.label || ""}
            description={currentTab?.helpText}
          />
        </div>
        {/* Tab Content */}
        <div className="space-y-6 p-4 min-w-md rounded-xl shadow-xl">
          {activeTab === "themes" && <Themes />}

          {/* {activeTab === "loaders" && <Loaders loaderRef={loaderRef} />} */}

          {activeTab === "pro" && <Pro />}
        </div>
      </div>

      {/* Sidebar - Fixed position, won't scroll with content */}
      <div className="sticky top-0 h-screen">
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