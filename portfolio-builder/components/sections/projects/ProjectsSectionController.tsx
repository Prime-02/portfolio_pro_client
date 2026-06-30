// portfolio-builder/components/sections/projects/ProjectsSectionController.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import ProjectsRenderer from "./ProjectsRenderer";
import ProjectsEditor from "./ProjectsEditor";
import { ProjectsData, getEmptyProjectsData } from "@/portfolio-builder/types/projects";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProjectsSectionControllerProps {
  projectsData: ProjectsData | null;
  onSave: (updatedProjectsData: ProjectsData) => Promise<void>;
  username: string;
  viewOnly: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProjectsSectionController({
  projectsData,
  onSave,
  username,
  viewOnly
}: ProjectsSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { fetchProjectsByUser } = useProjectStore();

  // ── Optimistic local state ────────────────────────────────────────────────
  const [localData, setLocalData] = useState<ProjectsData | null>(projectsData);
  useEffect(() => {
    if (projectsData) setLocalData(projectsData);
  }, [projectsData]);

  // Prefetch with the real filter config as soon as both username and
  // projectsData are available.
  const prefetchedRef = useRef(false);
  useEffect(() => {
    if (!username || !projectsData || prefetchedRef.current) return;
    prefetchedRef.current = true;
    fetchProjectsByUser(username, {
      is_completed: projectsData.filters?.is_completed,
      is_concept: projectsData.filters?.is_concept,
      project_category: projectsData.filters?.project_category,
      project_platform: projectsData.filters?.project_platform,
      project_status: projectsData.filters?.project_status,
      ids: projectsData.filters?.ids,
      merge_filters: projectsData.filters?.merge_filters,
    });
  }, [username, projectsData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Save ----------------------------------------------------------------
  const handleSave = async (updatedProjectsData: ProjectsData) => {
    setLocalData(updatedProjectsData);
    await onSave(updatedProjectsData);
  };

  // ---- Cancel --------------------------------------------------------------
  const handleCancel = () => {
    setLocalData(projectsData);
    setIsEditing(false);
  };

  // ---- Fullscreen ----------------------------------------------------------
  const handleSetFullscreen = (latestData: ProjectsData) => {
    setLocalData(latestData);
    setIsEditing(false);
  };

  // ---- No projects data, not editing — show placeholder --------------------
  if (!localData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Projects section not set up</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Projects Section
          </button>
        </div>
      </div>
    );
  }

  // ---- Editing — show editor -----------------------------------------------
  if (isEditing) {
    return (
      <ProjectsEditor
        initialData={localData || getEmptyProjectsData()}
        onSave={handleSave}
        onCancel={handleCancel}
        setFullScreen={handleSetFullscreen}
        username={username}
      />
    );
  }

  // ---- Viewing — show renderer ---------------------------------------------
  return (
    <div className="relative">
      <ProjectsRenderer data={localData!} username={username} />

      {/* Edit button */}
      {
        !viewOnly &&
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors"
        >
          Edit
        </button>
      }
    </div>
  );
}
