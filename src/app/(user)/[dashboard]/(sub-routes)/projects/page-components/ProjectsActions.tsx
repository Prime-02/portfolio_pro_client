import Button from "@/app/components/buttons/Buttons";
import Popover from "@/app/components/containers/divs/PopOver";
import { toast } from "@/app/components/toastify/Toastify";
import { DeleteData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";
import { useLoadProjectStats } from "@/app/stores/project_stores/ProjectStats";
import { Edit, FilePlus2, Trash, View } from "lucide-react";
import React from "react";

const ProjectsActions = () => {
  const { projectsNames, clearProjectsNames, getAllProjects } =
    useProjectsStore();
  const { loading, setLoading, accessToken, currentPath, router } =
    useGlobalState();
  const projectCount = projectsNames.length;
  const isMultiple = projectCount > 1;
  const hasSelection = projectCount > 0;
  const loadProjectStats = useLoadProjectStats();

  const deleteProjects = async () => {
    setLoading("deleting_projects");
    const projects_ids = projectsNames;
    toast.info(
      `Project${isMultiple ? "s" : ""} deletion in progress, you will be notified about it's progress`,
      {
        title: `Project${isMultiple ? "s" : ""} deletion in progress`,
      }
    );
    clearProjectsNames();
    try {
      const deleteRes = await DeleteData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/delete/bulk`,
        data: { project_ids: projects_ids },
      });

      if (deleteRes) {
        toast.success(
          `${projectCount} project${isMultiple ? "s" : ""} ${isMultiple ? "have" : "has"} been successfully deleted`
        );
        getAllProjects({ accessToken, setLoading });
        loadProjectStats();
        clearProjectsNames();
      }
    } catch (error) {
      toast.error(
        `An error occurred while deleting ${isMultiple ? "these" : "this"} project${isMultiple ? "s" : ""}`
      );
      console.error(
        `Error deleting ${isMultiple ? "these" : "this"} project${isMultiple ? "s" : ""}:`,
        error
      );
    } finally {
      setLoading("deleting_projects");
    }
  };

  const actions = [
    {
      name: "Open",
      icon: View,
      action: () => {
        router.push(`${currentPath}/${projectsNames[0]}`);
      },
      showWhen: !isMultiple,
      disabled: !hasSelection,
      description: "Open selected project",
    },
    {
      name: "Edit",
      icon: Edit,
      action: () => {
        router.push(
          PathUtil.buildUrlWithQuery(`${currentPath}/import`, {
            mode: "edit",
            projectId: projectsNames[0],
          })
        );
      },
      showWhen: !isMultiple,
      disabled: !hasSelection,
      description: "Edit selected project",
    },
    {
      name: "Add to Portfolio",
      icon: FilePlus2,
      action: () => {
        console.log("Adding to portfolio:", projectsNames);
      },
      showWhen: true,
      disabled: !hasSelection,
      description: "Add projects to portfolio",
      hasPopover: true,
      popoverContent: <div>A list of portfolios will appear here soon</div>,
    },
    {
      name: "Delete",
      icon: Trash,
      action: () => {
        console.log("Deleting projects:", projectsNames);
      },
      showWhen: true,
      disabled: !hasSelection,
      description: "Delete selected projects",
      hasPopover: true,
      isDestructive: true, // Add flag to identify destructive action
      popoverContent: (
        <div className="w-full flex flex-col gap-y-4 p-4">
          <p className=" text-sm font-medium">
            Are you sure you want to delete {projectCount} project
            {projectCount !== 1 ? "s" : ""}?
            <span className="block text-xs mt-1 opacity-65">
              This action cannot be undone.
            </span>
          </p>
          <div className="flex gap-x-2 justify-start">
            <Button
              variant="secondary"
              text="Cancel"
              onClick={() => clearProjectsNames()}
              disabled={loading.includes("deleting_projects")}
              aria-label="Cancel project deletion"
            />
            <Button
              text="Continue"
              customColor="red"
              loading={loading.includes("deleting_projects")}
              disabled={loading.includes("deleting_projects")}
              onClick={deleteProjects}
            />
          </div>
        </div>
      ),
    },
  ];

  const visibleActions = actions.filter((action) => action.showWhen);

  const ActionButton = ({ action }: { action: any }) => {
    const IconComponent = action.icon;

    // Define button styles based on whether it's a destructive action
    const getButtonStyles = () => {
      if (action.disabled) {
        return "opacity-50 cursor-not-allowed bg-[var(--foreground)] text-gray-400";
      }

      if (action.isDestructive) {
        return "bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none";
      }

      return "bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-white focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:outline-none";
    };

    const buttonElement = (
      <button
        onClick={action.hasPopover ? undefined : action.action}
        disabled={action.disabled}
        className={`group relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${getButtonStyles()}`}
        title={action.description}
        aria-label={action.description}
      >
        <IconComponent size={18} className="flex-shrink-0" />
        <span className="hidden md:inline whitespace-nowrap text-xs truncate max-w-[100px]">
          {action.name}
        </span>
        {/* Mobile tooltip */}
        <span className="absolute hidden group-hover:block md:group-hover:hidden -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
          {action.name}
        </span>
      </button>
    );

    if (action.hasPopover) {
      return (
        <Popover
          key={action.name}
          clicker={buttonElement}
          position="bottom-center"
          clickerClassName=""
        >
          {action.popoverContent}
        </Popover>
      );
    }

    return <div key={action.name}>{buttonElement}</div>;
  };

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex justify-start items-center p-4 shadow-sm rounded-lg">
      <div className="flex items-center gap-3">
        {visibleActions.map((action) => (
          <ActionButton key={action.name} action={action} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsActions;
