// src/app/profile/view/ProfileHeroCard.tsx

import Image from "next/image";
import { Badge } from "@/src/app/components/profile/Badge";
import { StatCard } from "./StatCard";
import type {
    UserProfileRequest,
    UserUpdateRequest,
} from "@/lib/stores/user/useUserSettings";
import MarkdownRenderer from "../../markdown/MarkdownRenderer";
import { getImageSrc, handleShareProfile } from "@/lib/utilities/syncFunctions/syncs";
import Button from "../../buttons/Buttons";
import { Edit, Share2Icon } from "lucide-react";
import { UserResponse } from "@/lib/stores/user/useUserAccountStore";


interface ProfileHeroCardProps {
    profile: UserProfileRequest | null;
    userInfo: UserResponse | UserUpdateRequest | null;
    name: string;
    username: string | null;
    isOwnProfile: boolean;
    onEdit?: () => void;
}

export const ProfileHeroCard = ({
    profile,
    userInfo,
    name,
    username,
    isOwnProfile,
    onEdit,
}: ProfileHeroCardProps) => {
    return (
        <div className="card rounded-2xl">
            {/* Top row: Avatar + Edit button */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
                <div className="relative w-32 h-32 sm:w-[25vw] sm:h-[25vw] md:w-[30vw] md:h-[30vw] max-w-40 md:max-w-56 max-h-40 md:max-h-56 rounded-full overflow-hidden ring-4 ring-(--accent)/20 shadow-lg shrink-0">
                    {userInfo?.profile_picture ? (
                        <Image
                            src={getImageSrc(userInfo?.profile_picture)}
                            alt={name || "Profile"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 128px, (max-width: 768px) 25vw, 30vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-(--accent)/10 to-(--accent)/5 flex items-center justify-center">
                            <svg className="w-[35%] h-[35%] text-(--accent)/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                </div>

                {isOwnProfile && onEdit && (
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                        <Button
                            text="Share Your Profile"
                            icon={<Share2Icon className="w-4 h-4 transition-transform group-hover:rotate-12" />}
                            onClick={() => {
                                handleShareProfile({
                                    title: `${name || username}'s Profile — Portfolio Pro`,
                                    text: `Discover ${name || username}'s profile on Portfolio Pro`,
                                    imageUrl: userInfo?.profile_picture || undefined
                                })
                            }}
                            variant="outline"
                            className="text-xs sm:text-sm"
                        />
                        <Button
                            text="Edit Profile"
                            icon={<Edit className="w-4 h-4 transition-transform group-hover:rotate-12" />}
                            onClick={onEdit}
                            className="text-xs sm:text-sm"
                        />
                    </div>
                )}
            </div>

            {/* Name & username */}
            <div className="mb-4 sm:mb-5 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-league-700 text-(--foreground) leading-tight break-words">
                    {name || "Not Set"}
                </h1>
                {username && (
                    <p className="text-(--foreground)/50 font-league-400 mt-1 text-xs sm:text-sm break-all">@{username}</p>
                )}
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 justify-center sm:justify-start">
                {profile?.open_to_work && (
                    <Badge active color="accent" className="text-xs sm:text-sm">
                        <span className="flex items-center gap-1 sm:gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            Open to Work
                        </span>
                    </Badge>
                )}
                {profile?.availability && (
                    <Badge color="primary" className="text-xs sm:text-sm">
                        {profile.availability.replace("_", " ").toLocaleUpperCase()} Notice Period
                    </Badge>
                )}
            </div>

            {/* Bio */}
            {profile?.bio && (
                <div className="mb-4 sm:mb-6 rounded-xl bg-(--foreground)/[0.03] border border-(--foreground)/5">
                    <MarkdownRenderer
                        className="text-sm sm:text-base text-(--foreground)/80 leading-relaxed break-words"
                        markdown={profile.bio}
                    />
                </div>
            )}

            {/* Quick stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {profile?.profession && (
                    <StatCard value={profile.profession} label="Profession" icon="briefcase" />
                )}
                {profile?.job_title && (
                    <StatCard value={profile.job_title} label="Role" icon="badge" />
                )}
                {profile?.years_of_experience != null && (
                    <StatCard value={`${profile.years_of_experience}yr`} label="Experience" icon="clock" />
                )}
                {profile?.location && (
                    <StatCard value={profile.location} label="Location" icon="map-pin" />
                )}
            </div>
        </div>
    );
};