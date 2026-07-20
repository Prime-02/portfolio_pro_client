// portfolio-builder/components/sections/experience/ExperienceSectionController.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import ExperienceRenderer from "./ExperienceRenderer";
import ExperienceEditor from "./ExperienceEditor";
import { ExperienceData, getEmptyExperienceData } from "@/portfolio-builder/types/experience";
import { useExperiencesStore } from "@/lib/stores/experiences/useExperience";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExperienceSectionControllerProps {
  experienceData: ExperienceData | null;
  onChange: (updatedExperienceData: ExperienceData) => void;
  username: string;
  viewOnly: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ExperienceSectionController({
  experienceData,
  onChange,
  username,
  viewOnly
}: ExperienceSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { fetchUserExperiencesByUsername } = useExperiencesStore();

  // Prefetch with the real filter config as soon as both username and
  // experienceData are available. This starts the fetch one render cycle earlier
  // than waiting for ExperienceRenderer to mount, so the renderer finds the
  // request already in-flight (or resolved) rather than starting cold.
  const prefetchedRef = useRef(false);
  useEffect(() => {
    if (!username || !experienceData || prefetchedRef.current) return;
    prefetchedRef.current = true;
    fetchUserExperiencesByUsername(username, {
      is_featured: experienceData.filters?.is_featured,
      is_current: experienceData.filters?.is_current,
      employment_type: experienceData.filters?.employment_type,
      location_type: experienceData.filters?.location_type,
      industry: experienceData.filters?.industry,
      ids: experienceData.filters?.ids,
      merge_filters: experienceData.filters?.merge_filters,
    });
  }, [username, experienceData]);

  // ---- Add section -----------------------------------------------------
  const handleAdd = () => {
    onChange(experienceData ?? getEmptyExperienceData());
    setIsEditing(true);
  };

  // ---- No experience data, not editing — show placeholder ------------------
  if (!experienceData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Experience section not set up</p>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Experience Section
          </button>
        </div>
      </div>
    );
  }

  const resolvedData = experienceData ?? getEmptyExperienceData();

  // ---- Editing — show editor -----------------------------------------------
  if (isEditing) {
    return (
      <ExperienceEditor
        data={resolvedData}
        onChange={onChange}
        onDone={() => setIsEditing(false)}
        username={username}
      />
    );
  }

  // ---- Viewing — show renderer ---------------------------------------------
  return (
    <div className="relative">
      <ExperienceRenderer data={resolvedData} username={username} />

      {/* Edit button */}
      {
        !viewOnly &&
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors"
        >
          Edit
        </button>
      }
    </div>
  );
}