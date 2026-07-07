"use client";

import React, { useCallback, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, Pencil, Trash2, X, Check, ChevronDown, Loader2 } from "lucide-react";
import { useContentCommentStore } from "@/lib/stores/contents";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import type { ContentCommentWithUser } from "@/lib/stores/contents/types/content.types";
import { getDisplayName } from "@/lib/stores/contents/types/content.types";
import CommentAvatar from "./CommentAvatar";
import CommentComposer from "./CommentComposer";
import ReplyItem from "./ReplyItem";

interface CommentItemProps {
  comment: ContentCommentWithUser;
  contentId: string;
}

export default function CommentItem({ comment, contentId }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const updateComment = useContentCommentStore((s) => s.updateComment);
  const deleteComment = useContentCommentStore((s) => s.deleteComment);
  const likeComment = useContentCommentStore((s) => s.likeComment);
  const unlikeComment = useContentCommentStore((s) => s.unlikeComment);
  const createComment = useContentCommentStore((s) => s.createComment);
  const fetchCommentThread = useContentCommentStore((s) => s.fetchCommentThread);
  const isSubmitting = useContentCommentStore((s) => s.isSubmitting);
  const replies = useContentCommentStore((s) => s.threadsByComment[comment.id]);
  const repliesTotal = useContentCommentStore(
    (s) => s.threadTotalsByComment[comment.id] ?? comment.replies_count
  );

  // Get current user from settings store
  const currentUserId = useUserSettings((s) => s.userInfo?.id ?? null);

  // Proper ownership check: must be logged in AND be the author
  const isOwn = !!currentUserId && comment.user_id === currentUserId;

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

  const handleSaveEdit = useCallback(async () => {
    if (!editText.trim() || editText.trim() === comment.body) {
      setIsEditing(false);
      return;
    }
    try {
      await updateComment(comment.id, { body: editText.trim() });
      setIsEditing(false);
    } catch {
      // Error handled by store; optimistic update already rolled back
    }
  }, [editText, comment.id, comment.body, updateComment]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteComment(comment.id);
      setConfirmingDelete(false);
    } catch {
      // Error handled by store; optimistic update already rolled back
    }
  }, [comment.id, deleteComment]);

  const loadReplies = useCallback(async () => {
    setIsLoadingReplies(true);
    try {
      await fetchCommentThread(comment.id, 1, 20);
    } catch {
      // Error handled by store
    } finally {
      setIsLoadingReplies(false);
    }
  }, [comment.id, fetchCommentThread]);

  const toggleReplies = useCallback(async () => {
    if (repliesExpanded) {
      setRepliesExpanded(false);
      return;
    }
    setRepliesExpanded(true);
    if (!replies) {
      await loadReplies();
    }
  }, [repliesExpanded, replies, loadReplies]);

  const handleReplySubmit = useCallback(async () => {
    if (!replyText.trim()) return;
    try {
      await createComment({
        content_id: contentId,
        body: replyText.trim(),
        parent_comment_id: comment.id,
      });
      setReplyText("");
      setIsReplying(false);
      setRepliesExpanded(true);
      await loadReplies();
    } catch {
      // Error handled by store; optimistic update already rolled back
    }
  }, [replyText, contentId, comment.id, createComment, loadReplies]);

  return (
    <div className="flex gap-3">
      <CommentAvatar user={comment.user} size="md" />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <CommentComposer
            value={editText}
            onChange={setEditText}
            onSubmit={handleSaveEdit}
            onCancel={() => {
              setIsEditing(false);
              setEditText(comment.body);
            }}
            isSubmitting={isSubmitting}
            size="sm"
            autoFocus
          />
        ) : (
          <div className="rounded-xl px-3 py-2 bg-[var(--foreground)]/5">
            <p className="text-xs font-semibold text-[var(--foreground)]/80 mb-0.5">
              {getDisplayName(comment.user)}
            </p>
            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
              {comment.body}
            </p>
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center gap-3 mt-1 ml-1 flex-wrap">
            <span className="text-xs text-[var(--foreground)]/40">
              {comment.created_at
                ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
                : "Recently"}
              {comment.is_edited && " · edited"}
            </span>

            <button
              onClick={handleToggleLike}
              disabled={isTogglingLike}
              className={`flex items-center gap-1 text-xs transition-colors ${comment.is_liked
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)]/40 hover:text-[var(--accent)]"
                }`}
            >
              <Heart size={12} fill={comment.is_liked ? "currentColor" : "none"} />
              {comment.likes_count > 0 && comment.likes_count}
            </button>

            <button
              onClick={() => setIsReplying((prev) => !prev)}
              className="text-xs text-[var(--foreground)]/40 hover:text-[var(--accent)] transition-colors"
            >
              Reply
            </button>

            {isOwn && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs text-[var(--foreground)]/40 hover:text-[var(--accent)] transition-colors"
                >
                  <Pencil size={12} />
                  Edit
                </button>

                {confirmingDelete ? (
                  <span className="flex items-center gap-1 text-xs">
                    <span className="text-[var(--foreground)]/50">Delete?</span>
                    <button
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="flex items-center gap-1 text-xs text-[var(--foreground)]/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Inline Reply Composer */}
        {isReplying && (
          <div className="mt-2">
            <CommentComposer
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleReplySubmit}
              onCancel={() => {
                setIsReplying(false);
                setReplyText("");
              }}
              placeholder={`Reply to ${getDisplayName(comment.user)}...`}
              isSubmitting={isSubmitting}
              size="sm"
              autoFocus
            />
          </div>
        )}

        {/* Replies Dropdown Toggle */}
        {comment.replies_count > 0 && (
          <button
            onClick={toggleReplies}
            className="flex items-center gap-1 mt-2 ml-1 text-xs font-medium text-[var(--accent)] hover:underline"
          >
            <ChevronDown
              size={12}
              className={`transition-transform ${repliesExpanded ? "rotate-180" : ""}`}
            />
            {repliesExpanded ? "Hide" : "View"} {repliesTotal} {repliesTotal === 1 ? "reply" : "replies"}
          </button>
        )}

        {/* Nested Replies */}
        {comment.replies_count > 0 && repliesExpanded && (
          <div className="mt-2 ml-4 space-y-2 border-l-2 border-[var(--foreground)]/10 pl-3">
            {isLoadingReplies ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
                <span className="text-xs text-[var(--foreground)]/50">Loading replies...</span>
              </div>
            ) : (
              (replies ?? []).map((reply) => (
                <ReplyItem key={reply.id} reply={reply} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}