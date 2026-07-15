// portfolio-builder/components/sections/hero/editor-components/MediaTab.tsx

import { useState } from "react";
import { HeroData, HeroMediaType, HeroMediaShape, HeroMediaSize } from "@/portfolio-builder/types/hero";
import SelectField from './SelectField';
import Field from './Field';
import { ImageField } from "@/src/app/components/cloudinary/ImageField";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useParams } from "next/navigation";
import { useCloudinaryCore } from "@/lib/stores/cloudinary/useCloudinaryCore";
import { Textinput } from "@/src/app/components/inputs/Textinput";

interface MediaTabProps {
    data: HeroData;
    onUpdate: (value: Partial<HeroData["media"]>) => void;
}

const MEDIA_TYPE_OPTIONS: { value: HeroMediaType; label: string }[] = [
    { value: "none", label: "None" },
    { value: "image", label: "Image" },
    { value: "lottie", label: "Lottie Animation" },
    { value: "video", label: "Video" },
];

const SHAPE_OPTIONS: { value: HeroMediaShape; label: string }[] = [
    { value: "circle", label: "Circle" },
    { value: "rounded", label: "Rounded" },
    { value: "square", label: "Square" },
    { value: "portrait", label: "Portrait (3:4)" },
    { value: "landscape", label: "Landscape (16:9)" },
];

const SIZE_OPTIONS: { value: HeroMediaSize; label: string }[] = [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
];

function getUrlForType(media: HeroData["media"]): string | null {
    if (!media) return null;
    switch (media.type) {
        case "image": return media.imageUrl || null;
        case "lottie": return media.lottieUrl || null;
        case "video": return media.videoUrl || null;
        default: return null;
    }
}

function getUrlKey(type: HeroMediaType): "imageUrl" | "lottieUrl" | "videoUrl" | null {
    switch (type) {
        case "image": return "imageUrl";
        case "lottie": return "lottieUrl";
        case "video": return "videoUrl";
        default: return null;
    }
}

function extractCloudinaryInfo(url: string): { publicId: string; resourceType: "image" | "video" | "raw" } | null {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/");
        const uploadIndex = pathParts.indexOf("upload");
        if (uploadIndex === -1) return null;
        const publicIdWithExt = pathParts.slice(uploadIndex + 2).join("/");
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
        let resourceType: "image" | "video" | "raw" = "image";
        if (pathParts.includes("video")) resourceType = "video";
        else if (publicIdWithExt.endsWith(".json")) resourceType = "raw";
        return { publicId, resourceType };
    } catch {
        return null;
    }
}

export default function MediaTab({ data, onUpdate }: MediaTabProps) {
    const mediaType = data.media?.type ?? "none";
    const currentUrl = getUrlForType(data.media);
    const { userInfo } = useUserSettings();
    const params = useParams();
    const portfolioId = params.portfolio as string;
    const { deleteAsset } = useCloudinaryCore();

    const [pendingType, setPendingType] = useState<HeroMediaType | null>(null);

    const handleTypeChange = (value: HeroMediaType) => {
        if (currentUrl && value !== mediaType) {
            setPendingType(value);
        } else {
            commitTypeChange(value);
        }
    };

    const commitTypeChange = async (value: HeroMediaType) => {
        if (currentUrl) {
            const cloudinaryInfo = extractCloudinaryInfo(currentUrl);
            if (cloudinaryInfo) {
                try {
                    await deleteAsset(
                        cloudinaryInfo.publicId,
                        cloudinaryInfo.resourceType,
                        true
                    );
                } catch {
                    console.warn("Failed to delete old Cloudinary asset during type switch");
                }
            }
        }

        onUpdate({
            type: value,
            imageUrl: "",
            lottieUrl: "",
            videoUrl: "",
        });
        setPendingType(null);
    };

    const handleUrlChange = (url: string | null) => {
        const key = getUrlKey(mediaType);
        if (!key) return;
        onUpdate({ [key]: url || "" });
    };

    const uploadLabel =
        mediaType === "lottie" ? "Lottie JSON" :
            mediaType === "video" ? "Video" :
                "Image";

    return (
        <div className="flex flex-col gap-4">
            {/* ── Type ───────────────────────────────────────────────── */}
            <SelectField
                label="Media Type"
                id="mediaType"
                value={mediaType}
                onChange={(v) => handleTypeChange(v as HeroMediaType)}
                options={MEDIA_TYPE_OPTIONS}
            />

            {/* ── Confirm type switch warning ─────────────────────────── */}
            {pendingType && (
                <div className="rounded-lg border border-[var(--pb-warning-border)] bg-[var(--pb-warning-bg)] px-3 py-3 flex flex-col gap-2">
                    <p className="text-xs text-[var(--pb-warning)] leading-snug">
                        Switching to <span className="font-semibold">{pendingType}</span> will clear your current upload. Continue?
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => commitTypeChange(pendingType)}
                            className="text-xs font-medium px-3 py-1 rounded-md bg-[var(--pb-warning)]/20 text-[var(--pb-warning)] hover:bg-[var(--pb-warning)]/30 transition-colors"
                        >
                            Yes, switch
                        </button>
                        <button
                            type="button"
                            onClick={() => setPendingType(null)}
                            className="text-xs font-medium px-3 py-1 rounded-md bg-[var(--pb-surface-elevated)] text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)] transition-colors border border-[var(--pb-border)]"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ── None empty state ───────────────────────────────────── */}
            {mediaType === "none" && (
                <p className="text-xs text-[var(--pb-text-muted)] leading-relaxed px-0.5">
                    No media shown. Choose <span className="font-medium text-[var(--pb-text-primary)]">Image</span>{` to add a profile photo,`} <span className="font-medium text-[var(--pb-text-primary)]">Lottie</span> {`for an animation, or`} <span className="font-medium text-[var(--pb-text-primary)]">Video</span> {`for a looping clip alongside your text.`}
                </p>
            )}

            {/* ── Upload ─────────────────────────────────────────────── */}
            {mediaType !== "none" && (
                <Field label={`Upload ${uploadLabel}`} htmlFor="mediaUpload">
                    <ImageField
                        url={currentUrl}
                        onChange={handleUrlChange}
                        folder={`${userInfo?.id}/portfolios/${portfolioId}/hero/${mediaType}`}
                        accept={mediaType}
                    />
                </Field>
            )}

            {/* ── Shape & Size (when media is active) ───────────────── */}
            {mediaType !== "none" && (
                <>
                    <SelectField
                        label="Shape"
                        id="mediaShape"
                        value={data.media?.shape ?? "circle"
                        }
                        onChange={(v) => onUpdate({ shape: v as HeroMediaShape })}
                        options={SHAPE_OPTIONS}
                    />

                    <SelectField
                        label="Size"
                        id="mediaSize"
                        value={data.media?.size ?? "md"}
                        onChange={(v) => onUpdate({ size: v as HeroMediaSize })}
                        options={SIZE_OPTIONS}
                    />
                </>
            )}
        </div>
    );
}