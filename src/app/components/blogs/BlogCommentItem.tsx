"use client";

import { useState } from "react";
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
import Button from "../buttons/Buttons";
import { TextArea } from "../inputs/TextArea";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { toast } from "../toastify/Toastify";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);

  const {
    createComment,
    deleteComment,
    updateComment,
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

  const handleReply = async () => {
    if (!userInfo?.username) {
      toast.warning("You must be logged in to comment");
      return;
    }
    if (!replyContent.trim()) return;

    const data = {
      content_id: contentId,
      body: replyContent,
      parent_comment_id: comment.id,
    };

    const result = await createComment(data);
    if (result) {
      setReplyContent("");
      setIsReplying(false);
      setIsExpanded(true);
      setHasFetchedReplies(true);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim() || editContent === comment.body) {
      setIsEditing(false);
      return;
    }

    const success = await updateComment(comment.id, { body: editContent });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowActions(false);
    await deleteComment(comment.id, false);
    setIsDeleting(false);
  };

  const handleLoadMoreReplies = async () => {
    setShowRepliesLoading(true);
    const nextPage = repliesPage + 1;
    await fetchCommentThread(comment.id, nextPage, 10);
    setRepliesPage(nextPage);
    setShowRepliesLoading(false);
  };

  const isDeleted = comment.is_deleted;

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
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center overflow-hidden">
            {comment.user?.profile_picture ? (
              <img
                src={comment.user.profile_picture}
                alt={comment.user.username || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-[var(--accent)]">
                {comment.user?.username?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              {comment.user?.username ?? "Unknown"}
            </span>
            <span className="text-[10px] text-[var(--foreground)]/30">
              {new Date(comment.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            {comment.is_edited && (
              <span className="text-[10px] text-[var(--foreground)]/20">(edited)</span>
            )}
            {isDeleted && (
              <span className="text-[10px] text-red-400">[deleted]</span>
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
            <p className={`text-sm leading-relaxed ${isDeleted ? "text-[var(--foreground)]/30 italic" : "text-[var(--foreground)]/60"}`}>
              {comment.body}
            </p>
          )}

          {/* Actions */}
          {!isEditing && !isDeleted && (
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-[var(--foreground)]/40 hover:text-[var(--accent)] transition-colors"
              >
                Reply
              </button>

              {(replies.length > 0 || (comment.replies_count ?? 0) > 0) && (
                <button
                  onClick={async () => {
                    const opening = !isExpanded;
                    setIsExpanded(opening);
                    if (opening && !hasFetchedReplies) {
                      setShowRepliesLoading(true);
                      await fetchCommentThread(comment.id, 1, 10);
                      setHasFetchedReplies(true);
                      setShowRepliesLoading(false);
                    }
                  }}
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

              {/* More actions (edit/delete) - shown on hover */}
              <AnimatePresence>
                {showActions && (
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
                      disabled={isDeleting}
                      className="p-1 rounded hover:bg-red-500/10 transition-colors"
                      title="Delete comment"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-3 h-3 text-red-400/50 hover:text-red-500" />
                      )}
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
                      placeholder="Write a reply..."
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
