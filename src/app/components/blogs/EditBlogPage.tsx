"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Image, Settings, FileText, Check } from "lucide-react";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import type { ContentUpdatePayload, ContentStatus } from "@/lib/stores/contents/types/content.types";
import Button from "../buttons/Buttons";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Textinput } from "../inputs/Textinput";
import { FileInput } from "../inputs/FileInput";
import MarkdownEditor from "../markdown/MarkdownEditor";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { TextArea } from "../inputs/TextArea";

type EditTab = "basic" | "media" | "settings";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.blog as string;

  const { userInfo } = useUserSettings();
  const { currentContent, fetchContentById, updateContent, isLoading, isSubmitting, error, clearError } = useContentStore();
  const isPost = currentContent?.content_type === "POST"

  const [activeTab, setActiveTab] = useState<EditTab>("basic");
  const [pageError, setPageError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<ContentUpdatePayload & { coverImage: File | null; clearedImage: boolean }>({
    title: "",
    body: "",
    excerpt: "",
    category: "",
    tags: "",
    status: "DRAFT",
    is_public: false,
    is_featured: false,
    is_pinned: false,
    allow_comments: true,
    allow_likes: true,
    allow_reshare: true,
    meta_title: "",
    meta_description: "",
    coverImage: null,
    clearedImage: false,
  });

  const [tagInput, setTagInput] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);

  // Load blog data
  useEffect(() => {
    if (contentId) {
      fetchContentById(contentId);
    }
  }, [contentId]);

  useEffect(() => {
    if (currentContent) {
      setForm({
        title: currentContent.title,
        body: currentContent.body ?? "",
        excerpt: currentContent.excerpt ?? "",
        category: currentContent.category ?? "",
        tags: currentContent.tags?.join(",") ?? "",
        status: currentContent.status,
        is_public: currentContent.is_public,
        is_featured: currentContent.is_featured,
        is_pinned: currentContent.is_pinned,
        allow_comments: currentContent.allow_comments,
        allow_likes: currentContent.allow_likes,
        allow_reshare: currentContent.allow_reshare,
        meta_title: currentContent.meta_title ?? "",
        meta_description: currentContent.meta_description ?? "",
        coverImage: null,
        clearedImage: false,
      });
      setTagsList(currentContent.tags ?? []);
    }
  }, [currentContent]);

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!contentId || !form.title) return;

    const payload: ContentUpdatePayload = {
      title: form.title,
      body: form.body,
      excerpt: form.excerpt,
      category: form.category,
      tags: tagsList.length > 0 ? tagsList.join(",") : '',
      status: form.status,
      is_public: form.is_public,
      is_featured: form.is_featured,
      is_pinned: form.is_pinned,
      allow_comments: form.allow_comments,
      allow_likes: form.allow_likes,
      allow_reshare: form.allow_reshare,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      cover_image: form.coverImage ?? undefined,
    };

    const result = await updateContent(contentId, payload);
    if (result) {
      router.push(`/${userInfo?.username || "user"}/blogs/${contentId}`);
    } else {
      setPageError(error ?? "Failed to update post");
    }
  };

  const tabs: { id: EditTab; label: string; icon: typeof FileText }[] = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "media", label: "Media", icon: Image },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (!currentContent && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--foreground)]/30">Loading post data...</div>
      </div>
    );
  }

  if (!currentContent && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--foreground)]/30">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--foreground)]/5">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <Button
              onClick={handleSubmit}
              disabled={!form.title || isSubmitting}
              loading={isSubmitting}
              icon={<Save className="w-4 h-4" />}
              text="Save Changes"
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1

            className="text-3xl font-league-700 capitalize mb-2">Edit {currentContent?.content_type || "POST"}</h1>

          {pageError && <ErrorMessage message={pageError} onDismiss={() => { setPageError(null); clearError(); }} />}

          {/* Tabs */}
          <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[var(--foreground)]/5 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? "bg-[var(--background)] text-[var(--accent)] shadow-sm"
                    : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === "basic" && (
              <>
                {/* Only show title, category, excerpt, and meta fields for blogs */}
                {!isPost && (
                  <>
                    <Textinput
                      label="Title"
                      value={form.title ?? ""}
                      onChange={(v) => set("title", v)}
                      required
                    />

                    <Textinput
                      label="Category"
                      value={form.category ?? ""}
                      onChange={(v) => set("category", v)}
                    />

                    <TextArea
                      label="Summary/Excerpt"
                      value={form.excerpt ?? ""}
                      onChange={(v) => set("excerpt", v)}
                    />
                  </>
                )}

                {/* Body - MarkdownEditor for blogs, TextArea for posts */}
                {isPost ? (
                  <TextArea
                    label="Content"
                    value={form.body ?? ""}
                    onChange={(v) => set("body", v)}
                  />
                ) : (
                  <MarkdownEditor
                    label="Content"
                    value={form.body ?? ""}
                    onChange={(v) => set("body", v)}
                    minHeight="200px"
                  />
                )}

                {/* Tags - always shown */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagInput.trim()) {
                          if (!tagsList.includes(tagInput.trim())) {
                            setTagsList([...tagsList, tagInput.trim()]);
                          }
                          setTagInput("");
                        }
                      }}
                      placeholder="Add tag and press Enter"
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--foreground)]/10 
                        bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent)]/50
                        placeholder:text-[var(--foreground)]/30"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tagsList.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                          bg-[var(--foreground)]/5 text-[var(--foreground)]/50 
                          border border-[var(--foreground)]/10"
                      >
                        {tag}
                        <button
                          onClick={() => setTagsList(tagsList.filter((t) => t !== tag))}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Meta - only show for blogs */}
                {!isPost && (
                  <div className="space-y-4">
                    <Textinput
                      label="Meta Title"
                      value={form.meta_title ?? ""}
                      onChange={(v) => set("meta_title", v)}
                    />
                    <Textinput
                      label="Meta Description"
                      value={form.meta_description ?? ""}
                      onChange={(v) => set("meta_description", v)}
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === "media" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Cover Image</h3>
                  <p className="text-xs text-[var(--foreground)]/40">
                    Replace the current cover image
                  </p>
                  <FileInput
                    value={form.coverImage ?? (form.clearedImage ? null : currentContent?.cover_image_url ?? null)}
                    onChange={(file) => {
                      if (file === null) {
                        set("clearedImage", true);
                        set("coverImage", null);
                      } else {
                        set("clearedImage", false);
                        set("coverImage", file);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Status - only show for blogs */}
                {!isPost && (
                  <Textinput
                    type="dropdown"
                    label="Status"
                    options={[
                      { id: "DRAFT", code: "Draft" },
                      { id: "PUBLISHED", code: "Published" },
                      { id: "SCHEDULED", code: "Scheduled" },
                      { id: "ARCHIVED", code: "Archived" },
                    ]}
                    value={form.status ?? "DRAFT"}
                    onChange={(v) => set("status", v as ContentStatus)}
                  />
                )}

                {/* Visibility - only show for blogs */}
                {!isPost && (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
                    <div>
                      <p className="text-sm font-medium">Public Post</p>
                      <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                        Visible to everyone on your profile
                      </p>
                    </div>
                    <button
                      type="button"
                      title="is public button"
                      onClick={() => set("is_public", !form.is_public)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${form.is_public ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${form.is_public ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                )}

                {/* Featured - only show for blogs */}
                {!isPost && (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
                    <div>
                      <p className="text-sm font-medium">Featured Post</p>
                      <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                        Highlight this post in your portfolio
                      </p>
                    </div>
                    <button
                      type="button"
                      title="is featured button"
                      onClick={() => set("is_featured", !form.is_featured)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${form.is_featured ? "bg-amber-500" : "bg-[var(--foreground)]/20"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${form.is_featured ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                )}

                {/* Pinned - only show for blogs */}
                {!isPost && (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
                    <div>
                      <p className="text-sm font-medium">Pinned Post</p>
                      <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                        Keep this post at the top of your list
                      </p>
                    </div>
                    <button
                      type="button"
                      title="is pinned button"
                      onClick={() => set("is_pinned", !form.is_pinned)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${form.is_pinned ? "bg-blue-500" : "bg-[var(--foreground)]/20"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${form.is_pinned ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                )}

                {/* Allow Comments - always shown */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
                  <div>
                    <p className="text-sm font-medium">Allow Comments</p>
                    <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                      Let readers leave comments on this post
                    </p>
                  </div>
                  <button
                    type="button"
                    title="allow comments button"
                    onClick={() => set("allow_comments", !form.allow_comments)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${form.allow_comments ? "bg-emerald-500" : "bg-[var(--foreground)]/20"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${form.allow_comments ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Allow Likes - always shown */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
                  <div>
                    <p className="text-sm font-medium">Allow Likes</p>
                    <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                      Let readers like this post
                    </p>
                  </div>
                  <button
                    type="button"
                    title="allow likes button"
                    onClick={() => set("allow_likes", !form.allow_likes)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${form.allow_likes ? "bg-emerald-500" : "bg-[var(--foreground)]/20"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${form.allow_likes ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Allow Reshare - always shown */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
                  <div>
                    <p className="text-sm font-medium">Allow Reshare</p>
                    <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                      Let others share this post to their profile
                    </p>
                  </div>
                  <button
                    type="button"
                    title="allow reshare button"
                    onClick={() => set("allow_reshare", !form.allow_reshare)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${form.allow_reshare ? "bg-emerald-500" : "bg-[var(--foreground)]/20"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${form.allow_reshare ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}