// components/social/PublicSocialProfile.tsx
"use client";

import { useEffect } from "react";
import { useSocialLinks } from "@/lib/stores/social_links/useSocialLinks";
import { SocialLinksGrid } from "./SocialLinksGrid";
import { useTheme } from "../theme/ThemeContext";
import { useRouting } from "@/lib/hooks/routing/useRouting";

interface PublicSocialProfileProps {
    username: string;
    miniView?: boolean;
}

export function PublicSocialProfile({ username, miniView = false }: PublicSocialProfileProps) {
    const { publicSocialLinks, publicUsername, fetchPublicSocialLinks, isLoadingPublic } = useSocialLinks();
    const { profileContext } = useTheme();
    const { router } = useRouting()
    const usernamePath = profileContext?.username ? `${profileContext.username}` : "";

    useEffect(() => {
        if (username && username !== publicUsername) {
            fetchPublicSocialLinks(username);
        }
    }, [username, publicUsername, fetchPublicSocialLinks]);

    const displayedLinks = miniView ? publicSocialLinks.slice(0, 3) : publicSocialLinks;
    const showSeeAll = miniView && publicSocialLinks.length > 0;

    if (publicSocialLinks.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--foreground)]/50">No links yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <SocialLinksGrid
                links={displayedLinks}
                isLoading={isLoadingPublic}
                isPrivate={false}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/socials` : `/${username}/socials`)}
                        className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                    >
                        See all
                    </button>
                </div>
            )}
        </div>
    );
}