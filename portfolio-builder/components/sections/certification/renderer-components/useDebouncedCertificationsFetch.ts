// portfolio-builder/components/sections/certification/renderer-components/useDebouncedCertificationsFetch.ts

import { useRef, useState, useCallback, useEffect } from "react";
import type { PublicCertificationFilters } from "@/portfolio-builder/types/certification";
import type { CertificationItem } from "./layoutProps";
import { useCertifications } from "@/lib/stores/certifications/useCertifications";

const DEBOUNCE_MS = 400;

export function useDebouncedCertificationsFetch(
  username: string,
  filters?: PublicCertificationFilters,
) {
  // Pull only the action — NOT publicCertifications.
  // This prevents executeFetch from recreating every time the store updates.
  const fetchPublicCertifications = useCertifications(
    (s) => s.fetchPublicCertifications,
  );

  const [rendererCertifications, setRendererCertifications] = useState<
    CertificationItem[]
  >([]);
  const [isLoadingCertifications, setIsLoadingCertifications] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestFiltersRef = useRef(
    filters ?? ({} as PublicCertificationFilters),
  );
  latestFiltersRef.current = filters ?? ({} as PublicCertificationFilters);

  const executeFetch = useCallback(() => {
    if (!username) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingCertifications(true);
    setIsStale(false);

    fetchPublicCertifications(username, {
      issuing_organization:
        latestFiltersRef.current.issuing_organization ?? undefined,
      ids: latestFiltersRef.current.ids ?? undefined,
      merge_filters: latestFiltersRef.current.merge_filters ?? undefined,
    })
      .then(() => {
        if (!controller.signal.aborted) {
          // Read fresh from the store via getState() rather than from the
          // closure — avoids stale data and removes publicCertifications
          // from deps (which was causing the infinite loop).
          const storeCertifications =
            useCertifications.getState().publicCertifications || [];
          setRendererCertifications(
            storeCertifications as unknown as CertificationItem[],
          );
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRendererCertifications([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingCertifications(false);
        }
      });
  }, [username, fetchPublicCertifications]);

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
    filters?.issuing_organization,
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
    rendererCertifications,
    isLoadingCertifications,
    isStale,
    refetch: executeFetch,
  };
}
