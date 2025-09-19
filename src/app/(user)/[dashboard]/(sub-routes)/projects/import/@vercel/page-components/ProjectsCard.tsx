import React from "react";
import { ExternalLink } from "lucide-react";
import { ProjectsProps } from "./ProjectsDisplay";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";

const ProjectsCard: React.FC<ProjectsProps> = ({
  name,
  framework,
  production_url,
}) => {
  const { toggleProjectName, projectsNames } = useProjectsStore();

  const handleVisitProject = () => {
    if (production_url) {
      window.open(production_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      onClick={() => {
        toggleProjectName(name);
      }}
      className={` border ${projectsNames.includes(name) ? "border-[var(--accent)]" : "border-[var(--accent)]/20"} rounded-lg flex flex-col shadow-md hover:shadow-lg transition-all duration-300  overflow-hidden`}
    >
      {production_url && (
        <ImageCard
          id={production_url}
          image_url={"https://image.thum.io/get/" + production_url}
          borderRadius="lg"
          borderColor="none"
        />
      )}
      <div className="p-2 flex justify-between w-full items-center  ">
        <div className="flex items-center justify-between">
          <h3
            onClick={() => {
              handleVisitProject();
            }}
            className="text-lg font-semibold underline flex items-center gap-1 truncate"
          >
            {name}
            <ExternalLink size={16} />
          </h3>
        </div>

        {/* Framework Badge */}
        {framework && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--foreground)] text-[var(--background)]  ">
              {framework}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

export default ProjectsCard;
