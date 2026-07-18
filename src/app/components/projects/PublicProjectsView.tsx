"use client";

import { FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../context/ThemeContext";
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
  miniView?: boolean;
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
  miniView = false,
}: PublicProjectsViewProps) {
  const router = useRouter();
  const { profileContext } = useTheme();
  const usernamePath = profileContext?.username ? `${profileContext.username}` : "";
  const displayedProjects = miniView ? projects.slice(0, 3) : projects;
  const showSeeAll = miniView && projects.length > 0;

  if (isLoading && projects.length === 0) return <LoadingSkeleton />;

  return (
    <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-7xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-7xl mx-auto"}>
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
            projects={displayedProjects}
            isLoading={isLoading && projects.length === 0}
            isOwner={false}
            onEdit={() => { }}
            onDelete={() => { }}
          />

          {showSeeAll && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => router.push(usernamePath ? `/${usernamePath}/projects` : `/${username}/projects`)}
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
    </div>
  );
}