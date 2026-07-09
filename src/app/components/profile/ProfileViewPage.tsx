// src/app/profile/ProfileViewPage.tsx

"use client";
import type {
    UserProfileRequest,
    UserSettings,
    UserUpdateRequest,
} from "@/lib/stores/user/useUserSettings";
import { ProfileHeroCard } from "./view/ProfileHeroCard";
import { EmptyState } from "./view/EmptyState";
import BlogsPage from "../blogs/BlogsPage";
import CertificationsPage from "../certifications";
import EducationPage from "../education";
import ExperiencePage from "../experience";
import ProjectsPage from "../projects/ProjectsPage";
import SkillsPage from "../skills";
import SocialLinksPage from "../socials";
import TestimonialsPage from "../testimonials/TestimonialsPage";
import { UserResponse } from "@/lib/stores/user/useUserAccountStore";

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

            <div className="space-y-6">
                <SocialLinksPage miniView={true} />
                <SkillsPage miniView={true} />
                <ExperiencePage miniView={true} />
                <EducationPage miniView={true} />
                <CertificationsPage miniView={true} />
                <ProjectsPage miniView={true} />
                <BlogsPage miniView={true} />
                <TestimonialsPage miniView={true} />
            </div>

            <EmptyState
                visible={!profile && !userInfo && !settings}
            />
        </div>
    );
};