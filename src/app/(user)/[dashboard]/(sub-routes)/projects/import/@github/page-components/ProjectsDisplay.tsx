import { toast } from "@/app/components/toastify/Toastify";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useCallback, useEffect, useState } from "react";
import ProjectsCard from "./ProjectsCard";
import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";

interface GitHubRepoPreviewProps {
  repositories: RepoProps[];
  total_count: number;
  total_returned: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface RepoProps {
  full_name: string;
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  language: string;
}

const ProjectsDisplay = () => {
  const { accessToken, loading, setLoading } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<GitHubRepoPreviewProps>({
    repositories: [],
    total_count: 0,
    total_returned: 0,
    page: 0,
    per_page: 0,
    has_more: false,
  });
  const LoaderComponent = getLoader(loader) || null;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getGitHubProjectsPreview = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setLoading("fetching_preview");
        }

        const previewRes: GitHubRepoPreviewProps = await GetAllData({
          access: accessToken,
          url: `${V1_BASE_URL}/github/installations/repositories?page=${pageNum}`,
        });

        if (previewRes) {
          setProjects((prev) => ({
            ...previewRes, // Use the new response data for metadata
            repositories: append
              ? [...prev.repositories, ...previewRes.repositories]
              : previewRes.repositories,
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
        console.log("Something went wrong while fetching preview: ", error);
        toast.error(
          "We couldn't fetch your github projects please try again.",
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
    await getGitHubProjectsPreview(nextPage, true);
  }, [getGitHubProjectsPreview, page]);

  useEffect(() => {
    if (accessToken) {
      getGitHubProjectsPreview();
    }
  }, [accessToken, getGitHubProjectsPreview]);

  // Check if initial loading
  const isInitialLoading = loading.includes("fetching_preview") && page === 1;

  return (
    <div>
      {projects.total_count < 1 && !isInitialLoading ? (
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
          totalItems={projects.total_count}
          loadedItems={projects.repositories.length} // Use actual loaded items count
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
        >
          {projects.repositories.map((repo, i) => (
            <ProjectsCard
              key={`${repo.name}-${i}`} // Better key using repo name
              name={repo.name}
              description={repo.description}
              html_url={repo.html_url}
              homepage={repo.homepage}
              language={repo.language}
              full_name={repo.full_name}
            />
          ))}
        </MasonryGrid>
      )}
    </div>
  );
};

export default ProjectsDisplay;
