// portfolio-builder/components/sections/bio/BioSectionController.tsx

"use client";

import { useMemo, useState } from "react";
import BioRenderer from "@/portfolio-builder/components/sections/bio/BioRenderer";
import BioEditor from "@/portfolio-builder/components/sections/bio/BioEditor";
import { BioData, getDefaultBioData } from "@/portfolio-builder/types/bio";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BioSectionControllerProps {
  bioData: BioData | null;
  onChange: (updatedBioData: BioData) => void;
  viewOnly: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BioSectionController({ bioData, onChange, viewOnly }: BioSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { profile } = useUserSettings();

  const buildSeed = () =>
    getDefaultBioData({
      bio: profile?.bio,
      location: profile?.location,
      yearsExperience: profile?.years_of_experience,
      headline: profile?.profession,
    });

  // ---- Add section -----------------------------------------------------
  const handleAdd = () => {
    onChange(bioData ?? buildSeed());
    setIsEditing(true);
  };

  // ---- No bio data, not editing — show placeholder -------------------------
  if (!bioData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Bio section not set up</p>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Bio Section
          </button>
        </div>
      </div>
    );
  }

  const resolvedData = useMemo(() =>
    bioData ?? getDefaultBioData({
      bio: profile?.bio,
      location: profile?.location,
      yearsExperience: profile?.years_of_experience,
      headline: profile?.profession,
    }),
    [bioData, profile?.bio, profile?.location, profile?.years_of_experience, profile?.profession]
  );
  // ---- Editing — show editor -----------------------------------------------
  if (isEditing) {
    return (
      <BioEditor
        data={resolvedData}
        onChange={onChange}
        onDone={() => setIsEditing(false)}
      />
    );
  }

  // ---- Viewing — show renderer -----------------------------------------------
  return (
    <div className="relative">
      <BioRenderer data={resolvedData} />

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