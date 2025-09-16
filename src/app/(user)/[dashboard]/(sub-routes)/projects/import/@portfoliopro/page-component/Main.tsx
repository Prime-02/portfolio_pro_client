"use client";
import { MediaFile } from "@/app/components/types and interfaces/MediaInputElements";
import {
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
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";

const Main = () => {
  const [mediaState, setMediaState] = useState<MediaFile[]>([]);
  const [skills, setSkills] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [projectData, setProjectData] = useState<ProjectCreateFormData>(
    initialProjectFormData
  );
  const { checkParams, loading, setLoading, accessToken } = useGlobalState();
  const mode = checkParams("mode") || "create";
  const projectId = checkParams("projectId");

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
    if (isStep1Valid()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSave = () => {
    handleSubmit();
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
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
      )}

      <div className="w-full h-[0.1px] bg-[var(--accent)]/20" />
    </div>
  );
};

export default Main;