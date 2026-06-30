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
  onSave: (updatedCertificationData: CertificationData) => Promise<void>;
  username: string;
  viewOnly: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CertificationSectionController({
  certificationData,
  onSave,
  username,
  viewOnly
}: CertificationSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { fetchPublicCertifications } = useCertifications();

  // ── Optimistic local state ────────────────────────────────────────────────
  const [localData, setLocalData] = useState<CertificationData | null>(certificationData);
  useEffect(() => {
    if (certificationData) setLocalData(certificationData);
  }, [certificationData]);

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

  // ---- Save ----------------------------------------------------------------
  const handleSave = async (updatedCertificationData: CertificationData) => {
    setLocalData(updatedCertificationData);
    await onSave(updatedCertificationData);
  };

  // ---- Cancel --------------------------------------------------------------
  const handleCancel = () => {
    setLocalData(certificationData);
    setIsEditing(false);
  };

  // ---- Fullscreen ----------------------------------------------------------
  const handleSetFullscreen = (latestData: CertificationData) => {
    setLocalData(latestData);
    setIsEditing(false);
  };

  // ---- No certification data, not editing — show placeholder ----------------
  if (!localData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Certification section not set up</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Certification Section
          </button>
        </div>
      </div>
    );
  }

  // ---- Editing — show editor -----------------------------------------------
  if (isEditing) {
    return (
      <CertificationEditor
        initialData={localData || getEmptyCertificationData()}
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
      <CertificationRenderer data={localData!} username={username} />

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
