"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
  MessageCircle,
  Loader2,
} from "lucide-react";
import type { ProjectWithAuthor } from "@/lib/stores/projects/types/project.types";
import { useProjectEngagementStore } from "@/lib/stores/projects/useProjectEngagementStore";

interface ProjectReactionBarProps {
  project: ProjectWithAuthor;
  showComments: boolean;
  isLoadingComments: boolean;
  onToggleComments: () => void;
}

export default function ProjectReactionBar({
  project,
  showComments,
  isLoadingComments,
  onToggleComments,
}: ProjectReactionBarProps) {
  const toggleLike = useProjectEngagementStore((s) => s.toggleLike);
  const likesTotalByProject = useProjectEngagementStore((s) => s.likesTotalByProject);

  const [optimisticLiked, setOptimisticLiked] = useState(project.is_liked ?? false);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(project.likes_count);

  const storeCount = likesTotalByProject[project.id];

  useEffect(() => {
    if (storeCount !== undefined) setOptimisticLikesCount(storeCount);
  }, [storeCount]);

  const handleToggleLike = useCallback(async () => {
    const wasLiked = optimisticLiked;
    const prevCount = optimisticLikesCount;

    setOptimisticLiked(!wasLiked);
    setOptimisticLikesCount(wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      await toggleLike(project.id);
    } catch {
      setOptimisticLiked(wasLiked);
      setOptimisticLikesCount(prevCount);
    }
  }, [optimisticLiked, optimisticLikesCount, project.id, toggleLike]);

  return (
    <>
      {/* Stats Bar */}
      <div className="flex items-center justify-between text-xs text-[var(--foreground)]/50 mb-3 px-1">
        <span>{optimisticLikesCount.toLocaleString()} likes</span>
        <span>{project.comments_count.toLocaleString()} comments</span>
      </div>

      {/* Interaction Bar */}
      <div className="flex items-center gap-1 pt-3 border-t border-[var(--foreground)]/10">
        {/* Like Button */}
        <div className="relative flex-1">
          <button
            onClick={handleToggleLike}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-colors ${optimisticLiked
                ? "text-[var(--accent)] bg-[var(--accent)]/10"
                : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
              }`}
          >
            <span className="text-lg">❤️</span>
            <span className="text-sm font-medium">
              {optimisticLiked ? "Liked" : "Like"}
            </span>
          </button>
        </div>

        {/* Comment Button */}
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
      </div>
    </>
  );
}