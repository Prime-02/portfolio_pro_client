// app/(dashboard)/skills/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSkills } from "@/lib/stores/skills/useSkills";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useTheme } from "../theme/ThemeContext";

export default function SkillsPage({ miniView = false }: { miniView?: boolean }) {
    const {
        skills,
        isLoading,
        error,
        fetchAllSkills,
        deleteSkill,
        isDeleting,
        clearError,
        fetchPublicSkillsByUsername,
        publicSkills,
        isLoadingPublicByUsername,
    } = useSkills();

    // Get profile context from ThemeContext instead of re-validating
    const { profileContext } = useTheme();

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editSkill, setEditSkill] = useState<ProfessionalSkill | null>(null);
    const [deleteSkillState, setDeleteSkillState] = useState<ProfessionalSkill | null>(null);

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
                await fetchPublicSkillsByUsername(profileContext.username);
            } else if (profileContext.kind === "own") {
                await fetchAllSkills();
            }
        };

        fetchData();
    }, [profileContext.kind, publicUsername]);

    const displaySkills = isOwnProfile ? skills : publicSkills;
    const displayLoading = isOwnProfile ? isLoading : isLoadingPublicByUsername;

    const handleDelete = async () => {
        if (!deleteSkillState?.id) return;
        await deleteSkill(deleteSkillState.id);
        setDeleteSkillState(null);
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
                skills={displaySkills}
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
            skills={displaySkills}
            miniView={miniView}
            isLoading={displayLoading}
            error={error}
            onClearError={clearError}
            addDialogOpen={addDialogOpen}
            onAddDialogChange={setAddDialogOpen}
            editSkill={editSkill}
            onEditSkillChange={setEditSkill}
            deleteSkill={deleteSkillState}
            onDeleteSkillChange={setDeleteSkillState}
            isDeleting={isDeleting}
            onDeleteConfirm={handleDelete}
        />
    );
}