// src/app/profile/UserProfilePage.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { UserResponse, useUserSettings } from "@/lib/stores/user/useUserSettings";
import { EditProfileForm } from "@/src/app/components/profile/EditProfileForm";
import { ErrorMessage } from "@/src/app/components/profile/ErrorMessage";
import { ProfileNotFound } from "@/src/app/components/profile/ProfileNotFound";
import { EmptyProfile } from "@/src/app/components/profile/EmptyProfile";
import { UserNotFoundNotice } from "@/src/app/components/profile/UserNotFoundNotice";
import { useValidation } from "@/lib/hooks/validation/useValidation";
import { ProfileViewPage } from "./ProfileViewPage";
import { ProfileSkeleton } from "./view/ProfileSkeleton";

type ProfileScenario =
    | { kind: "public"; username: string }
    | { kind: "own" }
    | { kind: "not-found" }
    | { kind: "user-not-found"; username: string }
    | { kind: "pending" };

export const UserProfilePage = () => {
    const {
        settings,
        publicSettings,
        profile,
        publicProfile,
        userInfo,
        publicUserInfo,
        isLoading,
        error,
        fetchSettings,
        fetchProfile,
        fetchUserInfo,
        fetchPublicSettings,
        fetchPublicProfile,
        fetchPublicUserInfo,
        updateProfile,
        updateUserInfo,
        updateSettings,
        clearError,
    } = useUserSettings();

    const { checkIfOwnProfile, validateProfileUsername } = useValidation();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [scenario, setScenario] = useState<ProfileScenario>({ kind: "pending" });

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
    }, [userInfo?.username]);

    // Refetch function that depends on current scenario
    const refetchData = async () => {
        if (scenario.kind === "pending") return;

        if (scenario.kind === "public") {
            await Promise.all([
                fetchPublicSettings(scenario.username),
                fetchPublicProfile(scenario.username),
                fetchPublicUserInfo(scenario.username),
            ]);
        } else if (scenario.kind === "own" || scenario.kind === "user-not-found") {
            await Promise.all([fetchSettings(), fetchProfile(), fetchUserInfo()]);
        }
    };

    useEffect(() => {
        if (scenario.kind === "pending") return;
        refetchData();
    }, [scenario]);

    const isOwnProfile = scenario.kind === "own" || scenario.kind === "user-not-found";
    const displayProfile = isOwnProfile ? profile : publicProfile;
    const displayUserInfo = isOwnProfile ? userInfo : publicUserInfo;
    const displaySettings = isOwnProfile ? settings : publicSettings;

    const handleSaveProfile = async (payload: Parameters<typeof updateProfile>[0]) => {
        setIsSaving(true);
        try {
            await updateProfile(payload);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveUserInfo = async (payload: Parameters<typeof updateUserInfo>[0]) => {
        setIsSaving(true);
        try {
            await updateUserInfo(payload);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSettings = async (payload: Parameters<typeof updateSettings>[0]) => {
        setIsSaving(true);
        try {
            await updateSettings(payload);
            await refetchData()
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = async () => {
        setIsEditing(false);
        await refetchData(); // Refetch to discard any unsaved changes
    };

    // ─── UI states ───────────────────────────────────────────────────────────
    if (scenario.kind === "pending") return <ProfileSkeleton message="Loading profile..." />;

    if (scenario.kind === "not-found") return <ProfileNotFound />;

    if (isLoading && !displayProfile && !displayUserInfo) return <ProfileSkeleton message="Loading profile..." />;

    if (error && !displayProfile && !displayUserInfo) {
        return (
            <ErrorMessage
                message={error}
                onRetry={() => {
                    clearError();
                    if (isOwnProfile) {
                        fetchProfile();
                    } else {
                        fetchPublicProfile((scenario as any).username);
                    }
                }}
            />
        );
    }

    if (!displayProfile && !displayUserInfo && !isLoading) {
        return <EmptyProfile isOwnProfile={isOwnProfile} onSetupProfile={() => setIsEditing(true)} />;
    }

    // ─── Main render ─────────────────────────────────────────────────────────
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {scenario.kind === "user-not-found" && <UserNotFoundNotice username={scenario.username} />}

            {isOwnProfile && (
                <div className="flex justify-end mb-6">
                    {isEditing ? (
                        <span className="text-sm text-(--foreground)/50 font-league-400 py-2">
                            Editing your profile
                        </span>
                    ) : null}
                </div>
            )}

            {isEditing && isOwnProfile ? (
                <EditProfileForm
                    profile={profile}
                    userInfo={userInfo}
                    settings={settings}
                    onSaveProfile={handleSaveProfile}
                    onSaveUserInfo={handleSaveUserInfo}
                    onSaveSettings={handleSaveSettings}
                    onCancel={handleCancelEdit} // Updated to use the new refetch handler
                    isSaving={isSaving}
                />
            ) : (
                <ProfileViewPage
                    profile={displayProfile}
                    userInfo={displayUserInfo as UserResponse}
                    settings={displaySettings}
                    isOwnProfile={isOwnProfile}
                    onEdit={() => setIsEditing(true)}
                    fetchData={refetchData} // Pass the refetch function
                />
            )}
        </div>
    );
};