import EmptyState from "@/app/components/containers/cards/EmptyState";
import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useCallback, useEffect, useState } from "react";
import ProjectsCard from "./ProjectsCard";

interface Thumbnail {
  width: number;
  height: number;
  url: string;
}

interface Owner {
  user_id: string;
  team_id: string;
}

interface Urls {
  edit_url: string;
  view_url: string;
}

export interface CanvaProjectsProps {
  id: string;
  title: string;
  owner: Owner;
  thumbnail: Thumbnail;
  urls: Urls;
  created_at: number;
  updated_at: number;
  page_count: number;
}
interface CanvaProjectReviewProps {
  designs: CanvaProjectsProps[];
  pagination: { has_more: boolean; total_returned: number };
}

const ProjectsDisplay = () => {
  const { accessToken, loading, setLoading, isOnline } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<CanvaProjectReviewProps>({
    designs: [],
    pagination: { has_more: false, total_returned: 0 },
  });
  const LoaderComponent = getLoader(loader) || null;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getCanvaDesignPreview = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setLoading("fetching_preview");
        }

        const previewRes: CanvaProjectReviewProps = await GetAllData({
          access: accessToken,
          url: `${V1_BASE_URL}/canva/projects?page=${pageNum}`,
        });

        if (previewRes) {
          setProjects((prev) => ({
            ...previewRes, // Use the new response data for metadata
            designs: append
              ? [...prev.designs, ...previewRes.designs]
              : previewRes.designs,
          }));

          // Update page state when appending
          if (append) {
            setPage(pageNum);
          }
        } else {
          toast.error(
            "We couldn't fetch your canva projects please try again.",
            {
              title: "Error fetching projects preview",
            }
          );
        }
      } catch (error) {
        console.log("Something went wrong while fetching preview: ", error);
        toast.error(
          "We couldn't fetch your canva projects please try again.",
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
    await getCanvaDesignPreview(nextPage, true);
  }, [getCanvaDesignPreview, page]);

  useEffect(() => {
    if (accessToken && isOnline) {
      getCanvaDesignPreview();
    }
  }, [accessToken, getCanvaDesignPreview, isOnline]);

  // Check if initial loading
  const isInitialLoading = loading.includes("fetching_preview") && page === 1;

  return (
    <div>
      {projects.pagination.total_returned < 1 && !isInitialLoading ? (
        <EmptyState
          title="No Canva Designs Found"
          description="You have no Canva designs yet. Start by creating a new design on Canva."
          actionText="Refresh"
          onAction={() => getCanvaDesignPreview()}
        />
      ) : (
        <div className="space-y-4">
          {isInitialLoading ? (
            <div className="w-full flex justify-center items-center py-20">
              {LoaderComponent && <LoaderComponent color={accentColor.color} />}
            </div>
          ) : (
            <MasonryGrid
              gap={5}
              totalItems={projects.pagination.total_returned}
              page={page}
              customMessage="No more designs to load"
              setPage={setPage}
              onLoadMore={
                projects.pagination.has_more ? handleLoadMore : undefined
              }
              isLoading={isLoadingMore}
              loadingIndicator={
                LoaderComponent ? (
                  <LoaderComponent color={accentColor.color} />
                ) : (
                  "Loading..."
                )
              }
            >
              {projects.designs.map((project) => (
                <ProjectsCard key={project.id} {...project} />
              ))}
            </MasonryGrid>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsDisplay;
