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
        fetchAllSocialLinks().catch(() => {
            // Error handled in store
        });
    }, [fetchAllSocialLinks]);

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
            displayColor = link.customColor || "#ffffff";
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
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Your Social Links
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchAllSocialLinks()}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Refresh social links"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => navigateToSocialLinks(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                        title="Add new social link"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add New
                    </button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                    <button
                        onClick={() => fetchAllSocialLinks()}
                        className="mt-1 text-xs text-red-300 hover:text-red-200 underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Available social links to add */}
            <div className="space-y-3">
                <h4 className="text-xs font-medium text-neutral-400">
                    Add to Hero Section
                </h4>

                {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-neutral-500 py-4">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading your social links...
                    </div>
                ) : availableLinks.length === 0 && links.length === 0 ? (
                    <div className="text-center py-6 bg-neutral-800/50 rounded-lg border border-neutral-800">
                        <p className="text-sm text-neutral-400 mb-3">
                            No social links available
                        </p>
                        <button
                            onClick={() => navigateToSocialLinks(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Your First Social Link
                        </button>
                    </div>
                ) : availableLinks.length === 0 && links.length > 0 ? (
                    <p className="text-sm text-neutral-500 py-2">
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
                                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 rounded-lg text-sm text-neutral-300 transition-all group"
                                >
                                    {IconComponent ? (
                                        <IconComponent
                                            className="w-4 h-4"
                                            style={{ color: platform.color }}
                                        />
                                    ) : (
                                        <span className="w-4 h-4 flex items-center justify-center text-xs font-bold uppercase bg-neutral-700 rounded">
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
                    <h4 className="text-xs font-medium text-neutral-400">
                        Active Hero Links ({links.length})
                    </h4>
                    <div className="space-y-3">
                        {links.map((link, index) => {
                            const { IconComponent, displayColor, platform } = getLinkDisplay(link);

                            return (
                                <div
                                    key={`${link.platformId}-${index}`}
                                    className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-800"
                                >
                                    {/* Platform icon */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-700 border border-neutral-600 flex-shrink-0">
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
                                                className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${link.useIconColor !== false
                                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                    : "bg-neutral-700 text-neutral-400 border border-neutral-600"
                                                    }`}
                                            >
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        background: displayColor,
                                                    }}
                                                />
                                                {link.useIconColor !== false ? "Brand Color" : "Custom"}
                                            </button>
                                        </div>

                                        {/* Custom color picker */}
                                        {link.useIconColor === false && (
                                            <ColorPicker
                                                id={`color-${link.platformId}-${index}`}
                                                value={link.customColor || "#ffffff"}
                                                onChange={(color) => setCustomColor(index, color)}
                                                placeholder="#000000"
                                            />
                                        )}
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        onClick={() => removeLink(index)}
                                        className="flex-shrink-0 mt-1 p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
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
            <div className="pt-3 border-t border-neutral-800">
                <button
                    onClick={() => navigateToSocialLinks(false)}
                    className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors group"
                >
                    <ExternalLink className="w-3.5 h-3.5 group-hover:text-neutral-400" />
                    Manage all your social links
                </button>
            </div>
        </div>
    );
}