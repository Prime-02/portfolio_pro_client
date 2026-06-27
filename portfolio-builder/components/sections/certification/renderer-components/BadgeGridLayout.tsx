"use client";

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import CertificationCard from "./CertificationCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const COL_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;

export default function BadgeGridLayout({ certifications, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
  const colClass = COL_CLASS[data.columns] ?? "grid-cols-3";
  const gapClass = GAP_CLASS[data.gap];

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
    <div className={`grid ${colClass} ${gapClass} items-stretch`}>
      {certifications.map((cert, index) => (
        <MotionItem
          key={cert.id || index}
          isAnimated={isAnimated}
          shouldAnimate={shouldAnimate}
          anim={anim}
          className="h-full"
        >
          <div className="h-full">
            <CertificationCard
              certification={cert}
              config={resolveCardOverride(cert, data.cardOverrides, defaults)}
              cardSize={data.cardSize}
            />
          </div>
        </MotionItem>
      ))}
    </div>
  );
}