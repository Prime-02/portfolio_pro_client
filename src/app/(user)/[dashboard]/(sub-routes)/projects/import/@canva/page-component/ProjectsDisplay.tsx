import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useCallback, useEffect, useState } from "react";

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

interface CanvaProjectsProps {
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
  has_more: boolean;
}

const ProjectsDisplay = () => {
  const { accessToken, loading, setLoading, isOnline } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<CanvaProjectReviewProps>({
    designs: [],
    has_more: false,
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
            url: `${V1_BASE_URL}/vercel/projects?page=${pageNum}`,
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
      await getCanvaDesignPreview(nextPage, true);
    }, [getCanvaDesignPreview, page]);
  
    useEffect(() => {
      if (accessToken && isOnline) {
        getCanvaDesignPreview();
      }
    }, [accessToken, getCanvaDesignPreview, isOnline]);
  
    // Check if initial loading
    const isInitialLoading = loading.includes("fetching_preview") && page === 1;
  
  return <div>ProjectsDisplay</div>;
};

export default ProjectsDisplay;
