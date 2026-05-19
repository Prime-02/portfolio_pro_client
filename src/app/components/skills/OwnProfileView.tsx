// components/skills/OwnProfileView.tsx
import { Zap, Plus } from "lucide-react";
import Button from "../buttons/Buttons";
import { StatsBar } from "./StatsBar";
import { SkillsGrid } from "./SkillsGrid";
import { SkillDialogs } from "./SkillDialogs";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import { PageHeader } from "../ui/PageHeader";

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
}: OwnProfileViewProps) {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <PageHeader
                icon={<Zap className="w-6 h-6 text-[var(--accent)]" />}
                title="My Skills"
                description="Showcase your expertise and professional abilities"
                action={
                    <Button
                        onClick={() => onAddDialogChange(true)}
                        className="self-start sm:self-auto"
                        text="Add Skill"
                        icon={<Plus className="w-4 h-4" />}
                    />
                }
            />

            {!isLoading && <StatsBar skills={skills} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            <SkillsGrid
                skills={skills}
                isLoading={isLoading}
                onEdit={onEditSkillChange}
                onDelete={onDeleteSkillChange}
                onAddClick={() => onAddDialogChange(true)}
                isOwner={true}
            />

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