"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Image, Settings, FileText, Check } from "lucide-react";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import type { ContentCreatePayload, ContentType, ContentStatus } from "@/lib/stores/contents/types/content.types";
import Button from "../buttons/Buttons";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Textinput } from "../inputs/Textinput";
import { FileInput } from "../inputs/FileInput";
import MarkdownEditor from "../markdown/MarkdownEditor";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { TextArea } from "../inputs/TextArea";

type CreateTab = "basic" | "media" | "settings";

export default function CreateBlogPage() {
  const router = useRouter();
  const { createContent, isSubmitting, error } = useContentStore();
  const { userInfo } = useUserSettings();

  const [activeTab, setActiveTab] = useState<CreateTab>("basic");
  const [pageError, setPageError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<ContentCreatePayload & { coverImage: File | null }>({
    title: "",
    content_type: "BLOG",
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
  });

  const [tagInput, setTagInput] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title) return;

    const payload: ContentCreatePayload = {
      title: form.title,
      content_type: "BLOG",
      body: form.body || undefined,
      excerpt: form.excerpt || undefined,
      category: form.category || undefined,
      tags: tagsList.length > 0 ? tagsList.join(",") : undefined,
      status: form.status,
      is_public: form.is_public,
      is_featured: form.is_featured,
      is_pinned: form.is_pinned,
      allow_comments: form.allow_comments,
      allow_likes: form.allow_likes,
      allow_reshare: form.allow_reshare,
      meta_title: form.meta_title || undefined,
      meta_description: form.meta_description || undefined,
      cover_image: form.coverImage ?? undefined,
    };

    const result = await createContent(payload);
    if (result) {
      router.push(`/${userInfo?.username || "user"}/blogs/${result.id}`);
    } else {
      setPageError(error ?? "Failed to create post");
    }
  };

  const tabs: { id: CreateTab; label: string; icon: typeof FileText }[] = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "media", label: "Media", icon: Image },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const isValid = form.title.length > 0;

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
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
              icon={<Plus className="w-4 h-4" />}
              text="Create Post"
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-league-700 mb-2">New Post</h1>
          <p className="text-[var(--foreground)]/50 mb-8">
            Share your thoughts, stories, and insights with the world.
          </p>

          {pageError && <ErrorMessage message={pageError} onDismiss={() => setPageError(null)} />}

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
                <Textinput
                  label="Title"
                  desc="e.g., Getting Started with React Server Components"
                  value={form.title}
                  onChange={(v) => set("title", v)}
                  required
                />

                <Textinput
                  label="Category"
                  desc="e.g., Technology, Design, Tutorial"
                  value={form.category ?? ""}
                  onChange={(v) => set("category", v)}
                />

                <MarkdownEditor
                  label="Content"
                  hint="Write your post content in Markdown"
                  value={form.body ?? ""}
                  onChange={(v) => set("body", v)}
                  minHeight="200px"
                />

                <TextArea
                  label="Excerpt"
                  desc="A short summary that appears in previews"
                  value={form.excerpt ?? ""}
                  onChange={(v) => set("excerpt", v)}
                />

                {/* Tags */}
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

                {/* Meta */}
                <div className="space-y-4">
                  <Textinput
                    label="Meta Title"
                    desc="SEO title (optional)"
                    value={form.meta_title ?? ""}
                    onChange={(v) => set("meta_title", v)}
                  />
                  <Textinput
                    label="Meta Description"
                    desc="SEO description (optional)"
                    value={form.meta_description ?? ""}
                    onChange={(v) => set("meta_description", v)}
                  />
                </div>
              </>
            )}

            {activeTab === "media" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Cover Image</h3>
                  <p className="text-xs text-[var(--foreground)]/40">
                    Main image displayed at the top of your post
                  </p>
                  <FileInput
                    value={form.coverImage}
                    onChange={(file) => setForm((prev) => ({ ...prev, coverImage: file }))}
                  />
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Status */}
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

                {/* Visibility */}
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

                {/* Featured */}
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

                {/* Pinned */}
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

                {/* Allow Comments */}
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

                {/* Allow Likes */}
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

                {/* Allow Reshare */}
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
