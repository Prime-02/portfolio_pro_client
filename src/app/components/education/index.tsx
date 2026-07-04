// app/(dashboard)/education/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useEducation } from "@/lib/stores/education/useEducation";
import type { Education } from "@/lib/stores/education/useEducation";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useTheme } from "../theme/ThemeContext";

export default function EducationPage({ miniView = false }: { miniView?: boolean }) {
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

    // Store IDs only — derive live objects from the store so they're
    // always fresh after an update, never a stale snapshot.
    const [editEduId, setEditEduId] = useState<string | null>(null);
    const [deleteEduId, setDeleteEduId] = useState<string | null>(null);

    const editEdu = educations.find((e) => e.id === editEduId) ?? null;
    const deleteEdu = educations.find((e) => e.id === deleteEduId) ?? null;

    // Derived state from profileContext
    const isOwnProfile = profileContext.kind === "own";
    const publicUsername = profileContext.kind === "public" ? profileContext.username : null;

    // Fetch data based on profile context
    useEffect(() => {
        if (
            profileContext.kind === "pending" ||
            profileContext.kind === "unauthenticated" ||
            profileContext.kind === "not-found"
        ) {
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

    // Adapters — OwnProfileView/EducationDialogs still pass Education | null,
    // so we unwrap to ID here at the boundary.
    const handleEditEduChange = (edu: Education | null) => {
        setEditEduId(edu?.id ?? null);
    };

    const handleDeleteEduChange = (edu: Education | null) => {
        setDeleteEduId(edu?.id ?? null);
    };

    const handleDelete = async () => {
        if (!deleteEduId) return;
        await deleteEducation(deleteEduId);
        setDeleteEduId(null);
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
                miniView={miniView}
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
            miniView={miniView}
            isLoading={displayLoading}
            error={error}
            onClearError={clearError}
            addDialogOpen={addDialogOpen}
            onAddDialogChange={setAddDialogOpen}
            editEdu={editEdu}
            onEditEduChange={handleEditEduChange}
            deleteEdu={deleteEdu}
            onDeleteEduChange={handleDeleteEduChange}
            isDeleting={isDeleting}
            onDeleteConfirm={handleDelete}
        />
    );
}