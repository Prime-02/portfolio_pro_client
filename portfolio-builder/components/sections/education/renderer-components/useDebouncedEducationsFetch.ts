// portfolio-builder/components/sections/education/renderer-components/useDebouncedEducationsFetch.ts

import { useRef, useState, useCallback, useEffect } from "react";
import type { EducationFilterConfig } from "@/portfolio-builder/types/education";
import type { EducationItem } from "./layoutProps";
import { useEducation } from "@/lib/stores/education/useEducation";

const DEBOUNCE_MS = 400;

export function useDebouncedEducationsFetch(
  username: string,
  filters?: EducationFilterConfig,
) {
  // Pull only the action — NOT userPublicEducations.
  // This prevents executeFetch from recreating every time the store updates.
  const fetchPublicUserEducations = useEducation(
    (s) => s.fetchPublicUserEducations,
  );

  const [rendererEducations, setRendererEducations] = useState<EducationItem[]>(
    [],
  );
  const [isLoadingEducations, setIsLoadingEducations] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestFiltersRef = useRef(filters ?? ({} as EducationFilterConfig));
  latestFiltersRef.current = filters ?? ({} as EducationFilterConfig);

  const executeFetch = useCallback(() => {
    if (!username) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingEducations(true);
    setIsStale(false);

    fetchPublicUserEducations(username, {
      is_current: latestFiltersRef.current.is_current ?? undefined,
      institution: latestFiltersRef.current.institution ?? undefined,
      degree: latestFiltersRef.current.degree ?? undefined,
      field_of_study: latestFiltersRef.current.field_of_study ?? undefined,
      ids: latestFiltersRef.current.ids ?? undefined,
      merge_filters: latestFiltersRef.current.merge_filters ?? undefined,
    })
      .then(() => {
        if (!controller.signal.aborted) {
          // Read fresh from the store via getState() rather than from the
          // closure — avoids stale data and removes publicEducations
          // from deps (which was causing the infinite loop).
          const storeEducations =
            useEducation.getState().publicEducations || [];
          setRendererEducations(storeEducations as unknown as EducationItem[]);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRendererEducations([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingEducations(false);
        }
      });
  }, [username, fetchPublicUserEducations]);

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
    filters?.is_current,
    filters?.institution,
    filters?.degree,
    filters?.field_of_study,
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
    rendererEducations,
    isLoadingEducations,
    isStale,
    refetch: executeFetch,
  };
}
