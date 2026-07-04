// portfolio-builder/components/sections/projects/renderer-components/resolveCardOverride.ts

import { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";
import type {
  ProjectCardStyle,
  ProjectsData,
  DateDisplay,
  StatusDisplay,
  PlatformDisplay,
  CategoryDisplay,
} from "@/portfolio-builder/types/projects";

export interface CardConfig {
  style: ProjectCardStyle;
  showImage: boolean;
  showDescription: boolean;
  showUrl: boolean;
  showDates: boolean;
  showStatus: boolean;
  showPlatform: boolean;
  showCategory: boolean;
  showStack: boolean;
  showBudget: boolean;
  showClient: boolean;
  showContribution: boolean;
  dateDisplay: DateDisplay;
  statusDisplay: StatusDisplay;
  platformDisplay: PlatformDisplay;
  categoryDisplay: CategoryDisplay;
  accentColor?: string;
}

type Defaults = Omit<CardConfig, "accentColor">;

export function resolveCardOverride(
  project: PortfolioProjectResponse,
  overrides: ProjectsData["cardOverrides"],
  defaults: Defaults,
): CardConfig {
  for (const override of overrides ?? []) {
    const target = override.target;
    let matches = false;

    if (target.ids?.includes(project.id || "")) matches = true;
    if (target.categories?.includes(project.project_category || ""))
      matches = true;
    if (target.platforms?.includes(project.project_platform || ""))
      matches = true;
    if (target.statuses?.includes(project.status || "")) matches = true;
    if (
      target.is_completed !== undefined &&
      project.is_completed === target.is_completed
    )
      matches = true;
    if (
      target.is_concept !== undefined &&
      project.is_concept === target.is_concept
    )
      matches = true;

    if (matches) {
      return {
        style: override.style,
        showImage: override.showImage ?? defaults.showImage,
        showDescription: override.showDescription ?? defaults.showDescription,
        showUrl: override.showUrl ?? defaults.showUrl,
        showDates: override.showDates ?? defaults.showDates,
        showStatus: override.showStatus ?? defaults.showStatus,
        showPlatform: override.showPlatform ?? defaults.showPlatform,
        showCategory: override.showCategory ?? defaults.showCategory,
        showStack: override.showStack ?? defaults.showStack,
        showBudget: override.showBudget ?? defaults.showBudget,
        showClient: override.showClient ?? defaults.showClient,
        showContribution:
          override.showContribution ?? defaults.showContribution,
        // display settings are never overridden per card — they're section-level
        dateDisplay: defaults.dateDisplay,
        statusDisplay: defaults.statusDisplay,
        platformDisplay: defaults.platformDisplay,
        categoryDisplay: defaults.categoryDisplay,
        accentColor: override.accentColor,
      };
    }
  }

  return { ...defaults, accentColor: undefined };
}
