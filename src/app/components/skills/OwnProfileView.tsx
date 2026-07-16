// components/skills/OwnProfileView.tsx
import { Zap, Plus, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme/ThemeContext";
import Button from "../buttons/Buttons";
import { StatsBar } from "./StatsBar";
import { SkillsGrid } from "./SkillsGrid";
import { SkillDialogs } from "./SkillDialogs";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import { PageHeader } from "../ui/PageHeader";
import { handleShareProfile } from "@/lib/utilities/syncFunctions/syncs";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface OwnProfileViewProps {
    skills: ProfessionalSkill[];
    isLoading: boolean;
    error: string | null;
    onClearError: () => void;
    addDialogOpen: boolean;
    onAddDialogChange: (open: boolean) => void;
    editSkill: ProfessionalSkill | null;
    onEditSkillChange: (skill: ProfessionalSkill | null) => void;
    deleteSkill: ProfessionalSkill | null;
    onDeleteSkillChange: (skill: ProfessionalSkill | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
    miniView?: boolean;
}

export function OwnProfileView({
    skills,
    isLoading,
    error,
    onClearError,
    addDialogOpen,
    onAddDialogChange,
    editSkill,
    onEditSkillChange,
    deleteSkill,
    onDeleteSkillChange,
    isDeleting,
    onDeleteConfirm,
    miniView = false,
}: OwnProfileViewProps) {
    const router = useRouter();
    const { profileContext } = useTheme();
    const usernamePath = profileContext?.username ? `${profileContext.username}` : "";
    const displayedSkills = miniView ? skills.slice(0, 3) : skills;
    const showSeeAll = miniView && skills.length > 0;
    const { userInfo } = useUserSettings()

    return (
        <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-6xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto"}>
            <PageHeader
                icon={<Zap className="w-6 h-6 text-[var(--accent)]" />}
                title="My Skills"
                description="Showcase your expertise and professional abilities"
                action={!miniView ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            onClick={() => {
                                handleShareProfile({
                                    title: `${userInfo?.username}'s Skills — Portfolio Pro`,
                                    text: `Explore ${userInfo?.username}'s expertise and skills on Portfolio Pro`,
                                    imageUrl: userInfo?.profile_picture || undefined
                                })
                            }}
                            className="self-start sm:self-auto"
                            text="Share Your Skills"
                            icon={<Share2 className="w-4 h-4" />}
                            variant="outline"
                        />
                        <Button
                            onClick={() => onAddDialogChange(true)}
                            className="self-start sm:self-auto"
                            text="Add Skill"
                            icon={<Plus className="w-4 h-4" />}
                        />
                    </div>
                ) : undefined}
            />

            {!isLoading && <StatsBar skills={skills} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            <SkillsGrid
                skills={displayedSkills}
                isLoading={isLoading}
                onEdit={onEditSkillChange}
                onDelete={onDeleteSkillChange}
                onAddClick={() => onAddDialogChange(true)}
                isOwner={true}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/skills` : "/skills")}
                        className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                    >
                        See all
                    </button>
                </div>
            )}

            <SkillDialogs
                addDialogOpen={addDialogOpen}
                onAddDialogChange={onAddDialogChange}
                editSkill={editSkill}
                onEditSkillChange={onEditSkillChange}
                deleteSkill={deleteSkill}
                onDeleteSkillChange={onDeleteSkillChange}
                isDeleting={isDeleting}
                onDeleteConfirm={onDeleteConfirm}
            />
        </div>
    );
}