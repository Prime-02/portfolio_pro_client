"use client";

import { useEffect, useState, useRef } from "react";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import { useValidation } from "@/lib/hooks/validation/useValidation";
import { useUserStore } from "@/lib/stores/user/userStore";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { LoadingSkeletonBlogs } from "./LoadingSkeletonBlogs";
import { OwnBlogsView } from "./OwnBlogsView";
import { PublicBlogsView } from "./PublicBlogsView";

type BlogScenario =
  | { kind: "public"; username: string }
  | { kind: "own" }
  | { kind: "not-found" }
  | { kind: "user-not-found"; username: string }
  | { kind: "pending" };

export default function BlogsPage() {
  const {
    items,
    total,
    isLoading,
    error,
    fetchUserContent,
    fetchContent,
    deleteContent,
  } = useContentStore();

  const { checkIfOwnProfile, validateProfileUsername } = useValidation();
  const { userData, fetchUserData } = useUserStore();
  const { pathname } = useRouting();

  const [scenario, setScenario] = useState<BlogScenario>({ kind: "pending" });
  const [pageError, setPageError] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState({
    query: "",
    status: "" as "" | "PUBLISHED" | "DRAFT" | "ARCHIVED",
    sort: "date" as "date" | "name" | "views" | "likes",
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
        await fetchUserContent(scenario.username, {
          content_type: "BLOG",
          status: "PUBLISHED",
          page: 1,
          page_size: 20,
        });
      } else if (scenario.kind === "own" || scenario.kind === "user-not-found") {
        await fetchContent({
          content_type: "BLOG",
          search: filterParams.query || undefined,
          status: filterParams.status || undefined,
          sort_by: filterParams.sort === "date" ? "created_at" : filterParams.sort,
          sort_order: filterParams.sortDirection,
          page: 1,
          page_size: 20,
        });
      }
    };

    fetchData();
  }, [scenario, filterParams.query, filterParams.status, filterParams.sort, filterParams.sortDirection]);

  // Handle store errors
  useEffect(() => {
    if (error) setPageError(error);
  }, [error]);

  const isOwnProfile = scenario.kind === "own" || scenario.kind === "user-not-found";
  const isLoadingData = isLoading;

  const handleDelete = async (contentIds: string[]) => {
    for (const id of contentIds) {
      await deleteContent(id, true);
    }
  };

  if (scenario.kind === "pending") return <LoadingSkeletonBlogs />;
  if (scenario.kind === "not-found") return <div className="p-10 text-center text-[var(--foreground)]/50">Profile not found</div>;

  if (!isOwnProfile && scenario.kind === "public") {
    return (
      <PublicBlogsView
        username={scenario.username}
        blogs={items}
        totalBlogs={total}
        isLoading={isLoadingData}
        error={pageError}
        onClearError={() => setPageError(null)}
      />
    );
  }

  return (
    <OwnBlogsView
      blogs={items}
      totalBlogs={total}
      isLoading={isLoadingData}
      error={pageError}
      onClearError={() => setPageError(null)}
      filterParams={filterParams}
      onFilterChange={setFilterParams}
      onDelete={handleDelete}
      deleting={isLoading}
    />
  );
}
