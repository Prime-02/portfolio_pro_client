"use client";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import React from "react";
import ProfileSideBar from "./components/ProfileSideBar";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { theme } = useTheme();
  return (
    <div className="flex">
      <ProfileSideBar />
      <div className="px-2  flex-1 mx-auto  max-w-5xl min-w-md overflow-auto mt-5  min-h-screen">
        <div className="rounded-3xl">{children}</div>
      </div>
    </div>
  );
};

export default layout;
