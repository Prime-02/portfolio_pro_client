// components/education/OwnProfileView.tsx
import { GraduationCap, Plus, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme/ThemeContext";
import Button from "../buttons/Buttons";
import { StatsBar } from "./StatsBar";
import { EducationsGrid } from "./EducationsGrid";
import { EducationDialogs } from "./EducationDialogs";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { Education } from "@/lib/stores/education/useEducation";
import { PageHeader } from "../ui/PageHeader";
import { handleShareProfile } from "@/lib/utilities/syncFunctions/syncs";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface OwnProfileViewProps {
    educations: Education[];
    isLoading: boolean;
    error: string | null;
    onClearError: () => void;
    addDialogOpen: boolean;
    onAddDialogChange: (open: boolean) => void;
    editEdu: Education | null;
    onEditEduChange: (edu: Education | null) => void;
    deleteEdu: Education | null;
    onDeleteEduChange: (edu: Education | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
    miniView?: boolean;
}

export function OwnProfileView({
    educations,
    isLoading,
    error,
    onClearError,
    addDialogOpen,
    onAddDialogChange,
    editEdu,
    onEditEduChange,
    deleteEdu,
    onDeleteEduChange,
    isDeleting,
    onDeleteConfirm,
    miniView = false,
}: OwnProfileViewProps) {
    const router = useRouter();
    const { profileContext } = useTheme();
    const { userInfo } = useUserSettings()
    const usernamePath = profileContext?.username ? `${profileContext.username}` : "";
    const displayedEducations = miniView ? educations.slice(0, 3) : educations;
    const showSeeAll = miniView && educations.length > 0;

    return (
        <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-6xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto"}>
            <PageHeader
                icon={<GraduationCap className="w-6 h-6 text-[var(--accent)]" />}
                title="My Education"
                description="Manage your academic background and qualifications"
                action={!miniView ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            onClick={() => {
                                handleShareProfile({
                                    title: `${userInfo?.username}'s Education — Portfolio Pro`,
                                    text: `Explore ${userInfo?.username}'s academic qualifications on Portfolio Pro`,
                                    imageUrl: userInfo?.profile_picture || undefined
                                })
                            }}
                            className="self-start sm:self-auto"
                            text="Share Education History"
                            icon={<Share2 className="w-4 h-4" />}
                            variant="outline"
                        />
                        <Button
                            onClick={() => onAddDialogChange(true)}
                            className="self-start sm:self-auto"
                            text="Add Education"
                            icon={<Plus className="w-4 h-4" />}
                        />
                    </div>
                ) : undefined}
            />

            {!isLoading && <StatsBar educations={educations} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            <EducationsGrid
                educations={displayedEducations}
                isLoading={isLoading}
                onEdit={onEditEduChange}
                onDelete={onDeleteEduChange}
                onAddClick={() => onAddDialogChange(true)}
                isOwner={true}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/education` : "/education")}
                        className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                    >
                        See all
                    </button>
                </div>
            )}

            <EducationDialogs
                addDialogOpen={addDialogOpen}
                onAddDialogChange={onAddDialogChange}
                editEdu={editEdu}
                onEditEduChange={onEditEduChange}
                deleteEdu={deleteEdu}
                onDeleteEduChange={onDeleteEduChange}
                isDeleting={isDeleting}
                onDeleteConfirm={onDeleteConfirm}
            />
        </div>
    );
}