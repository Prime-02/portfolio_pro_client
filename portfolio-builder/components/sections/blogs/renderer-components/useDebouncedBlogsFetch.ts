// portfolio-builder/components/sections/blogs/renderer-components/useDebouncedBlogsFetch.ts

import { useRef, useState, useCallback, useEffect } from "react";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import type { BlogsData } from "@/portfolio-builder/types/blogs";
import { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";

const DEBOUNCE_MS = 400;

export function useDebouncedBlogsFetch(
  username: string,
  filters: BlogsData["filters"],
) {
  const { fetchPublicContent } = useContentStore();
  const [rendererBlogs, setRendererBlogs] = useState<ContentWithAuthor[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
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

    setIsLoadingBlogs(true);
    setIsStale(false);

    fetchPublicContent({
      username,
      content_type: latestFiltersRef.current.content_type,
      status: latestFiltersRef.current.status,
      category: latestFiltersRef.current.category,
      tags: latestFiltersRef.current.tags,
      is_public: latestFiltersRef.current.is_public,
      is_featured: latestFiltersRef.current.is_featured,
      search: latestFiltersRef.current.search,
      date_from: latestFiltersRef.current.date_from,
      date_to: latestFiltersRef.current.date_to,
      ids: latestFiltersRef.current.ids,
      merge_filters: latestFiltersRef.current.merge_filters,
      page_size: 50,
    })
      .then(() => {
        if (!controller.signal.aborted) {
          const { publicItems } = useContentStore.getState();
          setRendererBlogs(publicItems || []);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRendererBlogs([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingBlogs(false);
        }
      });
  }, [username, fetchPublicContent]);

  useEffect(() => {
    setIsStale(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      executeFetch();
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [
    username,
    filters.content_type,
    filters.status,
    filters.category,
    filters.tags?.join(","),
    filters.is_public,
    filters.is_featured,
    filters.search,
    filters.date_from,
    filters.date_to,
    filters.ids?.join(","),
    filters.merge_filters,
    executeFetch,
  ]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return { rendererBlogs, isLoadingBlogs, isStale, refetch: executeFetch };
}
