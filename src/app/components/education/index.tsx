// app/(dashboard)/education/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useEducation } from "@/lib/stores/education/useEducation";
import type { Education } from "@/lib/stores/education/useEducation";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useValidation } from "@/lib/hooks/validation/useValidation";
import { useUserStore } from "@/lib/stores/user/userStore";
import { useRouting } from "@/lib/hooks/routing/useRouting";

type EducationScenario =
    | { kind: "public"; username: string }
    | { kind: "own" }
    | { kind: "not-found" }
    | { kind: "user-not-found"; username: string }
    | { kind: "pending" };

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
    const { checkIfOwnProfile, validateProfileUsername } = useValidation();
    const { userData, fetchUserData } = useUserStore();
    const { pathname } = useRouting();

    const [scenario, setScenario] = useState<EducationScenario>({ kind: "pending" });
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editEdu, setEditEdu] = useState<Education | null>(null);
    const [deleteEdu, setDeleteEdu] = useState<Education | null>(null);

    const resolveInProgress = useRef(false);

    useEffect(() => {
        const resolveScenario = async () => {
            if (resolveInProgress.current) return;
            resolveInProgress.current = true;
            try {
                if (userData && !userData.username) await fetchUserData();

                const profileCheck = checkIfOwnProfile();
                const usernameInUrl = profileCheck?.username ?? null;
                const isAuthenticated = !!userData?.username;

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
    }, [pathname, userData?.username]);

    // Fetch data based on scenario
    useEffect(() => {
        if (scenario.kind === "pending") return;

        const fetchData = async () => {
            if (scenario.kind === "public") {
                await fetchPublicUserEducations(scenario.username);
            } else if (scenario.kind === "own" || scenario.kind === "user-not-found") {
                await fetchAllEducations();
            }
        };

        fetchData();
    }, [scenario]);

    const isOwnProfile = scenario.kind === "own" || scenario.kind === "user-not-found";
    const displayEducations = isOwnProfile ? educations : publicEducations;
    const displayLoading = isOwnProfile ? isLoading : isLoadingPublicByUsername;

    const handleDelete = async () => {
        if (!deleteEdu?.id) return;
        await deleteEducation(deleteEdu.id);
        setDeleteEdu(null);
    };

    // UI states
    if (scenario.kind === "pending") return <LoadingSkeleton />;
    if (scenario.kind === "not-found") return <div>Profile not found</div>;

    // Public profile view
    if (!isOwnProfile && scenario.kind === "public") {
        return (
            <PublicProfileView
                username={scenario.username}
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