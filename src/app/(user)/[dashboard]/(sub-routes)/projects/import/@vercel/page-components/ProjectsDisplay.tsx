import { toast } from "@/app/components/toastify/Toastify";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useCallback, useEffect, useState } from "react";
import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import ProjectsCard from "./ProjectsCard";
import EmptyState from "@/app/components/containers/cards/EmptyState";

interface VercelProjectReviewProps {
  projects: VercelProjectsProps[];
  total_returned: number;
  pagination: { has_more: boolean };
}

export interface VercelProjectsProps {
  name: string;
  framework: string;
  production_url: string;
}

const ProjectsDisplay = () => {
  const { accessToken, loading, setLoading } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<VercelProjectReviewProps>({
    projects: [],
    total_returned: 0,
    pagination: { has_more: false },
  });
  const LoaderComponent = getLoader(loader) || null;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getVercelProjectsPreview = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setLoading("fetching_preview");
        }

        const previewRes: VercelProjectReviewProps = await GetAllData({
          access: accessToken,
          url: `${V1_BASE_URL}/vercel/projects?page=${pageNum}`,
        });

        if (previewRes) {
          setProjects((prev) => ({
            ...previewRes, // Use the new response data for metadata
            projects: append
              ? [...prev.projects, ...previewRes.projects]
              : previewRes.projects,
          }));

          // Update page state when appending
          if (append) {
            setPage(pageNum);
          }
        } else {
          toast.error(
            "We couldn't fetch your vercel projects please try again.",
            {
              title: "Error fetching projects preview",
            }
          );
        }
      } catch (error) {
        console.log("Something went wrong while fetching preview: ", error);
        toast.error(
          "We couldn't fetch your vercel projects please try again.",
          {
            title: "Error fetching projects preview",
          }
        );
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setLoading("fetching_preview");
        }
      }
    },
    [accessToken, setLoading]
  );

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    await getVercelProjectsPreview(nextPage, true);
  }, [getVercelProjectsPreview, page]);

  useEffect(() => {
    if (accessToken) {
      getVercelProjectsPreview();
    }
  }, [accessToken, getVercelProjectsPreview]);

  // Check if initial loading
  const isInitialLoading = loading.includes("fetching_preview") && page === 1;

  return (
    <div>
      {projects.total_returned < 1 && !isInitialLoading ? (
        <EmptyState
          title="No Projects Found"
          description="No projects were found in your connected Vercel account. Please ensure that you have projects deployed on Vercel and try again."
          actionText="Refresh"
          onAction={() => getVercelProjectsPreview()}
        />
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
          totalItems={projects.total_returned}
          loadedItems={projects.projects.length} // Fixed: Use projects.projects.length
          page={page}
          customMessage="Showing all projects"
          setPage={setPage}
          onLoadMore={projects.pagination.has_more ? handleLoadMore : undefined} // Conditionally enable load more
          isLoading={isLoadingMore}
          loadingIndicator={
            LoaderComponent ? (
              <LoaderComponent color={accentColor.color} />
            ) : (
              "Loading more..."
            )
          }
        >
          {projects.projects.map((project, i) => (
            <ProjectsCard
              key={`${project.name}-${i}`}
              name={project.name}
              framework={project.framework}
              production_url={project.production_url}
            />
          ))}
        </MasonryGrid>
      )}
    </div>
  );
};

export default ProjectsDisplay;
