"use client";

import type { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

interface ProjectDialogsProps {
  deleteProject: PortfolioProjectResponse | null;
  onDeleteProjectChange: (project: PortfolioProjectResponse | null) => void;
  isDeleting: boolean;
  onDeleteConfirm: () => Promise<void>;
}

export function ProjectDialogs({
  deleteProject,
  onDeleteProjectChange,
  isDeleting,
  onDeleteConfirm,
}: ProjectDialogsProps) {
  return (
    <>
      {deleteProject && (
        <DeleteProjectDialog
          projectName={deleteProject.project_name}
          open={!!deleteProject}
          isLoading={isDeleting}
          onConfirm={onDeleteConfirm}
          onOpenChange={(open) => {
            if (!open) onDeleteProjectChange(null);
          }}
        />
      )}
    </>
  );
}
