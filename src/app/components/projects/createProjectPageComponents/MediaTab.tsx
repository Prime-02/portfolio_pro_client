"use client";

import { FileInput } from "../../inputs/FileInput";
import { CreateProjectBottomNav } from "./CreateProjectBottomNav";
import type { CreateTab } from "./CreateProjectTabs";

type MediaSlots = Record<string, File | null>;

interface MediaSlotProps {
    label: string;
    description: string;
    value: File | null;
    onChange: (file: File | null) => void;
}

function MediaSlot({ label, description, value, onChange }: MediaSlotProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium">{label}</h3>
            <p className="text-xs text-[var(--foreground)]/40">{description}</p>
            <FileInput value={value} onChange={onChange} />
        </div>
    );
}

interface MediaTabProps {
    mediaSlots: MediaSlots;
    onSlotChange: (key: string, file: File | null) => void;
    activeTab: CreateTab;
    onTabChange: (tab: CreateTab) => void;
}

export function MediaTab({ mediaSlots, onSlotChange, activeTab, onTabChange }: MediaTabProps) {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MediaSlot
                    label="Hero Image"
                    description="Main showcase image — displayed prominently in listings"
                    value={mediaSlots.hero_media}
                    onChange={(file) => onSlotChange("hero_media", file)}
                />
                <MediaSlot
                    label="Media 1"
                    description="Additional screenshot or image"
                    value={mediaSlots.media_1}
                    onChange={(file) => onSlotChange("media_1", file)}
                />
                <MediaSlot
                    label="Media 2"
                    description="Additional screenshot or image"
                    value={mediaSlots.media_2}
                    onChange={(file) => onSlotChange("media_2", file)}
                />
                <MediaSlot
                    label="Media 3"
                    description="Additional screenshot or image"
                    value={mediaSlots.media_3}
                    onChange={(file) => onSlotChange("media_3", file)}
                />
            </div>

            <CreateProjectBottomNav activeTab={activeTab} onChange={onTabChange} />
        </>
    );
}