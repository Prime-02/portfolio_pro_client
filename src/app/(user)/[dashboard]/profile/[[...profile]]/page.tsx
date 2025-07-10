"use client";

import { useTheme } from "@/app/components/theme/ThemeContext ";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import { UserProfile } from "@clerk/nextjs";
import React from "react";

const ProfilePage = () => {
  const { theme, accentColor } = useTheme();
  const { foreground, background } = theme;
  const { color } = accentColor;

  return (
    <div
      className="min-h-screen p-6 rounded-3xl"
      style={{
        backgroundColor: getColorShade(background, 10),
        color: foreground,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 transition-colors duration-300">
            Your Profile
          </h1>
          <p
            className="text-lg opacity-80 transition-colors duration-300"
            style={{ color: foreground }}
          >
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Container */}

        <UserProfile
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: color,
              colorText: foreground,
              // colorTextSecondary: foreground + "cc",
              colorBackground: background,
              colorInputBackground: background,
              colorInputText: foreground,
              // borderRadius: "0.75rem",
              fontFamily: "inherit",
            },
            elements: {
              rootBox: {
                backgroundColor: background,
                color: foreground,
              },
              card: {
                backgroundColor: background,
                borderRadius: "0.75rem",
              },
              headerTitle: {
                color: foreground,
              },
              headerSubtitle: {
                color: foreground + "cc",
              },
              socialButtonsBlockButton: {
                backgroundColor: background,
                border: `1px solid ${color}40`,
                color: foreground,
                borderRadius: "0.5rem",
                "&:hover": {
                  backgroundColor: color + "10",
                  borderColor: color,
                },
              },
              formButtonPrimary: {
                backgroundColor: color,
                borderRadius: "0.5rem",
                "&:hover": {
                  backgroundColor: color + "dd",
                },
                "&:focus": {
                  boxShadow: `0 0 0 2px ${color}40`,
                },
              },
              formFieldInput: {
                backgroundColor: background,
                borderColor: color + "30",
                color: foreground,
                borderRadius: "0.5rem",
                "&:focus": {
                  borderColor: color,
                  boxShadow: `0 0 0 2px ${color}20`,
                },
              },
              formFieldLabel: {
                color: foreground,
              },
              tabButton: {
                color: foreground + "aa",
                '&[data-state="active"]': {
                  color: color,
                  borderBottomColor: color,
                },
              },
              navbar: {
                backgroundColor: background,
              },
              navbarButton: {
                color: foreground + "aa",
                borderRadius: "0.5rem",
                '&[data-state="active"]': {
                  color: color,
                  backgroundColor: color + "10",
                },
                "&:hover": {
                  backgroundColor: color + "05",
                },
              },
              profileSection: {
                backgroundColor: background,
              },
              profileSectionTitle: {
                color: foreground,
              },
              profileSectionContent: {
                backgroundColor: background,
              },
              accordionTriggerButton: {
                color: foreground,
                "&:hover": {
                  backgroundColor: color + "05",
                },
              },
              accordionContent: {
                backgroundColor: background,
              },
              badge: {
                backgroundColor: color + "20",
                color: color,
                borderRadius: "0.25rem",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
