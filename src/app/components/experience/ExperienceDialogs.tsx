// components/experience/ExperienceDialogs.tsx
import type { Experience } from "@/lib/stores/experiences/useExperience";
import { AddExperienceDialog } from "./AddExperienceDialog";
import { EditExperienceDialog } from "./EditExperienceDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface ExperienceDialogsProps {
    addDialogOpen: boolean;
    onAddDialogChange: (open: boolean) => void;
    editExperience: Experience | null;
    onEditExperienceChange: (experience: Experience | null) => void;
    deleteExperience: Experience | null;
    onDeleteExperienceChange: (experience: Experience | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
}

export function ExperienceDialogs({
    addDialogOpen,
    onAddDialogChange,
    editExperience,
    onEditExperienceChange,
    deleteExperience,
    onDeleteExperienceChange,
    isDeleting,
    onDeleteConfirm,
}: ExperienceDialogsProps) {
    return (
        <>
            <AddExperienceDialog
                open={addDialogOpen}
                onOpenChange={onAddDialogChange}
            />

            {editExperience && (
                <EditExperienceDialog
                    experience={editExperience}
                    open={!!editExperience}
                    onOpenChange={(open) => {
                        if (!open) onEditExperienceChange(null);
                    }}
                />
            )}

            {deleteExperience && (
                <DeleteConfirmDialog
                    jobTitle={deleteExperience.job_title}
                    companyName={deleteExperience.company_name}
                    open={!!deleteExperience}
                    isLoading={isDeleting}
                    onConfirm={onDeleteConfirm}
                    onOpenChange={(open) => {
                        if (!open) onDeleteExperienceChange(null);
                    }}
                />
            )}
        </>
    );
}
