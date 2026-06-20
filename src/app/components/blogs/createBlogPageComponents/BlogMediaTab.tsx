"use client";

import { FileInput } from "../../inputs/FileInput";
import { CreateBlogBottomNav } from "./CreateBlogBottomNav";
import type { CreateBlogTab } from "./CreateBlogTabs";

interface BlogMediaTabProps {
    coverImage: File | null;
    onCoverImageChange: (file: File | null) => void;
    activeTab: CreateBlogTab;
    onTabChange: (tab: CreateBlogTab) => void;
}

export function BlogMediaTab({
    coverImage,
    onCoverImageChange,
    activeTab,
    onTabChange,
}: BlogMediaTabProps) {
    return (
        <>
            <div className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-medium">Cover Image</h3>
                    <p className="text-xs text-[var(--foreground)]/40">
                        Main image displayed at the top of your post
                    </p>
                    <FileInput value={coverImage} onChange={onCoverImageChange} />
                </div>
            </div>

            <CreateBlogBottomNav activeTab={activeTab} onChange={onTabChange} />
        </>
    );
}