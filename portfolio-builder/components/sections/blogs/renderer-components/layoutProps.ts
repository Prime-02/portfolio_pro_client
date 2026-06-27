// portfolio-builder/components/sections/blogs/renderer-components/layoutProps.ts

import { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";
import type { BlogsData } from "@/portfolio-builder/types/blogs";
import type { BioAnimations } from "@/portfolio-builder/types/bio";

export interface LayoutProps {
  blogs: ContentWithAuthor[];
  data: BlogsData;
  isAnimated: boolean;
  shouldAnimate: boolean;
  anim: BioAnimations;
}
