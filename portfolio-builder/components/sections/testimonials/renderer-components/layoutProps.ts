// portfolio-builder/components/sections/testimonials/renderer-components/layoutProps.ts

import { Testimonial } from "@/lib/stores/testimonials/useTestimonial";
import type { TestimonialsData } from "@/portfolio-builder/types/testimonials";
import type { BioAnimations } from "@/portfolio-builder/types/bio";

export interface LayoutProps {
  testimonials: Testimonial[];
  data: TestimonialsData;
  isAnimated: boolean;
  shouldAnimate: boolean;
  anim: BioAnimations;
}
