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
        <div className="card rounded-2xl p-6 sm:p-8">
            {/* Top row: Avatar + Edit button */}
            <div className="flex items-start justify-between mb-6">
                <div className="relative w-[30vw] h-[30vw] max-w-56 max-h-56 min-w-24 min-h-24 rounded-full overflow-hidden ring-4 ring-(--accent)/20 shadow-lg shrink-0">
                    {userInfo?.profile_picture ? (
                        <Image
                            src={getImageSrc(userInfo?.profile_picture)}
                            alt={name || "Profile"}
                            fill
                            className="object-cover"
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
                    <div className="flex items-center gap-x-2">
                        <Button
                            text="Share Your Profile"
                            icon={<Share2Icon className="w-4 h-4 transition-transform group-hover:rotate-12" />}
                            onClick={handleShareProfile}
                            variant="outline"
                        />
                        <Button
                            text="Edit Profile"
                            icon={<Edit className="w-4 h-4 transition-transform group-hover:rotate-12" />}
                            onClick={onEdit}
                        />
                    </div>
                )}
            </div>

            {/* Rest of the component remains the same... */}
            {/* Name & username */}
            <div className="mb-5">
                <h1 className="text-2xl sm:text-3xl font-league-700 text-(--foreground) leading-tight">
                    {name || "Anonymous"}
                </h1>
                {username && (
                    <p className="text-(--foreground)/50 font-league-400 mt-1 text-sm">@{username}</p>
                )}
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2 mb-6">
                {profile?.open_to_work && (
                    <Badge active color="accent">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            Open to Work
                        </span>
                    </Badge>
                )}
                {profile?.availability && (
                    <Badge color="primary">{profile.availability.replace("_", " ").toLocaleUpperCase()} Notice Period</Badge>
                )}
                {/* {(userInfo as any)?.is_active !== undefined && (
                    <Badge active={(userInfo as any).is_active} color={(userInfo as any).is_active ? "accent" : "secondary"}>
                        {(userInfo as any).is_active ? "Active" : "Inactive"}
                    </Badge>
                )} */}
            </div>

            {/* Bio */}
            {profile?.bio && (
                <div className="mb-6 p-4 rounded-xl bg-(--foreground)/[0.03] border border-(--foreground)/5">
                    <MarkdownRenderer className="text-(--foreground)/80 leading-relaxed" markdown={profile.bio} />
                </div>
            )}

            {/* Quick stats row */}
            <div className="grid grid-cols-1 gap-3">
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