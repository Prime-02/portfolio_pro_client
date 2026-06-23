// portfolio-builder/components/sections/skills/renderer-components/layoutProps.ts

import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import type { SkillsData } from "@/portfolio-builder/types/skills";
import type { BioAnimations } from "@/portfolio-builder/types/bio";

export interface LayoutProps {
  skills: ProfessionalSkill[];
  data: SkillsData;
  isAnimated: boolean;
  shouldAnimate: boolean;
  anim: BioAnimations;
}
