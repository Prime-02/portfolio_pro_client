import EmptyState from "@/app/components/containers/cards/EmptyState";
import { TextArea } from "@/app/components/inputs/Textinput";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { ProjectComment } from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import {
  DeleteData,
  GetAllData,
  PostAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import {
  formatDateString,
  getImageSrc,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import Image from "next/image";
import React, { useState, useEffect } from "react";

interface CommentWithReplies extends ProjectComment {
  replies?: CommentWithReplies[];
}

const ProjectComments = ({ projectId }: { projectId: string }) => {
  const { accessToken, setLoading, isLoading, userData } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [threadData, setThreadData] = useState<Map<string, CommentWithReplies>>(
    new Map()
  );
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const LoaderComponent = getLoader(loader) || null;

  useEffect(() => {
    getComments();
  }, [projectId]);

  const getComments = async () => {
    setLoading("fetching_project_comments");
    try {
      const commentsRes: { comments: ProjectComment[]; total: number } =
        await GetAllData({
          access: accessToken,
          url: `projects/${projectId}/comments`,
        });
      if (commentsRes && commentsRes.comments.length > 0) {
        setComments(commentsRes.comments);
      }
      console.log(commentsRes);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("fetching_project_comments");
    }
  };

  const makeCommentAndReply = async (
    content: string,
    parent_comment_id: string | null
  ) => {
    if (!content.trim()) return;

    if (parent_comment_id) {
      setLoading("making_reply");
    } else {
      setLoading("making_comment");
    }
    try {
      const commentRes = await PostAllData({
        access: accessToken,
        url: `projects/${projectId}/comments`,
        data: { content: content, parent_comment_id: parent_comment_id },
      });
      if (commentRes) {
        // If replying to a nested comment, refetch the thread
        if (parent_comment_id) {
          await refetchParentThread(parent_comment_id);
        } else {
          getComments();
        }
        setNewComment("");
        setReplyContent("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (parent_comment_id) {
        setLoading("making_reply");
      } else {
        setLoading("making_comment");
      }
    }
  };

  const updateCommentAndReply = async (
    content: string,
    parent_comment_id: string | null,
    comment_id: string
  ) => {
    if (!content.trim()) return;

    setLoading(`updating_comment_${comment_id}`);
    try {
      const commentRes = await UpdateAllData({
        access: accessToken,
        url: `projects/comments/${comment_id}`,
        field: { content: content, parent_comment_id: parent_comment_id },
      });
      if (commentRes) {
        // If updating a nested comment, refetch the thread
        if (parent_comment_id) {
          await refetchParentThread(parent_comment_id);
        } else {
          getComments();
        }
        setEditingComment(null);
        setEditContent("");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(`updating_comment_${comment_id}`);
    }
  };

  const deleteCommentAndReply = async (
    comment_id: string,
    parent_comment_id: string | null
  ) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setLoading(`deleting_comment_${comment_id}`);
    try {
      const deleteRes = await DeleteData({
        access: accessToken,
        url: `projects/comments/${comment_id}`,
      });
      if (deleteRes) {
        // If deleting a nested comment, refetch the thread
        if (parent_comment_id) {
          await refetchParentThread(parent_comment_id);
        } else {
          getComments();
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(`deleting_comment_${comment_id}`);
    }
  };

  const fetchThread = async (commentId: string) => {
    setLoading("loading_replies");
    try {
      const threadRes: CommentWithReplies = await GetAllData({
        access: accessToken,
        url: `projects/comments/${commentId}/thread`,
      });
      if (threadRes) {
        setThreadData((prev) => new Map(prev).set(commentId, threadRes));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("loading_replies");
    }
  };

  // Helper function to find and refetch the root comment of a thread
  const refetchParentThread = async (commentId: string) => {
    // Find the root comment ID by checking which thread contains this comment
    let rootCommentId: string | null = null;

    // Check if this comment is a direct child (in comments array)
    const directParent = comments.find((c) => c.comment_id === commentId);
    if (directParent) {
      rootCommentId = commentId;
    } else {
      // Search through thread data to find the root
      for (const [rootId, threadComment] of threadData.entries()) {
        if (hasCommentInThread(threadComment, commentId)) {
          rootCommentId = rootId;
          break;
        }
      }
    }

    if (rootCommentId && expandedComments.has(rootCommentId)) {
      await fetchThread(rootCommentId);
    } else {
      getComments();
    }
  };

  // Helper function to check if a comment exists in a thread
  const hasCommentInThread = (
    comment: CommentWithReplies,
    targetId: string
  ): boolean => {
    if (comment.comment_id === targetId) return true;
    if (comment.replies) {
      return comment.replies.some((reply) =>
        hasCommentInThread(reply, targetId)
      );
    }
    return false;
  };

  const toggleThread = async (commentId: string) => {
    const newExpandedComments = new Set(expandedComments);

    if (expandedComments.has(commentId)) {
      newExpandedComments.delete(commentId);
    } else {
      newExpandedComments.add(commentId);
      if (!threadData.has(commentId)) {
        await fetchThread(commentId);
      }
    }

    setExpandedComments(newExpandedComments);
  };

  const formatDate = (dateString: string) => {
    return formatDateString(dateString);
  };

  const handleStartEdit = (comment: CommentWithReplies) => {
    setEditingComment(comment.comment_id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const handleStartReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent("");
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const isOwnComment = (comment: CommentWithReplies) => {
    return (
      userData?.username === comment.username ||
      userData?.id === comment.user_id
    );
  };

  // Count total nested replies recursively
  // const countReplies = (comment: CommentWithReplies): number => {
  //   if (!comment.replies || comment.replies.length === 0) return 0;
  //   return (
  //     comment.replies.length +
  //     comment.replies.reduce((sum, reply) => sum + countReplies(reply), 0)
  //   );
  // };

  const renderComment = (comment: CommentWithReplies, depth = 0) => {
    const isTopLevel = depth === 0;
    const hasReplies = comment.replies && comment.replies.length > 0;
    // const totalReplies = countReplies(comment);

    return (
      <div
        key={comment.comment_id}
        className={`${depth > 0 ? "ml-8 mt-3 relative" : "mb-4"}`}
      >
        {/* Thread line indicator */}
        {depth > 0 && (
          <div
            className="absolute left-[-1rem] top-0 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-700 opacity-30"
            style={{ height: "100%" }}
          />
        )}

        <div className="flex gap-3">
          <Image
            width={1000}
            height={1000}
            src={getImageSrc(comment.profile_picture, comment.username)}
            alt={comment.username}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{comment.username}</span>
              <span className="text-xs opacity-65">
                {formatDate(comment.created_at)}
              </span>
            </div>

            {/* Edit mode */}
            {editingComment === comment.comment_id ? (
              <div className="space-y-2">
                <TextArea
                  value={editContent}
                  onChange={(e) => setEditContent(e)}
                  className="w-full p-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  rows={3}
                  disabled={
                    isLoading("updating_comment") ||
                    isLoading("updating_reply") ||
                    isLoading(`updating_comment_${comment.comment_id}`)
                  }
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateCommentAndReply(
                        editContent,
                        comment.parent_comment_id || null,
                        comment.comment_id
                      )
                    }
                    disabled={isLoading(
                      `updating_comment_${comment.comment_id}`
                    )}
                    className="px-3 py-1 bg-[var(--accent)] text-white text-xs rounded-lg hover:opacity-80 disabled:opacity-50"
                  >
                    {isLoading(`updating_comment_${comment.comment_id}`)
                      ? "Saving..."
                      : "Save"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 border text-xs rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm mb-2">{comment.content}</p>

                {/* Action buttons */}
                <div className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => handleStartReply(comment.comment_id)}
                    className="text-[var(--accent)] hover:opacity-70 font-medium"
                  >
                    Reply
                  </button>

                  {isOwnComment(comment) && (
                    <>
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="opacity-65 hover:opacity-100 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          deleteCommentAndReply(
                            comment.comment_id,
                            comment.parent_comment_id || null
                          )
                        }
                        disabled={isLoading(
                          `deleting_comment_${comment.comment_id}`
                        )}
                        className="text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        {isLoading(`deleting_comment_${comment.comment_id}`)
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </>
                  )}

                  {isTopLevel && comment.replies_count > 0 && (
                    <button
                      onClick={() => toggleThread(comment.comment_id)}
                      className="text-[var(--accent)] hover:opacity-70 font-medium ml-auto"
                      disabled={isLoading("loading_replies")}
                    >
                      {isLoading("loading_replies") &&
                      !threadData.has(comment.comment_id)
                        ? "Loading..."
                        : expandedComments.has(comment.comment_id)
                          ? "Hide replies"
                          : `View ${comment.replies_count} ${comment.replies_count === 1 ? "reply" : "replies"}`}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Reply input */}
            {replyingTo === comment.comment_id && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  rows={2}
                  disabled={isLoading("making_reply")}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      makeCommentAndReply(replyContent, comment.comment_id)
                    }
                    disabled={isLoading("making_reply") || !replyContent.trim()}
                    className="px-3 py-1 bg-[var(--accent)] text-white text-xs rounded-lg hover:opacity-80 disabled:opacity-50"
                  >
                    {isLoading("making_reply") ? "Replying..." : "Reply"}
                  </button>
                  <button
                    onClick={handleCancelReply}
                    className="px-3 py-1 border text-xs rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Render nested replies recursively */}
        {isTopLevel &&
          expandedComments.has(comment.comment_id) &&
          threadData.has(comment.comment_id) && (
            <div className="mt-3">
              {threadData
                .get(comment.comment_id)
                ?.replies?.map((reply) => renderComment(reply, depth + 1))}
            </div>
          )}

        {/* Render nested replies for non-top-level comments */}
        {!isTopLevel && hasReplies && (
          <div className="mt-3">
            {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading("fetching_project_comments")) {
    return (
      <div className="flex justify-center items-center py-8">
        {LoaderComponent && <LoaderComponent color={accentColor.color} />}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>

      {/* New comment input */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          rows={3}
          disabled={isLoading("making_comment")}
        />
        <button
          onClick={() => makeCommentAndReply(newComment, null)}
          disabled={isLoading("making_comment") || !newComment.trim()}
          className="mt-2 px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {isLoading("making_comment") ? "Posting..." : "Post Comment"}
        </button>
      </div>

      {comments.length === 0 ? (
        <EmptyState
          title="No comments yet"
          description="No comments has been made under this project yet. Be the first to say something!"
          actionText="Refresh"
          onAction={() => {
            getComments();
          }}
        />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default ProjectComments;
