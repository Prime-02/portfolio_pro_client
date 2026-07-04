// app/(dashboard)/social-links/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSocialLinks } from "@/lib/stores/social_links/useSocialLinks";
import type { SocialLink } from "@/lib/stores/social_links/useSocialLinks";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useTheme } from "../theme/ThemeContext";

export default function SocialLinksPage({ miniView = false }: { miniView?: boolean }) {
    const {
        socialLinks,
        isLoading,
        error,
        fetchAllSocialLinks,
        deleteSocialLink,
        isDeleting,
        clearError,
        fetchPublicSocialLinks,
        publicSocialLinks,
    } = useSocialLinks();

    // Get profile context from ThemeContext instead of re-validating
    const { profileContext } = useTheme();

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editLink, setEditLink] = useState<SocialLink | null>(null);
    const [deleteLink, setDeleteLink] = useState<SocialLink | null>(null);

    // Derived state from profileContext
    const isOwnProfile = profileContext.kind === "own";
    const publicUsername = profileContext.kind === "public" ? profileContext.username : null;

    // Fetch data based on profile context
    useEffect(() => {
        if (profileContext.kind === "pending" || profileContext.kind === "unauthenticated" || profileContext.kind === "not-found") {
            return;
        }

        const fetchLinks = async () => {
            if (profileContext.kind === "public") {
                await fetchPublicSocialLinks(profileContext.username);
            } else if (profileContext.kind === "own") {
                await fetchAllSocialLinks();
            }
        };

        fetchLinks();
    }, [profileContext.kind, publicUsername]);

    const displayLinks = isOwnProfile ? socialLinks : publicSocialLinks;

    const handleDelete = async () => {
        if (!deleteLink) return;
        await deleteSocialLink(deleteLink.id);
        setDeleteLink(null);
    };

    // UI states
    if (profileContext.kind === "pending") return <LoadingSkeleton />;

    if (profileContext.kind === "not-found" || profileContext.kind === "unauthenticated") {
        return <div>Profile not found</div>;
    }

    // Public profile view
    if (publicUsername) {
        return (
            <PublicProfileView
                username={publicUsername}
                miniView={miniView}
                error={error}
                onClearError={clearError}
            />
        );
    }

    // Own profile view
    return (
        <OwnProfileView
            links={displayLinks}
            miniView={miniView}
            isLoading={isLoading}
            error={error}
            onClearError={clearError}
            addDialogOpen={addDialogOpen}
            onAddDialogChange={setAddDialogOpen}
            editLink={editLink}
            onEditLinkChange={setEditLink}
            deleteLink={deleteLink}
            onDeleteLinkChange={setDeleteLink}
            isDeleting={isDeleting}
            onDeleteConfirm={handleDelete}
        />
    );
}