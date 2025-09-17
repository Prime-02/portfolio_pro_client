import React from "react";
import { ExternalLink, Globe } from "lucide-react";
import { gitHubLanguageColors } from "@/app/components/utilities/indices/projects-JSONs/projectCreate";
import Link from "next/link";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";
import { RepoProps } from "./ProjectsDisplay";

const ProjectsCard: React.FC<RepoProps> = ({
  full_name,
  name,
  description,
  html_url,
  homepage,
  language,
}) => {
  const languageColor = gitHubLanguageColors[language] || "#858585";

  const { toggleProjectName, projectsNames } = useProjectsStore();

  return (
    <button
      onClick={() => {
        toggleProjectName(full_name);
      }}
      className={` border ${projectsNames.includes(full_name) ? "border-[var(--accent)]" : "border-[var(--accent)]/20"} rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 max-w-md`}
    >
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-lg font-semibold  transition-colors">
          <Link
            href={html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center underline gap-1"
          >
            {name}
            <ExternalLink size={16} />
          </Link>
        </h3>
      </div>

      <p className="opacity-65 text-sm mb-1 w-full text-start line-clamp-2">
        {description || "No description available"}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {language && (
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: languageColor }}
              ></span>
              <span className="text-sm opacity-70">{language}</span>
            </div>
          )}
        </div>

        {homepage && (
          <Link
            href={homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-50 hover:opacity-70 transition-colors"
            title="Visit homepage"
          >
            <Globe size={16} />
          </Link>
        )}
      </div>
    </button>
  );
};

export default ProjectsCard;
