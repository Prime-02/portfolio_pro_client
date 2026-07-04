// portfolio-builder/components/sections/testimonials/renderer-components/resolveCardOverride.ts

import { Testimonial } from "@/lib/stores/testimonials/useTestimonial";
import type {
  TestimonialCardStyle,
  TestimonialsData,
  RatingDisplay,
  AvatarDisplay,
  DateDisplay,
} from "@/portfolio-builder/types/testimonials";

export interface CardConfig {
  style: TestimonialCardStyle;
  showAvatar: boolean;
  avatarDisplay: AvatarDisplay;
  showAuthorName: boolean;
  showAuthorTitle: boolean;
  showAuthorCompany: boolean;
  showAuthorRelationship: boolean;
  showContent: boolean;
  showRating: boolean;
  ratingDisplay: RatingDisplay;
  showDate: boolean;
  dateDisplay: DateDisplay;
  showFeaturedBadge: boolean;
  accentColor?: string;
}

type Defaults = Omit<CardConfig, "accentColor">;

export function resolveCardOverride(
  testimonial: Testimonial,
  overrides: TestimonialsData["cardOverrides"],
  defaults: Defaults,
): CardConfig {
  for (const override of overrides ?? []) {
    const target = override.target;
    let matches = false;

    if (target.ids?.includes(testimonial.id || "")) matches = true;
    if (target.companies?.includes(testimonial.author_company || ""))
      matches = true;
    if (target.relationships?.includes(testimonial.author_relationship || ""))
      matches = true;
    if (target.ratings?.includes(testimonial.rating || 0)) matches = true;
    if (
      target.is_featured !== undefined &&
      testimonial.is_featured === target.is_featured
    )
      matches = true;

    if (matches) {
      return {
        style: override.style,
        showAvatar: override.showAvatar ?? defaults.showAvatar,
        avatarDisplay: override.avatarDisplay ?? defaults.avatarDisplay,
        showAuthorName: override.showAuthorName ?? defaults.showAuthorName,
        showAuthorTitle: override.showAuthorTitle ?? defaults.showAuthorTitle,
        showAuthorCompany:
          override.showAuthorCompany ?? defaults.showAuthorCompany,
        showAuthorRelationship:
          override.showAuthorRelationship ?? defaults.showAuthorRelationship,
        showContent: override.showContent ?? defaults.showContent,
        showRating: override.showRating ?? defaults.showRating,
        ratingDisplay: defaults.ratingDisplay,
        showDate: override.showDate ?? defaults.showDate,
        dateDisplay: defaults.dateDisplay,
        showFeaturedBadge:
          override.showFeaturedBadge ?? defaults.showFeaturedBadge,
        accentColor: override.accentColor,
      };
    }
  }

  return { ...defaults, accentColor: undefined };
}
