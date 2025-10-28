"use client";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import {
  AllProjectsDisplayCardProps,
  ProjectStatusProps,
} from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import React, { useState, useEffect } from "react";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import PortfolioProLogo from "@/app/components/logo/PortfolioProTextLogo";
import ErrorDisplay from "@/app/components/containers/cards/ErrorDisplay";
import ProjectBasicInfo from "./ProjectBasicInfo";

const Main = () => {
  const { currentPath, isLoading, setLoading, accessToken } = useGlobalState();
  const [projectData, setProjectData] = useState<AllProjectsDisplayCardProps>({
    id: "",
    project_name: "",
    project_description: "",
    project_platform: "",
    project_category: "",
    project_url: "",
    project_image_url: "",
    is_public: true,
    is_completed: true,
    is_concept: true,
    stack: [],
    other_project_image_url: {},
    other_project_url: {},
    tags: [],
    start_date: "",
    end_date: "",
    budget: 0,
    client_name: "",
    status: "active",
    featured_in: [],
    last_updated: "",
    created_at: "",
    user_associations: [],
  });
  const [error, setError] = useState<Error | string | null>(null);

  const projectId = PathUtil.getLastSegment(currentPath);

  const getProjectData = async () => {
    setLoading("fetching_project_data");
    setError(null); // Clear any previous errors
    try {
      const projectDataRes: AllProjectsDisplayCardProps = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/${projectId}`,
      });
      if (projectDataRes) {
        setProjectData(projectDataRes);
      }
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error : "Failed to fetch project data");
    } finally {
      setLoading("fetching_project_data");
    }
  };

  // Use useEffect to fetch data when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      getProjectData();
    }
  }, [projectId]);

  if (isLoading("fetching_project_data")) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <PortfolioProLogo
          tracking={0.2}
          scale={0.75}
          fontWeight={"extrabold"}
          reanimateDelay={3000}
        />
      </div>
    );
  }

  // Show error display if there's an error
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <ErrorDisplay
          error={error}
          onRetry={getProjectData}
          title="Failed to load project"
          retryText="Retry Loading"
          className="w-full"
        />
      </div>
    );
  }

  // Show error if no project data was loaded (even without explicit error)
  if (!projectData.id) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <ErrorDisplay
          title="Project not found"
          description="The requested project could not be loaded. It may not exist or you may not have permission to view it."
          onRetry={getProjectData}
          retryText="Try Again"
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div>
      <ProjectBasicInfo
        project_category={projectData.project_category}
        project_description={projectData.project_description}
        project_name={projectData.project_name}
        project_platform={projectData.project_platform}
        project_url={projectData.project_url}
        stack={projectData.stack}
        tags={projectData.tags}
      />
    </div>
  );
};

export default Main;
