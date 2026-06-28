// portfolio-builder/components/sections/layout/editor-components/NavbarTab.tsx

"use client";

import { useState } from "react";
import { NavbarData, getEmptyNavbarData, SectionLink } from "@/portfolio-builder/types/layout";
import BackgroundTab from "@/portfolio-builder/components/shared/editor/BackgroundTab";
import { BioCTA } from "@/portfolio-builder/types/bio";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { PBDropdown, PBTextInput } from "@/portfolio-builder/components/shared/ui/inputs";
import { ImageField } from "@/src/app/components/cloudinary/ImageField";
import { useParams } from "next/navigation";
import { useCloudinaryCore } from "@/lib/stores/cloudinary/useCloudinaryCore";

interface NavbarTabProps {
    data: NavbarData;
    onChange: (updated: NavbarData) => void;
    availableSections: string[];
    sectionLinks: SectionLink[];
}

// ── Cloudinary helpers ────────────────────────────────────────────────────────

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

// ── Shared sub-components ────────────────────────────────────────────────────

function Toggle({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm text-[var(--pb-text-secondary)]">{label}</span>
                {description && (
                    <span className="text-xs text-[var(--pb-text-muted)] leading-snug">{description}</span>
                )}
            </div>
            <div className="relative flex-shrink-0 mt-0.5">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                />
                <div
                    className={`w-9 h-5 rounded-full transition-colors ${checked ? "bg-[var(--pb-foreground)]" : "bg-[var(--pb-foreground-20)]"
                        }`}
                />
                <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--pb-background)] shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"
                        }`}
                />
            </div>
        </label>
    );
}

export function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--pb-text-muted)] whitespace-nowrap">
                {label}
            </span>
            <div className="flex-1 h-px bg-[var(--pb-border)]" />
        </div>
    );
}

// ── Layout presets ────────────────────────────────────────────────────────────

const LAYOUT_PRESETS = [
    {
        id: "default",
        code: "Logo Left · Links Right",
    },
    {
        id: "centered",
        code: "Centered",
    },
    {
        id: "minimal",
        code: "Links Only",
    },
    {
        id: "sidebar",
        code: "Logo Left · Links Center",
    },
];

const POSITIONS = [
    { id: "fixed", code: "Fixed — Always visible at top" },
    { id: "sticky", code: "Sticky — Stays at top after scroll" },
    { id: "absolute", code: "Absolute — Overlays hero section" },
    { id: "relative", code: "Static — Normal page flow" },
];

const LOGO_TYPES = [
    { id: "text", code: "Text Logo" },
    { id: "image", code: "Image Logo" },
];

// ── CTA multi-button editor (mirrors Bio's CTATab) ────────────────────────────

const MAX_CTA = 2;

const CTA_VARIANT_OPTIONS = [
    { id: "primary", code: "Primary — Solid filled" },
    { id: "secondary", code: "Secondary — Muted fill" },
    { id: "outline", code: "Outline — Bordered" },
    { id: "ghost", code: "Ghost — No fill" },
    { id: "link", code: "Link — Text only" },
];

function validateUrl(url: string): string | null {
    if (!url.trim()) return null;
    const valid =
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/") ||
        url.startsWith("#") ||
        url.startsWith("mailto:") ||
        url.startsWith("tel:");
    return valid ? null : 'Must start with "https://", "/", "#", "mailto:", or "tel:"';
}

const EXTERNAL_LINK_ID = "__external__";

function UrlPicker({
    value,
    username,
    onChange,
}: {
    value: string;
    username: string;
    onChange: (url: string) => void;
}) {
    const internalOptions = [
        { id: `/${username}/profile`, code: "Your Profile" },
        { id: `/${username}/projects`, code: "Your Projects" },
        { id: `/${username}/socials`, code: "Your Social Media" },
        { id: `/${username}/experience`, code: "Your Experience" },
        { id: `/${username}/resume`, code: "Your CV / Resume" },
        { id: `/${username}/skills`, code: "Your Skills" },
        { id: `/${username}/testimonials`, code: "Your Testimonials" },
    ];

    const [mode, setMode] = useState<"internal" | "external">(() =>
        internalOptions.some((o) => o.id === value) ? "internal" : value.trim() ? "external" : "internal"
    );

    const allOptions = [...internalOptions, { id: EXTERNAL_LINK_ID, code: "🔗 External Link..." }];
    const dropdownValue =
        mode === "internal" && internalOptions.some((o) => o.id === value)
            ? value
            : mode === "external"
                ? EXTERNAL_LINK_ID
                : "";

    return (
        <div className="space-y-2">
            <PBDropdown
                options={allOptions}
                label="Link Destination"
                value={dropdownValue}
                onSelect={(val) => {
                    if (val === EXTERNAL_LINK_ID) {
                        setMode("external");
                        onChange("");
                    } else {
                        setMode("internal");
                        onChange(val as string);
                    }
                }}
                placeholder="Choose destination..."
                size="sm"
                includeNoneOption={false}
                clearable={false}
            />
            {mode === "external" && (
                <PBTextInput
                    label="External URL"
                    value={value}
                    onChange={onChange}
                    placeholder="https://example.com"
                    error={value.trim() ? validateUrl(value) || undefined : undefined}
                />
            )}
        </div>
    );
}

function CTAButtons({
    buttons,
    onChange,
}: {
    buttons: BioCTA[];
    onChange: (buttons: BioCTA[] | undefined) => void;
}) {
    const { userInfo } = useUserSettings();
    const username = userInfo?.username || "";
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
    const atLimit = buttons.length >= MAX_CTA;

    const toggle = (i: number) => setCollapsed((p) => ({ ...p, [i]: !p[i] }));

    const add = () => {
        const btn: BioCTA = { label: "Contact Me", url: "#contact", variant: "primary", openInNewTab: false };
        onChange([...buttons, btn]);
    };

    const update = (i: number, partial: Partial<BioCTA>) => {
        const next = [...buttons];
        next[i] = { ...next[i], ...partial };
        onChange(next);
    };

    const remove = (i: number) => {
        const next = buttons.filter((_, idx) => idx !== i);
        onChange(next.length > 0 ? next : undefined);
    };

    const reorder = (from: number, to: number) => {
        if (to < 0 || to >= buttons.length) return;
        const next = [...buttons];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onChange(next);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-[var(--pb-text-primary)]">CTA Buttons</p>
                    <p className="text-xs text-[var(--pb-text-muted)]">{buttons.length} / {MAX_CTA}</p>
                </div>
                <button
                    type="button"
                    onClick={add}
                    disabled={atLimit}
                    className={`text-sm px-3 py-1 rounded-md border transition-colors ${atLimit
                        ? "text-[var(--pb-text-disabled)] border-[var(--pb-border)] cursor-not-allowed opacity-50"
                        : "text-[var(--pb-text-primary)] border-[var(--pb-border)] hover:bg-[var(--pb-surface-hover)]"
                        }`}
                >
                    + Add
                </button>
            </div>

            {buttons.length === 0 && (
                <div className="rounded-lg border border-dashed border-[var(--pb-border)] py-5 text-center">
                    <p className="text-sm text-[var(--pb-text-muted)]">No CTA buttons. Add up to {MAX_CTA}.</p>
                </div>
            )}

            {buttons.map((btn, i) => {
                const isCollapsed = collapsed[i];
                const urlError = validateUrl(btn.url);
                return (
                    <div key={i} className="border border-[var(--pb-border)] rounded-lg overflow-hidden">
                        {/* Card header */}
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--pb-surface)]">
                            <div className="flex flex-col gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => reorder(i, i - 1)}
                                    disabled={i === 0}
                                    className="text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] disabled:opacity-30 text-[10px] leading-none"
                                >▲</button>
                                <button
                                    type="button"
                                    onClick={() => reorder(i, i + 1)}
                                    disabled={i === buttons.length - 1}
                                    className="text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] disabled:opacity-30 text-[10px] leading-none"
                                >▼</button>
                            </div>
                            <button
                                type="button"
                                onClick={() => toggle(i)}
                                className="flex-1 flex items-center gap-2 text-left min-w-0"
                            >
                                <span className="text-sm text-[var(--pb-text-primary)] truncate font-medium">
                                    {btn.label.trim() || `Button ${i + 1}`}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--pb-border)] text-[var(--pb-text-muted)] shrink-0 capitalize">
                                    {btn.variant}
                                </span>
                                {urlError && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-error-bg)] text-[var(--pb-error)] shrink-0 border border-[var(--pb-error-border)]">
                                        invalid url
                                    </span>
                                )}
                                <span className="ml-auto text-[var(--pb-text-muted)] text-xs">
                                    {isCollapsed ? "▼" : "▲"}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors px-1"
                            >✕</button>
                        </div>

                        {/* Card body */}
                        {!isCollapsed && (
                            <div className="p-3 space-y-3">
                                <PBTextInput
                                    label="Label"
                                    value={btn.label}
                                    onChange={(v) => update(i, { label: v })}
                                    placeholder="Contact Me"
                                />
                                <UrlPicker
                                    value={btn.url}
                                    username={username}
                                    onChange={(url) => update(i, { url })}
                                />
                                <PBDropdown
                                    options={CTA_VARIANT_OPTIONS}
                                    label="Variant"
                                    value={btn.variant}
                                    onSelect={(val) => update(i, { variant: val as BioCTA["variant"] })}
                                    placeholder="Select variant"
                                    size="sm"
                                    includeNoneOption={false}
                                    clearable={false}
                                />
                                <Toggle
                                    label="Open in new tab"
                                    checked={btn.openInNewTab || false}
                                    onChange={(v) => update(i, { openInNewTab: v })}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Logo Image Upload ─────────────────────────────────────────────────────────

function LogoImageUpload({
    logoImageUrl,
    onLogoImageChange,
}: {
    logoImageUrl: string | undefined;
    onLogoImageChange: (url: string | null) => void;
}) {
    const { userInfo } = useUserSettings();
    const params = useParams();
    const portfolioId = params.portfolio as string;
    const { deleteAsset } = useCloudinaryCore();

    const handleImageChange = async (url: string | null) => {
        // If there's an existing Cloudinary image, delete it before updating
        if (logoImageUrl && url !== logoImageUrl) {
            const cloudinaryInfo = extractCloudinaryInfo(logoImageUrl);
            if (cloudinaryInfo) {
                try {
                    await deleteAsset(
                        cloudinaryInfo.publicId,
                        cloudinaryInfo.resourceType,
                        true
                    );
                } catch {
                    console.warn("Failed to delete old Cloudinary logo image");
                }
            }
        }
        onLogoImageChange(url);
    };

    return (
        <ImageField
            url={logoImageUrl || null}
            onChange={handleImageChange}
            folder={`${userInfo?.id}/portfolio/${portfolioId}/navbar/logo`}
            accept="image"
        />
    );
}

// ── Range slider helper ───────────────────────────────────────────────────────

function RangeSlider({
    label,
    value,
    onChange,
    min = 0,
    max = 80,
    step = 4,
    unit = "px",
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}) {
    return (
        <div>
            <div className="flex justify-between mb-1">
                <label className="text-xs text-[var(--pb-text-muted)]">{label}</label>
                <span className="text-xs text-[var(--pb-text-muted)] tabular-nums">{value}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 appearance-none bg-[var(--pb-foreground-20)] rounded-full accent-[var(--pb-foreground)] cursor-pointer"
            />
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NavbarTab({ data, onChange, availableSections, sectionLinks }: NavbarTabProps) {
    const update = (partial: Partial<NavbarData>) => onChange({ ...data, ...partial });
    const visibleCount = (data.sectionLinks ?? sectionLinks).filter((l) => l.visible).length;
    const ctaButtons: BioCTA[] = (data.ctaButtons as BioCTA[] | undefined) ?? [];

    return (
        <div className="flex flex-col gap-5">

            {/* Enable */}
            <Toggle
                label="Enable Navbar"
                checked={data.enabled}
                onChange={(v) => update({ enabled: v })}
            />

            {data.enabled && (
                <>
                    <SectionDivider label="Layout" />

                    {/* Layout presets - using PBDropdown */}
                    <PBDropdown
                        options={LAYOUT_PRESETS}
                        value={data.layout}
                        onSelect={(val) => update({ layout: val as NavbarData["layout"] })}
                        placeholder="Select layout..."
                        size="md"
                        variant="outlined"
                        includeNoneOption={false}
                        clearable={false}
                    />

                    <SectionDivider label="Position" />

                    {/* Position - using PBDropdown */}
                    <PBDropdown
                        options={POSITIONS}
                        value={data.position}
                        onSelect={(val) => update({ position: val as NavbarData["position"] })}
                        placeholder="Select position..."
                        size="md"
                        variant="outlined"
                        includeNoneOption={false}
                        clearable={false}
                    />

                    <SectionDivider label="Mobile" />

                    {/* Mobile menu */}
                    <Toggle
                        label="Mobile Hamburger Menu"
                        description="Collapses links into a drawer on small screens"
                        checked={data.mobileMenu ?? true}
                        onChange={(v) => update({ mobileMenu: v })}
                    />

                    <SectionDivider label="Theme Toggle" />

                    {/* Theme toggle */}
                    <Toggle
                        label="Show Theme Toggle"
                        description="Adds a light/dark/system theme switcher to the navbar"
                        checked={data.showThemeToggle ?? false}
                        onChange={(v) => update({ showThemeToggle: v })}
                    />

                    <SectionDivider label="Logo" />

                    {/* Logo */}
                    <Toggle
                        label="Show Logo"
                        checked={data.showLogo ?? true}
                        onChange={(v) => update({ showLogo: v })}
                    />

                    {data.showLogo && (
                        <div className="space-y-3">
                            {/* Logo type - using PBDropdown */}
                            <PBDropdown
                                options={LOGO_TYPES}
                                value={data.logoType || "text"}
                                onSelect={(val) => update({ logoType: val as "text" | "image" })}
                                placeholder="Select logo type..."
                                size="sm"
                                variant="outlined"
                                includeNoneOption={false}
                                clearable={false}
                            />

                            {data.logoType === "text" && (
                                <PBTextInput
                                    label="Logo Text"
                                    value={data.logoText ?? ""}
                                    onChange={(v) => update({ logoText: v })}
                                    placeholder="Portfolio"
                                />
                            )}
                            {data.logoType === "image" && (
                                <LogoImageUpload
                                    logoImageUrl={data.logoImageUrl}
                                    onLogoImageChange={(url) => update({ logoImageUrl: url || "" })}
                                />
                            )}

                            {/* Logo size (only for image) */}
                            {data.logoType === "image" && (
                                <RangeSlider
                                    label="Logo Size"
                                    value={data.logoSize ?? 32}
                                    onChange={(v) => update({ logoSize: v })}
                                    min={20}
                                    max={80}
                                    step={4}
                                />
                            )}
                        </div>
                    )}

                    <SectionDivider label="CTA Buttons" />

                    {/* CTA multi-buttons */}
                    <CTAButtons
                        buttons={ctaButtons}
                        onChange={(btns) => update({ ctaButtons: btns } as Partial<NavbarData>)}
                    />

                    <SectionDivider label="Visual" />

                    {/* Visual toggles */}
                    <div className="space-y-3">
                        <Toggle
                            label="Blur / Glass Effect"
                            description="Frosted glass backdrop behind the navbar"
                            checked={!!data.blur}
                            onChange={(v) => update({ blur: v })}
                        />
                        <Toggle
                            label="Bottom Border"
                            checked={!!data.borderBottom}
                            onChange={(v) => update({ borderBottom: v })}
                        />
                    </div>

                    <SectionDivider label="Spacing" />

                    {/* Padding */}
                    <div className="grid grid-cols-2 gap-4">
                        <RangeSlider
                            label="Horizontal Padding"
                            value={data.paddingX ?? 0}
                            onChange={(v) => update({ paddingX: v })}
                            max={80}
                            step={4}
                        />
                        <RangeSlider
                            label="Vertical Padding"
                            value={data.paddingY ?? 0}
                            onChange={(v) => update({ paddingY: v })}
                            max={80}
                            step={4}
                        />
                    </div>

                    {/* Margin */}
                    <div className="grid grid-cols-2 gap-4">
                        <RangeSlider
                            label="Horizontal Margin"
                            value={data.marginX ?? 0}
                            onChange={(v) => update({ marginX: v })}
                            max={80}
                            step={4}
                        />
                        <RangeSlider
                            label="Vertical Margin"
                            value={data.marginY ?? 0}
                            onChange={(v) => update({ marginY: v })}
                            max={80}
                            step={4}
                        />
                    </div>

                    {/* Border Radius */}
                    <RangeSlider
                        label="Border Radius"
                        value={data.borderRadius ?? 0}
                        onChange={(v) => update({ borderRadius: v })}
                        max={40}
                        step={2}
                    />

                    <SectionDivider label="Background" />

                    {/* Background */}
                    <BackgroundTab
                        data={data}
                        onUpdate={(partial) =>
                            update({ background: { ...(data.background ?? { type: "none" }), ...partial } })
                        }
                    />
                </>
            )}
        </div>
    );
}