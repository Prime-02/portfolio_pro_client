"use client";

import React, { useCallback, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, Pencil, Trash2, X, Check, ChevronDown, Loader2 } from "lucide-react";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import type { ProjectComment } from "@/lib/stores/projects/types/project.types";
import ProjectCommentAvatar from "./ProjectCommentAvatar";
import ProjectCommentComposer from "./ProjectCommentComposer";
import ProjectReplyItem from "./ProjectReplyItem";
import { useProjectEngagementStore } from "@/lib/stores/projects/useProjectEngagementStore";

interface ProjectCommentItemProps {
  comment: ProjectComment;
  projectId: string;
}

function getDisplayName(user?: { display_name?: string | null; username?: string | null } | null): string {
  return user?.display_name || user?.username || "Not Set";
}

export default function ProjectCommentItem({ comment, projectId }: ProjectCommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const updateComment = useProjectEngagementStore((s) => s.updateComment);
  const deleteComment = useProjectEngagementStore((s) => s.deleteComment);
  const addComment = useProjectEngagementStore((s) => s.addComment);
  const fetchCommentReplies = useProjectEngagementStore((s) => s.fetchCommentReplies);
  const isSubmitting = useProjectEngagementStore(
    (s) => s.loading.addComment || s.loading.updateComment
  );
  const replies = useProjectEngagementStore((s) => s.repliesByComment[comment.comment_id]);
  const repliesTotal = useProjectEngagementStore(
    (s) => s.repliesTotalByComment[comment.comment_id] ?? comment.replies_count ?? 0
  );

  const currentUserId = useUserSettings((s) => s.userInfo?.id ?? null);
  const isOwn = !!currentUserId && comment.user_id === currentUserId;

  const handleSaveEdit = useCallback(async () => {
    if (!editText.trim() || editText.trim() === comment.content) {
      setIsEditing(false);
      return;
    }
    try {
      await updateComment(comment.comment_id, { content: editText.trim() });
      setIsEditing(false);
    } catch {
      // Rollback handled by store
    }
  }, [editText, comment.comment_id, comment.content, updateComment]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteComment(comment.comment_id);
      setConfirmingDelete(false);
    } catch {
      // Rollback handled by store
    }
  }, [comment.comment_id, deleteComment]);

  const loadReplies = useCallback(async () => {
    setIsLoadingReplies(true);
    try {
      await fetchCommentReplies(comment.comment_id, { page: 1, size: 20 });
    } catch {
      // Error handled by store
    } finally {
      setIsLoadingReplies(false);
    }
  }, [comment.comment_id, fetchCommentReplies]);

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
      await addComment(projectId, {
        content: replyText.trim(),
        parent_comment_id: comment.comment_id,
      });
      setReplyText("");
      setIsReplying(false);
      setRepliesExpanded(true);
      await loadReplies();
    } catch {
      // Rollback handled by store
    }
  }, [replyText, projectId, comment.comment_id, addComment, loadReplies]);

  return (
    <div className="flex gap-3">
      <ProjectCommentAvatar user={{
        username: comment.username || "",
        profile_picture: comment.profile_picture || "",
      }} size="md" />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <ProjectCommentComposer
            value={editText}
            onChange={setEditText}
            onSubmit={handleSaveEdit}
            onCancel={() => {
              setIsEditing(false);
              setEditText(comment.content);
            }}
            isSubmitting={!!isSubmitting}
            size="sm"
            autoFocus
          />
        ) : (
          <div className="rounded-xl px-3 py-2 bg-[var(--foreground)]/5">
            <p className="text-xs font-semibold text-[var(--foreground)]/80 mb-0.5">
              {getDisplayName({
                display_name: comment.username,
                username: comment.username,
              })}
            </p>
            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center gap-3 mt-1 ml-1 flex-wrap">
            <span className="text-xs text-[var(--foreground)]/40">
              {comment.created_at
                ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
                : "Recently"}
            </span>

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
                      disabled={!!isSubmitting}
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
            <ProjectCommentComposer
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleReplySubmit}
              onCancel={() => {
                setIsReplying(false);
                setReplyText("");
              }}
              placeholder={`Reply to ${getDisplayName(comment.user)}...`}
              isSubmitting={!!isSubmitting}
              size="sm"
              autoFocus
            />
          </div>
        )}

        {/* Replies Dropdown Toggle */}
        {(comment.replies_count ?? 0) > 0 && (
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
        {(comment.replies_count ?? 0) > 0 && repliesExpanded && (
          <div className="mt-2 ml-4 space-y-2 border-l-2 border-[var(--foreground)]/10 pl-3">
            {isLoadingReplies ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
                <span className="text-xs text-[var(--foreground)]/50">Loading replies...</span>
              </div>
            ) : (
              (replies ?? []).map((reply) => (
                <ProjectReplyItem key={reply.comment_id} reply={reply} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
