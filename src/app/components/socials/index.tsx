// app/(dashboard)/social-links/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSocialLinks } from "@/lib/stores/social_links/useSocialLinks";
import type { SocialLink } from "@/lib/stores/social_links/useSocialLinks";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useValidation } from "@/lib/hooks/validation/useValidation";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

type SocialLinksScenario =
    | { kind: "public"; username: string }
    | { kind: "own" }
    | { kind: "not-found" }
    | { kind: "user-not-found"; username: string }
    | { kind: "pending" };

export default function SocialLinksPage() {
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
    const { checkIfOwnProfile, validateProfileUsername } = useValidation();
    const { pathname } = useRouting();

    const [scenario, setScenario] = useState<SocialLinksScenario>({ kind: "pending" });
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editLink, setEditLink] = useState<SocialLink | null>(null);
    const [deleteLink, setDeleteLink] = useState<SocialLink | null>(null);
    const {userInfo, fetchUserInfo} = useUserSettings()

    const resolveInProgress = useRef(false);

    useEffect(() => {
        const resolveScenario = async () => {
            if (resolveInProgress.current) return;
            resolveInProgress.current = true;
            try {
                if (userInfo && !userInfo.username) await fetchUserInfo();

                const profileCheck = checkIfOwnProfile();
                const usernameInUrl = profileCheck?.username ?? null;
                const isAuthenticated = !!userInfo?.username;

                if (usernameInUrl) {
                    const validation = await validateProfileUsername(usernameInUrl);
                    if (validation.isValid && validation.isOwnProfile) {
                        setScenario({ kind: "own" });
                    } else if (validation.isValid && validation.username) {
                        setScenario({ kind: "public", username: validation.username });
                    } else if (isAuthenticated) {
                        setScenario({ kind: "user-not-found", username: usernameInUrl });
                    } else {
                        setScenario({ kind: "not-found" });
                    }
                } else if (isAuthenticated) {
                    setScenario({ kind: "own" });
                } else {
                    setScenario({ kind: "not-found" });
                }
            } finally {
                resolveInProgress.current = false;
            }
        };
        resolveScenario();
    }, [pathname, userInfo?.username]);

    // Fetch data based on scenario
    useEffect(() => {
        if (scenario.kind === "pending") return;

        const fetchLinks = async () => {
            if (scenario.kind === "public") {
                await fetchPublicSocialLinks(scenario.username);
            } else if (scenario.kind === "own" || scenario.kind === "user-not-found") {
                await fetchAllSocialLinks();
            }
        };

        fetchLinks();
    }, [scenario]);

    const isOwnProfile = scenario.kind === "own" || scenario.kind === "user-not-found";
    const displayLinks = isOwnProfile ? socialLinks : publicSocialLinks;

    const handleDelete = async () => {
        if (!deleteLink) return;
        await deleteSocialLink(deleteLink.id);
        setDeleteLink(null);
    };

    // UI states
    if (scenario.kind === "pending") return <LoadingSkeleton />;
    if (scenario.kind === "not-found") return <div>Profile not found</div>;

    // Public profile view
    if (!isOwnProfile && scenario.kind === "public") {
        return (
            <PublicProfileView
                username={scenario.username}
                error={error}
                onClearError={clearError}
            />
        );
    }

    // Own profile view
    return (
        <OwnProfileView
            links={displayLinks}
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