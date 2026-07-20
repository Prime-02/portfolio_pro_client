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
  onChange: (updatedEducationData: EducationData) => void;
  username: string;
  viewOnly: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EducationSectionController({
  educationData,
  onChange,
  username,
  viewOnly
}: EducationSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { fetchPublicUserEducations } = useEducation();

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

  // ---- Add section -----------------------------------------------------
  const handleAdd = () => {
    onChange(educationData ?? getEmptyEducationData());
    setIsEditing(true);
  };

  // ---- No education data, not editing — show placeholder ------------------
  if (!educationData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Education section not set up</p>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Education Section
          </button>
        </div>
      </div>
    );
  }

  const resolvedData = educationData ?? getEmptyEducationData();

  // ---- Editing — show editor -----------------------------------------------
  if (isEditing) {
    return (
      <EducationEditor
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
      <EducationRenderer data={resolvedData} username={username} />

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