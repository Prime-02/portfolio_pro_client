// portfolio-builder/components/sections/blogs/renderer-components/sortBlogs.ts

import { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";

export function sortBlogs(
  blogs: ContentWithAuthor[],
  sortBy: string,
): ContentWithAuthor[] {
  const sorted = [...blogs];
  switch (sortBy) {
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "date-asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.published_at || a.created_at).getTime() -
          new Date(b.published_at || b.created_at).getTime(),
      );
    case "date-desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.published_at || b.created_at).getTime() -
          new Date(a.published_at || a.created_at).getTime(),
      );
    case "views-desc":
      return sorted.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    case "likes-desc":
      return sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    case "comments-desc":
      return sorted.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
    default:
      return sorted;
  }
}
