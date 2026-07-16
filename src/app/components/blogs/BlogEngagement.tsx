"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  Share2,
} from "lucide-react";
import { useContentLikeStore } from "@/lib/stores/contents/useContentLikeStore";
import { useContentCommentStore } from "@/lib/stores/contents/useContentCommentStore";
import { useContentShareStore } from "@/lib/stores/contents/useContentShareStore";
import type { ContentCommentWithUser, ContentWithAuthor, ReactionType } from "@/lib/stores/contents/types/content.types";
import Button from "../buttons/Buttons";
import { TextArea } from "../inputs/TextArea";
import { BlogCommentItem } from "./BlogCommentItem";
import { toast } from "../toastify/Toastify";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import Link from "next/link";
import { REACTIONS } from "../feed/posts/feed_card_components/ContentReactionBar";

interface BlogEngagementProps {
  blog: ContentWithAuthor;
}

export function BlogEngagement({ blog }: BlogEngagementProps) {
  const { userInfo } = useUserSettings();
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [accumulatedComments, setAccumulatedComments] = useState<ContentCommentWithUser[]>(blog.comments_count ? [] : []);

  // Optimistic state for reactions
  const [optimisticLiked, setOptimisticLiked] = useState(blog.is_liked ?? false);
  const [optimisticReaction, setOptimisticReaction] = useState<ReactionType | null>(
    blog.reaction_type ?? null
  );
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(blog.likes_count);

  const reactionContainerRef = useRef<HTMLDivElement>(null);

  const {
    likeContent,
    unlikeContent,
    userLikedStatus,
    likesByContent,
    totalByContent,
    fetchContentLikes,
    isSubmitting: likeSubmitting,
    error: likeError,
  } = useContentLikeStore();

  const {
    createComment,
    fetchComments,
    commentsByContent,
    totalByContent: commentTotalByContent,
    isSubmitting: commentSubmitting,
    isLoading: commentLoading,
    error: commentError,
  } = useContentCommentStore();

  const {
    shareContent,
    userSharedStatus,
    checkUserShared,
    isSubmitting: shareSubmitting,
  } = useContentShareStore();

  const contentId = blog.id;
  const comments = accumulatedComments.length > 0
    ? accumulatedComments
    : [];
  const totalComments = commentTotalByContent[contentId] ?? blog.comments_count ?? 0;

  // Use optimistic values for display
  const isLiked = optimisticLiked;
  const likesCount = optimisticLikesCount;
  const recentLikes = likesByContent[contentId] ?? [];
  const isShared = userSharedStatus[contentId]?.shared ?? blog.is_shared ?? false;

  // Sync with prop changes when blog updates from parent
  useEffect(() => {
    setOptimisticLiked(blog.is_liked ?? false);
    setOptimisticReaction(blog.reaction_type ?? null);
    setOptimisticLikesCount(blog.likes_count);
  }, [blog.is_liked, blog.reaction_type, blog.likes_count]);

  // Also sync with store values
  useEffect(() => {
    const storeLiked = userLikedStatus[contentId]?.liked;
    const storeReaction = userLikedStatus[contentId]?.reaction_type;
    const storeTotal = totalByContent[contentId];

    if (storeLiked !== undefined) {
      setOptimisticLiked(storeLiked);
    }
    if (storeReaction !== undefined) {
      setOptimisticReaction(storeReaction);
    }
    if (storeTotal !== undefined) {
      setOptimisticLikesCount(storeTotal);
    }
  }, [userLikedStatus, totalByContent, contentId]);

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

  useEffect(() => {
    if (likeError || commentError) setErrorDismissed(false);
  }, [likeError, commentError]);

  useEffect(() => {
    const storeComments = commentsByContent[contentId];
    if (!storeComments) return;
    if (currentPage === 1) {
      setAccumulatedComments(storeComments);
    } else {
      setAccumulatedComments((prev) => {
        const storeById = new Map(storeComments.map((c) => [c.id, c]));
        const updated = prev.map((c) => storeById.get(c.id) ?? c);
        const existingIds = new Set(prev.map((c) => c.id));
        const newOnes = storeComments.filter((c) => !existingIds.has(c.id));
        return [...updated, ...newOnes];
      });
    }
  }, [commentsByContent, contentId, currentPage]);

  useEffect(() => {
    if (!likesByContent[contentId]) {
      fetchContentLikes(contentId, 1, 10);
    }
    if (!commentsByContent[contentId]) {
      fetchComments({ content_id: contentId, page: 1, page_size: 10, sort_order: "desc" });
    }
    checkUserShared(contentId);
  }, [contentId]);

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
          await unlikeContent(contentId);
        } else {
          await likeContent({ content_id: contentId, reaction_type: reactionType });
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
      contentId,
      likeContent,
      unlikeContent,
      userInfo?.username,
    ]
  );

  const handleAddComment = async () => {
    if (!userInfo?.username) {
      toast.warning("You must be logged in to comment");
      return;
    }
    if (!newComment.trim()) return;
    const result = await createComment({ content_id: contentId, body: newComment });
    if (result) {
      setNewComment("");
    }
  };

  const handleSortChange = async (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setCurrentPage(1);
    setAccumulatedComments([]);
    await fetchComments({
      content_id: contentId,
      page: 1,
      page_size: 10,
      sort_order: newSort === "oldest" ? "asc" : "desc",
    });
  };

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchComments({
      content_id: contentId,
      page: nextPage,
      page_size: 10,
      sort_order: sortBy === "oldest" ? "asc" : "desc",
    });
  };

  const hasMoreComments = comments.length < totalComments;
  const activeErrors = [
    likeError && { key: "like", message: likeError },
    commentError && { key: "comment", message: commentError },
  ].filter(Boolean) as { key: string; message: string }[];
  const hasErrors = activeErrors.length > 0 && !errorDismissed;

  const currentReaction = REACTIONS.find((r) => r.type === optimisticReaction);

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
                  {activeErrors.map(({ key, message }) => (
                    <p key={key} className="text-sm text-red-500">{message}</p>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setErrorDismissed(true);
                }}
                className="p-1 hover:bg-red-500/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Like & Share Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-xl border border-[var(--foreground)]/10 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--foreground)]/40 uppercase tracking-wider flex items-center gap-2">
            Reactions ({likesCount})
          </h3>
          <div className="flex gap-2">
            {/* Reaction Button with Picker */}
            <div className="relative" ref={reactionContainerRef}>
              <Button
                size="sm"
                variant={isLiked ? "primary" : "outline"}
                onClick={() => setShowReactionPicker((prev) => !prev)}
                disabled={!userInfo?.username}
                loading={likeSubmitting}
                icon={
                  currentReaction ? (
                    <span className="text-base">{currentReaction.emoji}</span>
                  ) : (
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  )
                }
                text={isLiked && currentReaction ? currentReaction.label : isLiked ? "Liked" : "Like"}
              />

              {/* Reaction Picker */}
              <AnimatePresence>
                {showReactionPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1 p-2 rounded-2xl border border-[var(--foreground)]/10 shadow-xl z-50"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Recent Likers */}
        {recentLikes.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-2">
              {recentLikes.slice(0, 8).map((like) => (
                <Link
                  href={`/${like.user?.username}`}
                  key={like.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center overflow-hidden">
                      {like.user?.profile_picture ? (
                        <Image
                          src={like.user.profile_picture}
                          alt={like.user.username || "User avatar"}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-[var(--accent)]">
                          {like.user?.username?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-medium">{like.user?.username}</span>
                </Link>
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
              Sort: {sortBy === "newest" ? "Newest" : "Oldest"}
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
                      {option === "newest" ? "Newest First" : "Oldest First"}
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
              disabled={!newComment.trim() || commentSubmitting}
              loading={commentSubmitting}
              icon={<Send className="w-4 h-4" />}
              text="Post"
            />
          </div>
        </div>

        {/* Comments list */}
        {commentLoading && comments.length === 0 ? (
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
                <BlogCommentItem
                  key={comment.id}
                  comment={comment}
                  contentId={contentId}
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
                  loading={commentLoading}
                  text={`Load More Comments (${totalComments - comments.length} remaining)`}
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