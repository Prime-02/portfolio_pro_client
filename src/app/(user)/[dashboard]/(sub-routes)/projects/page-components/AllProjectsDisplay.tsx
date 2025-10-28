"use client";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useCallback, useEffect } from "react";
import AllProjectsCard from "./AllProjectsCard";
import SearchAndFilter from "./SearchAndFilter";
import ProjectsActions from "./ProjectsActions";
import Modal from "@/app/components/containers/modals/Modal";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";
import EmptyState from "@/app/components/containers/cards/EmptyState";
import { useLoadProjectStats } from "@/app/stores/project_stores/ProjectStats";

const AllProjectsDisplay = () => {
  const { checkParams, accessToken, loading, setLoading, isOnline, isLoading } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const LoaderComponent = getLoader(loader) || null;
  const loadProjectStats = useLoadProjectStats();

  // Get everything from the store
  const {
    clearProjectsNames,
    projectsNames,
    projects,
    page,
    isLoadingMore,
    getAllProjects,
    handleLoadMore,
  } = useProjectsStore();

  const platformTitle = checkParams("filter") || "all";
  const filter = checkParams("filter");
  const query = checkParams("querry");
  const sort = checkParams("sort");
  const view = checkParams("view") || "grid";
  const sortDirection = checkParams("sortDirection");

  const formattedPlatformTitle = (platformTitle: string) => {
    if (platformTitle === "portfoliopro") {
      return "PORTFOLIO PRO";
    } else {
      return platformTitle.replace("_", " ").toLocaleUpperCase();
    }
  };

  useEffect(() => {
    clearProjectsNames();
  }, [clearProjectsNames]);

  // Wrapper function to call the store method with current params
  const fetchProjects = useCallback(
    (pageNum = 1, append = false) => {
      return getAllProjects({
        accessToken,
        setLoading,
        filter:
          filter === "portfoliopro" ? "portfolio-pro" : filter || undefined,
        query: query || undefined,
        sort: sort || undefined,
        sortDirection: sortDirection || undefined,
        pageNum,
        append,
      });
    },
    [
      accessToken,
      filter,
      query,
      sort,
      sortDirection,
    ]
  );

  // Wrapper function for load more
  const loadMore = useCallback(() => {
    return handleLoadMore({
      accessToken,
      setLoading,
      filter: filter || undefined,
      query: query || undefined,
      sort: sort || undefined,
      sortDirection: sortDirection || undefined,
    });
  }, [
    accessToken,
    setLoading,
    filter,
    query,
    sort,
    sortDirection,
    handleLoadMore,
  ]);

  useEffect(() => {
    if (isOnline) {
      fetchProjects();
      loadProjectStats();
    }
  }, [isOnline]);

  // Check if initial loading
  const isInitialLoading = isLoading("fetching_projects") && page === 1;

  return (
    <div className="flex relative flex-col gap-y-3 ">
      <BasicHeader
        heading={`${formattedPlatformTitle(platformTitle)} projects`.toUpperCase()}
        subHeading="Click on a project's card to see further actions."
      />
      <SearchAndFilter />
      {projects.total < 1 && !isInitialLoading ? (
        <div className="text-center py-8 w-sm mx-auto px-4 rounded-lg border border-[var(--accent)]/20 ">
          <EmptyState
            title="No projects found"
            description="We couldn't find any projects affiliated to your account. Either add new project or refresh if you have any project."
            actionText="Refresh"
            onAction={fetchProjects}
          />
        </div>
      ) : isInitialLoading ? (
        <div className="h-[10rem] flex items-center justify-center mx-auto">
          {LoaderComponent ? (
            <LoaderComponent color={accentColor.color} />
          ) : (
            "Fetching projects, please wait..."
          )}
        </div>
      ) : (
        <MasonryGrid
          gap={10}
          totalItems={projects.total}
          loadedItems={projects.projects.length}
          page={page}
          customMessage="Showing all repositories"
          setPage={() => {}} // This is now handled by the store
          onLoadMore={loadMore}
          isLoading={isLoadingMore}
          loadingIndicator={
            LoaderComponent ? (
              <LoaderComponent color={accentColor.color} />
            ) : (
              "Loading more..."
            )
          }
          layout={{
            stage1: view === "list" ? 1 : 1,
            stage2: view === "list" ? 1 : 2,
            stage3: view === "list" ? 1 : 3,
            stage4: view === "list" ? 1 : 3,
            stage5: view === "list" ? 1 : 4,
            stage6: view === "list" ? 1 : 5,
            stage7: view === "list" ? 1 : 6,
          }}
        >
          {projects.projects.map((project, i) => (
            <AllProjectsCard key={`${project.id || i}`} {...project} />
          ))}
        </MasonryGrid>
      )}
      <Modal
        isOpen={projectsNames.length > 0}
        title={`${projectsNames.length} Project${projectsNames.length > 1 ? "s" : ""}`}
        onClose={clearProjectsNames}
        showMinimizeButton
        closeOnBackdropClick={false}
        showBackdrop={false}
        size="auto"
      >
        <ProjectsActions />
      </Modal>
    </div>
  );
};

export default AllProjectsDisplay;
