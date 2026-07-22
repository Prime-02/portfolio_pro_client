"use client";

import { useState, useCallback } from "react";
import Image from "@/src/app/components/ui/Image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  X,
  Edit3,
  Trash2,
  Send,
  Heart,
} from "lucide-react";
import { useContentCommentStore } from "@/lib/stores/contents/useContentCommentStore";
import type { ContentCommentWithUser } from "@/lib/stores/contents/types/content.types";
import { getDisplayName } from "@/lib/stores/contents/types/content.types";
import Button from "../buttons/Buttons";
import { TextArea } from "../inputs/TextArea";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { toast } from "../../../context/Toastify";
import { isAuthenticated } from "@/lib/client/api";
import Link from "next/link";

interface BlogCommentItemProps {
  comment: ContentCommentWithUser;
  contentId: string;
  depth?: number;
  maxDepth?: number;
}

export function BlogCommentItem({
  comment,
  contentId,
  depth = 0,
  maxDepth = 3,
}: BlogCommentItemProps) {
  const { userInfo } = useUserSettings();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasFetchedReplies, setHasFetchedReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.body);
  const [showActions, setShowActions] = useState(false);
  const [showRepliesLoading, setShowRepliesLoading] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);

  const {
    createComment,
    deleteComment,
    updateComment,
    likeComment,
    unlikeComment,
    fetchCommentThread,
    threadsByComment,
    threadTotalsByComment,
    isSubmitting,
    error,
  } = useContentCommentStore();

  const storeReplies = threadsByComment[comment.id];
  const replies = storeReplies ?? comment.replies ?? [];
  const totalReplies = threadTotalsByComment[comment.id] ?? comment.replies_count ?? replies.length;
  const hasMoreReplies = replies.length < totalReplies;

  // Ownership check: must be logged in AND be the author
  const currentUserId = userInfo?.id ?? null;
  const isOwn = !!currentUserId && comment.user_id === currentUserId;

  const handleReply = async () => {
    if (!userInfo?.username || !isAuthenticated()) {
      toast.warning("You must be logged in to comment");
      return;
    }
    if (!replyContent.trim()) return;

    try {
      await createComment({
        content_id: contentId,
        body: replyContent.trim(),
        parent_comment_id: comment.id,
      });
      setReplyContent("");
      setIsReplying(false);
      setIsExpanded(true);
      setHasFetchedReplies(true);
    } catch {
      // Error handled by store; optimistic update already rolled back
    }
  };

  const handleUpdate = useCallback(async () => {
    if (!editContent.trim() || editContent === comment.body) {
      setIsEditing(false);
      return;
    }
    try {
      await updateComment(comment.id, { body: editContent.trim() });
      setIsEditing(false);
    } catch {
      // Error handled by store; optimistic update already rolled back
    }
  }, [editContent, comment.id, comment.body, updateComment]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteComment(comment.id);
    } catch {
      // Error handled by store; optimistic update already rolled back
    }
  }, [comment.id, deleteComment]);

  const handleToggleLike = useCallback(async () => {
    setIsTogglingLike(true);
    try {
      if (comment.is_liked) {
        await unlikeComment(comment.id);
      } else {
        await likeComment(comment.id);
      }
    } catch {
      // Error handled by store; optimistic update already rolled back
    } finally {
      setIsTogglingLike(false);
    }
  }, [comment.id, comment.is_liked, likeComment, unlikeComment]);

  const handleLoadMoreReplies = async () => {
    setShowRepliesLoading(true);
    const nextPage = repliesPage + 1;
    await fetchCommentThread(comment.id, nextPage, 10);
    setRepliesPage(nextPage);
    setShowRepliesLoading(false);
  };

  const handleToggleReplies = async () => {
    const opening = !isExpanded;
    setIsExpanded(opening);
    if (opening && !hasFetchedReplies) {
      setShowRepliesLoading(true);
      await fetchCommentThread(comment.id, 1, 10);
      setHasFetchedReplies(true);
      setShowRepliesLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className={`${depth > 0 ? "ml-8 pl-4 border-l-2 border-[var(--foreground)]/5" : ""}`}
    >
      <div
        className="flex gap-3 py-3 group"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Avatar */}
        <Link
          href={`/${comment.user?.username}`}
          className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center overflow-hidden">
            {comment.user?.profile_picture ? (
              <Image
                src={comment.user.profile_picture}
                alt={getDisplayName(comment.user) || "User avatar"}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-[var(--accent)]">
                {getDisplayName(comment.user)[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/${comment.user?.username}`}
              className="text-sm font-medium">
              {getDisplayName(comment.user)}
            </Link>
            <span className="text-[10px] text-[var(--foreground)]/30">
              {new Date(comment.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            {comment.is_edited && (
              <span className="text-[10px] text-[var(--foreground)]/20">(edited)</span>
            )}
          </div>

          {/* Edit mode */}
          {isEditing ? (
            <div className="space-y-2">
              <TextArea
                value={editContent}
                onChange={setEditContent}
                className="min-h-[60px] w-full"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={!editContent.trim() || isSubmitting}
                  loading={isSubmitting}
                  text="Save"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.body);
                  }}
                  text="Cancel"
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-[var(--foreground)]/60">
              {comment.body}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-2">
              {/* Like */}
              <button
                onClick={handleToggleLike}
                disabled={isTogglingLike}
                className={`flex items-center gap-1 text-xs transition-colors ${comment.is_liked
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)]/40 hover:text-[var(--accent)]"
                  }`}
              >
                <Heart className={`w-3.5 h-3.5 ${comment.is_liked ? "fill-current" : ""}`} />
                {comment.likes_count > 0 && comment.likes_count}
              </button>

              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-[var(--foreground)]/40 hover:text-[var(--accent)] transition-colors"
              >
                Reply
              </button>

              {(replies.length > 0 || (comment.replies_count ?? 0) > 0) && (
                <button
                  onClick={handleToggleReplies}
                  className="text-xs text-[var(--foreground)]/40 hover:text-[var(--accent)] transition-colors flex items-center gap-1"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  {showRepliesLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    `${totalReplies} ${totalReplies === 1 ? "reply" : "replies"}`
                  )}
                </button>
              )}

              {/* Edit/Delete - shown on hover, only for owner */}
              <AnimatePresence>
                {showActions && isOwn && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditContent(comment.body);
                      }}
                      className="p-1 rounded hover:bg-[var(--foreground)]/5 transition-colors"
                      title="Edit comment"
                    >
                      <Edit3 className="w-3 h-3 text-[var(--foreground)]/30" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-1 rounded hover:bg-red-500/10 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3 h-3 text-red-400/50 hover:text-red-500" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Reply input */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 w-full"
              >
                <div className="flex gap-2 items-start">
                  <div className="flex-1 min-w-0">
                    <TextArea
                      value={replyContent}
                      onChange={setReplyContent}
                      placeholder={`Reply to ${getDisplayName(comment.user)}...`}
                      className="w-full min-h-[60px]"
                    />
                  </div>
                  <div className="shrink-0 flex gap-1">
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={!replyContent.trim() || isSubmitting}
                      loading={isSubmitting}
                      icon={<Send className="w-4 h-4" />}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyContent("");
                      }}
                      icon={<X className="w-4 h-4" />}
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested replies */}
          <AnimatePresence>
            {isExpanded && replies.length > 0 && depth < maxDepth && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2"
              >
                {replies.map((reply) => (
                  <BlogCommentItem
                    key={reply.id}
                    comment={reply}
                    contentId={contentId}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                  />
                ))}

                {/* Load more replies */}
                {hasMoreReplies && depth < maxDepth && (
                  <button
                    onClick={handleLoadMoreReplies}
                    disabled={showRepliesLoading}
                    className="ml-8 text-xs text-[var(--accent)] hover:underline mt-2 flex items-center gap-1"
                  >
                    {showRepliesLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load more replies (${totalReplies - replies.length} remaining)`
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}