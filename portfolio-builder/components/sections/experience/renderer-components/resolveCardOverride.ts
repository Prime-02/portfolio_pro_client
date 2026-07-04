// portfolio-builder/components/sections/experience/renderer-components/resolveCardOverride.ts

import type {
  ExperienceData,
  ExperienceCardOverride,
  EmploymentType,
  LocationType,
} from "@/portfolio-builder/types/experience";
import type { ExperienceItem } from "./layoutProps";

export interface CardConfig {
  style: ExperienceData["cardStyle"];
  showCompanyLogo: boolean;
  showDescription: boolean;
  showEmploymentType: boolean;
  showLocationType: boolean;
  showDuration: boolean;
  showSkills: boolean;
  showCompanyName: boolean;
  showJobTitle: boolean;
  dateDisplayFormat: ExperienceData["dateDisplayFormat"];
  accentColor?: string;
}

type Defaults = Omit<CardConfig, "accentColor">;

export function resolveCardOverride(
  exp: ExperienceItem,
  overrides: ExperienceData["cardOverrides"],
  defaults: Defaults,
): CardConfig {
  for (const override of overrides ?? []) {
    const target = override.target;
    let matches = false;

    if (target.ids?.includes(exp.id || "")) matches = true;
    if (target.industries?.includes(exp.industry || "")) matches = true;
    if (
      target.employment_types?.length &&
      target.employment_types.includes(exp.employment_type as EmploymentType)
    )
      matches = true;
    if (
      target.location_types?.length &&
      target.location_types.includes(exp.location_type as LocationType)
    )
      matches = true;
    if (
      target.is_featured !== undefined &&
      exp.is_featured === target.is_featured
    )
      matches = true;
    if (target.is_current !== undefined && exp.is_current === target.is_current)
      matches = true;

    if (matches) {
      return {
        style: override.style,
        showCompanyLogo: override.showCompanyLogo ?? defaults.showCompanyLogo,
        showDescription: override.showDescription ?? defaults.showDescription,
        showEmploymentType:
          override.showEmploymentType ?? defaults.showEmploymentType,
        showLocationType:
          override.showLocationType ?? defaults.showLocationType,
        showDuration: override.showDuration ?? defaults.showDuration,
        showSkills: override.showSkills ?? defaults.showSkills,
        showCompanyName: override.showCompanyName ?? defaults.showCompanyName,
        showJobTitle: override.showJobTitle ?? defaults.showJobTitle,
        dateDisplayFormat: defaults.dateDisplayFormat,
        accentColor: override.accentColor,
      };
    }
  }

  return { ...defaults, accentColor: undefined };
}
