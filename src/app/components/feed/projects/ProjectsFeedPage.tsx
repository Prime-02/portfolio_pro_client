"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, FolderOpen } from "lucide-react";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import ProjectCard from "./components/ProjectCard";
import ProjectFeedSkeleton from "./components/ProjectFeedSkeleton";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import Button from "../../buttons/Buttons";

const PAGE_SIZE = 10;
const SKELETON_COUNT = 3;

/**
 * Derive a ProjectWithAuthor from PortfolioProjectResponse.
 * The creator is the user_association with role "creator" or "owner".
 */
function enrichWithAuthor(
  project: import("@/lib/stores/projects/types/project.types").PortfolioProjectResponse,
): import("@/lib/stores/projects/types/project.types").ProjectWithAuthor {
  const creatorAssoc = project.user_associations?.find(
    (ua) => ua.role === "creator" || ua.role === "owner",
  );
  const author = creatorAssoc
    ? {
      id: creatorAssoc.user_id,
      username: creatorAssoc.user?.username ?? "",
      display_name: creatorAssoc.user?.display_name ?? null,
      profile_picture: creatorAssoc.user?.profile_picture ?? null,
    }
    : null;

  return {
    ...project,
    author,
  };
}

export default function ProjectsFeedPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const [page, setPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { userInfo } = useUserSettings();
  const { router } = useRouting();

  const filteredProjects = useProjectStore((s) => s.publicProjects);
  const filteredHasMore = useProjectStore((s) => s.publicProjectsHasMore);
  const isLoading = useProjectStore((s) => s.loading.fetchPublicProjects);
  const fetchPublicProjects = useProjectStore((s) => s.fetchPublicProjects);

  // Initial load + reload whenever the "search" query param changes
  useEffect(() => {
    const loadInitial = async () => {
      setIsInitialLoading(true);
      setPage(1);
      await fetchPublicProjects({
        page: 1,
        size: PAGE_SIZE,
        search: search || undefined,
      });
      setIsInitialLoading(false);
    };
    loadInitial();
  }, [fetchPublicProjects, search]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && filteredHasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPublicProjects({
            page: nextPage,
            size: PAGE_SIZE,
            search: search || undefined,
          });
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [filteredHasMore, isLoading, page, fetchPublicProjects, search]);

  // Enrich projects with author data for the cards
  const projectsWithAuthor = filteredProjects.map(enrichWithAuthor);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Create Project CTA */}
        {userInfo?.username && (
          <div
            className="rounded-2xl border border-[var(--foreground)]/10 p-4 flex items-center justify-between"
            style={{ backgroundColor: "var(--background)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center">
                <Plus size={20} className="text-[var(--accent)]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--foreground)]">
                  Share your work
                </p>
                <p className="text-xs text-[var(--foreground)]/50">
                  Showcase a project to the community
                </p>
              </div>
            </div>
            <Button
              text="Create Project"
              onClick={() => router.push(`/${userInfo.username}/projects/create`)}
            />
          </div>
        )}

        {/* Feed */}
        <div className="space-y-6">
          {isInitialLoading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ProjectFeedSkeleton key={`skeleton-${i}`} />
            ))
          ) : projectsWithAuthor.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                <FolderOpen size={32} className="text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                {search ? "No results found" : "No projects yet"}
              </h3>
              <p className="text-sm text-[var(--foreground)]/50">
                {search
                  ? `Nothing matched "${search}". Try a different search.`
                  : "Be the first to showcase a project with the community!"}
              </p>
            </div>
          ) : (
            projectsWithAuthor.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-4">
            {isLoading && !isInitialLoading && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[var(--foreground)]/50">Loading more...</span>
              </div>
            )}
            {!filteredHasMore && projectsWithAuthor.length > 0 && (
              <p className="text-center text-sm text-[var(--foreground)]/30 py-4">
                You&apos;ve reached the end
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
