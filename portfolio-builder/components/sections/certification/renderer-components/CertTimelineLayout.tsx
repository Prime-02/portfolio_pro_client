"use client";

import { useMemo } from "react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import CertificationCard from "./CertificationCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-6", medium: "gap-8", large: "gap-10" } as const;

function parseDate(dateStr: string | null | undefined): number {
  if (!dateStr) return Date.now();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

export default function CertTimelineLayout({
  certifications,
  data,
  isAnimated,
  shouldAnimate,
  anim,
}: LayoutProps) {
  const gapClass = GAP_CLASS[data.gap];

  const sorted = useMemo(() => {
    return [...certifications].sort(
      (a, b) => parseDate(b.issue_date) - parseDate(a.issue_date),
    );
  }, [certifications]);

  const defaults = {
    style: data.cardStyle,
    showCertificationName: data.showCertificationName,
    showIssuingOrganization: data.showIssuingOrganization,
    showIssueDate: data.showIssueDate,
    showExpirationDate: data.showExpirationDate,
    showCertificateLink: data.showCertificateLink,
    showVerificationBadge: data.showVerificationBadge,
    showValidityIndicator: data.showValidityIndicator,
    showDescription: data.showDescription,
    dateDisplayFormat: data.dateDisplayFormat,
  } as const;

  return (
    <div className={`relative flex flex-col ${gapClass}`}>
      {/* Central timeline line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[var(--pb-border)] md:-translate-x-px" />

      {sorted.map((cert, index) => {
        const isLeft = index % 2 === 0;
        const expired = cert.expiration_date ? new Date(cert.expiration_date).getTime() < Date.now() : false;

        const card = (
          <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
            <CertificationCard
              certification={cert}
              config={resolveCardOverride(cert, data.cardOverrides, defaults)}
              cardSize={data.cardSize}
              fullWidth={true}
            />
          </MotionItem>
        );

        return (
          <div key={cert.id || index} className="relative flex items-center">
            {/* Timeline node */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
              <div
                className={`w-3 h-3 rounded-full border-2 border-[var(--pb-background)] ${expired ? "bg-[var(--pb-error)]" : "bg-[var(--pb-success)]"
                  }`}
              />
            </div>

            {/* Left column */}
            <div className="hidden md:flex md:w-1/2 md:pr-8 md:justify-end">
              {isLeft && card}
            </div>

            {/* Right column */}
            <div className="pl-10 w-full md:pl-8 md:w-1/2">
              {!isLeft && card}
              {isLeft && <div className="md:hidden">{card}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
