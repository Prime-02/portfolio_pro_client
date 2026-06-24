// portfolio-builder/components/sections/experience/renderer-components/sortExperiences.ts

import type { ExperienceItem } from "./layoutProps";

function parseDate(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function getEndDate(exp: ExperienceItem): number {
  if (exp.is_current) return Date.now();
  return parseDate(exp.end_date);
}

export function sortExperiences(
  experiences: ExperienceItem[],
  sortBy: string,
): ExperienceItem[] {
  const sorted = [...experiences];
  switch (sortBy) {
    case "date-desc":
      return sorted.sort((a, b) => getEndDate(b) - getEndDate(a));
    case "date-asc":
      return sorted.sort((a, b) => getEndDate(a) - getEndDate(b));
    case "company-asc":
      return sorted.sort((a, b) =>
        (a.company_name || "").localeCompare(b.company_name || ""),
      );
    case "company-desc":
      return sorted.sort((a, b) =>
        (b.company_name || "").localeCompare(a.company_name || ""),
      );
    case "title-asc":
      return sorted.sort((a, b) =>
        (a.job_title || "").localeCompare(b.job_title || ""),
      );
    case "title-desc":
      return sorted.sort((a, b) =>
        (b.job_title || "").localeCompare(a.job_title || ""),
      );
    default:
      return sorted;
  }
}
