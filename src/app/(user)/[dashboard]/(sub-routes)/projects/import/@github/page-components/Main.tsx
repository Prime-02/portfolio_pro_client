"use client";
import React from "react";
import { useGitHubProjectsStore } from "@/app/stores/project_stores/GitHubProjectsStore";
import OAuthButton from "@/app/(auth)/user-auth/[platform]/platforms/OAuthButton";
import ProjectsDisplay from "./ProjectsDisplay"; // Your existing GitHub ProjectsDisplay
import PlatformIntegration from "../../PlatformIntegration";

const Main = () => {
  const { projectsNames, clearProjectsNames } = useGitHubProjectsStore();

  const headerTexts = {
    default: "Your GitHub Projects",
    resync: "Re-sync your account to GitHub",
    disconnect: "Disconnect your account from GitHub",
  };

  const subHeaderTexts = {
    default: "All projects available and accessible to your GitHub account",
    resync:
      'Re-sync or switch GitHub accounts to import new projects. Click "Continue With GitHub" to proceed',
    disconnect:
      'You\'re about to disconnect your account from GitHub, all projects imported from GitHub will be lost. Click "Continue" to proceed.',
  };

  return (
    <PlatformIntegration
      platform="github"
      projectsNames={projectsNames}
      clearProjectsNames={clearProjectsNames}
      headerTexts={headerTexts}
      subHeaderTexts={subHeaderTexts}
      OAuthComponent={<OAuthButton provider="github" />}
      ProjectsDisplayComponent={<ProjectsDisplay />}
      oAuthProps={{ provider: "github" }}
    />
  );
};

export default Main;
