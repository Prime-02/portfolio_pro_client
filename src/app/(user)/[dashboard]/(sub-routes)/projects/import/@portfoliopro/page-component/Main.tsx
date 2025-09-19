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
  DeleteData,
  GetAllData,
  PostAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import {
  generateQueryParams,
  PathUtil,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";
import Button from "@/app/components/buttons/Buttons";
import { ArrowLeft, Trash, View } from "lucide-react";
import ProjectCollaboratorsForm from "./ProjectCollaboratorsForm";
import Popover from "@/app/components/containers/divs/PopOver";

const Main = () => {
  const {
    checkParams,
    setLoading,
    accessToken,
    checkValidId,
    currentPath,
    router,
    isOnline,
    loading,
  } = useGlobalState();
  const [mediaState, setMediaState] = useState<MediaFile[]>([]);
  const [skills, setSkills] = useState<string>("");
  const currentStep = checkParams("step") || "1";
  const [projectData, setProjectData] = useState<ProjectCreateFormData>(
    initialProjectFormData
  );
  const { projectsNames } = useProjectsStore();
  const mode = checkParams("mode") || "create";
  const rawProjectId = checkParams("projectId") || "";
  const [collaboratorCount, setCollaboratorCount] = useState<number>(0);
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

  const setCurrentStep = (step: number) => {
    const constructedRoute = `${currentPath}${generateQueryParams({
      mode: mode,
      projectId: projectId,
      step: step,
    })}`;
    if (constructedRoute) {
      router.push(constructedRoute);
    }
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
    const currentStepNum = Number(currentStep);

    // Only validate Step 1 when moving from step 1 to step 2
    if (!checkValidId(projectId) && currentStepNum === 1 && !isStep1Valid()) {
      toast.error(
        "Please fill in all required fields before proceeding to the next step"
      );
      return;
    }

    if (currentStepNum < 3) {
      setCurrentStep(currentStepNum + 1);
    }
  };

  const handlePreviousStep = () => {
    const currentStepNum = Number(currentStep);

    // Go to previous step, minimum step is 1
    if (currentStepNum > 1) {
      setCurrentStep(currentStepNum - 1);
    }
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

  const deleteProjects = async () => {
    setLoading("deleting_projects");
    const project_id = projectId;
    toast.info(
      `Project deletion in progress, you will be notified about it's progress`,
      {
        title: `Project deletion in progress`,
      }
    );
    try {
      const deleteRes = await DeleteData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/delete/bulk`,
        data: { project_ids: [project_id] },
      });

      if (deleteRes) {
        toast.success(`This project been successfully deleted`);
        router.push(PathUtil.removeLastSegment(currentPath));
      }
    } catch (error) {
      toast.error(`An error occurred while deleting this project`);
      console.error(`Error deleting this project:`, error);
    } finally {
      setLoading("deleting_projects");
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
        setCollaboratorCount(projectDataRes.user_associations.length);
        setLoading("fetching_project_by_id");
      }
    } catch (error) {
      console.log("Error fetching this project data: ", error);
      toast.error(
        "We couldn't retrieve this project's data, plase try again.",
        {
          title: "Error fetching project data",
        }
      );
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
        setLoading("updating_project");
      }
    } catch (error) {
      console.log("An error occured while updating this project: ", error);
      toast.error(
        "An error occured while updating this project. Please try again or contact support"
      );
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
      <div className="flex w-full items-center flex-wrap justify-between">
        <div className="flex flex-col gap-2 items-start">
          <h1 className="md:text-3xl text-2xl font-semibold">
            {mode === "create" ? "Create" : "Updating"}{" "}
            {`${projectId && projectData.project_name ? projectData.project_name : "Project"}`}
          </h1>
          <h3 className="md:text-base text-sm opacity-65 font-thin max-w-2xl">
            {`${
              projectId && projectData.project_name
                ? `Update this project with detailed information and add collaborators`
                : `Import projects manually on the platform by uploading images and
          details of the project`
            }`}
          </h3>
          <StepIndicator
            collaboratorCount={collaboratorCount}
            projectId={projectId}
            currentStep={Number(currentStep)}
          />
        </div>
        <div className="flex flex-wrap max-w-sm justify-start  md:justify-end gap-3">
          <Button
            text="Back To Projects"
            onClick={() => {
              router.push(PathUtil.removeLastSegment(currentPath));
            }}
            icon={<ArrowLeft />}
          />
          <Button
            text="View Project"
            onClick={() => {
              router.push(PathUtil.removeLastSegment(currentPath));
            }}
            variant="outline"
            icon={<View />}
          />
          <Popover
            clickerClassName=""
            clickerContainerClassName=""
            clicker={
              <Button
                text="Remove Projects"
                variant="ghost"
                customColor="red"
                icon={<Trash />}
              />
            }
          >
            <div className="w-full flex flex-col gap-y-4 p-4">
              <p className=" text-sm font-medium">
                Are you sure you want to delete this project?
                <span className="block text-xs mt-1 opacity-65">
                  This action cannot be undone.
                </span>
              </p>
              <div className="flex gap-x-2 justify-start">
                {/* <Button
                  variant="secondary"
                  text="Cancel"
                  onClick={() => clearProjectsNames()}
                  disabled={loading.includes("deleting_projects")}
                  aria-label="Cancel project deletion"
                /> */}
                <Button
                  text="Continue"
                  customColor="red"
                  loading={loading.includes("deleting_projects")}
                  disabled={loading.includes("deleting_projects")}
                  onClick={deleteProjects}
                />
              </div>
            </div>
          </Popover>
        </div>
      </div>

      <div className="w-full h-[0.1px] bg-[var(--accent)]/20" />

      {/* Step 1 Form - Always mounted, visibility controlled */}
      <div className={currentStep === "1" ? "block" : "hidden"}>
        <Step1Form
          projectData={projectData}
          mediaState={mediaState}
          onFieldChange={handleFieldValues}
          onMediaChange={setMediaState}
          onNext={handleNextStep}
          onSave={handleSave}
          isValid={isStep1Valid()}
          projectId={projectId}
          onRefresh={getProjectByProjectId}
        />
      </div>

      {/* Step 2 Form - Only rendered when on step 2 */}
      {currentStep === "2" && (
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
          onNext={handleNextStep}
        />
      )}

      {currentStep === "3" && (
        <ProjectCollaboratorsForm
          projectId={projectId}
          projectName={projectData.project_name}
          onPrevious={handlePreviousStep}
        />
      )}

      <div className="w-full h-[0.1px] bg-[var(--accent)]/20" />
    </div>
  );
};

export default Main;
