"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Send, Reply, Trash2 } from "lucide-react";
import {
  useSuggestionsStore,
  useSuggestionComments,
  useSuggestionLoading,
  SuggestionCommentResponse,
} from "@/lib/stores/suggestions/useSuggestions";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface SuggestionCommentsProps {
  suggestionId: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CommentItem({
  comment,
  suggestionId,
  depth = 0,
}: {
  comment: SuggestionCommentResponse;
  suggestionId: string;
  depth?: number;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const { userInfo } = useUserSettings();
  const createComment = useSuggestionsStore((s) => s.createComment);
  const deleteComment = useSuggestionsStore((s) => s.deleteComment);
  const isCreating = useSuggestionLoading(`createComment:${suggestionId}`);
  const isDeleting = useSuggestionLoading(`deleteComment:${comment.id}`);

  const author = comment.user;
  const displayName = author?.firstname && author?.lastname
    ? `${author.firstname} ${author.lastname}`
    : author?.username || "Not Set";

  const isAuthor = userInfo?.id === comment.user_id;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await createComment(suggestionId, {
      content: replyText.trim(),
      parent_comment_id: comment.id,
    });
    setReplyText("");
    setIsReplying(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    await deleteComment(comment.id, suggestionId);
  };

  return (
    <div className={depth > 0 ? "ml-8 mt-3" : "mt-3"}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 flex items-center justify-center overflow-hidden border border-[var(--accent)]/20">
            {author?.profile_picture ? (
              <Image
                src={author.profile_picture}
                alt={displayName}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-[var(--accent)]">
                {getInitials(displayName)}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl bg-[var(--foreground)]/5 px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[var(--foreground)]">
                {displayName}
              </span>
              <span className="text-[10px] text-[var(--foreground)]/30">
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>
            <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 ml-1">
            <button
              onClick={() => setIsReplying((p) => !p)}
              className="flex items-center gap-1 text-[10px] text-[var(--foreground)]/40 hover:text-[var(--accent)] transition-colors"
            >
              <Reply size={10} />
              Reply
            </button>
            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 text-[10px] text-[var(--foreground)]/40 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 size={10} />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>

          {/* Reply Input */}
          {isReplying && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                autoFocus
              />
              <button
                onClick={handleReply}
                disabled={isCreating || !replyText.trim()}
                className="p-2 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies?.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              suggestionId={suggestionId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SuggestionComments({ suggestionId }: SuggestionCommentsProps) {
  const [newComment, setNewComment] = useState("");

  const { userInfo } = useUserSettings();
  const comments = useSuggestionComments(suggestionId);
  const createComment = useSuggestionsStore((s) => s.createComment);
  const isCreating = useSuggestionLoading(`createComment:${suggestionId}`);

  const topLevelComments = comments.filter((c) => !c.parent_comment_id);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    await createComment(suggestionId, {
      content: newComment.trim(),
      parent_comment_id: null,
    });
    setNewComment("");
  };

  return (
    <div className="pt-4">
      {/* Comment List */}
      <div className="space-y-1">
        {topLevelComments.length === 0 ? (
          <p className="text-sm text-[var(--foreground)]/30 text-center py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              suggestionId={suggestionId}
            />
          ))
        )}
      </div>

      {/* New Comment Input */}
      {userInfo && (
        <div className="flex gap-3 mt-4 pt-3 border-t border-[var(--foreground)]/5">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 flex items-center justify-center overflow-hidden border border-[var(--accent)]/20">
              {userInfo.profile_picture ? (
                <Image
                  src={userInfo.profile_picture}
                  alt="Your avatar"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-[var(--accent)]">
                  {getInitials(userInfo.firstname || userInfo.username || "You")}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            <button
              onClick={handleSubmit}
              disabled={isCreating || !newComment.trim()}
              className="p-2 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}