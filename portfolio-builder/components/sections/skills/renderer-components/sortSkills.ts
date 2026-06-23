// portfolio-builder/components/sections/skills/renderer-components/sortSkills.ts

import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import { PROFICIENCY_ORDER, DIFFICULTY_ORDER } from "./ProficiencyDisplay";

export function sortSkills(
  skills: ProfessionalSkill[],
  sortBy: string,
): ProfessionalSkill[] {
  const sorted = [...skills];
  switch (sortBy) {
    case "name-asc":
      return sorted.sort((a, b) => a.skill_name.localeCompare(b.skill_name));
    case "name-desc":
      return sorted.sort((a, b) => b.skill_name.localeCompare(a.skill_name));
    case "proficiency-asc":
      return sorted.sort(
        (a, b) =>
          (PROFICIENCY_ORDER[a.proficiency_level] || 0) -
          (PROFICIENCY_ORDER[b.proficiency_level] || 0),
      );
    case "proficiency-desc":
      return sorted.sort(
        (a, b) =>
          (PROFICIENCY_ORDER[b.proficiency_level] || 0) -
          (PROFICIENCY_ORDER[a.proficiency_level] || 0),
      );
    case "difficulty-asc":
      return sorted.sort(
        (a, b) =>
          (DIFFICULTY_ORDER[a.difficulty_level?.toLowerCase() || ""] || 0) -
          (DIFFICULTY_ORDER[b.difficulty_level?.toLowerCase() || ""] || 0),
      );
    case "difficulty-desc":
      return sorted.sort(
        (a, b) =>
          (DIFFICULTY_ORDER[b.difficulty_level?.toLowerCase() || ""] || 0) -
          (DIFFICULTY_ORDER[a.difficulty_level?.toLowerCase() || ""] || 0),
      );
    default:
      return sorted;
  }
}
