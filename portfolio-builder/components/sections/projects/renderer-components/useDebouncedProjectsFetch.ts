// portfolio-builder/components/sections/projects/renderer-components/useDebouncedProjectsFetch.ts

import { useRef, useState, useCallback, useEffect } from "react";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import type { ProjectsData } from "@/portfolio-builder/types/projects";
import { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";

const DEBOUNCE_MS = 400;

export function useDebouncedProjectsFetch(
  username: string,
  filters: ProjectsData["filters"],
) {
  const { fetchProjectsByUser } = useProjectStore();
  const [rendererProjects, setRendererProjects] = useState<PortfolioProjectResponse[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestFiltersRef = useRef(filters);
  latestFiltersRef.current = filters;

  const executeFetch = useCallback(() => {
    if (!username) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingProjects(true);
    setIsStale(false);

    fetchProjectsByUser(username, {
      is_completed: latestFiltersRef.current.is_completed,
      is_concept: latestFiltersRef.current.is_concept,
      project_category: latestFiltersRef.current.project_category,
      project_platform: latestFiltersRef.current.project_platform,
      project_status: latestFiltersRef.current.project_status,
      ids: latestFiltersRef.current.ids,
      merge_filters: latestFiltersRef.current.merge_filters,
    })
      .then(() => {
        if (!controller.signal.aborted) {
          // Get the filtered projects from the store
          const { filteredProjects } = useProjectStore.getState();
          setRendererProjects(filteredProjects || []);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRendererProjects([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingProjects(false);
        }
      });
  }, [username, fetchProjectsByUser]);

  useEffect(() => {
    setIsStale(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeFetch();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    username,
    filters.is_completed,
    filters.is_concept,
    filters.project_category,
    filters.project_platform,
    filters.project_status,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    filters.ids?.join(","),
    filters.merge_filters,
    executeFetch,
  ]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return { rendererProjects, isLoadingProjects, isStale, refetch: executeFetch };
}
