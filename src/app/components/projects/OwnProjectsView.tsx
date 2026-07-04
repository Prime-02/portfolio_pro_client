"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Plus, Share2 } from "lucide-react";
import { ProjectStatsBar } from "./ProjectStatsBar";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectGrid } from "./ProjectGrid";
import { EmptyProjectsState } from "./EmptyProjectsState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import type { PortfolioProjectResponse, ProjectStats } from "@/lib/stores/projects/types/project.types";
import { PageHeader } from "../ui/PageHeader";
import Button from "../buttons/Buttons";
import { ErrorMessage } from "../ui/ErrorMessage";
import { InfiniteScrollTrigger } from "../blogs/InfiniteScrollTrigger";
import { handleShareProfile } from "@/lib/utilities/syncFunctions/syncs";
import { useTheme } from "../theme/ThemeContext";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface OwnProjectsViewProps {
  projects: PortfolioProjectResponse[];
  totalProjects: number;
  projectStats: ProjectStats | null;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  error: string | null;
  onClearError: () => void;
  filterParams: {
    query: string;
    filterPlatform: string;
    sort: "name" | "date";
    sortDirection: "asc" | "desc";
  };
  onFilterChange: (params: OwnProjectsViewProps["filterParams"]) => void;
  onDelete: (projectIds: string[]) => Promise<void>;
  deleting: boolean;
  miniView?: boolean;
}

export function OwnProjectsView({
  projects,
  totalProjects,
  projectStats,
  isLoading,
  hasMore,
  onLoadMore,
  error,
  onClearError,
  filterParams,
  onFilterChange,
  onDelete,
  deleting,
  miniView = false,
}: OwnProjectsViewProps) {
  const router = useRouter();
  const { profileContext } = useTheme();
  const { userInfo } = useUserSettings()
  const usernamePath = profileContext?.username ? `${profileContext.username}` : "";
  const [deleteProject, setDeleteProject] = useState<PortfolioProjectResponse | null>(null);

  const handleEdit = (project: PortfolioProjectResponse) => {
    router.push(`projects/${project.id}/edit`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProject) return;
    await onDelete([deleteProject.id]);
    setDeleteProject(null);
  };

  const displayedProjects = miniView ? projects.slice(0, 3) : projects;
  const showSeeAll = miniView && projects.length > 0;

  if (isLoading && projects.length === 0) return <LoadingSkeleton />;

  return (
    <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-7xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-7xl mx-auto"}>
      <PageHeader
        icon={<FolderOpen className="w-6 h-6 text-[var(--accent)]" />}
        title="My Projects"
        description={`${totalProjects} project${totalProjects !== 1 ? "s" : ""} in your portfolio`}
        action={!miniView ? (
          <div className="flex items-center gap-x-2">
            <Button
              onClick={handleShareProfile}
              className="self-start sm:self-auto"
              text="Share Your Projects"
              icon={<Share2 className="w-4 h-4" />}
              variant="outline"
            />
            <Button
              onClick={() => router.push("projects/create")}
              className="self-start sm:self-auto"
              text="New Project"
              icon={<Plus className="w-4 h-4" />}
            />
          </div>
        ) : undefined}
      />


      {
        !miniView &&
        <ProjectStatsBar stats={projectStats} totalProjects={totalProjects} />
      }

      {
        !miniView &&
        <ProjectFilters
          query={filterParams.query}
          onQueryChange={(query) => onFilterChange({ ...filterParams, query })}
          filterPlatform={filterParams.filterPlatform}
          onPlatformChange={(filterPlatform) =>
            onFilterChange({ ...filterParams, filterPlatform })
          }
          sort={filterParams.sort}
          onSortChange={(sort) => onFilterChange({ ...filterParams, sort })}
          sortDirection={filterParams.sortDirection}
          onSortDirectionChange={(sortDirection) =>
            onFilterChange({ ...filterParams, sortDirection })
          }
        />
      }


      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      {projects.length === 0 && !isLoading ? (
        <EmptyProjectsState isOwner={true} />
      ) : (
        <>
          <ProjectGrid
            projects={displayedProjects}
            isLoading={isLoading && projects.length === 0}
            isOwner={true}
            onEdit={handleEdit}
            onDelete={setDeleteProject}
          />

          {showSeeAll && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => router.push(usernamePath ? `/${usernamePath}/projects` : `/${userInfo?.username || "users"}/projects`)}
                className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
              >
                See all
              </button>
            </div>
          )}

          {!miniView && (
            <InfiniteScrollTrigger
              hasMore={hasMore}
              isLoading={isLoading}
              onLoadMore={onLoadMore}
            />
          )}
        </>
      )}

      <DeleteProjectDialog
        projectName={deleteProject?.project_name ?? ""}
        open={!!deleteProject}
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => !open && setDeleteProject(null)}
      />
    </div>
  );
}