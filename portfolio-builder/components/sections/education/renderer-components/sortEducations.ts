// portfolio-builder/components/sections/education/renderer-components/sortEducations.ts

import type { EducationItem } from "./layoutProps";

function parseDate(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function getEndDate(edu: EducationItem): number {
  if (edu.is_current) return Date.now();
  return parseDate(edu.end_year);
}

export function sortEducations(
  educations: EducationItem[],
  sortBy: string,
): EducationItem[] {
  const sorted = [...educations];
  switch (sortBy) {
    case "date-desc":
      return sorted.sort((a, b) => getEndDate(b) - getEndDate(a));
    case "date-asc":
      return sorted.sort((a, b) => getEndDate(a) - getEndDate(b));
    case "institution-asc":
      return sorted.sort((a, b) =>
        (a.institution || "").localeCompare(b.institution || ""),
      );
    case "institution-desc":
      return sorted.sort((a, b) =>
        (b.institution || "").localeCompare(a.institution || ""),
      );
    case "degree-asc":
      return sorted.sort((a, b) =>
        (a.degree || "").localeCompare(b.degree || ""),
      );
    case "degree-desc":
      return sorted.sort((a, b) =>
        (b.degree || "").localeCompare(a.degree || ""),
      );
    default:
      return sorted;
  }
}
