"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Globe, Copy, ExternalLink, Check } from "lucide-react";
import type { SocialLink } from "@/lib/stores/social_links/useSocialLinks";
import { socialMediaPlatforms } from "@/lib/utilities/indices/DropDownItems";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { copyToClipboard } from "@/lib/utilities/syncFunctions/syncs";
import { useUIStore } from "@/lib/stores/ui/useUIStore";

interface SocialLinkCardProps {
    link: SocialLink;
    onEdit?: () => void;
    onDelete?: () => void;
    isPrivate?: boolean;
}

export function SocialLinkCard({ link, onEdit, onDelete, isPrivate = true }: SocialLinkCardProps) {
    const [copied, setCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { getThemeVariant } = useUserSettings();
    const { isDesktop } = useUIStore();

    const platform = socialMediaPlatforms.find(
        (p) => p.code.toLowerCase() === link.platform_name.toLowerCase()
    );

    const Icon = platform?.icon ?? Globe;
    const accentColor = platform
        ? getThemeVariant() === "dark"
            ? platform.darkColor
            : platform.color
        : "var(--accent)";

    const handleCopy = async () => {
        await copyToClipboard(link.profile_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const trimmedUrl = link.profile_url.replace(/^https?:\/\//, "");
    const displayUrl = trimmedUrl.length > 40 ? trimmedUrl.substring(0, 40) + "..." : trimmedUrl;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative rounded-2xl border border-[var(--foreground)]/10 
                       bg-[var(--background)] hover:border-[var(--foreground)]/20 
                       hover:shadow-lg transition-all duration-300 overflow-hidden p-5 h-fit"
        >
            {/* Platform Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2.5 rounded-xl"
                        style={{ backgroundColor: `${accentColor}15` }}
                    >
                        <Icon className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                    <div>
                        <h3 className="font-league-600 text-lg text-[var(--foreground)]">
                            {platform?.code ?? link.platform_name}
                        </h3>
                        {link.url_type && (
                            <span className="text-xs text-[var(--foreground)]/50 capitalize">
                                {link.url_type}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {isPrivate && (
                    <motion.div
                        initial={isDesktop ? { opacity: 0 } : { opacity: 1 }}
                        animate={{ opacity: !isDesktop || isHovered ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-1"
                    >
                        <button
                            onClick={onEdit}
                            className="p-2 rounded-lg hover:bg-[var(--foreground)]/10 transition-colors"
                            title="Edit"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Bio/Headline */}
            {link.profile_headline && (
                <p className="mb-4 text-base font-medium text-[var(--foreground)]/80 leading-relaxed">
                    {link.profile_headline}
                </p>
            )}

            {/* Profile URL */}
            <div className="flex items-center gap-2">
                <div
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-between p-2.5 rounded-xl 
                               bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 
                               transition-colors cursor-pointer group/url min-w-0"
                >
                    <p className="text-sm text-[var(--foreground)]/70 truncate" title={trimmedUrl}>
                        {displayUrl}
                    </p>
                    {copied ? (
                        <Check className="w-4 h-4 flex-shrink-0 text-green-500 ml-2" />
                    ) : (
                        <Copy className="w-4 h-4 flex-shrink-0 text-[var(--foreground)]/40 
                                       group-hover/url:text-[var(--accent)] transition-colors ml-2" />
                    )}
                </div>
                <a
                    href={link.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 
                               transition-colors flex-shrink-0"
                    style={{ color: accentColor }}
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </motion.div>
    );
}