"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import type { ContentCreatePayload } from "@/lib/stores/contents/types/content.types";
import { ErrorMessage } from "../ui/ErrorMessage";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { CreateBlogHeader } from "./createBlogPageComponents/CreateBlogHeader";
import { CreateBlogTabs, type CreateBlogTab } from "./createBlogPageComponents/CreateBlogTabs";
import { BlogBasicInfoTab } from "./createBlogPageComponents/BlogBasicInfoTab";
import { BlogMediaTab } from "./createBlogPageComponents/BlogMediaTab";
import { BlogSettingsTab } from "./createBlogPageComponents/BlogSettingsTab";

type BlogFormState = ContentCreatePayload & { coverImage: File | null };

export default function CreateBlogPage() {
  const router = useRouter();
  const { createContent, isSubmitting, error } = useContentStore();
  const { userInfo } = useUserSettings();

  const [activeTab, setActiveTab] = useState<CreateBlogTab>("basic");
  const [pageError, setPageError] = useState<string | null>(null);
  const [tagsList, setTagsList] = useState<string[]>([]);

  const [form, setForm] = useState<BlogFormState>({
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

  const set = (key: keyof BlogFormState, value: unknown) =>
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

  const isValid = form.title.length > 0;

  return (
    <div className="min-h-screen">
      <CreateBlogHeader
        onBack={() => router.back()}
        onSubmit={handleSubmit}
        isValid={isValid}
        isLoading={isSubmitting}
      />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-league-700 mb-2">New Post</h1>
          <p className="text-[var(--foreground)]/50 mb-8">
            Share your thoughts, stories, and insights with the world.
          </p>

          {pageError && (
            <ErrorMessage message={pageError} onDismiss={() => setPageError(null)} />
          )}

          <CreateBlogTabs activeTab={activeTab} onChange={setActiveTab} />

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === "basic" && (
              <BlogBasicInfoTab
                form={form}
                set={set}
                tagsList={tagsList}
                setTagsList={setTagsList}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === "media" && (
              <BlogMediaTab
                coverImage={form.coverImage}
                onCoverImageChange={(file) => set("coverImage", file)}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === "settings" && (
              <BlogSettingsTab
                form={form}
                set={set}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}