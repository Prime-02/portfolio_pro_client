// portfolio-builder/components/sections/bio/BioSectionController.tsx

"use client";

import { useState, useEffect } from "react";
import BioRenderer from "@/portfolio-builder/components/sections/bio/BioRenderer";
import BioEditor from "@/portfolio-builder/components/sections/bio/BioEditor";
import { BioData, getEmptyBioData } from "@/portfolio-builder/types/bio";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BioSectionControllerProps {
  bioData: BioData | null;
  onSave: (updatedBioData: BioData) => Promise<void>;
  viewOnly: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BioSectionController({ bioData, onSave, viewOnly }: BioSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);

  // ── Optimistic local state ─────────────────────────────────────────────
  const [localData, setLocalData] = useState<BioData | null>(bioData);
  useEffect(() => {
    if (bioData) setLocalData(bioData);
  }, [bioData]);

  // ---- Save ----------------------------------------------------------------
  const handleSave = async (updatedBioData: BioData) => {
    setLocalData(updatedBioData);   // optimistic
    await onSave(updatedBioData);
  };

  // ---- Cancel --------------------------------------------------------------
  const handleCancel = () => {
    setLocalData(bioData);          // rollback
    setIsEditing(false);
  };

  // ---- Fullscreen ----------------------------------------------------------
  const handleSetFullscreen = (latestData: BioData) => {
    setLocalData(latestData);
    setIsEditing(false);
  };

  // ---- No bio data, not editing — show placeholder -------------------------
  if (!localData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Bio section not set up</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Bio Section
          </button>
        </div>
      </div>
    );
  }

  // ---- Editing — show editor -----------------------------------------------
  if (isEditing) {
    return (
      <BioEditor
        initialData={localData || getEmptyBioData()}
        onSave={handleSave}
        onCancel={handleCancel}
        setFullScreen={handleSetFullscreen}
      />
    );
  }

  // ---- Viewing — show renderer ---------------------------------------------
  return (
    <div className="relative">
      <BioRenderer data={localData!} />

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