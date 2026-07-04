// portfolio-builder/components/sections/experience/renderer-components/useDebouncedExperiencesFetch.ts

import { useRef, useState, useCallback, useEffect } from "react";
import type { ExperienceFilterConfig } from "@/portfolio-builder/types/experience";
import type { ExperienceItem } from "./layoutProps";
import { useExperiencesStore } from "@/lib/stores/experiences/useExperience";

const DEBOUNCE_MS = 400;

export function useDebouncedExperiencesFetch(
  username: string,
  filters?: ExperienceFilterConfig,
) {
  // Pull only the action — NOT userPublicExperiences.
  // This prevents executeFetch from recreating every time the store updates.
  const fetchUserExperiencesByUsername = useExperiencesStore(
    (s) => s.fetchUserExperiencesByUsername,
  );

  const [rendererExperiences, setRendererExperiences] = useState<
    ExperienceItem[]
  >([]);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestFiltersRef = useRef(filters ?? ({} as ExperienceFilterConfig));
  latestFiltersRef.current = filters ?? ({} as ExperienceFilterConfig);

  const executeFetch = useCallback(() => {
    if (!username) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingExperiences(true);
    setIsStale(false);

    fetchUserExperiencesByUsername(username, {
      is_featured: latestFiltersRef.current.is_featured ?? undefined,
      is_current: latestFiltersRef.current.is_current ?? undefined,
      employment_type: latestFiltersRef.current.employment_type ?? undefined,
      location_type: latestFiltersRef.current.location_type ?? undefined,
      industry: latestFiltersRef.current.industry ?? undefined,
      ids: latestFiltersRef.current.ids ?? undefined,
      merge_filters: latestFiltersRef.current.merge_filters ?? undefined,
    })
      .then(() => {
        if (!controller.signal.aborted) {
          // Read fresh from the store via getState() rather than from the
          // closure — avoids stale data and removes userPublicExperiences
          // from deps (which was causing the infinite loop).
          const storeExperiences =
            useExperiencesStore.getState().userPublicExperiences[username] ||
            [];
          setRendererExperiences(
            storeExperiences as unknown as ExperienceItem[],
          );
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRendererExperiences([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingExperiences(false);
        }
      });
  }, [username, fetchUserExperiencesByUsername]); // userPublicExperiences intentionally removed

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
    filters?.is_featured,
    filters?.is_current,
    filters?.employment_type,
    filters?.location_type,
    filters?.industry,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    filters?.ids?.join(","),
    filters?.merge_filters,
    executeFetch,
  ]);

  // Cleanup on unmount
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

  return {
    rendererExperiences,
    isLoadingExperiences,
    isStale,
    refetch: executeFetch,
  };
}
