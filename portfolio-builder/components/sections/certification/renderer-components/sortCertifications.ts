// portfolio-builder/components/sections/certification/renderer-components/sortCertifications.ts

import type { CertificationItem } from "./layoutProps";

function parseDate(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function getIssueDate(cert: CertificationItem): number {
  return parseDate(cert.issue_date);
}

function isExpired(cert: CertificationItem): boolean {
  if (!cert.expiration_date) return false;
  const d = new Date(cert.expiration_date);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

export function sortCertifications(
  certifications: CertificationItem[],
  sortBy: string,
): CertificationItem[] {
  const sorted = [...certifications];
  switch (sortBy) {
    case "date-desc":
      return sorted.sort((a, b) => getIssueDate(b) - getIssueDate(a));
    case "date-asc":
      return sorted.sort((a, b) => getIssueDate(a) - getIssueDate(b));
    case "issuer-asc":
      return sorted.sort((a, b) =>
        (a.issuing_organization || "").localeCompare(b.issuing_organization || ""),
      );
    case "issuer-desc":
      return sorted.sort((a, b) =>
        (b.issuing_organization || "").localeCompare(a.issuing_organization || ""),
      );
    case "name-asc":
      return sorted.sort((a, b) =>
        (a.certification_name || "").localeCompare(b.certification_name || ""),
      );
    case "name-desc":
      return sorted.sort((a, b) =>
        (b.certification_name || "").localeCompare(a.certification_name || ""),
      );
    default:
      return sorted;
  }
}
