"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Edit, Flag, MoreVertical, Sparkles, Trash } from "lucide-react";
import { useContentCommentStore, useContentStore } from "@/lib/stores/contents";
import type { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";
import ContentReactionBar from "./ContentReactionBar";
import ReportContentModal from "./ReportContentModal";
import CommentsSection from "./CommentsSection";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import CloseButton from "../../../buttons/CloseButton";
import Button from "../../../buttons/Buttons";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import ConfirmationModal from "../../../containers/modals/ConfirmationModal";

interface FeedCardProps {
  content: ContentWithAuthor;
}

// Character limit for post body truncation
const POST_BODY_CHAR_LIMIT = 300;

export default function FeedCard({ content }: FeedCardProps) {
  const { userInfo } = useUserSettings()
  const [showComments, setShowComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isPostExpanded, setIsPostExpanded] = useState(false);

  const fetchComments = useContentCommentStore((s) => s.fetchComments);

  // Toggle comments section with loading indicator
  const toggleComments = useCallback(async () => {
    if (!showComments) {
      setIsLoadingComments(true);
      try {
        // Fetch top-level (parent) comments for this content
        await fetchComments({ content_id: content.id });
      } catch {
        // Error handled by store
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments((prev) => !prev);
  }, [showComments, content.id, fetchComments]);

  const author = content.author;
  const isBlog = content.content_type === "BLOG";
  const isPost = content.content_type === "POST";
  const isOwn = content.author?.id === userInfo?.id

  // Determine if post body needs truncation
  const postBody = content.body || "";
  const isPostLong = isPost && postBody.length > POST_BODY_CHAR_LIMIT;
  const displayBody = isPost && !isPostExpanded && isPostLong
    ? postBody.slice(0, POST_BODY_CHAR_LIMIT) + "..."
    : postBody;

  return (
    <>
      <article
        className="rounded-2xl border border-[var(--foreground)]/10 p-5 transition-shadow hover:shadow-md"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Author Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/${author?.username}`}
            className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center overflow-hidden">
              {author?.profile_picture ? (
                <img
                  src={author.profile_picture}
                  alt={author.display_name || author.username || "Author avatar"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-[var(--accent)]">
                  {(author?.display_name || author?.username || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--foreground)]">
                {author?.display_name || author?.username || "Not Set"}
              </p>
              <p className="text-xs text-[var(--foreground)]/50">
                {content.created_at
                  ? formatDistanceToNow(new Date(content.created_at), { addSuffix: true })
                  : "Recently"}
                {isBlog && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-[var(--accent)]/10 text-[var(--accent)]">
                    Blog
                  </span>
                )}
              </p>
            </div>
          </Link>

          {/* Report Button */}

          {
            isOwn ? <AuthorsAction username={userInfo?.username || ""} postId={content.id} /> :
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 rounded-full hover:bg-[var(--foreground)]/5 transition-colors text-[var(--foreground)]/40 hover:text-red-500"
                title="Report content"
              >
                <Flag size={16} />
              </button>
          }
        </div>

        {/* Content Body */}
        <div className="mb-4">
          {isPost && content.body && (
            <div>
              <p className="text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                {displayBody}
              </p>
              {isPostLong && (
                <button
                  onClick={() => setIsPostExpanded(!isPostExpanded)}
                  className="inline-flex items-center gap-1 mt-1 text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  {isPostExpanded ? "Show Less" : "Read More"}
                  <Sparkles size={14} />
                </button>
              )}
            </div>
          )}

          {isBlog && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {content.title}
              </h3>
              {content.excerpt && (
                <p className="text-[var(--foreground)]/80 leading-relaxed mb-3">
                  {content.excerpt}
                </p>
              )}
              <Link
                href={`/blogs/${content.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Read More
                <Sparkles size={14} />
              </Link>
            </div>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cover Image - CORRECTED */}
        {content.cover_image_url && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img
              src={content.cover_image_url}
              alt={content.title || "Post cover image"}
              width={800}
              height={400}
              className="w-full object-cover"
              style={{ maxHeight: '20rem' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <ContentReactionBar
          content={content}
          showComments={showComments}
          isLoadingComments={isLoadingComments}
          onToggleComments={toggleComments}
        />

        {/* Comments Section */}
        {showComments && (
          <CommentsSection
            contentId={content.id}
            isLoading={isLoadingComments}
          />
        )}
      </article>

      <ReportContentModal
        contentId={content.id}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </>
  );
}

const AuthorsAction = ({ username, postId }: { username: string, postId: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [deletePost, setDeletePost] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { router } = useRouting()
  const { deleteContent } = useContentStore()

  const handleDeleePost = async () => {
    setIsDeleting(true)
    try {
      await deleteContent(postId, true)
    } finally {
      setIsDeleting(false)
    }
  }
  return (
    <>
      <div className="relative">
        {
          isOpen ?
            <CloseButton onClick={() => setIsOpen(false)} />
            :
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-[var(--background)]/20 rounded"
              aria-label="Open menu"
            >
              <MoreVertical />
            </button>
        }

        {isOpen && (
          <div className="absolute right-0 mt-2 bg-[var(--background)] shadow-lg rounded-md border flex flex-col min-w-[150px] z-10">
            <Button
              variant="ghost"
              text="Edit"
              onClick={() => {
                router.push(`/${username}/blogs/${postId}/edit`)
              }}
              className="flex items-center justify-end"
              size="sm"
            />
            <Button
              variant="ghost"
              text="Delete"
              customColor="red"
              onClick={() => {
                setDeletePost(true)
              }}
              className="flex items-center justify-end"
              size="sm"
            />
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={deletePost}
        onClose={() => setDeletePost(false)}
        confirmText="Proceed"
        title="You are about to delete this post. This action is irriversible."
        onConfirm={() => {
          handleDeleePost()
        }}
        loading={isDeleting}
        variant="warning"
      />
    </>
  )
}