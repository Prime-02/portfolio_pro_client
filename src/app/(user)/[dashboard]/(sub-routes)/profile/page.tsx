"use client";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  getColorShade,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";
import React, { useState } from "react";
import ProfileTemplate from "./page-components/ProfileTemplate";
import { defaultProfileSettingsJson } from "@/app/components/utilities/indices/settings-JSONs/UserProfile";
import { useGlobalState } from "@/app/globalStateProvider";
const ProfileMain = () => {
  const { theme } = useTheme();
  const { userData } = useGlobalState();
  const [profileSettings, setProfileSettings] = useState(
    defaultProfileSettingsJson
  );

  return (
    <div className="p-5 flex flex-col gap-y-5">
      <div
        className="rounded-3xl w-full flex flex-col py-5 h-auto pb-4 relative"
        style={{
          backgroundColor: getColorShade(theme.background, 10),
        }}
      >
        <ProfileTemplate
          showSettings={getCurrentUrl("pathSegment", 0) === userData.username}
          settings={profileSettings}
          setSettings={setProfileSettings}
        />
      </div>
    </div>
  );
};

export default ProfileMain;
