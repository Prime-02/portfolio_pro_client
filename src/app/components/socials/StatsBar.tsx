// components/social/StatsBar.tsx
import { Link2, Share2 } from "lucide-react";
import type { SocialLink } from "@/lib/stores/social_links/useSocialLinks";

interface StatsBarProps {
    links: SocialLink[];
    className?: string;
}

export function StatsBar({ links, className = "" }: StatsBarProps) {
    const getPlatformsCount = () => {
        const unique = new Set(links.map((l) => l.platform_name));
        return unique.size;
    };

    if (links.length === 0) return null;

    return (
        <div className={`flex gap-4 mb-8 flex-wrap ${className}`}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <Link2 className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {links.length} {links.length === 1 ? "link" : "links"}
                </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <Share2 className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {getPlatformsCount()} {getPlatformsCount() === 1 ? "platform" : "platforms"}
                </span>
            </div>
        </div>
    );
}