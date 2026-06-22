"use client";

import { useEffect, useState, useCallback } from "react";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { OwnProjectsView } from "./OwnProjectsView";
import { PublicProjectsView } from "./PublicProjectsView";
import { useTheme } from "../theme/ThemeContext ";

const PAGE_SIZE = 20;

export default function ProjectsPage() {
  const {
    projects,
    totalProjects,
    projectsPage,
    projectsHasMore,
    loading,
    errors,
    filteredProjects,
    totalFilteredProjects,
    filteredPage,
    filteredHasMore,
    fetchMyProjects,
    fetchProjectsByUser,
    fetchProjectStats,
    projectStats,
    deleteProjects,
  } = useProjectStore();

  // Get profile context from ThemeContext instead of re-validating
  const { profileContext } = useTheme();

  const [error, setError] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState({
    query: "",
    filterPlatform: "",
    sort: "date" as "name" | "date",
    sortDirection: "desc" as "asc" | "desc",
  });

  // Derived state from profileContext
  const isOwnProfile = profileContext.kind === "own";
  const publicUsername = profileContext.kind === "public" ? profileContext.username : null;

  // ── Initial / filter-change fetch (always page 1) ───────────────────
  useEffect(() => {
    if (profileContext.kind === "pending" || profileContext.kind === "unauthenticated" || profileContext.kind === "not-found") {
      return;
    }

    const fetchData = async () => {
      if (profileContext.kind === "public") {
        await fetchProjectsByUser(profileContext.username, { page: 1, size: PAGE_SIZE } as never);
      } else if (profileContext.kind === "own") {
        await fetchMyProjects({
          include_public: true,
          query: filterParams.query || undefined,
          filter_platform: filterParams.filterPlatform || undefined,
          sort: filterParams.sort,
          sort_direction: filterParams.sortDirection,
          page: 1,
          size: PAGE_SIZE,
        });
        await fetchProjectStats();
      }
    };

    fetchData();
  }, [
    profileContext.kind,
    publicUsername,
    filterParams.query,
    filterParams.filterPlatform,
    filterParams.sort,
    filterParams.sortDirection,
  ]);

  // ── Store error sync ─────────────────────────────────────────────────
  useEffect(() => {
    const storeError = errors.fetchProjects || errors.fetchProjectsByUser;
    if (storeError) setError(storeError);
  }, [errors]);

  // ── Load-more handlers ───────────────────────────────────────────────
  const handleLoadMoreOwn = useCallback(async () => {
    if (!projectsHasMore || loading.fetchProjects) return;
    await fetchMyProjects({
      include_public: true,
      query: filterParams.query || undefined,
      filter_platform: filterParams.filterPlatform || undefined,
      sort: filterParams.sort,
      sort_direction: filterParams.sortDirection,
      page: projectsPage + 1,
      size: PAGE_SIZE,
    });
  }, [projectsHasMore, loading.fetchProjects, projectsPage, filterParams, fetchMyProjects]);

  const handleLoadMorePublic = useCallback(async () => {
    if (!filteredHasMore || loading.fetchProjectsByUser || !publicUsername) return;
    await fetchProjectsByUser(publicUsername, {
      page: filteredPage + 1,
      size: PAGE_SIZE,
    } as never);
  }, [filteredHasMore, loading.fetchProjectsByUser, filteredPage, publicUsername, fetchProjectsByUser]);

  // ── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async (projectIds: string[]) => {
    await deleteProjects({ project_ids: projectIds });
  };

  // ── Render ───────────────────────────────────────────────────────────
  const isLoading =
    loading.fetchProjects || loading.fetchProjectsByUser || loading.fetchProjectStats;

  if (profileContext.kind === "pending") return <LoadingSkeleton />;

  if (profileContext.kind === "not-found" || profileContext.kind === "unauthenticated") {
    return <div>Profile not found</div>;
  }

  // Public profile view
  if (!isOwnProfile && publicUsername) {
    return (
      <PublicProjectsView
        username={publicUsername}
        projects={filteredProjects}
        totalProjects={totalFilteredProjects}
        isLoading={isLoading || false}
        hasMore={filteredHasMore}
        onLoadMore={handleLoadMorePublic}
        error={error}
        onClearError={() => setError(null)}
      />
    );
  }

  // Own profile view
  return (
    <OwnProjectsView
      projects={projects}
      totalProjects={totalProjects}
      projectStats={projectStats}
      isLoading={isLoading || false}
      hasMore={projectsHasMore}
      onLoadMore={handleLoadMoreOwn}
      error={error}
      onClearError={() => setError(null)}
      filterParams={filterParams}
      onFilterChange={setFilterParams}
      onDelete={handleDelete}
      deleting={loading.deleteProjects || false}
    />
  );
}