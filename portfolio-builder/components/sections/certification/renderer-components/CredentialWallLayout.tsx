// portfolio-builder/components/sections/certification/renderer-components/CredentialWallLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import CertificationCard from "./CertificationCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;

export default function CredentialWallLayout({ certifications, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
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
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gapClass}`}>
      {certifications.map((cert, index) => (
        <MotionItem
          key={cert.id || index}
          isAnimated={isAnimated}
          shouldAnimate={shouldAnimate}
          anim={anim}
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
