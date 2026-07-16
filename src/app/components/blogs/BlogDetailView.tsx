"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Share2, Flag } from "lucide-react";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import { BlogHero } from "./BlogHero";
import { BlogContent } from "./BlogContent";
import { BlogEngagement } from "./BlogEngagement";
import Button from "../buttons/Buttons";
import { ErrorMessage } from "../ui/ErrorMessage";
import { toast } from "../toastify/Toastify";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { LoadingSkeletonBlogDetail } from "./LoadingSkeletonBlogDetail";
import { useContentReportStore } from "@/lib/stores/contents/useContentReportStore";
import Modal from "../containers/modals/Modal";

export default function BlogDetailPage({ isPublicView = false }: { isPublicView?: boolean }) {
  const params = useParams();
  const router = useRouter();
  const contentId = params.blog as string;

  const { currentContent, fetchContentBySlug, isLoading, error, clearError } = useContentStore();
  const { reportContent, isSubmitting: reportSubmitting } = useContentReportStore();
  const { userInfo, publicUserInfo } = useUserSettings();
  const isPost = currentContent?.content_type === "POST"

  const [pageError, setPageError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // Resolve ownership
  useEffect(() => {
    if (!currentContent || !userInfo) return;
    setIsOwner(currentContent.user_id === userInfo.id);
  }, [currentContent, userInfo]);

  // Fetch blog data
  useEffect(() => {
    if (!contentId) {
      toast.info("Post not found");
      return;
    }

    const loadData = async () => {
      try {
        await fetchContentBySlug(contentId);
      } catch (err) {
        console.error("Error loading blog:", err);
        setPageError("Failed to load post");
      }
    };

    loadData();
  }, [contentId]);

  // Handle errors
  useEffect(() => {
    if (error) setPageError(error);
  }, [error]);

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.warning("Please provide a reason");
      return;
    }
    await reportContent({
      content_id: contentId,
      reason: reportReason,
      description: reportDescription || null,
    });
    setShowReportModal(false);
    setReportReason("");
    setReportDescription("");
    toast.success("Report submitted");
  };

  if (isLoading && !currentContent) return <LoadingSkeletonBlogDetail />;

  if (!currentContent && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Post not found</h2>
          <p className="text-[var(--foreground)]/60">{`The post you're looking for doesn't exist or you don't have access to it.`}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mt-4"
            text=" Go Back"
          />
        </div>
      </div>
    );
  }

  const blog = currentContent;
  if (!blog) return null;

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      {
        !isPublicView && <div className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--foreground)]/5">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => router.push(`/${userInfo?.username || publicUserInfo?.username || "user"}/blogs`)}
              className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex gap-2">
              {!isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportModal(true)}
                  icon={<Flag className="w-4 h-4" />}
                  text="Report"
                />
              )}
              {isOwner && (
                <Button
                  size="sm"
                  onClick={() => router.push(`/${userInfo?.username || publicUserInfo?.username || "user"}/blogs/${currentContent.id}/edit`)}
                  icon={<Pencil className="w-4 h-4" />}
                  text="Edit"
                />
              )}
            </div>
          </div>
        </div>

      }
      <div className="max-w-4xl mx-auto px-6 py-8">
        {pageError && <ErrorMessage message={pageError} onDismiss={() => { setPageError(null); clearError(); }} />}

        {/* Hero */}
        <BlogHero isPost={isPost} blog={blog} />

        {/* Content */}
        <div className="mt-8">
          <BlogContent isPost={isPost} blog={blog} />
        </div>

        {/* Engagement */}
        <div className="mt-12 pt-8 border-t border-[var(--foreground)]/10">
          <BlogEngagement blog={blog} />
        </div>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={
          <>
            <h2 className="text-xl font-league-600 mb-1">Report Post</h2>
            <p className="text-sm text-[var(--foreground)]/50">
              Help us keep the community safe
            </p>
          </>
        }
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <input
              type="text"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="e.g., Spam, Harassment, Misinformation"
              className="w-full px-3 py-2 rounded-xl border border-[var(--foreground)]/10 
                bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent)]/50
                placeholder:text-[var(--foreground)]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Provide more details..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[var(--foreground)]/10 
                bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent)]/50
                placeholder:text-[var(--foreground)]/30 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="ghost" onClick={() => setShowReportModal(false)} text="Cancel" />
          <Button
            onClick={handleReport}
            disabled={!reportReason.trim() || reportSubmitting}
            loading={reportSubmitting}
            icon={<Flag className="w-4 h-4" />}
            text="Submit Report"
          />
        </div>
      </Modal>
    </div>
  );
}
