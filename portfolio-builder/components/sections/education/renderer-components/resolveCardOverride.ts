// portfolio-builder/components/sections/education/renderer-components/resolveCardOverride.ts

import type {
  EducationData,
  EducationCardOverride,
} from "@/portfolio-builder/types/education";
import type { EducationItem } from "./layoutProps";

export interface CardConfig {
  style: EducationData["cardStyle"];
  showInstitutionLogo: boolean;
  showInstitution: boolean;
  showDegree: boolean;
  showFieldOfStudy: boolean;
  showDates: boolean;
  showDuration: boolean;
  showDescription: boolean;
  showCurrentIndicator: boolean;
  dateDisplayFormat: EducationData["dateDisplayFormat"];
  accentColor?: string;
}

type Defaults = Omit<CardConfig, "accentColor">;

export function resolveCardOverride(
  edu: EducationItem,
  overrides: EducationData["cardOverrides"],
  defaults: Defaults,
): CardConfig {
  for (const override of overrides ?? []) {
    const target = override.target;
    let matches = false;

    if (target.ids?.includes(edu.id || "")) matches = true;
    if (target.institutions?.includes(edu.institution || "")) matches = true;
    if (target.degrees?.includes(edu.degree || "")) matches = true;
    if (target.fields_of_study?.includes(edu.field_of_study || ""))
      matches = true;
    if (target.is_current !== undefined && edu.is_current === target.is_current)
      matches = true;

    if (matches) {
      return {
        style: override.style,
        showInstitutionLogo:
          override.showInstitutionLogo ?? defaults.showInstitutionLogo,
        showInstitution: override.showInstitution ?? defaults.showInstitution,
        showDegree: override.showDegree ?? defaults.showDegree,
        showFieldOfStudy:
          override.showFieldOfStudy ?? defaults.showFieldOfStudy,
        showDates: override.showDates ?? defaults.showDates,
        showDuration: override.showDuration ?? defaults.showDuration,
        showDescription: override.showDescription ?? defaults.showDescription,
        showCurrentIndicator:
          override.showCurrentIndicator ?? defaults.showCurrentIndicator,
        dateDisplayFormat: defaults.dateDisplayFormat,
        accentColor: override.accentColor,
      };
    }
  }

  return { ...defaults, accentColor: undefined };
}
