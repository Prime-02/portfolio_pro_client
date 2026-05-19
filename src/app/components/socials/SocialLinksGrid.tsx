// components/social/SocialLinksGrid.tsx
import { SocialLinkCard } from "./SocialLinkCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptySocialState } from "./EmptySocialState";
import type { SocialLink } from "@/lib/stores/social_links/useSocialLinks";

interface SocialLinksGridProps {
    links: SocialLink[];
    isLoading: boolean;
    onEdit?: (link: SocialLink) => void;
    onDelete?: (link: SocialLink) => void;
    onAddClick?: () => void;
    isPrivate?: boolean
}

export function SocialLinksGrid({
    links,
    isLoading,
    onEdit,
    onDelete,
    onAddClick,
    isPrivate
}: SocialLinksGridProps) {
    if (isLoading) return <LoadingSkeleton />;

    if (links.length === 0) {
        return <EmptySocialState onAddClick={onAddClick} />;
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
                <SocialLinkCard
                    key={link.id}
                    link={link}
                    onEdit={() => onEdit?.(link)}
                    onDelete={() => onDelete?.(link)}
                    isPrivate={isPrivate}
                />
            ))}
        </div>
    );
}