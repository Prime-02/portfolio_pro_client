// portfolio-builder/components/sections/skills/renderer-components/resolveCardOverride.ts

import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import type {
  SkillCardStyle,
  SkillsData,
  ProficiencyDisplay,
  DifficultyDisplay,
} from "@/portfolio-builder/types/skills";

export interface CardConfig {
  style: SkillCardStyle;
  showLogo: boolean;
  showDescription: boolean;
  showProficiency: boolean;
  showDifficulty: boolean;
  showCategory: boolean;
  proficiencyDisplay: ProficiencyDisplay;
  difficultyDisplay: DifficultyDisplay;
  accentColor?: string;
}

type Defaults = Omit<CardConfig, "accentColor">;

export function resolveCardOverride(
  skill: ProfessionalSkill,
  overrides: SkillsData["cardOverrides"],
  defaults: Defaults,
): CardConfig {
  for (const override of overrides) {
    const target = override.target;
    let matches = false;

    if (target.ids?.includes(skill.id || "")) matches = true;
    if (target.categories?.includes(skill.category || "")) matches = true;
    if (target.subcategories?.includes(skill.subcategory || "")) matches = true;
    if (target.is_major !== undefined && skill.is_major === target.is_major)
      matches = true;
    if (
      target.difficulty_level &&
      skill.difficulty_level === target.difficulty_level
    )
      matches = true;

    if (matches) {
      return {
        style: override.style,
        showLogo: override.showLogo ?? defaults.showLogo,
        showDescription: override.showDescription ?? defaults.showDescription,
        showProficiency: override.showProficiency ?? defaults.showProficiency,
        showDifficulty: override.showDifficulty ?? defaults.showDifficulty,
        showCategory: override.showCategory ?? defaults.showCategory,
        // display settings are never overridden per card — they're section-level
        proficiencyDisplay: defaults.proficiencyDisplay,
        difficultyDisplay: defaults.difficultyDisplay,
        accentColor: override.accentColor,
      };
    }
  }

  return { ...defaults, accentColor: undefined };
}
