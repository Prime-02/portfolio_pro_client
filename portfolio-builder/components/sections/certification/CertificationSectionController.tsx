"use client";

import { useEffect, useRef, useState } from "react";
import CertificationRenderer from "./CertificationRenderer";
import CertificationEditor from "./CertificationEditor";
import { CertificationData, getEmptyCertificationData } from "@/portfolio-builder/types/certification";
import { useCertifications } from "@/lib/stores/certifications/useCertifications";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CertificationSectionControllerProps {
  certificationData: CertificationData | null;
  onChange: (updatedCertificationData: CertificationData) => void;
  username: string;
  viewOnly: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CertificationSectionController({
  certificationData,
  onChange,
  username,
  viewOnly
}: CertificationSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { fetchPublicCertifications } = useCertifications();

  // Prefetch with the real filter config as soon as both username and
  // certificationData are available.
  const prefetchedRef = useRef(false);
  useEffect(() => {
    if (!username || !certificationData || prefetchedRef.current) return;
    prefetchedRef.current = true;
    fetchPublicCertifications(username, {
      issuing_organization: certificationData.filters?.issuing_organization,
      ids: certificationData.filters?.ids,
      merge_filters: certificationData.filters?.merge_filters,
    });
  }, [username, certificationData, fetchPublicCertifications]);

  // ---- Add section -----------------------------------------------------
  const handleAdd = () => {
    onChange(certificationData ?? getEmptyCertificationData());
    setIsEditing(true);
  };

  // ---- No certification data, not editing — show placeholder ----------------
  if (!certificationData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Certification section not set up</p>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Certification Section
          </button>
        </div>
      </div>
    );
  }

  const resolvedData = certificationData ?? getEmptyCertificationData();

  // ---- Editing — show editor -----------------------------------------------
  if (isEditing) {
    return (
      <CertificationEditor
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
      <CertificationRenderer data={resolvedData} username={username} />

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