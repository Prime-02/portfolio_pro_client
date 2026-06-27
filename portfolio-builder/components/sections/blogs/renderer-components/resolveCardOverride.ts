// portfolio-builder/components/sections/blogs/renderer-components/resolveCardOverride.ts

import { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";
import type {
  BlogCardStyle,
  BlogsData,
  DateDisplay,
  StatusDisplay,
  ReactionDisplay,
} from "@/portfolio-builder/types/blogs";

export interface CardConfig {
  style: BlogCardStyle;
  showImage: boolean;
  showTitle: boolean;
  showExcerpt: boolean;
  showBody: boolean;
  showAuthor: boolean;
  showDates: boolean;
  showStatus: boolean;
  showTags: boolean;
  showCategory: boolean;
  showReactions: boolean;
  showComments: boolean;
  showViews: boolean;
  showReadTime: boolean;
  showShare: boolean;
  showBookmark: boolean;
  showUrl: boolean;
  dateDisplay: DateDisplay;
  statusDisplay: StatusDisplay;
  reactionDisplay: ReactionDisplay;
  accentColor?: string;
}

type Defaults = Omit<CardConfig, "accentColor">;

export function resolveCardOverride(
  blog: ContentWithAuthor,
  overrides: BlogsData["cardOverrides"],
  defaults: Defaults,
): CardConfig {
  for (const override of overrides) {
    const target = override.target;
    let matches = false;

    if (target.ids?.includes(blog.id || "")) matches = true;
    if (target.categories?.includes(blog.category || "")) matches = true;
    if (target.tags?.some((t) => blog.tags?.includes(t))) matches = true;
    if (target.statuses?.includes(blog.status || "")) matches = true;
    if (target.content_types?.includes(blog.content_type || "")) matches = true;
    if (target.is_featured !== undefined && blog.is_featured === target.is_featured) matches = true;
    if (target.is_pinned !== undefined && blog.is_pinned === target.is_pinned) matches = true;

    if (matches) {
      return {
        style: override.style,
        showImage: override.showImage ?? defaults.showImage,
        showTitle: override.showTitle ?? defaults.showTitle,
        showExcerpt: override.showExcerpt ?? defaults.showExcerpt,
        showBody: override.showBody ?? defaults.showBody,
        showAuthor: override.showAuthor ?? defaults.showAuthor,
        showDates: override.showDates ?? defaults.showDates,
        showStatus: override.showStatus ?? defaults.showStatus,
        showTags: override.showTags ?? defaults.showTags,
        showCategory: override.showCategory ?? defaults.showCategory,
        showReactions: override.showReactions ?? defaults.showReactions,
        showComments: override.showComments ?? defaults.showComments,
        showViews: override.showViews ?? defaults.showViews,
        showReadTime: override.showReadTime ?? defaults.showReadTime,
        showShare: override.showShare ?? defaults.showShare,
        showBookmark: override.showBookmark ?? defaults.showBookmark,
        showUrl: override.showUrl ?? defaults.showUrl,
        dateDisplay: defaults.dateDisplay,
        statusDisplay: defaults.statusDisplay,
        reactionDisplay: defaults.reactionDisplay,
        accentColor: override.accentColor,
      };
    }
  }

  return { ...defaults, accentColor: undefined };
}
