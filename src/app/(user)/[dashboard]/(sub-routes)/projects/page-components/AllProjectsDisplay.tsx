"use client";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import { AllProjectsDisplayCardProps } from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { generateQueryParams } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useCallback, useEffect, useState } from "react";
import AllProjectsCard from "./AllProjectsCard";
import SearchAndFilter from "./SearchAndFilter";

interface AllProjectsDisplayProps {
  projects: AllProjectsDisplayCardProps[];
  total: number;
}

const AllProjectsDisplay = () => {
  const { checkParams, accessToken, loading, setLoading } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const [page, setPage] = useState(1);
  const LoaderComponent = getLoader(loader) || null;
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [projects, setProjects] = useState<AllProjectsDisplayProps>({
    projects: [],
    total: 0,
  });

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

  const getAllProjects = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setLoading("fetching_projects");
        }
        const projectRes: AllProjectsDisplayProps = await GetAllData({
          access: accessToken,
          url: `${V1_BASE_URL}/projects/me${generateQueryParams({
            filter_platform: filter,
            query: query,
            sort: sort,
            sort_direction: sortDirection,
            page: pageNum,
            size: 25,
          })}`,
        });
        if (projectRes) {
          setProjects((prev) => ({
            ...projectRes, // Use the new response data for metadata
            projects: append
              ? [...prev.projects, ...projectRes.projects]
              : projectRes.projects,
          }));

          // Update page state when appending
          if (append) {
            setPage(pageNum);
          }
        } else {
          toast.error(
            "We couldn't fetch your github projects please try again.",
            {
              title: "Error fetching projects preview",
            }
          );
        }
      } catch (error) {
        console.log(
          "Something went wrong while fetching this user's projects: ",
          error
        );
        toast.error("We couldn't fetch your projects please try again.", {
          title: "Error fetching projects",
        });
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setLoading("fetching_projects");
        }
      }
    },
    [accessToken, setLoading, platformTitle, filter, query, sort, sortDirection]
  );

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    await getAllProjects(nextPage, true);
  }, [getAllProjects, page]);

  useEffect(() => {
    if (accessToken) {
      getAllProjects();
    }
  }, [accessToken, getAllProjects]);

  // Check if initial loading
  const isInitialLoading = loading.includes("fetching_projects") && page === 1;

  return (
    <div className="flex flex-col gap-y-3 ">
      <BasicHeader
        heading={`${formattedPlatformTitle(platformTitle)} projects`.toUpperCase()}
      />
      <SearchAndFilter />
      {projects.total < 1 && !isInitialLoading ? (
        <div className="text-center py-8">
          <p>No repositories found.</p>
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
          gap={3}
          totalItems={projects.total}
          loadedItems={projects.projects.length} // Use actual loaded items count
          page={page}
          customMessage="Showing all repositories"
          setPage={setPage}
          onLoadMore={handleLoadMore}
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
            <AllProjectsCard key={i} {...project} />
          ))}
        </MasonryGrid>
      )}
    </div>
  );
};

export default AllProjectsDisplay;
