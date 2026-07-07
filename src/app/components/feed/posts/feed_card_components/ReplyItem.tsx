"use client";

import React, { useCallback, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, Pencil, Trash2, X, Check } from "lucide-react";
import { useContentCommentStore } from "@/lib/stores/contents";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import type { ContentCommentWithUser } from "@/lib/stores/contents/types/content.types";
import { getDisplayName } from "@/lib/stores/contents/types/content.types";
import CommentAvatar from "./CommentAvatar";
import CommentComposer from "./CommentComposer";

interface ReplyItemProps {
  reply: ContentCommentWithUser;
}

export default function ReplyItem({ reply }: ReplyItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.body);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const updateComment = useContentCommentStore((s) => s.updateComment);
  const deleteComment = useContentCommentStore((s) => s.deleteComment);
  const likeComment = useContentCommentStore((s) => s.likeComment);
  const unlikeComment = useContentCommentStore((s) => s.unlikeComment);
  const isSubmitting = useContentCommentStore((s) => s.isSubmitting);

  // Get current user from settings store
  const currentUserId = useUserSettings((s) => s.userInfo?.id ?? null);

  // Proper ownership check: must be logged in AND be the author
  const isOwn = !!currentUserId && reply.user_id === currentUserId;

  const handleToggleLike = useCallback(async () => {
    setIsTogglingLike(true);
    try {
      if (reply.is_liked) {
        await unlikeComment(reply.id);
      } else {
        await likeComment(reply.id);
      }
    } catch {
      // Error handled by store; optimistic update already rolled back
    } finally {
      setIsTogglingLike(false);
    }
  }, [reply.id, reply.is_liked, likeComment, unlikeComment]);

  const handleSaveEdit = useCallback(async () => {
    if (!editText.trim() || editText.trim() === reply.body) {
      setIsEditing(false);
      return;
    }
    try {
      await updateComment(reply.id, { body: editText.trim() });
      setIsEditing(false);
    } catch {
      // Error handled by store; optimistic update already rolled back
    }
  }, [editText, reply.id, reply.body, updateComment]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteComment(reply.id);
      setConfirmingDelete(false);
    } catch {
      // Error handled by store; optimistic update already rolled back
    }
  }, [reply.id, deleteComment]);

  return (
    <div className="flex gap-2">
      <CommentAvatar user={reply.user} size="sm" />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <CommentComposer
            value={editText}
            onChange={setEditText}
            onSubmit={handleSaveEdit}
            onCancel={() => {
              setIsEditing(false);
              setEditText(reply.body);
            }}
            isSubmitting={isSubmitting}
            size="sm"
            autoFocus
          />
        ) : (
          <div className="rounded-lg px-2.5 py-1.5 bg-[var(--foreground)]/5">
            <p className="text-xs font-semibold text-[var(--foreground)]/80 mb-0.5">
              {getDisplayName(reply.user)}
            </p>
            <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap">
              {reply.body}
            </p>
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center gap-2 mt-0.5 ml-1">
            <span className="text-[10px] text-[var(--foreground)]/40">
              {reply.created_at
                ? formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })
                : "Recently"}
              {reply.is_edited && " · edited"}
            </span>

            <button
              onClick={handleToggleLike}
              disabled={isTogglingLike}
              className={`flex items-center gap-1 text-[10px] transition-colors ${reply.is_liked
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)]/40 hover:text-[var(--accent)]"
                }`}
            >
              <Heart size={10} fill={reply.is_liked ? "currentColor" : "none"} />
              {reply.likes_count > 0 && reply.likes_count}
            </button>

            {isOwn && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-[10px] text-[var(--foreground)]/40 hover:text-[var(--accent)] transition-colors"
                >
                  <Pencil size={10} />
                  Edit
                </button>

                {confirmingDelete ? (
                  <span className="flex items-center gap-1 text-[10px]">
                    <span className="text-[var(--foreground)]/50">Delete?</span>
                    <button
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Check size={10} />
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="flex items-center gap-1 text-[10px] text-[var(--foreground)]/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={10} />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}