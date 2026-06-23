// portfolio-builder/components/sections/skills/SkillsSectionController.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import SkillsRenderer from "./SkillsRenderer";
import SkillsEditor from "./SkillsEditor";
import { SkillsData, getEmptySkillsData } from "@/portfolio-builder/types/skills";
import { useSkills } from "@/lib/stores/skills/useSkills";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SkillsSectionControllerProps {
  skillsData: SkillsData | null;
  onSave: (updatedSkillsData: SkillsData) => Promise<void>;
  username: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SkillsSectionController({
  skillsData,
  onSave,
  username,
}: SkillsSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { fetchPublicSkillsByUsername } = useSkills();

  // Prefetch with the real filter config as soon as both username and
  // skillsData are available. This starts the fetch one render cycle earlier
  // than waiting for SkillsRenderer to mount, so the renderer finds the
  // request already in-flight (or resolved) rather than starting cold.
  const prefetchedRef = useRef(false);
  useEffect(() => {
    if (!username || !skillsData || prefetchedRef.current) return;
    prefetchedRef.current = true;
    fetchPublicSkillsByUsername(username, {
      category: skillsData.filters?.category,
      subcategory: skillsData.filters?.subcategory,
      difficulty_level: skillsData.filters?.difficulty_level,
      is_major: skillsData.filters?.is_major,
      ids: skillsData.filters?.ids,
      merge_filters: skillsData.filters?.merge_filters,
    });
  }, [username, skillsData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Save ----------------------------------------------------------------
  const handleSave = async (updatedSkillsData: SkillsData) => {
    await onSave(updatedSkillsData);
  };

  // ---- Cancel --------------------------------------------------------------
  const handleCancel = () => {
    setIsEditing(false);
  };

  // ---- No skills data, not editing — show placeholder ----------------------
  if (!skillsData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Skills section not set up</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Skills Section
          </button>
        </div>
      </div>
    );
  }

  // ---- Editing — show editor -----------------------------------------------
  if (isEditing) {
    return (
      <SkillsEditor
        initialData={skillsData || getEmptySkillsData()}
        onSave={handleSave}
        onCancel={handleCancel}
        setFullScreen={() => setIsEditing(false)}
        username={username}
      />
    );
  }

  // ---- Viewing — show renderer ---------------------------------------------
  return (
    <div className="relative">
      <SkillsRenderer data={skillsData!} username={username} />

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