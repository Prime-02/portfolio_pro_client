"use client";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";
import UserDisplayPictures from "./page-components/DisplayPictures";
const page = () => {
  const { theme } = useTheme();
  return (
    <div className="p-5 flex flex-col gap-y-5">
      <div
        className="rounded-3xl w-full flex flex-col min-h-screen h-auto relative"
        style={{
          backgroundColor: getColorShade(theme.background, 10),
        }}
      >
        <UserDisplayPictures />
      </div>
    </div>
  );
};

export default page;
