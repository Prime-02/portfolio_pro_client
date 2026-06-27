"use client";

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import CertificationCard from "./CertificationCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-2", medium: "gap-3", large: "gap-4" } as const;

export default function VerificationListLayout({ certifications, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
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
    <div className={`flex flex-col ${gapClass} w-full`}>
      {certifications.map((cert, index) => (
        <MotionItem
          key={cert.id || index}
          isAnimated={isAnimated}
          shouldAnimate={shouldAnimate}
          anim={anim}
        >
          <div className="w-full">
            <CertificationCard
              certification={cert}
              config={resolveCardOverride(cert, data.cardOverrides, defaults)}
              cardSize={data.cardSize}
              fullWidth={true}
            />
          </div>
        </MotionItem>
      ))}
    </div>
  );
}
