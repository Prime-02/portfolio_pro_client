"use client";
import React from "react";
import ProfileSideBar from "../components/ProfileSideBar";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const {theme} = useTheme()
  return (
    <div className="flex">
      <ProfileSideBar />
      <div className="flex-1 mx-auto  max-w-5xl min-w-sm overflow-auto mt-5 ">
        <div
          className="rounded-3xl"
          style={{
            backgroundColor: getColorShade(theme?.background, 10),
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default layout;
