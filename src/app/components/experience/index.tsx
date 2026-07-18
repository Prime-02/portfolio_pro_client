// app/(dashboard)/experience/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useExperiencesStore } from "@/lib/stores/experiences/useExperience";
import type { Experience } from "@/lib/stores/experiences/useExperience";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useTheme } from "../../../context/ThemeContext";

export default function ExperiencePage({ miniView = false }: { miniView?: boolean }) {
    const {
        myExperiences,
        myExperiencesLoading,
        myExperiencesError,
        fetchMyExperiences,
        deleteExperience,
        deleting,
        userPublicExperiences,
        userPublicExperiencesLoading,
        userPublicExperiencesError,
        fetchUserExperiencesByUsername,
    } = useExperiencesStore();

    // Get profile context from ThemeContext instead of re-validating
    const { profileContext } = useTheme();

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editExperience, setEditExperience] = useState<Experience | null>(null);
    const [deleteExperienceState, setDeleteExperienceState] = useState<Experience | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Derived state from profileContext
    const isOwnProfile = profileContext.kind === "own";
    const publicUsername = profileContext.kind === "public" ? profileContext.username : "";

    // Fetch data based on profile context
    useEffect(() => {
        if (profileContext.kind === "pending" || profileContext.kind === "unauthenticated" || profileContext.kind === "not-found") {
            return;
        }

        const fetchData = async () => {
            if (profileContext.kind === "public") {
                await fetchUserExperiencesByUsername(profileContext.username);
            } else if (profileContext.kind === "own") {
                await fetchMyExperiences();
            }
        };

        fetchData();
    }, [profileContext.kind, publicUsername]);

    // Derive display data and loading/error state based on profile context
    const displayExperiences = isOwnProfile
        ? myExperiences
        : (userPublicExperiences[publicUsername] ?? []);
    const isLoading = isOwnProfile ? myExperiencesLoading : userPublicExperiencesLoading;
    const storeError = isOwnProfile ? myExperiencesError : userPublicExperiencesError;

    useEffect(() => {
        if (storeError) setError(storeError);
    }, [storeError]);

    const handleDelete = async () => {
        if (!deleteExperienceState?.id) return;
        await deleteExperience(deleteExperienceState.id);
        setDeleteExperienceState(null);
    };

    // UI states
    if (profileContext.kind === "pending") return <LoadingSkeleton />;

    if (profileContext.kind === "not-found" || profileContext.kind === "unauthenticated") {
        return <div>Profile not found</div>;
    }

    // Public profile view
    if (!isOwnProfile && publicUsername) {
        return (
            <PublicProfileView
                username={publicUsername}
                experiences={displayExperiences}
                miniView={miniView}
                isLoading={isLoading}
                error={error}
                onClearError={() => setError(null)}
            />
        );
    }

    // Own profile view
    return (
        <OwnProfileView
            experiences={displayExperiences}
            miniView={miniView}
            isLoading={isLoading}
            error={error}
            onClearError={() => setError(null)}
            addDialogOpen={addDialogOpen}
            onAddDialogChange={setAddDialogOpen}
            editExperience={editExperience}
            onEditExperienceChange={setEditExperience}
            deleteExperience={deleteExperienceState}
            onDeleteExperienceChange={setDeleteExperienceState}
            isDeleting={deleting}
            onDeleteConfirm={handleDelete}
        />
    );
}