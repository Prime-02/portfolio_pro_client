"use client";

import { useState } from "react";
import { Textinput } from "../../inputs/Textinput";
import { TextArea } from "../../inputs/TextArea";
import MarkdownEditor from "../../markdown/MarkdownEditor";
import { CreateBlogBottomNav } from "./CreateBlogBottomNav";
import type { CreateBlogTab } from "./CreateBlogTabs";
import type { ContentCreatePayload } from "@/lib/stores/contents/types/content.types";

type BlogFormState = ContentCreatePayload & { coverImage: File | null };

interface BlogBasicInfoTabProps {
    form: BlogFormState;
    set: (key: keyof BlogFormState, value: unknown) => void;
    tagsList: string[];
    setTagsList: (tags: string[]) => void;
    activeTab: CreateBlogTab;
    onTabChange: (tab: CreateBlogTab) => void;
}

export function BlogBasicInfoTab({
    form,
    set,
    tagsList,
    setTagsList,
    activeTab,
    onTabChange,
}: BlogBasicInfoTabProps) {
    const [tagInput, setTagInput] = useState("");

    const handleAddTag = (val: string) => {
        if (!tagsList.includes(val)) {
            setTagsList([...tagsList, val]);
        }
        setTagInput("");
    };

    return (
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
                <div className="flex gap-2 flex-col mb-2">
                    <Textinput
                        label="Tags"
                        type="text"
                        value={tagInput}
                        onChange={(v) => setTagInput(v)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && tagInput.trim()) {
                                handleAddTag(tagInput.trim());
                            }
                        }}
                        desc="Add tag and press Enter"
                        className="w-full"
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

            {/* SEO Meta */}
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

            <CreateBlogBottomNav activeTab={activeTab} onChange={onTabChange} />
        </>
    );
}