// components/experience/OwnProfileView.tsx
"use client";

import { Briefcase, Plus, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme/ThemeContext";
import Button from "../buttons/Buttons";
import { StatsBar } from "./StatsBar";
import { ExperienceTimeline } from "./ExperienceTimeline";
import { ExperienceDialogs } from "./ExperienceDialogs";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { Experience } from "@/lib/stores/experiences/useExperience";
import { useSkills } from "@/lib/stores/skills/useSkills";
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/client/api";
import { PageHeader } from "../ui/PageHeader";
import { handleShareProfile } from "@/lib/utilities/syncFunctions/syncs";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface OwnProfileViewProps {
    experiences: Experience[];
    isLoading: boolean;
    error: string | null;
    onClearError: () => void;
    addDialogOpen: boolean;
    onAddDialogChange: (open: boolean) => void;
    editExperience: Experience | null;
    onEditExperienceChange: (experience: Experience | null) => void;
    deleteExperience: Experience | null;
    onDeleteExperienceChange: (experience: Experience | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
    miniView?: boolean;
}

export function OwnProfileView({
    experiences,
    isLoading,
    error,
    onClearError,
    addDialogOpen,
    onAddDialogChange,
    editExperience,
    onEditExperienceChange,
    deleteExperience,
    onDeleteExperienceChange,
    isDeleting,
    onDeleteConfirm,
    miniView = false,
}: OwnProfileViewProps) {
    const { fetchAllSkills } = useSkills()
    const {userInfo} = useUserSettings()

    useEffect(() => {
        if (!isAuthenticated()) return
        fetchAllSkills()
    }, [])

    const router = useRouter();
    const { profileContext } = useTheme();
    const usernamePath = profileContext?.username ? `${profileContext.username}` : "";
    const displayedExperiences = miniView ? experiences.slice(0, 3) : experiences;
    const showSeeAll = miniView && experiences.length > 0;

    return (
        <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-6xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto"}>
            <PageHeader
                icon={<Briefcase className="w-6 h-6 text-[var(--accent)]" />}
                title="My Experience"
                description="Your professional journey and career history"
                action={!miniView ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            onClick={() => {
                                handleShareProfile({
                                    title: `${userInfo?.username}'s Experience — Portfolio Pro`,
                                    text: `Explore ${userInfo?.username}'s career journey on Portfolio Pro`,
                                    imageUrl: userInfo?.profile_picture || undefined
                                })
                            }}
                            className="self-start sm:self-auto"
                            text="Share Your Experience"
                            icon={<Share2 className="w-4 h-4" />}
                            variant="outline"
                        />
                        <Button
                            onClick={() => onAddDialogChange(true)}
                            className="self-start sm:self-auto"
                            text="Add Role"
                            icon={<Plus className="w-4 h-4" />}
                        />
                    </div>
                ) : undefined}
            />

            {!isLoading && <StatsBar experiences={experiences} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            <ExperienceTimeline
                experiences={displayedExperiences}
                isLoading={isLoading}
                onEdit={onEditExperienceChange}
                onDelete={onDeleteExperienceChange}
                onAddClick={() => onAddDialogChange(true)}
                isOwner={true}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/experience` : "/experience")}
                        className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                    >
                        See all
                    </button>
                </div>
            )}

            <ExperienceDialogs
                addDialogOpen={addDialogOpen}
                onAddDialogChange={onAddDialogChange}
                editExperience={editExperience}
                onEditExperienceChange={onEditExperienceChange}
                deleteExperience={deleteExperience}
                onDeleteExperienceChange={onDeleteExperienceChange}
                isDeleting={isDeleting}
                onDeleteConfirm={onDeleteConfirm}
            />
        </div>
    );
}