"use client";

import React, { useCallback, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, Pencil, Trash2, X, Check } from "lucide-react";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import type { ProjectComment } from "@/lib/stores/projects/types/project.types";
import ProjectCommentAvatar from "./ProjectCommentAvatar";
import ProjectCommentComposer from "./ProjectCommentComposer";
import { useProjectEngagementStore } from "@/lib/stores/projects/useProjectEngagementStore";

interface ProjectReplyItemProps {
  reply: ProjectComment;
}

function getDisplayName(user?: { display_name?: string | null; username?: string | null } | null): string {
  return user?.display_name || user?.username || "Anonymous";
}

export default function ProjectReplyItem({ reply }: ProjectReplyItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const updateComment = useProjectEngagementStore((s) => s.updateComment);
  const deleteComment = useProjectEngagementStore((s) => s.deleteComment);
  const isSubmitting = useProjectEngagementStore(
    (s) => s.loading.updateComment || s.loading.deleteComment
  );

  const currentUserId = useUserSettings((s) => s.userInfo?.id ?? null);
  const isOwn = !!currentUserId && reply.user_id === currentUserId;

  const handleSaveEdit = useCallback(async () => {
    if (!editText.trim() || editText.trim() === reply.content) {
      setIsEditing(false);
      return;
    }
    try {
      await updateComment(reply.comment_id, { content: editText.trim() });
      setIsEditing(false);
    } catch {
      // Rollback handled by store
    }
  }, [editText, reply.comment_id, reply.content, updateComment]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteComment(reply.comment_id);
      setConfirmingDelete(false);
    } catch {
      // Rollback handled by store
    }
  }, [reply.comment_id, deleteComment]);

  return (
    <div className="flex gap-2">
      <ProjectCommentAvatar user={reply.user} size="sm" />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <ProjectCommentComposer
            value={editText}
            onChange={setEditText}
            onSubmit={handleSaveEdit}
            onCancel={() => {
              setIsEditing(false);
              setEditText(reply.content);
            }}
            isSubmitting={!!isSubmitting}
            size="sm"
            autoFocus
          />
        ) : (
          <div className="rounded-lg px-2.5 py-1.5 bg-[var(--foreground)]/5">
            <p className="text-xs font-semibold text-[var(--foreground)]/80 mb-0.5">
              {getDisplayName(reply.user)}
            </p>
            <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap">
              {reply.content}
            </p>
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center gap-2 mt-0.5 ml-1">
            <span className="text-[10px] text-[var(--foreground)]/40">
              {reply.created_at
                ? formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })
                : "Recently"}
            </span>
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
                      disabled={!!isSubmitting}
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
