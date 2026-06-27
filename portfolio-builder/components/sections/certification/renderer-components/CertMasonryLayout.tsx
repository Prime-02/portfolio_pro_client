"use client";

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import CertificationCard from "./CertificationCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;

export default function CertMasonryLayout({ certifications, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
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

  // Distribute items into columns for masonry effect
  const columns: typeof certifications[] = [[], [], []];
  certifications.forEach((cert, i) => {
    columns[i % 3].push(cert);
  });

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gapClass}`}>
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {col.map((cert, index) => (
            <MotionItem
              key={cert.id || `${colIndex}-${index}`}
              isAnimated={isAnimated}
              shouldAnimate={shouldAnimate}
              anim={anim}
            >
              <CertificationCard
                certification={cert}
                config={resolveCardOverride(cert, data.cardOverrides, defaults)}
                cardSize={data.cardSize}
              />
            </MotionItem>
          ))}
        </div>
      ))}
    </div>
  );
}
