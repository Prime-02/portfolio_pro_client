// components/experience/OwnProfileView.tsx
"use client";

import { Briefcase, Plus, Share2 } from "lucide-react";
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
}: OwnProfileViewProps) {
    const { fetchAllSkills } = useSkills()

    useEffect(() => {
        if (!isAuthenticated()) return
        fetchAllSkills()
    }, [])

    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-4xl mx-auto">
            <PageHeader
                icon={<Briefcase className="w-6 h-6 text-[var(--accent)]" />}
                title="My Experience"
                description="Your professional journey and career history"
                action={
                    <div className="flex items-center gap-x-2">
                        <Button
                            onClick={handleShareProfile}
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
                }
            />

            {!isLoading && <StatsBar experiences={experiences} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            <ExperienceTimeline
                experiences={experiences}
                isLoading={isLoading}
                onEdit={onEditExperienceChange}
                onDelete={onDeleteExperienceChange}
                onAddClick={() => onAddDialogChange(true)}
                isOwner={true}
            />

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