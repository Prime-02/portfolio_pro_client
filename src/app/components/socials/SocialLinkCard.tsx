"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Globe, ChevronDown, Copy } from "lucide-react";
import type { SocialLink } from "@/lib/stores/social_links/useSocialLinks";
import { socialMediaPlatforms } from "@/lib/utilities/indices/DropDownItems";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { copyToClipboard } from "@/lib/utilities/syncFunctions/syncs";

interface SocialLinkCardProps {
    link: SocialLink;
    onEdit?: () => void;
    onDelete?: () => void;
    isPrivate?: boolean
}

export function SocialLinkCard({ link, onEdit, onDelete, isPrivate = true }: SocialLinkCardProps) {
    const [expanded, setExpanded] = useState(false);
    const { getThemeVariant } = useUserSettings();

    const platform = socialMediaPlatforms.find(
        (p) => p.code.toLowerCase() === link.platform_name.toLowerCase()
    );

    const Icon = platform?.icon ?? Globe;
    const accentColor = platform
        ? getThemeVariant() === "dark"
            ? platform.darkColor
            : platform.color
        : "var(--accent)";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative rounded-2xl border border-[var(--foreground)]/10 
                       bg-[var(--background)] hover:border-[var(--foreground)]/20 
                       transition-all duration-300 overflow-hidden"
        >
            {/* Color accent bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: accentColor }}
            />

            <div className="p-5">
                {/* Platform Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2.5 rounded-xl"
                            style={{ backgroundColor: `${accentColor}20` }}
                        >
                            <Icon className="w-5 h-5" style={{ color: accentColor }} />
                        </div>
                        <div>
                            <h3 className="font-league-600 text-lg">
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
                    {
                        isPrivate && <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        </div>
                    }
                </div>

                {/* Profile URL */}
                <div
                    onClick={() => {
                        copyToClipboard(link.profile_url)
                    }}
                    rel="noopener noreferrer"
                    className="block mb-3 p-3 rounded-xl bg-[var(--foreground)]/5
                hover:bg-[var(--foreground)]/10 transition-colors group/link"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-[var(--foreground)]/70 truncate flex-1 mr-2">
                            {link.profile_url.replace(/^https?:\/\//, "")}
                        </p>
                        <Copy
                            className="w-4 h-4 flex-shrink-0 text-[var(--foreground)]/40 
                                       group-hover/link:text-[var(--accent)] transition-colors"
                        />
                    </div>
                </div>

                {/* Headline (expandable) */}
                {link.profile_headline && (
                    <div>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1 text-sm text-[var(--foreground)]/60 
                                       hover:text-[var(--foreground)]/80 transition-colors"
                        >
                            <span>Bio</span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                            />
                        </button>
                        <motion.div
                            initial={false}
                            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <p className="mt-2 text-sm text-[var(--foreground)]/70 leading-relaxed">
                                {link.profile_headline}
                            </p>
                        </motion.div>
                    </div>
                )}
            </div>
        </motion.div >
    );
}