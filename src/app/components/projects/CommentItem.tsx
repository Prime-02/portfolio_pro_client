"use client";

import { useState } from "react";
import Image from "next/image";
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
} from "lucide-react";
import { useProjectEngagementStore } from "@/lib/stores/projects/useProjectEngagementStore";
import type { ProjectComment } from "@/lib/stores/projects/types/project.types";
import Button from "../buttons/Buttons";
import { TextArea } from "../inputs/TextArea";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { toast } from "../toastify/Toastify";

interface CommentItemProps {
    comment: ProjectComment;
    projectId: string;
    depth?: number;
    maxDepth?: number;
}

export function CommentItem({
    comment,
    projectId,
    depth = 0,
    maxDepth = 3,
}: CommentItemProps) {
    const { userInfo } = useUserSettings()
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasFetchedReplies, setHasFetchedReplies] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showActions, setShowActions] = useState(false);
    const [showRepliesLoading, setShowRepliesLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [repliesPage, setRepliesPage] = useState(1);

    const {
        addComment,
        deleteComment,
        updateComment,
        fetchCommentReplies,
        repliesByComment,
        repliesTotalByComment,
        loading,
        errors,
    } = useProjectEngagementStore();

    const storeReplies = repliesByComment[comment.comment_id];
    const replies = storeReplies ?? comment.replies ?? [];
    const totalReplies = repliesTotalByComment[comment.comment_id] ?? comment.replies_count ?? replies.length;
    const hasMoreReplies = replies.length < totalReplies;

    const handleReply = async () => {
        if (!userInfo?.username) {
            toast.warning("You must be logged in to comment on a projects")
            return
        }
        if (!replyContent.trim()) return;

        const data = {
            content: replyContent,
            parent_comment_id: comment.comment_id,
        };

        const result = await addComment(projectId, data);
        if (result) {
            setReplyContent("");
            setIsReplying(false);
            setIsExpanded(true);
            setHasFetchedReplies(true);
        }
    };

    const handleUpdate = async () => {
        if (!editContent.trim() || editContent === comment.content) {
            setIsEditing(false);
            return;
        }

        const success = await updateComment(comment.comment_id, {
            content: editContent,
        });

        if (success) {
            setIsEditing(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setShowActions(false);
        await deleteComment(comment.comment_id);
        setIsDeleting(false);
    };

    const handleLoadMoreReplies = async () => {
        setShowRepliesLoading(true);
        const nextPage = repliesPage + 1;
        await fetchCommentReplies(comment.comment_id, {
            page: nextPage,
            size: 10,
        });
        setRepliesPage(nextPage);
        setShowRepliesLoading(false);
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
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center overflow-hidden">
                        {comment?.profile_picture ? (
                            <img
                                src={comment.profile_picture}
                                alt={comment.username || "User avatar"}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs font-medium text-[var(--accent)]">
                                {comment.username?.[0]?.toUpperCase() ?? "?"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                            {comment?.username ?? "Unknown"}
                        </span>
                        <span className="text-[10px] text-[var(--foreground)]/30">
                            {new Date(comment.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                        {(comment as ProjectComment & { updated_at?: string }).updated_at &&
                            (comment as ProjectComment & { updated_at?: string }).updated_at !== comment.created_at && (
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
                                    disabled={!editContent.trim() || loading.updateComment}
                                    loading={loading.updateComment}
                                    text="Save"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(comment.content);
                                    }}
                                    text="Cancel"
                                />
                            </div>
                            {errors.updateComment && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.updateComment}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--foreground)]/60 leading-relaxed">
                            {comment.content}
                        </p>
                    )}

                    {/* Actions */}
                    {!isEditing && (
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
                                            await fetchCommentReplies(comment.comment_id, { page: 1, size: 10 });
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
                                                setEditContent(comment.content);
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
                                            disabled={!replyContent.trim() || loading.addComment}
                                            loading={loading.addComment}
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
                                {errors.addComment && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.addComment}
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
                                    <CommentItem
                                        key={reply.comment_id}
                                        comment={reply}
                                        projectId={projectId}
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