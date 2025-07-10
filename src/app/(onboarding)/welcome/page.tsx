"use client"
import { useTheme } from "@/app/components/theme/ThemeContext ";
import React from "react";

const WelcomePage = () => {
  const { lightTheme, darkTheme, accentColor } = useTheme();
  return (
    <div>
      {accentColor.color}
      {lightTheme.background}
      {lightTheme.foreground}
      {darkTheme.background}
      {darkTheme.foreground}
    </div>
  );
};

export default WelcomePage;
