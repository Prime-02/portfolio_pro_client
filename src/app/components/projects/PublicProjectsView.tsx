"use client";

import { FolderOpen } from "lucide-react";
import { ProjectGrid } from "./ProjectGrid";
import { EmptyProjectsState } from "./EmptyProjectsState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import type { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";
import { PageHeader } from "../ui/PageHeader";
import { ErrorMessage } from "../ui/ErrorMessage";
import { InfiniteScrollTrigger } from "../blogs/InfiniteScrollTrigger";

interface PublicProjectsViewProps {
  username: string;
  projects: PortfolioProjectResponse[];
  totalProjects: number;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  error: string | null;
  onClearError: () => void;
}

export function PublicProjectsView({
  username,
  projects,
  totalProjects,
  isLoading,
  hasMore,
  onLoadMore,
  error,
  onClearError,
}: PublicProjectsViewProps) {
  if (isLoading && projects.length === 0) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        icon={<FolderOpen className="w-6 h-6 text-[var(--accent)]" />}
        title={`${username}'s Projects`}
        description={`${totalProjects} project${totalProjects !== 1 ? "s" : ""} in their portfolio`}
      />

      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      {projects.length === 0 && !isLoading ? (
        <EmptyProjectsState isOwner={false} username={username} />
      ) : (
        <>
          <ProjectGrid
            projects={projects}
            isLoading={isLoading && projects.length === 0}
            isOwner={false}
            onEdit={() => { }}
            onDelete={() => { }}
          />

          <InfiniteScrollTrigger
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={onLoadMore}
          />
        </>
      )}
    </div>
  );
}