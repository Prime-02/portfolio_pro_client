// src/app/profile/UserProfilePage.tsx
"use client";

import { useEffect, useState } from "react";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { EditProfileForm } from "@/src/app/components/profile/EditProfileForm";
import { ErrorMessage } from "@/src/app/components/profile/ErrorMessage";
import { ProfileNotFound } from "@/src/app/components/profile/ProfileNotFound";
import { EmptyProfile } from "@/src/app/components/profile/EmptyProfile";
import { UserNotFoundNotice } from "@/src/app/components/profile/UserNotFoundNotice";
import { ProfileViewPage } from "./ProfileViewPage";
import { ProfileSkeleton } from "./view/ProfileSkeleton";
import { useTheme } from "../../../context/ThemeContext";
import { UserResponse } from "@/lib/stores/user/useUserAccountStore";
import { useRouting } from "@/lib/hooks/routing/useRouting";

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
        fetchPublicSettings,
        fetchPublicProfile,
        fetchPublicUserInfo,
        updateProfile,
        updateUserInfo,
        updateSettings,
        clearError,
    } = useUserSettings();

    // Get profile context from ThemeContext instead of re-validating
    const { profileContext } = useTheme();
    const { checkParams, clearQueryParam } = useRouting()
    const isNew = checkParams("edit_profile") === "true"
    const [isEditing, setIsEditing] = useState(isNew);
    const [isSaving, setIsSaving] = useState(false);

    // Derived state from profileContext
    const isOwnProfile = profileContext.kind === "own";
    const isPublicProfile = profileContext.kind === "public";
    const showUserNotFound = profileContext.kind === "not-found" && !!userInfo?.username;

    // Refetch data based on profile context
    const refetchData = async () => {
        if (profileContext.kind === "pending" || profileContext.kind === "unauthenticated" || profileContext.kind === "not-found") {
            return; // Nothing to fetch for these states
        }

        if (profileContext.kind === "public") {
            await Promise.all([
                fetchPublicSettings(profileContext.username),
                fetchPublicProfile(profileContext.username),
                fetchPublicUserInfo(profileContext.username),
            ]);
        } else if (profileContext.kind === "own") {
            await Promise.all([fetchSettings(), fetchProfile()]);
        }
    };

    // Fetch data when profile context changes
    useEffect(() => {
        if (profileContext.kind === "pending") return;
        refetchData();
    }, [profileContext.kind]);

    // Determine which data to display
    const displayProfile = isOwnProfile ? profile : publicProfile;
    const displayUserInfo = isOwnProfile ? userInfo : publicUserInfo;
    const displaySettings = isOwnProfile ? settings : publicSettings;

    // ─── Save Handlers ────────────────────────────────────────────────────────
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
            await refetchData();
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = async () => {
        clearQueryParam(["edit_profile"])
        setIsEditing(false);
        await refetchData(); // Discard any unsaved changes
    };

    // ─── Loading State ────────────────────────────────────────────────────────
    if (profileContext.kind === "pending") {
        return <ProfileSkeleton message="Loading profile..." />;
    }

    // ─── Not Found (Unauthenticated) ──────────────────────────────────────────
    if (profileContext.kind === "not-found" && !userInfo?.username) {
        return <ProfileNotFound />;
    }

    // ─── Loading Data ─────────────────────────────────────────────────────────
    if (isLoading && !displayProfile && !displayUserInfo) {
        return <ProfileSkeleton message="Loading profile data..." />;
    }

    // ─── Error State ──────────────────────────────────────────────────────────
    if (error && !displayProfile && !displayUserInfo) {
        return (
            <ErrorMessage
                message={error}
                onRetry={() => {
                    clearError();
                    refetchData();
                }}
            />
        );
    }

    // ─── Empty Profile ────────────────────────────────────────────────────────
    if (!displayProfile && !displayUserInfo && !isLoading) {
        return (
            <EmptyProfile
                isOwnProfile={isOwnProfile}
                onSetupProfile={() => setIsEditing(true)}
            />
        );
    }

    // ─── Main Render ──────────────────────────────────────────────────────────
    return (
        <div className="max-w-6xl mx-auto">
            {/* User Not Found Notice for authenticated users viewing missing profiles */}
            {showUserNotFound && (
                <UserNotFoundNotice username={userInfo?.username ?? ""} />
            )}

            {/* Edit mode indicator for own profile */}
            {isOwnProfile && (
                <div className="flex justify-end mb-6">
                    {isEditing ? (
                        <span className="text-sm text-(--foreground)/50 font-league-400 py-2">
                            Editing your profile
                        </span>
                    ) : null}
                </div>
            )}

            {/* Edit Form or View Mode */}
            {isEditing && isOwnProfile ? (
                <EditProfileForm
                    profile={profile}
                    userInfo={userInfo}
                    settings={settings}
                    onSaveProfile={handleSaveProfile}
                    onSaveUserInfo={handleSaveUserInfo}
                    onSaveSettings={handleSaveSettings}
                    onCancel={handleCancelEdit}
                    isSaving={isSaving}
                />
            ) : (
                <ProfileViewPage
                    profile={displayProfile}
                    userInfo={displayUserInfo as UserResponse}
                    settings={displaySettings}
                    isOwnProfile={isOwnProfile}
                    onEdit={() => setIsEditing(true)}
                    fetchData={refetchData}
                />
            )}
        </div>
    );
};