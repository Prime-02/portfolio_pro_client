// app/(dashboard)/education/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useEducation } from "@/lib/stores/education/useEducation";
import type { Education } from "@/lib/stores/education/useEducation";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useTheme } from "../theme/ThemeContext ";

export default function EducationPage() {
    const {
        educations,
        isLoading,
        error,
        fetchAllEducations,
        deleteEducation,
        isDeleting,
        clearError,
        fetchPublicUserEducations,
        publicEducations,
        isLoadingPublicByUsername,
    } = useEducation();

    // Get profile context from ThemeContext instead of re-validating
    const { profileContext } = useTheme();

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editEdu, setEditEdu] = useState<Education | null>(null);
    const [deleteEdu, setDeleteEdu] = useState<Education | null>(null);

    // Derived state from profileContext
    const isOwnProfile = profileContext.kind === "own";
    const publicUsername = profileContext.kind === "public" ? profileContext.username : null;

    // Fetch data based on profile context
    useEffect(() => {
        if (profileContext.kind === "pending" || profileContext.kind === "unauthenticated" || profileContext.kind === "not-found") {
            return;
        }

        const fetchData = async () => {
            if (profileContext.kind === "public") {
                await fetchPublicUserEducations(profileContext.username);
            } else if (profileContext.kind === "own") {
                await fetchAllEducations();
            }
        };

        fetchData();
    }, [profileContext.kind, publicUsername]);

    const displayEducations = isOwnProfile ? educations : publicEducations;
    const displayLoading = isOwnProfile ? isLoading : isLoadingPublicByUsername;

    const handleDelete = async () => {
        if (!deleteEdu?.id) return;
        await deleteEducation(deleteEdu.id);
        setDeleteEdu(null);
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
                educations={displayEducations}
                isLoading={displayLoading}
                error={error}
                onClearError={clearError}
            />
        );
    }

    // Own profile view
    return (
        <OwnProfileView
            educations={displayEducations}
            isLoading={displayLoading}
            error={error}
            onClearError={clearError}
            addDialogOpen={addDialogOpen}
            onAddDialogChange={setAddDialogOpen}
            editEdu={editEdu}
            onEditEduChange={setEditEdu}
            deleteEdu={deleteEdu}
            onDeleteEduChange={setDeleteEdu}
            isDeleting={isDeleting}
            onDeleteConfirm={handleDelete}
        />
    );
}