// portfolio-builder/components/sections/projects/renderer-components/sortProjects.ts

import { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";


export function sortProjects(
  projects: PortfolioProjectResponse[],
  sortBy: string,
): PortfolioProjectResponse[] {
  const sorted = [...projects];
  switch (sortBy) {
    case "name-asc":
      return sorted.sort((a, b) => a.project_name.localeCompare(b.project_name));
    case "name-desc":
      return sorted.sort((a, b) => b.project_name.localeCompare(a.project_name));
    case "date-asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.start_date || a.created_at).getTime() -
          new Date(b.start_date || b.created_at).getTime(),
      );
    case "date-desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.start_date || b.created_at).getTime() -
          new Date(a.start_date || a.created_at).getTime(),
      );
    case "status-asc":
      return sorted.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    case "status-desc":
      return sorted.sort((a, b) => (b.status || "").localeCompare(a.status || ""));
    default:
      return sorted;
  }
}
