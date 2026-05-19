// app/(dashboard)/skills/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSkills } from "@/lib/stores/skills/useSkills";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useValidation } from "@/lib/hooks/validation/useValidation";
import { useUserStore } from "@/lib/stores/user/userStore";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

type SkillsScenario =
    | { kind: "public"; username: string }
    | { kind: "own" }
    | { kind: "not-found" }
    | { kind: "user-not-found"; username: string }
    | { kind: "pending" };

export default function SkillsPage() {
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
    const { checkIfOwnProfile, validateProfileUsername } = useValidation();
    const { userInfo, fetchUserInfo } = useUserSettings();
    const { pathname } = useRouting();

    const [scenario, setScenario] = useState<SkillsScenario>({ kind: "pending" });
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editSkill, setEditSkill] = useState<ProfessionalSkill | null>(null);
    const [deleteSkillState, setDeleteSkillState] = useState<ProfessionalSkill | null>(null);

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

        const fetchData = async () => {
            if (scenario.kind === "public") {
                await fetchPublicSkillsByUsername(scenario.username);
            } else if (scenario.kind === "own" || scenario.kind === "user-not-found") {
                await fetchAllSkills();
            }
        };

        fetchData();
    }, [scenario]);

    const isOwnProfile = scenario.kind === "own" || scenario.kind === "user-not-found";
    const displaySkills = isOwnProfile ? skills : publicSkills;
    const displayLoading = isOwnProfile ? isLoading : isLoadingPublicByUsername;

    const handleDelete = async () => {
        if (!deleteSkillState?.id) return;
        await deleteSkill(deleteSkillState.id);
        setDeleteSkillState(null);
    };

    // UI states
    if (scenario.kind === "pending") return <LoadingSkeleton />;
    if (scenario.kind === "not-found") return <div>Profile not found</div>;

    // Public profile view
    if (!isOwnProfile && scenario.kind === "public") {
        return (
            <PublicProfileView
                username={scenario.username}
                skills={displaySkills}
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