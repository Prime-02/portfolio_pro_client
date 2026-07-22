"use client";

// ProjectList.tsx
// Grid/list of project cards with selection state management

import React from "react";
import { ProjectCard } from "./ProjectCard";
import { Separator } from "./ui-components";
import { ProjectListProps } from "./types";
import CheckBox from "@/src/app/components/inputs/CheckBox";

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProjects,
  importingProjects,
  importResults,
  onSelectProject,
  onImportSingle,
  onSelectAll,
}) => {
  const allSelected = projects.length > 0 && projects.every((p) => selectedProjects.has(p.name));

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  return (
    <div className="space-y-3">
      {/* Select All Header */}
      <div className="flex items-center gap-3 px-1 py-2">
        <CheckBox
          isChecked={allSelected}
          setIsChecked={(e) => handleSelectAll(e)}
          label={allSelected ? "Deselect all" : "Select all"}
        />
        <Separator className="flex-1" />
        <span className="text-xs text-[var(--foreground)]/40">
          {selectedProjects.size} of {projects.length} selected
        </span>
      </div>

      {/* Project Cards */}
      <div className="grid gap-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={selectedProjects.has(project.name)}
            isImporting={importingProjects.has(project.name)}
            importStatus={
              importResults[project.name]
                ? importResults[project.name].success
                  ? "success"
                  : "error"
                : "idle"
            }
            onSelect={onSelectProject}
            onImportSingle={onImportSingle}
          />
        ))}
      </div>
    </div>
  );
};
