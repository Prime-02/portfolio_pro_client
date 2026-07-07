"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  Flame,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { useContentLikeStore } from "@/lib/stores/contents";
import type { ContentWithAuthor, ReactionType } from "@/lib/stores/contents/types/content.types";

interface ContentReactionBarProps {
  content: ContentWithAuthor;
  showComments: boolean;
  isLoadingComments: boolean;
  onToggleComments: () => void;
}

const REACTIONS: { type: ReactionType; icon: React.ReactNode; label: string }[] = [
  { type: "LIKE", icon: <ThumbsUp size={18} />, label: "Like" },
  { type: "LOVE", icon: <Heart size={18} />, label: "Love" },
  { type: "CELEBRATE", icon: <Flame size={18} />, label: "Celebrate" },
  { type: "INSIGHTFUL", icon: <Lightbulb size={18} />, label: "Insightful" },
];

export default function ContentReactionBar({
  content,
  showComments,
  isLoadingComments,
  onToggleComments,
}: ContentReactionBarProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(content.is_liked ?? false);
  const [optimisticReaction, setOptimisticReaction] = useState<ReactionType | null>(null);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(content.likes_count);

  const likeContent = useContentLikeStore((s) => s.likeContent);
  const unlikeContent = useContentLikeStore((s) => s.unlikeContent);

  // Sync with prop changes when content updates from parent
  useEffect(() => {
    setOptimisticLiked(content.is_liked ?? false);
    setOptimisticReaction(content.reaction_type ?? "LIKE");
    setOptimisticLikesCount(content.likes_count);
  }, [content.is_liked, content.reaction_type, content.likes_count]);

  const handleReaction = useCallback(
    async (reactionType: ReactionType) => {
      const wasLiked = optimisticLiked;
      const prevReaction = optimisticReaction;
      const prevCount = optimisticLikesCount;

      if (wasLiked && prevReaction === reactionType) {
        setOptimisticLiked(false);
        setOptimisticReaction(null);
        setOptimisticLikesCount(Math.max(0, prevCount - 1));
      } else {
        setOptimisticLiked(true);
        setOptimisticReaction(reactionType);
        if (!wasLiked) {
          setOptimisticLikesCount(prevCount + 1);
        }
      }
      setShowReactionPicker(false);

      try {
        if (wasLiked && prevReaction === reactionType) {
          await unlikeContent(content.id);
        } else {
          await likeContent({ content_id: content.id, reaction_type: reactionType });
        }
      } catch {
        setOptimisticLiked(wasLiked);
        setOptimisticReaction(prevReaction);
        setOptimisticLikesCount(prevCount);
      }
    },
    [optimisticLiked, optimisticReaction, optimisticLikesCount, content.id, likeContent, unlikeContent]
  );

  const currentReaction = REACTIONS.find((r) => r.type === optimisticReaction);

  return (
    <>
      {/* Stats Bar */}
      <div className="flex items-center justify-between text-xs text-[var(--foreground)]/50 mb-3 px-1">
        <span>{optimisticLikesCount.toLocaleString()} reactions</span>
        <span>{content.comments_count.toLocaleString()} comments</span>
        <span>{content.shares_count.toLocaleString()} shares</span>
      </div>

      {/* Interaction Bar */}
      <div className="flex items-center gap-1 pt-3 border-t border-[var(--foreground)]/10">
        {/* Reaction Button with Picker */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowReactionPicker((prev) => !prev)}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-colors ${optimisticLiked
                ? "text-[var(--accent)] bg-[var(--accent)]/10"
                : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
              }`}
          >
            {currentReaction ? (
              <>
                {currentReaction.icon}
                <span className="text-sm font-medium">{currentReaction.label}</span>
              </>
            ) : (
              <>
                <ThumbsUp size={18} />
                <span className="text-sm font-medium">React</span>
              </>
            )}
          </button>

          {showReactionPicker && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1 p-2 rounded-2xl border border-[var(--foreground)]/10 shadow-xl"
              style={{ backgroundColor: "var(--background)" }}
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  className={`p-2.5 rounded-xl transition-all hover:scale-110 ${optimisticLiked && optimisticReaction === reaction.type
                      ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                      : "hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/70"
                    }`}
                  title={reaction.label}
                >
                  {reaction.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment Button with Loading State */}
        <button
          onClick={onToggleComments}
          disabled={isLoadingComments}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-colors ${showComments
              ? "text-[var(--accent)] bg-[var(--accent)]/10"
              : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
            } ${isLoadingComments ? "opacity-70 cursor-wait" : ""}`}
        >
          {isLoadingComments ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <MessageCircle size={18} />
          )}
          <span className="text-sm font-medium">
            {isLoadingComments ? "Loading..." : "Comment"}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: content.title,
                url: `${window.location.origin}/content/${content.id}`,
              });
            } else {
              navigator.clipboard.writeText(`${window.location.origin}/content/${content.id}`);
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 transition-colors"
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </>
  );
}