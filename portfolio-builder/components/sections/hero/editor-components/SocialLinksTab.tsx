// portfolio-builder/components/sections/hero/editor-components/SocialLinksTab.tsx

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroData, SocialLink } from "@/portfolio-builder/types/hero";
import Field from "./Field";
import { inputClass } from "./styles";
import { useSocialLinks, SocialLink as UserSocialLink } from "@/lib/stores/social_links/useSocialLinks";
import { socialMediaPlatforms } from "@/lib/utilities/indices/DropDownItems";
import { RefreshCw, ExternalLink, Plus, X } from "lucide-react";
import ColorPicker from "./ColorPicker";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface SocialLinksTabProps {
    data: HeroData;
    onUpdate: (links: SocialLink[]) => void;
}

interface HeroSocialLink extends SocialLink {
    useIconColor?: boolean;
    customColor?: string;
}

export default function SocialLinksTab({ data, onUpdate }: SocialLinksTabProps) {
    const router = useRouter();
    const { userInfo } = useUserSettings()
    const links = (data.socialLinks || []) as HeroSocialLink[];

    const {
        socialLinks: userSocialLinks,
        isLoading,
        error,
        fetchAllSocialLinks,
    } = useSocialLinks();

    useEffect(() => {
        if (userSocialLinks.length > 0) return
        fetchAllSocialLinks().catch(() => {
            // Error handled in store
        });
    }, []);

    const getPlatformConfig = (platformName: string) => {
        const normalizedName = platformName.toLowerCase().trim();

        return socialMediaPlatforms.find(
            (p) =>
                p.id.toLowerCase() === normalizedName ||
                p.code.toLowerCase() === normalizedName
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

        const newLink: HeroSocialLink = {
            platformId,
            url: userLink.profile_url,
            useIconColor: true,
            customColor: platform?.color,
        };

        onUpdate([...links, newLink]);
    };

    const removeLink = (index: number) => {
        onUpdate(links.filter((_, i) => i !== index));
    };

    const toggleColorMode = (index: number) => {
        const updated = [...links];
        updated[index] = {
            ...updated[index],
            useIconColor: !updated[index].useIconColor,
        };
        onUpdate(updated);
    };

    const setCustomColor = (index: number, color: string) => {
        const updated = [...links];
        updated[index] = {
            ...updated[index],
            customColor: color,
        };
        onUpdate(updated);
    };

    const getLinkDisplay = (link: HeroSocialLink) => {
        const platform = getPlatformConfig(link.platformId);
        const IconComponent = platform?.icon;

        let displayColor: string;
        if (link.useIconColor !== false && platform) {
            displayColor = platform.color;
        } else {
            displayColor = link.customColor || "var(--pb-foreground)";
        }

        return { IconComponent, displayColor, platform };
    };

    const navigateToSocialLinks = (addNew: boolean) => {
        const url = `/${userInfo?.username}/socials${addNew ? '?add=new' : ''}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const availableLinks = userSocialLinks.filter((ul) => !isLinkAdded(ul));

    return (
        <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex items-center justify-between border-b border-[var(--pb-border)] pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--pb-text-muted)]">
                    Your Social Links
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchAllSocialLinks()}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)] bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg transition-all disabled:opacity-50 hover:border-[var(--pb-border-hover)]"
                        title="Refresh social links"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => navigateToSocialLinks(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)] bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg transition-all hover:border-[var(--pb-border-hover)]"
                        title="Add new social link"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add New
                    </button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="p-3 bg-[var(--pb-error-bg)] border border-[var(--pb-error-border)] rounded-lg">
                    <p className="text-sm text-[var(--pb-error)]">{error}</p>
                    <button
                        onClick={() => fetchAllSocialLinks()}
                        className="mt-1 text-xs text-[var(--pb-error)] hover:text-[var(--pb-error)]/80 underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Available social links to add */}
            <div className="space-y-3">
                <h4 className="text-xs font-medium text-[var(--pb-text-secondary)]">
                    Add to Hero Section
                </h4>

                {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--pb-text-muted)] py-4">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading your social links...
                    </div>
                ) : availableLinks.length === 0 && links.length === 0 ? (
                    <div className="text-center py-6 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg">
                        <p className="text-sm text-[var(--pb-text-secondary)] mb-3">
                            No social links available
                        </p>
                        <button
                            onClick={() => navigateToSocialLinks(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--pb-text-primary)] bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg transition-all hover:opacity-90"
                        >
                            <Plus className="w-4 h-4" />
                            Add Your First Social Link
                        </button>
                    </div>
                ) : availableLinks.length === 0 && links.length > 0 ? (
                    <p className="text-sm text-[var(--pb-text-muted)] py-2">
                        All your social links have been added to the hero section.
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
                                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--pb-surface)] border border-[var(--pb-border)] hover:border-[var(--pb-border-hover)] rounded-lg text-sm text-[var(--pb-text-primary)] transition-all group"
                                >
                                    {IconComponent ? (
                                        <IconComponent
                                            className="w-4 h-4"
                                            style={{ color: platform.color }}
                                        />
                                    ) : (
                                        <span className="w-4 h-4 flex items-center justify-center text-xs font-bold uppercase bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded">
                                            {userLink.platform_name.charAt(0)}
                                        </span>
                                    )}
                                    <span>{userLink.platform_name}</span>
                                    <Plus className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Active hero links */}
            {links.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xs font-medium text-[var(--pb-text-secondary)]">
                        Active Hero Links ({links.length})
                    </h4>
                    <div className="space-y-3">
                        {links.map((link, index) => {
                            const { IconComponent, displayColor, platform } = getLinkDisplay(link);

                            return (
                                <div
                                    key={`${link.platformId}-${index}`}
                                    className="flex items-start gap-3 p-3 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-lg"
                                >
                                    {/* Platform icon */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] flex-shrink-0">
                                        {IconComponent ? (
                                            <IconComponent
                                                className="w-5 h-5"
                                                style={{ color: displayColor }}
                                            />
                                        ) : (
                                            <span
                                                className="text-sm font-semibold uppercase"
                                                style={{ color: displayColor }}
                                            >
                                                {link.platformId.slice(0, 2)}
                                            </span>
                                        )}
                                    </div>

                                    {/* URL (readonly) and color controls */}
                                    <div className="flex-1 space-y-2">
                                        <Field
                                            label={platform?.code || link.platformId}
                                            htmlFor={`social-${link.platformId}-${index}`}
                                            className="flex-1"
                                        >
                                            <Textinput
                                                id={`social-${link.platformId}-${index}`}
                                                type="url"
                                                value={link.url}
                                                readOnly
                                                className={`${inputClass} opacity-60 cursor-not-allowed`}
                                            />
                                        </Field>

                                        {/* Color controls */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleColorMode(index)}
                                                className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-all ${link.useIconColor !== false
                                                    ? "bg-[var(--pb-accent-20)] text-[var(--pb-accent)] border border-[var(--pb-accent-30)]"
                                                    : "bg-[var(--pb-surface-elevated)] text-[var(--pb-text-primary)] border border-[var(--pb-border)]"
                                                    }`}
                                            >
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        background: displayColor,
                                                    }}
                                                />
                                                {link.useIconColor !== false ? "Default Color" : "Custom"}
                                            </button>
                                        </div>

                                        {/* Custom color picker */}
                                        {link.useIconColor === false && (
                                            <ColorPicker
                                                id={`color-${link.platformId}-${index}`}
                                                value={link.customColor || "var(--pb-foreground)"}
                                                onChange={(color) => setCustomColor(index, color)}
                                                placeholder="var(--pb-foreground)"
                                            />
                                        )}
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        onClick={() => removeLink(index)}
                                        className="flex-shrink-0 mt-1 p-1.5 text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] hover:bg-[var(--pb-error-bg)] rounded-lg transition-colors"
                                        title="Remove from hero"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* External link to manage social links */}
            <div className="pt-3 border-t border-[var(--pb-border)]">
                <button
                    onClick={() => navigateToSocialLinks(false)}
                    className="flex items-center gap-2 text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] transition-colors group"
                >
                    <ExternalLink className="w-3.5 h-3.5 group-hover:text-[var(--pb-text-secondary)]" />
                    Manage all your social links
                </button>
            </div>
        </div>
    );
}