// components/social/PublicSocialProfile.tsx
"use client";

import { useEffect } from "react";
import { useSocialLinks } from "@/lib/stores/social_links/useSocialLinks";
import { SocialLinksGrid } from "./SocialLinksGrid";

interface PublicSocialProfileProps {
    username: string;
}

export function PublicSocialProfile({ username }: PublicSocialProfileProps) {
    const { publicSocialLinks, publicUsername, fetchPublicSocialLinks, isLoadingPublic } = useSocialLinks();

    useEffect(() => {
        if (username && username !== publicUsername) {
            fetchPublicSocialLinks(username);
        }
    }, [username, publicUsername, fetchPublicSocialLinks]);

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
                links={publicSocialLinks}
                isLoading={isLoadingPublic}
                isPrivate={false}
            />
        </div>
    );
}