// portfolio-builder/components/sections/certification/renderer-components/resolveCardOverride.ts

import type { CertificationData, CertificationCardOverride } from "@/portfolio-builder/types/certification";
import type { CertificationItem } from "./layoutProps";

export interface CardConfig {
  style: CertificationData["cardStyle"];
  showCertificationName: boolean;
  showIssuingOrganization: boolean;
  showIssueDate: boolean;
  showExpirationDate: boolean;
  showCertificateLink: boolean;
  showVerificationBadge: boolean;
  showValidityIndicator: boolean;
  showDescription: boolean;
  dateDisplayFormat: CertificationData["dateDisplayFormat"];
  accentColor?: string;
}

type Defaults = Omit<CardConfig, "accentColor">;

function isExpired(expirationDate?: string | null): boolean {
  if (!expirationDate) return false;
  const d = new Date(expirationDate);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

export function resolveCardOverride(
  cert: CertificationItem,
  overrides: CertificationData["cardOverrides"],
  defaults: Defaults,
): CardConfig {
  for (const override of overrides) {
    const target = override.target;
    let matches = false;

    if (target.ids?.includes(cert.id || "")) matches = true;
    if (target.issuing_organizations?.includes(cert.issuing_organization || "")) matches = true;
    if (target.certification_names?.includes(cert.certification_name || "")) matches = true;
    if (target.has_expiration !== undefined) {
      const hasExp = !!cert.expiration_date;
      if (target.has_expiration === hasExp) matches = true;
    }
    if (target.is_expired !== undefined) {
      const expired = isExpired(cert.expiration_date);
      if (target.is_expired === expired) matches = true;
    }

    if (matches) {
      return {
        style: override.style,
        showCertificationName: override.showCertificationName ?? defaults.showCertificationName,
        showIssuingOrganization: override.showIssuingOrganization ?? defaults.showIssuingOrganization,
        showIssueDate: override.showIssueDate ?? defaults.showIssueDate,
        showExpirationDate: override.showExpirationDate ?? defaults.showExpirationDate,
        showCertificateLink: override.showCertificateLink ?? defaults.showCertificateLink,
        showVerificationBadge: override.showVerificationBadge ?? defaults.showVerificationBadge,
        showValidityIndicator: override.showValidityIndicator ?? defaults.showValidityIndicator,
        showDescription: override.showDescription ?? defaults.showDescription,
        dateDisplayFormat: defaults.dateDisplayFormat,
        accentColor: override.accentColor,
      };
    }
  }

  return { ...defaults, accentColor: undefined };
}
