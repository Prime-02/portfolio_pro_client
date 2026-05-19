// src/app/profile/ProfileViewPage.tsx

"use client";
import type {
    UserProfileRequest,
    UserSettings,
    UserResponse,
    UserUpdateRequest,
} from "@/lib/stores/user/useUserSettings";
import { ProfileHeroCard } from "./view/ProfileHeroCard";
import { ContactLinksCard } from "./view/ContactLinksCard";
import { EmptyState } from "./view/EmptyState";
import { PreferencesCard } from "./view/PreferenceCard";

interface ProfileViewPageProps {
    profile: UserProfileRequest | null;
    userInfo: UserResponse | UserUpdateRequest | null;
    settings: UserSettings | null;
    isOwnProfile?: boolean;
    onEdit?: () => void;
    fetchData?: () => void
}

export const ProfileViewPage = ({
    profile,
    userInfo,
    settings,
    isOwnProfile = false,
    onEdit,
}: ProfileViewPageProps) => {
    const name = [userInfo?.firstname, userInfo?.middlename, userInfo?.lastname]
        .filter(Boolean)
        .join(" ");

    const username = "username" in (userInfo ?? {}) ? (userInfo as any).username : null;

    return (
        <div className="space-y-6">
            <ProfileHeroCard
                profile={profile}
                userInfo={userInfo}
                name={name}
                username={username}
                isOwnProfile={isOwnProfile}
                onEdit={onEdit}
            />

            <ContactLinksCard
                profile={profile}
                userInfo={userInfo}
            />

            <PreferencesCard settings={settings} />

            <EmptyState
                visible={!profile && !userInfo && !settings}
            />
        </div>
    );
};