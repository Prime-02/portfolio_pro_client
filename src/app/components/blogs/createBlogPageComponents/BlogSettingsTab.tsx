"use client";

import { Textinput } from "../../inputs/Textinput";
import { CreateBlogBottomNav } from "./CreateBlogBottomNav";
import type { CreateBlogTab } from "./CreateBlogTabs";
import type { ContentCreatePayload, ContentStatus } from "@/lib/stores/contents/types/content.types";

type BlogFormState = ContentCreatePayload & { coverImage: File | null };

interface ToggleRowProps {
    label: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
    activeColor?: string;
}

function ToggleRow({
    label,
    description,
    checked,
    onToggle,
    activeColor = "bg-[var(--accent)]",
}: ToggleRowProps) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-[var(--foreground)]/40 mt-0.5">{description}</p>
            </div>
            <button
                type="button"
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${checked ? activeColor : "bg-[var(--foreground)]/20"}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${checked ? "translate-x-6" : "translate-x-1"}`}
                />
            </button>
        </div>
    );
}

interface BlogSettingsTabProps {
    form: BlogFormState;
    set: (key: keyof BlogFormState, value: unknown) => void;
    activeTab: CreateBlogTab;
    onTabChange: (tab: CreateBlogTab) => void;
}

export function BlogSettingsTab({ form, set, activeTab, onTabChange }: BlogSettingsTabProps) {
    return (
        <div className="space-y-6">
            <Textinput
                type="dropdown"
                label="Status"
                options={[
                    { id: "DRAFT", code: "Draft" },
                    { id: "PUBLISHED", code: "Published" },
                    { id: "SCHEDULED", code: "Scheduled" },
                    { id: "ARCHIVED", code: "Archived" },
                ]}
                value={form.status ?? "PUBLISHED"}
                onChange={(v) => set("status", v as ContentStatus)}
            />

            <ToggleRow
                label="Public Post"
                description="Visible to everyone on your profile"
                checked={form.is_public ?? true}
                onToggle={() => set("is_public", !form.is_public)}
            />

            <ToggleRow
                label="Featured Post"
                description="Highlight this post in your portfolio"
                checked={form.is_featured ?? false}
                onToggle={() => set("is_featured", !form.is_featured)}
                activeColor="bg-amber-500"
            />

            <ToggleRow
                label="Pinned Post"
                description="Keep this post at the top of your list"
                checked={form.is_pinned ?? false}
                onToggle={() => set("is_pinned", !form.is_pinned)}
                activeColor="bg-blue-500"
            />

            <ToggleRow
                label="Allow Comments"
                description="Let readers leave comments on this post"
                checked={form.allow_comments ?? true}
                onToggle={() => set("allow_comments", !form.allow_comments)}
                activeColor="bg-emerald-500"
            />

            <ToggleRow
                label="Allow Likes"
                description="Let readers like this post"
                checked={form.allow_likes ?? true}
                onToggle={() => set("allow_likes", !form.allow_likes)}
                activeColor="bg-emerald-500"
            />

            <ToggleRow
                label="Allow Reshare"
                description="Let others share this post to their profile"
                checked={form.allow_reshare ?? true}
                onToggle={() => set("allow_reshare", !form.allow_reshare)}
                activeColor="bg-emerald-500"
            />

            <CreateBlogBottomNav activeTab={activeTab} onChange={onTabChange} />
        </div>
    );
}