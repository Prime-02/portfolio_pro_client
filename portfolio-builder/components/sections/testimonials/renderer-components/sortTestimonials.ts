// portfolio-builder/components/sections/testimonials/renderer-components/sortTestimonials.ts

import { Testimonial } from "@/lib/stores/testimonials/useTestimonial";

export function sortTestimonials(
  testimonials: Testimonial[],
  sortBy: string,
): Testimonial[] {
  const sorted = [...testimonials];
  switch (sortBy) {
    case "rating-desc":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "rating-asc":
      return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    case "date-desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case "date-asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    case "name-asc":
      return sorted.sort((a, b) => a.author_name.localeCompare(b.author_name));
    case "name-desc":
      return sorted.sort((a, b) => b.author_name.localeCompare(a.author_name));
    default:
      return sorted;
  }
}
