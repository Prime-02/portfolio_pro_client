// portfolio-builder/components/sections/education/EducationSectionController.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import EducationRenderer from "./EducationRenderer";
import EducationEditor from "./EducationEditor";
import { EducationData, getEmptyEducationData } from "@/portfolio-builder/types/education";
import { useEducation } from "@/lib/stores/education/useEducation";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EducationSectionControllerProps {
  educationData: EducationData | null;
  onSave: (updatedEducationData: EducationData) => Promise<void>;
  username: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EducationSectionController({
  educationData,
  onSave,
  username,
}: EducationSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { fetchPublicUserEducations } = useEducation();

  // ── Optimistic local state ────────────────────────────────────────────────
  const [localData, setLocalData] = useState<EducationData | null>(educationData);
  useEffect(() => {
    if (educationData) setLocalData(educationData);
  }, [educationData]);

  // Prefetch with the real filter config as soon as both username and
  // educationData are available.
  const prefetchedRef = useRef(false);
  useEffect(() => {
    if (!username || !educationData || prefetchedRef.current) return;
    prefetchedRef.current = true;
    fetchPublicUserEducations(username, {
      is_current: educationData.filters?.is_current,
      institution: educationData.filters?.institution,
      degree: educationData.filters?.degree,
      field_of_study: educationData.filters?.field_of_study,
      ids: educationData.filters?.ids,
      merge_filters: educationData.filters?.merge_filters,
    });
  }, [username, educationData, fetchPublicUserEducations]);

  // ---- Save ----------------------------------------------------------------
  const handleSave = async (updatedEducationData: EducationData) => {
    setLocalData(updatedEducationData);
    await onSave(updatedEducationData);
  };

  // ---- Cancel --------------------------------------------------------------
  const handleCancel = () => {
    setLocalData(educationData);
    setIsEditing(false);
  };

  // ---- Fullscreen ----------------------------------------------------------
  const handleSetFullscreen = (latestData: EducationData) => {
    setLocalData(latestData);
    setIsEditing(false);
  };

  // ---- No education data, not editing — show placeholder ------------------
  if (!localData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Education section not set up</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Education Section
          </button>
        </div>
      </div>
    );
  }

  // ---- Editing — show editor -----------------------------------------------
  if (isEditing) {
    return (
      <EducationEditor
        initialData={localData || getEmptyEducationData()}
        onSave={handleSave}
        onCancel={handleCancel}
        setFullScreen={handleSetFullscreen}
        username={username}
      />
    );
  }

  // ---- Viewing — show renderer ---------------------------------------------
  return (
    <div className="relative">
      <EducationRenderer data={localData!} username={username} />

      {/* Edit button */}
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors"
      >
        Edit
      </button>
    </div>
  );
}
