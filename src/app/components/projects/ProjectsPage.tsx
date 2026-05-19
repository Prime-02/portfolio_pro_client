"use client";

import { useEffect, useState, useRef } from "react";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import { useValidation } from "@/lib/hooks/validation/useValidation";
import { useUserStore } from "@/lib/stores/user/userStore";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { OwnProjectsView } from "./OwnProjectsView";
import { PublicProjectsView } from "./PublicProjectsView";

type ProjectScenario =
  | { kind: "public"; username: string }
  | { kind: "own" }
  | { kind: "not-found" }
  | { kind: "user-not-found"; username: string }
  | { kind: "pending" };

export default function ProjectsPage() {
  const {
    projects,
    totalProjects,
    loading,
    errors,
    filteredProjects,       
    totalFilteredProjects,  
    fetchMyProjects,
    fetchProjectsByUser,
    fetchProjectStats,
    projectStats,
    deleteProjects,
  } = useProjectStore();

  const { checkIfOwnProfile, validateProfileUsername } = useValidation();
  const { userData, fetchUserData } = useUserStore();
  const { pathname } = useRouting();

  const [scenario, setScenario] = useState<ProjectScenario>({ kind: "pending" });
  const [error, setError] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState({
    query: "",
    filterPlatform: "",
    sort: "date" as "name" | "date",
    sortDirection: "desc" as "asc" | "desc",
  });

  const resolveInProgress = useRef(false);

  // Resolve profile scenario
  useEffect(() => {
    const resolveScenario = async () => {
      if (resolveInProgress.current) return;
      resolveInProgress.current = true;
      try {
        if (userData && !userData.username) await fetchUserData();

        const profileCheck = checkIfOwnProfile();
        const usernameInUrl = profileCheck?.username ?? null;
        const isAuthenticated = !!userData?.username;

        if (usernameInUrl) {
          const validation = await validateProfileUsername(usernameInUrl);
          if (validation.isValid && validation.isOwnProfile) {
            setScenario({ kind: "own" });
          } else if (validation.isValid && validation.username) {
            setScenario({ kind: "public", username: validation.username });
          } else if (isAuthenticated) {
            setScenario({ kind: "user-not-found", username: usernameInUrl });
          } else {
            setScenario({ kind: "not-found" });
          }
        } else if (isAuthenticated) {
          setScenario({ kind: "own" });
        } else {
          setScenario({ kind: "not-found" });
        }
      } finally {
        resolveInProgress.current = false;
      }
    };
    resolveScenario();
  }, [pathname, userData?.username]);

  // Fetch data based on scenario
  useEffect(() => {
    if (scenario.kind === "pending") return;

    const fetchData = async () => {
      if (scenario.kind === "public") {
        await fetchProjectsByUser(scenario.username);
      } else if (scenario.kind === "own" || scenario.kind === "user-not-found") {
        await fetchMyProjects({
          include_public: true,
          query: filterParams.query || undefined,
          filter_platform: filterParams.filterPlatform || undefined,
          sort: filterParams.sort,
          sort_direction: filterParams.sortDirection,
        });
        await fetchProjectStats();
      }
    };

    fetchData();
  }, [scenario, filterParams.query, filterParams.filterPlatform, filterParams.sort, filterParams.sortDirection]);

  // Handle store errors
  useEffect(() => {
    const storeError = errors.fetchProjects || errors.fetchProjectsByUser;
    if (storeError) setError(storeError);
  }, [errors]);

  const isOwnProfile = scenario.kind === "own" || scenario.kind === "user-not-found";
  const isLoading = loading.fetchProjects || loading.fetchProjectsByUser || loading.fetchProjectStats;

  const handleDelete = async (projectIds: string[]) => {
    await deleteProjects({ project_ids: projectIds });
  };

  if (scenario.kind === "pending") return <LoadingSkeleton />;
  if (scenario.kind === "not-found") return <div>Profile not found</div>;

  if (!isOwnProfile && scenario.kind === "public") {
    return (
      <PublicProjectsView
        username={scenario.username}
        projects={filteredProjects}         
        totalProjects={totalFilteredProjects}
        isLoading={isLoading || false}
        error={error}
        onClearError={() => setError(null)}
      />
    );
  }

  return (
    <OwnProjectsView
      projects={projects}
      totalProjects={totalProjects}
      projectStats={projectStats}
      isLoading={isLoading || false}
      error={error}
      onClearError={() => setError(null)}
      filterParams={filterParams}
      onFilterChange={setFilterParams}
      onDelete={handleDelete}
      deleting={loading.deleteProjects || false}
    />
  );
}
