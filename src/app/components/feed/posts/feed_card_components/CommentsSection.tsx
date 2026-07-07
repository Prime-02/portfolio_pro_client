"use client";

import React, { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { useContentCommentStore } from "@/lib/stores/contents";
import CommentComposer from "./CommentComposer";
import CommentItem from "./CommentItem";

interface CommentsSectionProps {
  contentId: string;
  isLoading: boolean;
}

export default function CommentsSection({
  contentId,
  isLoading,
}: CommentsSectionProps) {
  const [commentText, setCommentText] = useState("");

  const createComment = useContentCommentStore((s) => s.createComment);
  const fetchComments = useContentCommentStore((s) => s.fetchComments);
  const isSubmitting = useContentCommentStore((s) => s.isSubmitting);
  const comments = useContentCommentStore((s) => s.commentsByContent[contentId]) ?? [];
  const totalComments = useContentCommentStore((s) => s.totalByContent[contentId]) ?? 0;

  const handleCommentSubmit = useCallback(async () => {
    if (!commentText.trim()) return;
    try {
      await createComment({ content_id: contentId, body: commentText.trim() });
      setCommentText("");
      // Reload parent comments to reflect the authoritative server state
      await fetchComments({ content_id: contentId });
    } catch {
      // Error handled by store; optimistic update already rolled back
    }
  }, [commentText, contentId, createComment, fetchComments]);

  return (
    <div className="mt-4 pt-4 border-t border-[var(--foreground)]/10">
      {/* New Comment Composer */}
      <div className="mb-4">
        <CommentComposer
          value={commentText}
          onChange={setCommentText}
          onSubmit={handleCommentSubmit}
          placeholder="Write a comment..."
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
            <span className="text-sm text-[var(--foreground)]/50">Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-[var(--foreground)]/40 py-4">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              contentId={contentId}
            />
          ))
        )}

        {totalComments > comments.length && (
          <button className="w-full text-center text-sm text-[var(--accent)] hover:underline py-2">
            Load more comments
          </button>
        )}
      </div>
    </div>
  );
}