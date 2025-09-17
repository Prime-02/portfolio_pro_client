"use client";
import { MediaFile } from "@/app/components/types and interfaces/MediaInputElements";
import {
  AllProjectsDisplayCardProps,
  ProjectCreateFormData,
  ProjectStatusProps,
} from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import { initialProjectFormData } from "@/app/components/utilities/indices/projects-JSONs/projectCreate";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import Step1Form from "./Step1Form";
import Step2Form from "./Step2Form";
import StepIndicator from "./StepIndicator";
import { toast } from "@/app/components/toastify/Toastify";
import {
  GetAllData,
  PostAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";

const Main = () => {
  const [mediaState, setMediaState] = useState<MediaFile[]>([]);
  const [skills, setSkills] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [projectData, setProjectData] = useState<ProjectCreateFormData>(
    initialProjectFormData
  );
  const {
    checkParams,
    setLoading,
    accessToken,
    checkValidId,
    currentPath,
    router,
    isOnline,
  } = useGlobalState();
  const { projectsNames } = useProjectsStore();
  const mode = checkParams("mode") || "create";
  const rawProjectId = checkParams("projectId") || "";
  const projectId = checkValidId(rawProjectId)
    ? rawProjectId
    : projectsNames[0];

  useEffect(() => {
    const mediaFiles = mediaState.map((mediaData) => mediaData.media_file);

    setProjectData((prev) => ({
      ...prev,
      project_media: mediaFiles,
    }));
  }, [mediaState]);

  const handleFieldValues = (
    key: string,
    value: string | ProjectStatusProps | boolean
  ) => {
    setProjectData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStackAdd = (skill: string) => {
    setProjectData((prev) => ({
      ...prev,
      stack: [...prev.stack, skill],
    }));
  };

  const handleStackRemove = (index: number) => {
    setProjectData((prev) => ({
      ...prev,
      stack: prev.stack.filter((_, i) => i !== index),
    }));
  };

  const handleReset = () => {
    setProjectData(initialProjectFormData);
    setMediaState([]);
    setSkills("");
  };

  // Validation for Step 1 (required fields)
  const isStep1Valid = () => {
    return (
      projectData.project_name.trim() !== "" &&
      projectData.project_category !== "" &&
      projectData.project_description.trim() !== "" &&
      mediaState.length > 0
    );
  };

  const handleNextStep = () => {
    if (isStep1Valid() || checkValidId(projectId)) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSave = () => {
    if (projectId) {
      updateProjectData();
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading("uploading_projects");
    console.log("Project Data:", projectData);

    // Debug: Check each field to see which one is causing issues
    console.log("=== DEBUGGING PROJECT DATA ===");
    Object.entries(projectData).forEach(([key, value]) => {
      console.log(`${key}:`, typeof value, Array.isArray(value), value);

      if (Array.isArray(value)) {
        console.log(
          `  Array items:`,
          value.map((item) => ({
            value: item,
            type: typeof item,
            isFile: item instanceof File,
            isBlob: item instanceof Blob,
          }))
        );
      } else if (typeof value === "object" && value !== null) {
        console.log(`  Object keys:`, Object.keys(value));
      }
    });
    console.log("=== END DEBUG ===");

    try {
      const uploadRes = await PostAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/`,
        useFormData: true,
        data: projectData as ProjectCreateFormData,
      });

      if (uploadRes) {
        toast.success("You have successfully imported this project", {
          title: "Project Success",
        });
        handleReset();
        router.push(
          PathUtil.buildUrlWithQuery(`${currentPath}/import`, {
            mode: "edit",
            projectId: projectId,
          })
        );
      }
    } catch (error) {
      console.error("An Error occurred uploading this project:", error);
      toast.error(
        "An error occurred uploading this project. Please try again."
      );
    } finally {
      setLoading("uploading_projects");
    }
  };

  const getProjectByProjectId = async () => {
    setLoading("fetching_project_by_id");
    try {
      const projectDataRes: AllProjectsDisplayCardProps = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/${projectId}`,
      });
      if (projectDataRes) {
        Object.entries(projectData).forEach(([key]) => {
          handleFieldValues(
            key,
            projectDataRes[key] as string | boolean | ProjectStatusProps
          );
        });
      }
    } catch (error) {
      console.log("Error fetching this project data: ", error);
      toast.error(
        "We couldn't retrieve this project's data, plase try again.",
        {
          title: "Error fetching project data",
        }
      );
    } finally {
      setLoading("fetching_project_by_id");
    }
  };

  const updateProjectData = async () => {
    if (!isOnline) {
      toast.warning(
        "You are currently offline. Please check your internet and try again",
        { title: "Connection Error" }
      );
      return;
    }
    setLoading("updating_project");
    console.log("Update Data: ", projectData);

    try {
      const editRes = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/${projectId}`,
        field: projectData,
        useFormData: true,
      });
      if (editRes) {
        toast.success("This project has been updated successfully");
      }
    } catch (error) {
      console.log("An error occured while updating this project: ", error);
      toast.error(
        "An error occured while updating this project. Please try again or contact support"
      );
    } finally {
      setLoading("updating_project");
    }
  };

  useEffect(() => {
    if (accessToken && isOnline) {
      getProjectByProjectId();
    }
  }, [accessToken, isOnline]);

  return (
    <div className="flex flex-col gap-4 w-full min-h-screen h-auto p-4">
      <div className="flex flex-col items-start">
        <h1 className="md:text-3xl text-2xl font-semibold">
          {mode === "create" ? "Create" : "Edit"} Project
        </h1>
        <h3 className="md:text-base text-sm opacity-65 font-thin max-w-2xl">
          {`Import projects manually on the platform by uploading images and
          details of the project`}
        </h3>
      </div>

      <StepIndicator currentStep={currentStep} />

      <div className="w-full h-[0.1px] bg-[var(--accent)]/20" />

      {/* Step 1 Form - Always mounted, visibility controlled */}
      <div className={currentStep === 1 ? "block" : "hidden"}>
        <Step1Form
          projectData={projectData}
          mediaState={mediaState}
          onFieldChange={handleFieldValues}
          onMediaChange={setMediaState}
          onNext={handleNextStep}
          onSave={handleSave}
          isValid={isStep1Valid()}
          projectId={projectId}
        />
      </div>

      {/* Step 2 Form - Only rendered when on step 2 */}
      {currentStep === 2 && (
        <Step2Form
          projectData={projectData}
          skills={skills}
          onFieldChange={handleFieldValues}
          onSkillsChange={setSkills}
          onStackAdd={handleStackAdd}
          onStackRemove={handleStackRemove}
          onPrevious={handlePreviousStep}
          onSubmit={projectId ? handleSave : handleSubmit}
          onReset={handleReset}
          projectId={projectId}
        />
      )}

      <div className="w-full h-[0.1px] bg-[var(--accent)]/20" />
    </div>
  );
};

export default Main;
