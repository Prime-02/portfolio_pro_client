"use client";
import React from "react";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";
import PlatformIntegration from "../../PlatformIntegration";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import VercelButton from "@/app/(auth)/user-auth/[platform]/platforms/vercel/VercelButton";
import ProjectsDisplay from "./ProjectsDisplay";

const Main = () => {
  const { projectsNames, clearProjectsNames } = useProjectsStore();

  const headerTexts = {
    default: "Your Vercel Projects",
    resync: "Re-sync your account to Vercel",
    disconnect: "Disconnect your account from Vercel",
  };

  const subHeaderTexts = {
    default: "Projects deployed with and accessible to your Vercel account.",
    resync:
      "Resync to import new projects or switch connected Git accounts. Click 'Continue with Vercel' to proceed.",
    disconnect:
      "This will disconnect your Vercel account. All associated deployment data will be removed. Click 'Continue' to proceed.",
  };

  return (
    <PlatformIntegration
      platform="vercel"
      importEndpoint={`${V1_BASE_URL}/vercel/import`}
      projectsNames={projectsNames}
      clearProjectsNames={clearProjectsNames}
      headerTexts={headerTexts}
      subHeaderTexts={subHeaderTexts}
      OAuthComponent={<VercelButton />}
      ProjectsDisplayComponent={<ProjectsDisplay />}
    />
  );
};

export default Main;
