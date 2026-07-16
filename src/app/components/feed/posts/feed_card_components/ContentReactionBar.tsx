"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Loader2,
  Share2,
} from "lucide-react";
import { useContentLikeStore } from "@/lib/stores/contents";
import type { ContentWithAuthor, ReactionType } from "@/lib/stores/contents/types/content.types";
import { BASE_URL, handleShareProfile } from "@/lib/utilities/syncFunctions/syncs";

interface ContentReactionBarProps {
  content: ContentWithAuthor;
  showComments: boolean;
  isLoadingComments: boolean;
  onToggleComments: () => void;
}

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "LIKE", emoji: "👍", label: "Like" },
  { type: "LOVE", emoji: "❤️", label: "Love" },
  { type: "CELEBRATE", emoji: "🔥", label: "Celebrate" },
  { type: "INSIGHTFUL", emoji: "💡", label: "Insightful" },
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

  const reactionContainerRef = useRef<HTMLDivElement>(null);

  const likeContent = useContentLikeStore((s) => s.likeContent);
  const unlikeContent = useContentLikeStore((s) => s.unlikeContent);

  // Sync with prop changes when content updates from parent
  useEffect(() => {
    setOptimisticLiked(content.is_liked ?? false);
    setOptimisticReaction(content.reaction_type ?? "LIKE");
    setOptimisticLikesCount(content.likes_count);
  }, [content.is_liked, content.reaction_type, content.likes_count]);

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
      </div>

      {/* Interaction Bar */}
      <div className="flex items-center gap-1 pt-3 border-t border-[var(--foreground)]/10">
        {/* Reaction Button with Picker */}
        <div className="relative flex-1" ref={reactionContainerRef}>
          <button
            onClick={() => setShowReactionPicker((prev) => !prev)}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-colors ${optimisticLiked
              ? "text-[var(--accent)] bg-[var(--accent)]/10"
              : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
              }`}
          >
            {currentReaction ? (
              <>
                <span className="text-lg">{currentReaction.emoji}</span>
                <span className="text-sm font-medium">{currentReaction.label}</span>
              </>
            ) : (
              <>
                <span className="text-lg">👍</span>
                <span className="text-sm font-medium">React</span>
              </>
            )}
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

        <button
          onClick={() => {
            handleShareProfile({
              title: `${content.title} by ${content.author?.username} — Portfolio Pro`,
              url: `${BASE_URL}/blogs/${content.slug}`

            })
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-colors ${showComments
            ? "text-[var(--accent)] bg-[var(--accent)]/10"
            : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
            } ${isLoadingComments ? "opacity-70 cursor-wait" : ""}`}
        >
          <Share2 />
          Share
        </button>
      </div>
    </>
  );
}