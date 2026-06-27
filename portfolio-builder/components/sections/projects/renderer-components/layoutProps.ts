// portfolio-builder/components/sections/projects/renderer-components/layoutProps.ts

import { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";
import type { ProjectsData } from "@/portfolio-builder/types/projects";
import type { BioAnimations } from "@/portfolio-builder/types/bio";

export interface LayoutProps {
  projects: PortfolioProjectResponse[];
  data: ProjectsData;
  isAnimated: boolean;
  shouldAnimate: boolean;
  anim: BioAnimations;
}
