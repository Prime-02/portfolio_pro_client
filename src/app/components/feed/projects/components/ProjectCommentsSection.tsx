"use client";

import React, { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import ProjectCommentComposer from "./ProjectCommentComposer";
import ProjectCommentItem from "./ProjectCommentItem";
import { useProjectEngagementStore } from "@/lib/stores/projects/useProjectEngagementStore";

interface ProjectCommentsSectionProps {
  projectId: string;
  isLoading: boolean;
}

export default function ProjectCommentsSection({
  projectId,
  isLoading,
}: ProjectCommentsSectionProps) {
  const [commentText, setCommentText] = useState("");

  const addComment = useProjectEngagementStore((s) => s.addComment);
  const fetchProjectComments = useProjectEngagementStore((s) => s.fetchProjectComments);
  const isSubmitting = useProjectEngagementStore((s) => s.loading.addComment);
  const comments = useProjectEngagementStore((s) => s.commentsByProject[projectId]) ?? [];
  const totalComments = useProjectEngagementStore((s) => s.commentsTotalByProject[projectId]) ?? 0;

  const handleCommentSubmit = useCallback(async () => {
    if (!commentText.trim()) return;
    try {
      await addComment(projectId, { content: commentText.trim() });
      setCommentText("");
      await fetchProjectComments(projectId, { page: 1, size: 20 });
    } catch {
      // Error handled by store
    }
  }, [commentText, projectId, addComment, fetchProjectComments]);

  return (
    <div className="mt-4 pt-4 border-t border-[var(--foreground)]/10">
      {/* New Comment Composer */}
      <div className="mb-4">
        <ProjectCommentComposer
          value={commentText}
          onChange={setCommentText}
          onSubmit={handleCommentSubmit}
          placeholder="Write a comment..."
          isSubmitting={!!isSubmitting}
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
            <ProjectCommentItem
              key={comment.comment_id}
              comment={comment}
              projectId={projectId}
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
