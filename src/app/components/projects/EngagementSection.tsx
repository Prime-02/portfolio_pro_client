"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Send,
  ChevronDown,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useProjectEngagementStore } from "@/lib/stores/projects/useProjectEngagementStore";
import type { FullProjectEngagement, ProjectComment } from "@/lib/stores/projects/types/project.types";
import Button from "../buttons/Buttons";
import { TextArea } from "../inputs/TextArea";
import { CommentItem } from "./CommentItem";
import { toast } from "../toastify/Toastify";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface EngagementSectionProps {
  projectId: string;
  engagement?: FullProjectEngagement;
  isLoading: boolean;
}

export function EngagementSection({
  projectId,
  engagement,
  isLoading: isInitialLoading,
}: EngagementSectionProps) {
  const { userInfo } = useUserSettings()
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_liked">("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [accumulatedComments, setAccumulatedComments] = useState<ProjectComment[]>([]);

  const {
    toggleLike,
    userLikedByProject,
    likesTotalByProject,
    likesByProject,
    fetchProjectLikes,
    addComment,
    fetchProjectComments,
    commentsByProject,
    commentsTotalByProject,
    loading,
    errors,
    clearErrors,
  } = useProjectEngagementStore();

  const comments = accumulatedComments.length > 0
    ? accumulatedComments
    : engagement?.recent_comments || [];
  const totalComments =
    commentsTotalByProject[projectId] ?? engagement?.statistics?.comments_count ?? 0;
  const topLevelTotal =
    engagement?.statistics?.top_level_comments_count ?? totalComments;
  const isLiked =
    userLikedByProject[projectId] ?? engagement?.user_has_liked ?? false;
  const likesCount =
    likesTotalByProject[projectId] ?? engagement?.statistics?.likes_count ?? 0;
  const recentLikes = likesByProject[projectId] ?? engagement?.recent_likes ?? [];

  useEffect(() => {
    const hasAny = Object.values(errors).some((v) => v !== null && v !== undefined);
    if (hasAny) setErrorDismissed(false);
  }, [errors]);

  useEffect(() => {
    const storeComments = commentsByProject[projectId];
    if (!storeComments) return;
    if (currentPage === 1) {
      setAccumulatedComments(storeComments);
    } else {
      setAccumulatedComments((prev) => {
        const storeById = new Map(storeComments.map((c) => [c.comment_id, c]));
        const updated = prev.map((c) => storeById.get(c.comment_id) ?? c);
        const existingIds = new Set(prev.map((c) => c.comment_id));
        const newOnes = storeComments.filter((c) => !existingIds.has(c.comment_id));
        return [...updated, ...newOnes];
      });
    }
  }, [commentsByProject, projectId, currentPage]);

  useEffect(() => {
    if (!likesByProject[projectId] && !isInitialLoading) {
      fetchProjectLikes(projectId, { page: 1, size: 10 });
    }
  }, [projectId, isInitialLoading, likesByProject, fetchProjectLikes]);

  useEffect(() => {
    if (!commentsByProject[projectId] && !isInitialLoading) {
      fetchProjectComments(projectId, {
        page: 1,
        size: 10,
        sort_by: sortBy === "most_liked" ? "likes" : "created_at",
        sort_order: sortBy === "oldest" ? "asc" : "desc",
      });
    }
  }, [projectId, isInitialLoading, sortBy, fetchProjectComments, commentsByProject]);

  const handleToggleLike = async () => {
    if (!userInfo?.username) {
      toast.warning("You must be logged in to like a projects")
      return
    }
    await toggleLike(projectId);
  };

  const handleAddComment = async () => {
    if (!userInfo?.username) {
      toast.warning("You must be logged in to comment on a projects")
      return
    }
    if (!newComment.trim()) return;
    const result = await addComment(projectId, { content: newComment });
    if (result) {
      setNewComment("");
    }
  };

  const handleSortChange = async (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setCurrentPage(1);
    setAccumulatedComments([]);
    await fetchProjectComments(projectId, {
      page: 1,
      size: 10,
      sort_by: newSort === "most_liked" ? "likes" : "created_at",
      sort_order: newSort === "oldest" ? "asc" : "desc",
    });
  };

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchProjectComments(projectId, {
      page: nextPage,
      size: 10,
      sort_by: sortBy === "most_liked" ? "likes" : "created_at",
      sort_order: sortBy === "oldest" ? "asc" : "desc",
    });
  };

  const hasMoreComments = comments.length < topLevelTotal;
  const activeErrors = Object.entries(errors).filter(([_, value]) => value !== null);
  const hasErrors = activeErrors.length > 0 && !errorDismissed;

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  {activeErrors.map(([key, message]) => (
                    <p key={key} className="text-sm text-red-500">
                      {message as string}
                    </p>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setErrorDismissed(true);
                  clearErrors();
                }}
                className="p-1 hover:bg-red-500/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Like Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-xl border border-[var(--foreground)]/10 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--foreground)]/40 uppercase tracking-wider flex items-center gap-2">
            <Heart className={`w-4 h-4 ${isLiked ? "text-red-500 fill-red-500" : ""}`} />
            Likes ({likesCount})
          </h3>
          <div>
            <Button
              size="sm"
              variant={isLiked ? "primary" : "outline"}
              onClick={handleToggleLike}
              loading={loading.toggleLike}
              icon={
                <Heart
                  className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                />
              }
              text={isLiked ? "Liked" : "Like"}
            />
          </div>
        </div>

        {/* Recent Likers */}
        {recentLikes.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-[var(--foreground)]/30 mb-3">
              Recent Likers
            </h4>
            <div className="flex flex-wrap gap-2">
              {recentLikes.map((like) => (
                <div
                  key={like.like_id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--foreground)]/5"
                >
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center overflow-hidden">
                    {like.profile_picture ? (
                      <Image
                        src={like.profile_picture}
                        alt={like.username || "User avatar"}
                        width={20}
                        height={20}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[8px] font-medium text-[var(--accent)]">
                        {like.username[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{like.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Comments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[var(--foreground)]/40 uppercase tracking-wider flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comments ({totalComments})
          </h3>

          {/* Sort Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="text-xs text-[var(--foreground)]/40 hover:text-[var(--foreground)]/60 transition-colors flex items-center gap-1"
            >
              Sort: {sortBy === "newest" ? "Newest" : "oldest"}
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-6 z-10 bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg shadow-lg py-1 min-w-[140px]"
                  onMouseLeave={() => setShowSortMenu(false)}
                >
                  {(["newest", "oldest"] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        handleSortChange(option);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-[var(--foreground)]/5 transition-colors ${sortBy === option
                        ? "text-[var(--accent)] font-medium"
                        : "text-[var(--foreground)]/60"
                        }`}
                    >
                      {option === "newest" ? "Newest" : option === "oldest" ? "Oldest" : "Most Liked"}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Add comment */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <TextArea
              value={newComment}
              onChange={setNewComment}
              placeholder="Add a comment..."
              className="min-h-[80px]"
            />
          </div>
          <div className="flex flex-col justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading.addComment}
              loading={loading.addComment}
              icon={<Send className="w-4 h-4" />}
              text="Post"
            />
          </div>
        </div>

        {/* Comments list */}
        {loading.fetchComments && comments.length === 0 ? (
          <div className="text-center py-10">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--foreground)]/20" />
            <p className="text-sm text-[var(--foreground)]/30 mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-[var(--foreground)]/30 text-sm">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.comment_id}
                  comment={comment}
                  projectId={projectId}
                />
              ))}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMoreComments && (
              <div className="text-center pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  loading={loading.fetchComments}
                  text={`Load More Comments (${topLevelTotal - comments.length} remaining)`}
                  icon={<ChevronDown className="w-4 h-4" />}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}