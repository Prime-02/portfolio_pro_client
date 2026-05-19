// components/skills/SkillDialogs.tsx
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import { AddSkillDialog } from "./AddSkillDialog";
import { EditSkillDialog } from "./EditSkillDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface SkillDialogsProps {
    addDialogOpen: boolean;
    onAddDialogChange: (open: boolean) => void;
    editSkill: ProfessionalSkill | null;
    onEditSkillChange: (skill: ProfessionalSkill | null) => void;
    deleteSkill: ProfessionalSkill | null;
    onDeleteSkillChange: (skill: ProfessionalSkill | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
}

export function SkillDialogs({
    addDialogOpen,
    onAddDialogChange,
    editSkill,
    onEditSkillChange,
    deleteSkill,
    onDeleteSkillChange,
    isDeleting,
    onDeleteConfirm,
}: SkillDialogsProps) {
    return (
        <>
            <AddSkillDialog
                open={addDialogOpen}
                onOpenChange={onAddDialogChange}
            />

            {editSkill && (
                <EditSkillDialog
                    skill={editSkill}
                    open={!!editSkill}
                    onOpenChange={(open) => {
                        if (!open) onEditSkillChange(null);
                    }}
                />
            )}

            {deleteSkill && (
                <DeleteConfirmDialog
                    skillName={deleteSkill.skill_name}
                    proficiencyLevel={deleteSkill.proficiency_level}
                    open={!!deleteSkill}
                    isLoading={isDeleting}
                    onConfirm={onDeleteConfirm}
                    onOpenChange={(open) => {
                        if (!open) onDeleteSkillChange(null);
                    }}
                />
            )}
        </>
    );
}