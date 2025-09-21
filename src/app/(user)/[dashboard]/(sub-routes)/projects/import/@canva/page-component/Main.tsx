"use client";
import React from "react";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";
import PlatformIntegration from "../../PlatformIntegration";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import OAuthButton from "@/app/(auth)/user-auth/[platform]/platforms/OAuthButton";
import ProjectsDisplay from "./ProjectsDisplay";

const Main = () => {
  const { projectsNames, clearProjectsNames } = useProjectsStore();

  const headerTexts = {
    default: "Your Canva Projects",
    resync: "Re-sync your account to Canva",
    disconnect: "Disconnect your account from Canva",
  };

  const subHeaderTexts = {
    default: "Projects and designs found in your Canva account.",
    resync:
      "Resync to import new projects and designs or switch connected Canva accounts. Click 'Continue with Canva' to proceed.",
    disconnect:
      "This will disconnect your Vercel account. All associated projects and design data will be removed. Click 'Continue' to proceed.",
  };

  return (
    <PlatformIntegration
      platform="canva"
      importEndpoint={`${V1_BASE_URL}/vercel/import`}
      projectsNames={projectsNames}
      clearProjectsNames={clearProjectsNames}
      headerTexts={headerTexts}
      subHeaderTexts={subHeaderTexts}
      OAuthComponent={<OAuthButton provider="canva" fullWidth />}
      ProjectsDisplayComponent={<ProjectsDisplay />}
    />
  );
};

export default Main;
