// portfolio-builder/components/sections/testimonials/renderer-components/useDebouncedTestimonialsFetch.ts

import { useRef, useState, useCallback, useEffect } from "react";
import { useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";
import type { TestimonialsData } from "@/portfolio-builder/types/testimonials";
import { Testimonial } from "@/lib/stores/testimonials/useTestimonial";

const DEBOUNCE_MS = 400;

export function useDebouncedTestimonialsFetch(
  username: string,
  filters?: TestimonialsData["filters"],
) {
  const { fetchUserTestimonials } = useTestimonialsStore();
  const [rendererTestimonials, setRendererTestimonials] = useState<
    Testimonial[]
  >([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestFiltersRef = useRef(
    filters ?? ({} as TestimonialsData["filters"]),
  );
  latestFiltersRef.current = filters ?? ({} as TestimonialsData["filters"]);

  const executeFetch = useCallback(() => {
    if (!username) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingTestimonials(true);
    setIsStale(false);

    fetchUserTestimonials({
      username,
      skip: 0,
      limit: 100,
      is_featured: latestFiltersRef.current.is_featured ?? undefined,
      author_company: latestFiltersRef.current.author_company ?? undefined,
      author_relationship:
        latestFiltersRef.current.author_relationship ?? undefined,
      rating: latestFiltersRef.current.min_rating ?? undefined,
      ids: latestFiltersRef.current.ids ?? undefined,
      merge_filters: latestFiltersRef.current.merge_filters ?? undefined,
    })
      .then(() => {
        if (!controller.signal.aborted) {
          const { userTestimonials } = useTestimonialsStore.getState();
          setRendererTestimonials(userTestimonials || []);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRendererTestimonials([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingTestimonials(false);
        }
      });
  }, [username, fetchUserTestimonials]);

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
    filters?.author_company,
    filters?.author_relationship,
    filters?.min_rating,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    filters?.ids?.join(","),
    filters?.merge_filters,
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

  return {
    rendererTestimonials,
    isLoadingTestimonials,
    isStale,
    refetch: executeFetch,
  };
}
