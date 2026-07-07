"use client";

import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Lock,
  Pin,
  Star,
  Calendar,
  Clock,
} from "lucide-react";
import type { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";
import { useContentLikeStore } from "@/lib/stores/contents/useContentLikeStore";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { toast } from "../toastify/Toastify";

interface BlogHeroProps {
  blog: ContentWithAuthor;
  isPost: boolean
}

export function BlogHero({ blog, isPost }: BlogHeroProps) {
  const { likeContent, unlikeContent, userLikedStatus, isSubmitting } = useContentLikeStore();
  const { userInfo } = useUserSettings();

  const hasLiked = userLikedStatus[blog.id]?.liked ?? blog.is_liked ?? false;
  const likesCount = blog.likes_count ?? 0;
  const commentsCount = blog.comments_count ?? 0;
  const viewsCount = blog.views_count ?? 0;

  const readTime = blog.body ? Math.ceil(blog.body.split(/\s+/).length / 200) : 0;

  const handleLike = async () => {
    if (!userInfo?.username) {
      toast.warning("You must be logged in to like posts");
      return;
    }
    if (hasLiked) {
      await unlikeContent(blog.id);
    } else {
      await likeContent({ content_id: blog.id, reaction_type: "LIKE" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt || blog.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const statusConfig = {
    PUBLISHED: { label: "Published", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    DRAFT: { label: "Draft", color: "text-amber-500", bg: "bg-amber-500/10" },
    ARCHIVED: { label: "Archived", color: "text-[var(--foreground)]/40", bg: "bg-[var(--foreground)]/5" },
    SCHEDULED: { label: "Scheduled", color: "text-blue-500", bg: "bg-blue-500/10" },
    DELETED: { label: "Deleted", color: "text-red-500", bg: "bg-red-500/10" },
  };

  const status = statusConfig[blog.status] || statusConfig.DRAFT;

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      {blog.cover_image_url && (
        <div className="relative rounded-2xl overflow-hidden border border-[var(--foreground)]/10">
          <div className="relative aspect-[21/9] bg-[var(--foreground)]/5">
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/40 via-transparent to-transparent" />
          </div>
        </div>
      )}

      {/* Title & Meta Row */}
      {
        !isPost && <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-league-700 leading-tight">{blog.title}</h1>
        </div>
      }
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap text-sm text-[var(--foreground)]/50">
          {blog.author && (
            <span className="flex items-center gap-2">
              {blog.author.profile_picture ? (
                <img src={blog.author.profile_picture} alt={blog.author.username} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-[var(--accent)]">{blog.author.username[0]?.toUpperCase()}</span>
                </div>
              )}
              <span className="font-medium text-[var(--foreground)]/70">{blog.author.username}</span>
            </span>
          )}

          <span className="text-[var(--foreground)]/20">·</span>

          {
            !isPost && <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          }
          {!blog.is_public && !isPost && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--foreground)]/10 text-[var(--foreground)]/50">
              <Lock className="w-3 h-3" />
              Private
            </span>
          )}

          {blog.is_pinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)]">
              <Pin className="w-3 h-3" />
              Pinned
            </span>
          )}

          {blog.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-500">
              <Star className="w-3 h-3" />
              Featured
            </span>
          )}

          <span className="text-[var(--foreground)]/20">·</span>

          {blog.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(blog.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          )}

          {readTime > 0 && !isPost && (
            <>
              <span className="text-[var(--foreground)]/20">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readTime} min read
              </span>
            </>
          )}
        </div>
      </div>

      {/* Engagement Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleLike}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all
            ${hasLiked
              ? "border-red-500/30 bg-red-500/10 text-red-500"
              : "border-[var(--foreground)]/10 hover:border-red-500/30 hover:bg-red-500/5 text-[var(--foreground)]/60"
            }`}
        >
          <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--foreground)]/10 text-[var(--foreground)]/60">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{commentsCount}</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--foreground)]/10 text-[var(--foreground)]/60">
          <Eye className="w-5 h-5" />
          <span className="text-sm font-medium">{viewsCount}</span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--foreground)]/10 
            hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 transition-all text-[var(--foreground)]/60"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">Reshare</span>
        </button>
      </div>
    </div>
  );
}
