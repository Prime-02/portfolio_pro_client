// portfolio-builder/components/sections/hero/editor-components/LayoutMediaTab.tsx

import { useState } from "react";
import {
    HeroData,
    HeroLayout,
    HeroAlignment,
    HeroHeight,
    HeroMediaPosition,
    HeroVerticalAlignment,
    HeroMediaType,
    HeroMediaShape,
    HeroMediaSize,
    MobileMediaPosition,
} from "@/portfolio-builder/types/hero";
import SelectField from "./SelectField";
import Field from "./Field";
import { PBRangeInput, PBSwitch } from "@/portfolio-builder/components/shared/ui/inputs";
import { ImageField } from "@/src/app/components/cloudinary/ImageField";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useParams } from "next/navigation";
import { useCloudinaryCore } from "@/lib/stores/cloudinary/useCloudinaryCore";

interface LayoutMediaTabProps {
    data: HeroData;
    onChange: <K extends keyof HeroData>(key: K, value: HeroData[K]) => void;
}

// ---------------------------------------------------------------------------
// Option definitions
// ---------------------------------------------------------------------------

const LAYOUT_OPTIONS: {
    value: HeroLayout;
    label: string;
    description: string;
    preview: React.ReactNode;
}[] = [
        {
            value: "centered",
            label: "Centered",
            description: "Everything stacked, middle-aligned",
            preview: (
                <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect x="14" y="4" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
                    <rect x="10" y="10" width="28" height="5" rx="1.5" fill="currentColor" opacity="0.6" />
                    <rect x="16" y="18" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
                    <rect x="18" y="25" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.25" />
                </svg>
            ),
        },
        {
            value: "split",
            label: "Split",
            description: "Text on one side, media on the other",
            preview: (
                <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect x="4" y="6" width="18" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
                    <rect x="4" y="12" width="18" height="2" rx="1" fill="currentColor" opacity="0.5" />
                    <rect x="4" y="17" width="14" height="2" rx="1" fill="currentColor" opacity="0.4" />
                    <rect x="4" y="23" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.25" />
                    <rect x="28" y="4" width="16" height="24" rx="3" fill="currentColor" opacity="0.15" />
                    <circle cx="36" cy="16" r="6" fill="currentColor" opacity="0.3" />
                </svg>
            ),
        },
        {
            value: "minimal",
            label: "Minimal",
            description: "Just name and title, no extras",
            preview: (
                <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect x="4" y="11" width="24" height="4" rx="2" fill="currentColor" opacity="0.9" />
                    <rect x="4" y="19" width="16" height="2.5" rx="1.25" fill="currentColor" opacity="0.45" />
                </svg>
            ),
        },
    ];

const ALIGNMENT_OPTIONS: { value: HeroAlignment; label: string }[] = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
];

const SPLIT_ALIGNMENT_OPTIONS: { value: HeroAlignment; label: string }[] = [
    { value: "left", label: "Left" },
    { value: "right", label: "Right" },
    { value: "center", label: "Center" },
];

const HEIGHT_OPTIONS: {
    value: HeroHeight;
    label: string;
    hint: string;
}[] = [
        {
            value: "screen",
            label: "Full Screen",
            hint: "Exactly 100vh — always fills the viewport",
        },
        {
            value: "min-screen",
            label: "Min Full Screen",
            hint: "At least 100vh, expands if content overflows",
        },
        {
            value: "auto",
            label: "Auto",
            hint: "Shrinks to fit content — no forced height",
        },
    ];

const VERTICAL_ALIGNMENT_OPTIONS: {
    value: HeroVerticalAlignment;
    label: string;
}[] = [
        { value: "top", label: "Top" },
        { value: "center", label: "Center" },
        { value: "bottom", label: "Bottom" },
    ];

const MEDIA_POSITION_OPTIONS: {
    value: HeroMediaPosition;
    label: string;
}[] = [
        { value: "right", label: "Right (media on right)" },
        { value: "left", label: "Left (media on left)" },
    ];

const MOBILE_MEDIA_POSITION_OPTIONS: {
    value: MobileMediaPosition;
    label: string;
}[] = [
        { value: "below", label: "Show below text" },
        { value: "above", label: "Show above text" },
        { value: "hide", label: "Hide on mobile" },
    ];

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

// ---------------------------------------------------------------------------
// Media helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Toggle({
    label,
    hint,
    checked,
    onChange,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-3 py-2">
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-[var(--pb-text-primary)]">{label}</span>
                {hint && <span className="text-xs text-[var(--pb-text-muted)]">{hint}</span>}
            </div>
            <PBSwitch
                isSwitched={checked}
                onSwitch={onChange}
            />
        </div>
    );
}

function NumberField({
    label,
    value,
    min,
    max,
    step,
    onChange,
}: {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <PBRangeInput
                value={value ?? 1}
                min={min}
                label={label}
                max={max}
                step={step ?? 1}
                onChange={(e) => onChange(Number(e))}
            />
        </div>
    );
}

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--pb-text-muted)]">
                {label}
            </span>
            <div className="flex-1 h-px bg-[var(--pb-border)]" />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LayoutMediaTab({ data, onChange }: LayoutMediaTabProps) {
    const isSplit = data.layout === "split";
    const heightHint = HEIGHT_OPTIONS.find((o) => o.value === (data.height ?? "screen"))?.hint;

    const mediaType = data.media?.type ?? "none";
    const currentUrl = getUrlForType(data.media);
    const { userInfo } = useUserSettings();
    const params = useParams();
    const portfolioId = params.portfolio as string;
    const { deleteAsset } = useCloudinaryCore();

    const [pendingType, setPendingType] = useState<HeroMediaType | null>(null);

    function handleEffectChange(key: "scrollIndicator", value: boolean) {
        onChange("effects", { ...data.effects, [key]: value });
    }

    function handlePaddingChange(side: "top" | "bottom", value: number) {
        onChange("padding", { ...data.padding, [side]: value });
    }

    function handleMediaUpdate(value: Partial<NonNullable<HeroData["media"]>>) {
        onChange("media", { ...(data.media ?? { type: "none" }), ...value } as HeroData["media"]);
    }

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

        handleMediaUpdate({
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
        handleMediaUpdate({ [key]: url || "" });
    };

    const uploadLabel =
        mediaType === "lottie" ? "Lottie JSON" :
            mediaType === "video" ? "Video" :
                "Image";

    const [activeSection, setActiveSection] = useState<"layout" | "media">("layout");

    return (
        <div className="flex flex-col gap-4">
            {/* ── Sub-tab switcher ──────────────────────────────────── */}
            <div className="flex gap-1 rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] p-1">
                {(["layout", "media"] as const).map((section) => {
                    const active = activeSection === section;
                    return (
                        <button
                            key={section}
                            type="button"
                            onClick={() => setActiveSection(section)}
                            className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-accent)] ${active
                                ? "bg-[var(--pb-foreground)] text-[var(--pb-background)]"
                                : "text-[var(--pb-text-muted)] hover:text-[var(--pb-text-secondary)]"
                                }`}
                        >
                            {section}
                        </button>
                    );
                })}
            </div>

            {activeSection === "layout" && (
                <>
                    {/* ── Layout picker ─────────────────────────────────────── */}
                    <SectionDivider label="Layout" />

                    <div className="grid grid-cols-3 gap-2">
                        {LAYOUT_OPTIONS.map(({ value, label, description, preview }) => {
                            const active = data.layout === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => onChange("layout", value)}
                                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-accent)] hover:border-[var(--pb-accent)]/60 ${active
                                        ? "border-[var(--pb-foreground)] bg-[var(--pb-foreground-10)] text-[var(--pb-foreground)]"
                                        : "border-[var(--pb-border)] bg-[var(--pb-surface)] text-[var(--pb-text-muted)] hover:bg-[var(--pb-surface-hover)]"
                                        }`}
                                >
                                    <div className="h-10 w-full">{preview}</div>
                                    <div className="flex flex-col items-center gap-0.5 text-center">
                                        <span className={`text-xs font-semibold ${active ? "text-[var(--pb-text-primary)]" : "text-[var(--pb-text-secondary)]"}`}>
                                            {label}
                                        </span>
                                        <span className="text-[10px] leading-tight text-[var(--pb-text-muted)]">
                                            {description}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Split-specific layout options (tied directly to the layout choice above) ── */}
                    {isSplit && (
                        <>
                            <SectionDivider label="Split Options" />
                            <SelectField
                                label="Media Position"
                                id="mediaPosition"
                                value={data.mediaPosition ?? "right"}
                                onChange={(value) =>
                                    onChange("mediaPosition", value as HeroMediaPosition)
                                }
                                options={MEDIA_POSITION_OPTIONS}
                            />

                            <NumberField
                                label="Split Ratio (text width %)"
                                value={data.splitRatio ?? 50}
                                min={20}
                                max={80}
                                step={5}
                                onChange={(v) => onChange("splitRatio", v)}
                            />
                            <p className="text-xs text-[var(--pb-text-muted)] -mt-2 pl-0.5">
                                How much width the text column gets — the media column takes the rest.
                            </p>
                        </>
                    )}

                    {/* ── Alignment ─────────────────────────────────────────── */}
                    <SectionDivider label="Alignment" />

                    <SelectField
                        label="Horizontal"
                        id="alignment"
                        value={data.alignment ?? (isSplit ? "left" : "center")}
                        onChange={(value) => onChange("alignment", value as HeroAlignment)}
                        options={isSplit ? SPLIT_ALIGNMENT_OPTIONS : ALIGNMENT_OPTIONS}
                    />

                    <SelectField
                        label="Vertical"
                        id="verticalAlignment"
                        value={data.verticalAlignment ?? "center"}
                        onChange={(value) =>
                            onChange("verticalAlignment", value as HeroVerticalAlignment)
                        }
                        options={VERTICAL_ALIGNMENT_OPTIONS}
                    />

                    {/* ── Height ────────────────────────────────────────────── */}
                    <SectionDivider label="Height" />

                    <SelectField
                        label="Height"
                        id="height"
                        value={data.height ?? "screen"}
                        onChange={(value) => onChange("height", value as HeroHeight)}
                        options={HEIGHT_OPTIONS.map(({ value, label }) => ({ value, label }))}
                    />

                    {heightHint && (
                        <p className="text-xs text-[var(--pb-text-muted)] -mt-2 pl-0.5">{heightHint}</p>
                    )}

                    {/* ── Padding ───────────────────────────────────────────── */}
                    <SectionDivider label="Padding" />

                    <div className="grid grid-cols-1 gap-3">
                        <NumberField
                            label="Top"
                            value={data.padding?.top ?? 0}
                            min={0}
                            max={400}
                            step={4}
                            onChange={(v) => handlePaddingChange("top", v)}
                        />
                        <NumberField
                            label="Bottom"
                            value={data.padding?.bottom ?? 0}
                            min={0}
                            max={400}
                            step={4}
                            onChange={(v) => handlePaddingChange("bottom", v)}
                        />
                    </div>

                    {/* ── Extras ────────────────────────────────────────────── */}
                    <SectionDivider label="Extras" />

                    <Toggle
                        label="Scroll Indicator"
                        hint="Shows a subtle down-arrow at the bottom of the section"
                        checked={data.effects?.scrollIndicator ?? true}
                        onChange={(v) => handleEffectChange("scrollIndicator", v)}
                    />
                </>
            )}

            {activeSection === "media" && (
                <>
                    {/* ── Media ─────────────────────────────────────────────── */}
                    <SectionDivider label="Media" />

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
                                value={data.media?.shape ?? "circle"}
                                onChange={(v) => handleMediaUpdate({ shape: v as HeroMediaShape })}
                                options={SHAPE_OPTIONS}
                            />

                            <SelectField
                                label="Size"
                                id="mediaSize"
                                value={data.media?.size ?? "md"}
                                onChange={(v) => handleMediaUpdate({ size: v as HeroMediaSize })}
                                options={SIZE_OPTIONS}
                            />
                        </>
                    )}

                    {/* ── Split-specific media options ──────────────────────── */}
                    {isSplit && mediaType !== "none" && (
                        <>
                            <Toggle
                                label="Fill Full Height"
                                hint="Media becomes a true split-screen panel — full width and height of its column, flush with the section's edges"
                                checked={data.media?.fullHeight ?? false}
                                onChange={(v) => handleMediaUpdate({ fullHeight: v })}
                            />

                            {data.media?.fullHeight && (
                                <>
                                    <NumberField
                                        label="Corner Radius"
                                        value={data.media?.edgeRadius ?? 0}
                                        min={0}
                                        max={80}
                                        step={4}
                                        onChange={(v) => handleMediaUpdate({ edgeRadius: v })}
                                    />
                                    <p className="text-xs text-[var(--pb-text-muted)] -mt-2 pl-0.5">
                                        Rounds only the inner edge, where the media meets your text — the outer edges stay flush with the screen.
                                    </p>
                                </>
                            )}

                            <SelectField
                                label="Mobile Behavior"
                                id="mobileMediaPosition"
                                value={data.media?.mobilePosition ?? "below"}
                                onChange={(v) => handleMediaUpdate({ mobilePosition: v as MobileMediaPosition })}
                                options={MOBILE_MEDIA_POSITION_OPTIONS}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}