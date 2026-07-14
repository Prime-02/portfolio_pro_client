"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
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
import type { ContentWithAuthor, ReactionType } from "@/lib/stores/contents/types/content.types";
import { useContentLikeStore } from "@/lib/stores/contents/useContentLikeStore";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { toast } from "../toastify/Toastify";
import { REACTIONS } from "../feed/posts/feed_card_components/ContentReactionBar";
import Link from "next/link";

interface BlogHeroProps {
  blog: ContentWithAuthor;
  isPost: boolean;
}

export function BlogHero({ blog, isPost }: BlogHeroProps) {
  const { userInfo } = useUserSettings();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(blog.is_liked ?? false);
  const [optimisticReaction, setOptimisticReaction] = useState<ReactionType | null>(
    blog.reaction_type ?? null
  );
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(blog.likes_count);

  const reactionContainerRef = useRef<HTMLDivElement>(null);

  const likeContent = useContentLikeStore((s) => s.likeContent);
  const unlikeContent = useContentLikeStore((s) => s.unlikeContent);

  // Sync with prop changes when blog updates from parent
  useEffect(() => {
    setOptimisticLiked(blog.is_liked ?? false);
    setOptimisticReaction(blog.reaction_type ?? null);
    setOptimisticLikesCount(blog.likes_count);
  }, [blog.is_liked, blog.reaction_type, blog.likes_count]);

  // Handle click outside to close reaction picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        reactionContainerRef.current &&
        !reactionContainerRef.current.contains(event.target as Node)
      ) {
        setShowReactionPicker(false);
      }
    }

    if (showReactionPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showReactionPicker]);

  const handleReaction = useCallback(
    async (reactionType: ReactionType) => {
      if (!userInfo?.username) {
        toast.warning("You must be logged in to react to posts");
        return;
      }

      const wasLiked = optimisticLiked;
      const prevReaction = optimisticReaction;
      const prevCount = optimisticLikesCount;

      // Optimistic update
      if (wasLiked && prevReaction === reactionType) {
        // Unlike/remove reaction
        setOptimisticLiked(false);
        setOptimisticReaction(null);
        setOptimisticLikesCount(Math.max(0, prevCount - 1));
      } else {
        // Like/react
        setOptimisticLiked(true);
        setOptimisticReaction(reactionType);
        if (!wasLiked) {
          setOptimisticLikesCount(prevCount + 1);
        }
      }
      setShowReactionPicker(false);

      try {
        if (wasLiked && prevReaction === reactionType) {
          await unlikeContent(blog.id);
        } else {
          await likeContent({ content_id: blog.id, reaction_type: reactionType });
        }
      } catch {
        // Revert on error
        setOptimisticLiked(wasLiked);
        setOptimisticReaction(prevReaction);
        setOptimisticLikesCount(prevCount);
        toast.error("Failed to update reaction");
      }
    },
    [
      optimisticLiked,
      optimisticReaction,
      optimisticLikesCount,
      blog.id,
      likeContent,
      unlikeContent,
      userInfo?.username,
    ]
  );

  const commentsCount = blog.comments_count ?? 0;
  const readTime = blog.body ? Math.ceil(blog.body.split(/\s+/).length / 200) : 0;

  const statusConfig = {
    PUBLISHED: { label: "Published", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    DRAFT: { label: "Draft", color: "text-amber-500", bg: "bg-amber-500/10" },
    ARCHIVED: { label: "Archived", color: "text-[var(--foreground)]/40", bg: "bg-[var(--foreground)]/5" },
    SCHEDULED: { label: "Scheduled", color: "text-blue-500", bg: "bg-blue-500/10" },
    DELETED: { label: "Deleted", color: "text-red-500", bg: "bg-red-500/10" },
  };

  const currentReaction = REACTIONS.find((r) => r.type === optimisticReaction);
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
      {!isPost && (
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-league-700 leading-tight">{blog.title}</h1>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap text-sm text-[var(--foreground)]/50">
          {blog.author && (
            <Link
              href={`/${blog.author.username}`}
              className="flex items-center gap-2">
              {blog.author.profile_picture ? (
                <img src={blog.author.profile_picture} alt={blog.author.username} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-[var(--accent)]">{blog.author.username[0]?.toUpperCase()}</span>
                </div>
              )}
              <span className="font-medium text-[var(--foreground)]/70">{blog.author.username}</span>
            </Link>
          )}

          <span className="text-[var(--foreground)]/20">·</span>

          {!isPost && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          )}

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
        {/* Reaction Button with Picker */}
        <div className="relative" ref={reactionContainerRef}>
          <button
            onClick={() => setShowReactionPicker((prev) => !prev)}
            disabled={!userInfo?.username}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all
              ${optimisticLiked
                ? "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--foreground)]/10 hover:border-[var(--foreground)]/20 hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/60"
              }
              ${!userInfo?.username ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {currentReaction ? (
              <span className="text-lg">{currentReaction.emoji}</span>
            ) : (
              <Heart className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{optimisticLikesCount}</span>
          </button>

          {showReactionPicker && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1 p-2 rounded-2xl border border-[var(--foreground)]/10 shadow-xl"
              style={{ backgroundColor: "var(--background)" }}
            >
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  className={`p-2.5 rounded-xl transition-all hover:scale-110 text-lg ${optimisticLiked && optimisticReaction === reaction.type
                    ? "bg-[var(--accent)]/20"
                    : "hover:bg-[var(--foreground)]/5"
                    }`}
                  title={reaction.label}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment Count */}
        <div
          onClick={() => {
            console.log(blog.reaction_type)
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--foreground)]/10 text-[var(--foreground)]/60">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{commentsCount}</span>
        </div>
      </div>
    </div>
  );
}