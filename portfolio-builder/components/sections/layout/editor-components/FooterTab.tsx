// portfolio-builder/components/sections/layout/editor-components/FooterTab.tsx

"use client";

import { useEffect } from "react";
import { FooterData, FooterColumn, FooterSocialLink, SectionLink } from "@/portfolio-builder/types/layout";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";
import { PBDropdown, PBTextInput } from "@/portfolio-builder/components/shared/ui/inputs";
import { SectionDivider } from "./NavbarTab";
import { useSocialLinks, SocialLink as UserSocialLink } from "@/lib/stores/social_links/useSocialLinks";
import { socialMediaPlatforms } from "@/lib/utilities/indices/DropDownItems";
import { RefreshCw, Plus, X } from "lucide-react";
import { ImageField } from "@/src/app/components/cloudinary/ImageField";
import { useParams } from "next/navigation";
import { useCloudinaryCore } from "@/lib/stores/cloudinary/useCloudinaryCore";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface FooterTabProps {
    data: FooterData;
    onChange: (updated: FooterData) => void;
    sectionLinks: SectionLink[];
    onSectionLinksChange: (links: SectionLink[]) => void;
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

// ── Layout presets ────────────────────────────────────────────────────────────

const LAYOUTS = [
    { id: "simple", code: "Simple — Links + Copyright" },
    { id: "centered", code: "Centered — Stacked, centered" },
    { id: "columns", code: "Columns — Multi-column grid" },
    { id: "minimal", code: "Minimal — Copyright only" },
    { id: "branded", code: "Branded — Logo + Social + Links" },
    { id: "compact", code: "Compact — Horizontal, space-efficient" },
];

const LOGO_TYPES = [
    { id: "text", code: "Text Logo" },
    { id: "image", code: "Image Logo" },
];

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
        if (logoImageUrl && url !== logoImageUrl) {
            const cloudinaryInfo = extractCloudinaryInfo(logoImageUrl);
            if (cloudinaryInfo) {
                try {
                    await deleteAsset(cloudinaryInfo.publicId, cloudinaryInfo.resourceType, true);
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
            folder={`${userInfo?.id}/portfolio/${portfolioId}/footer/logo`}
            accept="image"
        />
    );
}

// ── Social Links Manager (mirrors Hero's SocialLinksTab) ─────────────────────

interface FooterSocialLinkExtended extends FooterSocialLink {
    useIconColor?: boolean;
    customColor?: string;
}

function SocialLinksManager({
    links,
    onChange,
}: {
    links: FooterSocialLinkExtended[];
    onChange: (links: FooterSocialLinkExtended[]) => void;
}) {
    const {
        socialLinks: userSocialLinks,
        isLoading,
        error,
        fetchAllSocialLinks,
    } = useSocialLinks();

    useEffect(() => {
        if (userSocialLinks.length > 0) return
        fetchAllSocialLinks().catch(() => { });
    }, [fetchAllSocialLinks]);

    const getPlatformConfig = (platformName: string) => {
        const normalizedName = platformName.toLowerCase().trim();
        return socialMediaPlatforms.find(
            (p) => p.id.toLowerCase() === normalizedName || p.code.toLowerCase() === normalizedName
        );
    };

    const isLinkAdded = (userLink: UserSocialLink) => {
        const platform = getPlatformConfig(userLink.platform_name);
        const platformId = platform?.id || userLink.platform_name;
        return links.some((l) => l.platformId === platformId);
    };

    const addLink = (userLink: UserSocialLink) => {
        if (isLinkAdded(userLink)) return;
        const platform = getPlatformConfig(userLink.platform_name);
        const platformId = platform?.id || userLink.platform_name;
        const newLink: FooterSocialLinkExtended = {
            platformId,
            url: userLink.profile_url,
            useIconColor: true,
            customColor: platform?.color,
        };
        onChange([...links, newLink]);
    };

    const removeLink = (index: number) => {
        onChange(links.filter((_, i) => i !== index));
    };

    const toggleColorMode = (index: number) => {
        const updated = [...links];
        updated[index] = { ...updated[index], useIconColor: !updated[index].useIconColor };
        onChange(updated);
    };

    const setCustomColor = (index: number, color: string) => {
        const updated = [...links];
        updated[index] = { ...updated[index], customColor: color };
        onChange(updated);
    };

    const availableLinks = userSocialLinks.filter((ul) => !isLinkAdded(ul));

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-[var(--pb-text-secondary)]">
                    Add Social Links
                </h4>
                <button
                    onClick={() => fetchAllSocialLinks()}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)] bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="p-2 bg-[var(--pb-error-bg)] border border-[var(--pb-error-border)] rounded-lg">
                    <p className="text-xs text-[var(--pb-error)]">{error}</p>
                </div>
            )}

            {/* Available links */}
            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-[var(--pb-text-muted)] py-2">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Loading...
                </div>
            ) : availableLinks.length === 0 && links.length === 0 ? (
                <p className="text-xs text-[var(--pb-text-muted)] py-2">
                    No social links available. Add some in your profile.
                </p>
            ) : availableLinks.length === 0 ? (
                <p className="text-xs text-[var(--pb-text-muted)] py-2">
                    All links added.
                </p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {availableLinks.map((userLink) => {
                        const platform = getPlatformConfig(userLink.platform_name);
                        const IconComponent = platform?.icon;
                        return (
                            <button
                                key={userLink.id}
                                onClick={() => addLink(userLink)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--pb-surface)] border border-[var(--pb-border)] hover:border-[var(--pb-border-hover)] rounded-lg text-xs text-[var(--pb-text-primary)] transition-all group"
                            >
                                {IconComponent ? (
                                    <IconComponent className="w-3.5 h-3.5" style={{ color: platform.color }} />
                                ) : (
                                    <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold uppercase bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded">
                                        {userLink.platform_name.charAt(0)}
                                    </span>
                                )}
                                <span>{userLink.platform_name}</span>
                                <Plus className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Active links */}
            {links.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-medium text-[var(--pb-text-secondary)]">
                        Active Links ({links.length})
                    </h4>
                    <div className="space-y-2">
                        {links.map((link, index) => {
                            const platform = getPlatformConfig(link.platformId);
                            const IconComponent = platform?.icon;
                            const displayColor = link.useIconColor !== false && platform
                                ? platform.color
                                : (link.customColor || "var(--pb-foreground)");

                            return (
                                <div
                                    key={`${link.platformId}-${index}`}
                                    className="flex items-center gap-2 p-2 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] flex-shrink-0">
                                        {IconComponent ? (
                                            <IconComponent className="w-4 h-4" style={{ color: displayColor }} />
                                        ) : (
                                            <span className="text-xs font-semibold uppercase" style={{ color: displayColor }}>
                                                {link.platformId.slice(0, 2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[var(--pb-text-primary)] truncate">{platform?.code || link.platformId}</p>
                                        <p className="text-[10px] text-[var(--pb-text-muted)] truncate">{link.url}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleColorMode(index)}
                                        className={`px-2 py-1 text-[10px] rounded transition-all ${link.useIconColor !== false
                                            ? "bg-[var(--pb-accent-20)] text-[var(--pb-accent)] border border-[var(--pb-accent-30)]"
                                            : "bg-[var(--pb-surface-elevated)] text-[var(--pb-text-primary)] border border-[var(--pb-border)]"
                                            }`}
                                    >
                                        {link.useIconColor !== false ? "Default" : "Custom"}
                                    </button>
                                    {link.useIconColor === false && (
                                        <input
                                            type="color"
                                            value={link.customColor || "#ededed"}
                                            onChange={(e) => setCustomColor(index, e.target.value)}
                                            className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                                        />
                                    )}
                                    <button
                                        onClick={() => removeLink(index)}
                                        className="p-1 text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FooterTab({ data, onChange, sectionLinks, onSectionLinksChange }: FooterTabProps) {
    const update = (partial: Partial<FooterData>) => onChange({ ...data, ...partial });
    const socialLinks = (data.socialLinks ?? []) as FooterSocialLinkExtended[];

    const visibleCount = sectionLinks.filter((l) => l.visible).length;

    const addColumn = () => {
        update({
            columns: [...(data.columns ?? []), { heading: "Column", links: [] }],
        });
    };

    const updateColumn = (i: number, partial: Partial<FooterColumn>) => {
        const cols = [...(data.columns ?? [])];
        cols[i] = { ...cols[i], ...partial };
        update({ columns: cols });
    };

    const removeColumn = (i: number) => {
        update({ columns: (data.columns ?? []).filter((_, idx) => idx !== i) });
    };

    const addColumnLink = (colIndex: number) => {
        const cols = [...(data.columns ?? [])];
        cols[colIndex] = {
            ...cols[colIndex],
            links: [...cols[colIndex].links, { label: "Link", href: "#" }],
        };
        update({ columns: cols });
    };

    const updateColumnLink = (
        colIndex: number,
        linkIndex: number,
        partial: Partial<{ label: string; href: string }>
    ) => {
        const cols = [...(data.columns ?? [])];
        cols[colIndex].links[linkIndex] = { ...cols[colIndex].links[linkIndex], ...partial };
        update({ columns: cols });
    };

    const removeColumnLink = (colIndex: number, linkIndex: number) => {
        const cols = [...(data.columns ?? [])];
        cols[colIndex] = {
            ...cols[colIndex],
            links: cols[colIndex].links.filter((_, i) => i !== linkIndex),
        };
        update({ columns: cols });
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Enable */}
            <Toggle
                label="Enable Footer"
                checked={data.enabled}
                onChange={(v) => update({ enabled: v })}
            />

            {data.enabled && (
                <>
                    <SectionDivider label="Layout" />

                    <PBDropdown
                        options={LAYOUTS}
                        value={data.layout}
                        onSelect={(val) => update({ layout: val as FooterData["layout"] })}
                        placeholder="Select layout..."
                        size="md"
                        variant="outlined"
                        includeNoneOption={false}
                        clearable={false}
                    />

                    <SectionDivider label="Logo" />

                    <Toggle
                        label="Show Logo"
                        checked={data.showLogo ?? false}
                        onChange={(v) => update({ showLogo: v })}
                    />

                    {data.showLogo && (
                        <div className="space-y-3">
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

                    <SectionDivider label="Theme Toggle" />

                    <Toggle
                        label="Show Theme Toggle"
                        description="Adds a light/dark/system theme switcher to the footer"
                        checked={data.showThemeToggle ?? false}
                        onChange={(v) => update({ showThemeToggle: v })}
                    />

                    <SectionDivider label="Social Links" />

                    <Toggle
                        label="Show Social Links"
                        checked={data.showSocial ?? false}
                        onChange={(v) => update({ showSocial: v })}
                    />

                    {data.showSocial && (
                        <SocialLinksManager
                            links={socialLinks}
                            onChange={(links) => update({ socialLinks: links })}
                        />
                    )}

                    <SectionDivider label="Content" />

                    <div className="space-y-2">
                        <PBTextInput
                            label="Copyright Text"
                            value={data.copyrightText ?? ""}
                            onChange={(v) => update({ copyrightText: v })}
                            placeholder="© {year} All rights reserved."
                        />
                        <p className="text-xs text-[var(--pb-text-muted)]">Use {"{year}"} to insert the current year.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--pb-text-secondary)] mb-1.5">
                            Tagline / Blurb
                        </label>
                        <textarea
                            value={data.tagline ?? ""}
                            onChange={(e) => update({ tagline: e.target.value })}
                            placeholder="A short description or tagline..."
                            rows={2}
                            className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm text-[var(--pb-text-primary)] placeholder:text-[var(--pb-input-placeholder)] resize-none focus:outline-none focus:border-[var(--pb-input-border-focus)] transition-colors"
                        />
                    </div>

                    <Toggle
                        label="Show Year in Copyright"
                        checked={data.showYear ?? true}
                        onChange={(v) => update({ showYear: v })}
                    />

                    <SectionDivider label="Visual" />

                    <Toggle
                        label="Blur / Glass Effect"
                        description="Frosted glass backdrop behind the footer"
                        checked={!!data.blur}
                        onChange={(v) => update({ blur: v })}
                    />

                    <Toggle
                        label="Top Border"
                        checked={data.borderTop ?? true}
                        onChange={(v) => update({ borderTop: v })}
                    />

                    <SectionDivider label="Spacing" />

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

                    <SectionDivider label="Background" />

                    <BackgroundTab
                        data={data}
                        onUpdate={(partial) =>
                            update({ background: { ...(data.background ?? { type: "none" }), ...partial } })
                        }
                        allowedTypes={["none", "image", "solid", "gradient"]}
                    />

                    {/* Columns (only for "columns" layout) */}
                    {data.layout === "columns" && (
                        <>
                            <SectionDivider label="Column Configuration" />
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-[var(--pb-text-secondary)]">
                                        Columns
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addColumn}
                                        className="text-xs px-2 py-1 rounded border border-[var(--pb-border)] text-[var(--pb-text-muted)] hover:border-[var(--pb-border-hover)] hover:text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)] transition-colors"
                                    >
                                        + Add Column
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {(data.columns ?? []).map((col, colIdx) => (
                                        <div
                                            key={colIdx}
                                            className="border border-[var(--pb-border)] rounded-lg p-3 space-y-2 bg-[var(--pb-surface)]"
                                        >
                                            <div className="flex items-center gap-2">
                                                <PBTextInput
                                                    label="Heading"
                                                    value={col.heading}
                                                    onChange={(v) => updateColumn(colIdx, { heading: v })}
                                                    placeholder="Heading"
                                                    className="flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeColumn(colIdx)}
                                                    className="text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors text-sm mt-5"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            {col.links.map((link, linkIdx) => (
                                                <div key={linkIdx} className="flex gap-2">
                                                    <PBTextInput
                                                        label="Label"
                                                        value={link.label}
                                                        onChange={(v) => updateColumnLink(colIdx, linkIdx, { label: v })}
                                                        placeholder="Label"
                                                        className="flex-1"
                                                    />
                                                    <PBTextInput
                                                        label="URL"
                                                        value={link.href}
                                                        onChange={(v) => updateColumnLink(colIdx, linkIdx, { href: v })}
                                                        placeholder="#section"
                                                        className="flex-1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeColumnLink(colIdx, linkIdx)}
                                                        className="text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors text-sm mt-5"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addColumnLink(colIdx)}
                                                className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] transition-colors"
                                            >
                                                + Add link
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}