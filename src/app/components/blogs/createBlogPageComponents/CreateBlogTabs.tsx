"use client";

import { FileText, Image, Settings } from "lucide-react";

export type CreateBlogTab = "basic" | "media" | "settings";

const tabs: { id: CreateBlogTab; label: string; icon: typeof FileText }[] = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "media", label: "Media", icon: Image },
    { id: "settings", label: "Settings", icon: Settings },
];

interface CreateBlogTabsProps {
    activeTab: CreateBlogTab;
    onChange: (tab: CreateBlogTab) => void;
}

export function CreateBlogTabs({ activeTab, onChange }: CreateBlogTabsProps) {
    return (
        <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[var(--foreground)]/5 w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
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
    );
}