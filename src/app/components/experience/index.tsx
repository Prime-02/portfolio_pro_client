// app/(dashboard)/experience/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useExperiencesStore } from "@/lib/stores/experiences/useExperience";
import type { Experience } from "@/lib/stores/experiences/useExperience";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useValidation } from "@/lib/hooks/validation/useValidation";
import { useUserStore } from "@/lib/stores/user/userStore";
import { useRouting } from "@/lib/hooks/routing/useRouting";

type ExperienceScenario =
    | { kind: "public"; username: string }
    | { kind: "own" }
    | { kind: "not-found" }
    | { kind: "user-not-found"; username: string }
    | { kind: "pending" };

export default function ExperiencePage() {
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

    const { checkIfOwnProfile, validateProfileUsername } = useValidation();
    const { userData, fetchUserData } = useUserStore();
    const { pathname } = useRouting();

    const [scenario, setScenario] = useState<ExperienceScenario>({ kind: "pending" });
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editExperience, setEditExperience] = useState<Experience | null>(null);
    const [deleteExperienceState, setDeleteExperienceState] = useState<Experience | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        if (scenario.kind === "pending") return;

        const fetchData = async () => {
            if (scenario.kind === "public") {
                await fetchUserExperiencesByUsername(scenario.username);
            } else if (scenario.kind === "own" || scenario.kind === "user-not-found") {
                await fetchMyExperiences();
            }
        };

        fetchData();
    }, [scenario]);

    const isOwnProfile = scenario.kind === "own" || scenario.kind === "user-not-found";

    // Derive display data and loading/error state based on scenario
    const publicUsername = scenario.kind === "public" ? scenario.username : "";
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

    if (scenario.kind === "pending") return <LoadingSkeleton />;
    if (scenario.kind === "not-found") return <div>Profile not found</div>;

    if (!isOwnProfile && scenario.kind === "public") {
        return (
            <PublicProfileView
                username={scenario.username}
                experiences={displayExperiences}
                isLoading={isLoading}
                error={error}
                onClearError={() => setError(null)}
            />
        );
    }

    return (
        <OwnProfileView
            experiences={displayExperiences}
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
