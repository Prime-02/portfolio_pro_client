// portfolio-builder/components/sections/skills/renderer-components/useDebouncedSkillsFetch.ts

import { useRef, useState, useCallback, useEffect } from "react";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import { useSkills } from "@/lib/stores/skills/useSkills";
import type { SkillsData } from "@/portfolio-builder/types/skills";

const DEBOUNCE_MS = 400;

export function useDebouncedSkillsFetch(
  username: string,
  filters: SkillsData["filters"],
) {
  const { fetchPublicSkillsByUsername } = useSkills();
  const [rendererSkills, setRendererSkills] = useState<ProfessionalSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
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

    setIsLoadingSkills(true);
    setIsStale(false);

    fetchPublicSkillsByUsername(username, {
      category: latestFiltersRef.current.category,
      subcategory: latestFiltersRef.current.subcategory,
      difficulty_level: latestFiltersRef.current.difficulty_level,
      is_major: latestFiltersRef.current.is_major,
      ids: latestFiltersRef.current.ids,
      merge_filters: latestFiltersRef.current.merge_filters,
    })
      .then((skills) => {
        if (!controller.signal.aborted) {
          setRendererSkills(skills || []);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRendererSkills([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingSkills(false);
        }
      });
  }, [username, fetchPublicSkillsByUsername]);

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
    filters.category,
    filters.subcategory,
    filters.difficulty_level,
    filters.is_major,
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

  return { rendererSkills, isLoadingSkills, isStale, refetch: executeFetch };
}
