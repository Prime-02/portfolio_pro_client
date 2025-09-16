"use client";
import Button from "@/app/components/buttons/Buttons";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import { Import, SaveAll } from "lucide-react";
import React, { ReactNode } from "react";
import { useGlobalState } from "@/app/globalStateProvider";
import { toast } from "@/app/components/toastify/Toastify";
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";

interface PlatformIntegrationProps {
  // Platform identification
  platform: string;

  // Store hooks and data
  projectsNames: string[];
  clearProjectsNames: () => void;

  // Header content
  headerTexts: {
    default: string;
    resync: string;
    disconnect: string;
  };
  subHeaderTexts: {
    default: string;
    resync: string;
    disconnect: string;
  };

  // Components
  OAuthComponent: ReactNode;
  ProjectsDisplayComponent: ReactNode;

  // Optional customization
  importEndpoint?: string;
  oAuthProps?: Record<string, unknown>;
  projectsDisplayProps?: Record<string, unknown>;
}

const PlatformIntegration: React.FC<PlatformIntegrationProps> = ({
  platform,
  projectsNames,
  clearProjectsNames,
  headerTexts,
  subHeaderTexts,
  OAuthComponent,
  ProjectsDisplayComponent,
  importEndpoint,
}) => {
  const { accessToken, loading, setLoading, currentPath, router, checkParams } =
    useGlobalState();

  const isResync = checkParams("resync") === "true";
  const isDisconnect = checkParams("disconnect") === "true";

  // Use custom endpoint or default pattern
  const endpoint =
    importEndpoint || `${V1_BASE_URL}/${platform}/installations/import`;

  const importProject = async (
    import_all: boolean,
    project_names: string[] | null
  ) => {
    const loadingKey = `importing_projects_${import_all ? "all" : "some"}`;
    setLoading(loadingKey);

    try {
      const importRes: { status: string; message: string } = await PostAllData({
        access: accessToken,
        url: endpoint,
        data: {
          import_all: import_all,
          project_names: project_names,
        },
      });

      if (importRes && importRes.status === "accepted") {
        toast.success(importRes.message);
        clearProjectsNames();
        router.push(PathUtil.removeLastSegment(currentPath));
      } else {
        toast.error(
          `An error occurred while importing your ${platform} projects. Please try again`
        );
      }
    } catch (error) {
      console.log(
        `An error occurred while importing ${platform} projects: `,
        error
      );
      toast.error(
        `An error occurred while importing your ${platform} projects. Please try again`
      );
    } finally {
      setLoading(loadingKey);
    }
  };

  const getHeaderText = () => {
    if (isResync) return headerTexts.resync;
    if (isDisconnect) return headerTexts.disconnect;
    return headerTexts.default;
  };

  const getSubHeaderText = () => {
    if (isResync) return subHeaderTexts.resync;
    if (isDisconnect) return subHeaderTexts.disconnect;
    return subHeaderTexts.default;
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex w-full justify-between gap-2 flex-wrap items-center">
        <BasicHeader
          heading={getHeaderText()}
          subHeading={getSubHeaderText()}
        />
        {!isResync && !isDisconnect && (
          <span className="flex items-center gap-x-2">
            {projectsNames.length > 0 && (
              <Button
                text="Clear"
                variant="ghost"
                customColor="red"
                onClick={clearProjectsNames}
                size="sm"
              />
            )}
            {projectsNames.length > 0 && (
              <Button
                text={`Import [${projectsNames.length}]`}
                icon={<Import />}
                variant="outline"
                size="sm"
                onClick={() => importProject(false, projectsNames)}
                loading={loading.includes("importing_projects_some")}
                disabled={loading.includes("importing_projects_some")}
              />
            )}
            <Button
              text="Import All"
              icon={<SaveAll />}
              size="sm"
              onClick={() => importProject(true, null)}
              loading={loading.includes("importing_projects_all")}
              disabled={loading.includes("importing_projects_all")}
            />
          </span>
        )}
      </div>
      <div className="w-full h-[0.1px] bg-[var(--accent)]/20" />
      {isResync ? (
        <div className="flex w-full items-center justify-center h-auto">
          {OAuthComponent}
        </div>
      ) : isDisconnect ? (
        <div className="flex w-full items-start justify-start h-auto">
          <Button customColor="red" text="Continue" />
        </div>
      ) : (
        <div>{ProjectsDisplayComponent}</div>
      )}
    </div>
  );
};

export default PlatformIntegration;
