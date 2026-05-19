// components/education/EducationDialogs.tsx
import type { Education } from "@/lib/stores/education/useEducation";
import { AddEducationDialog } from "./AddEducationDialog";
import { EditEducationDialog } from "./EditEducationDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface EducationDialogsProps {
    addDialogOpen: boolean;
    onAddDialogChange: (open: boolean) => void;
    editEdu: Education | null;
    onEditEduChange: (edu: Education | null) => void;
    deleteEdu: Education | null;
    onDeleteEduChange: (edu: Education | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
}

export function EducationDialogs({
    addDialogOpen,
    onAddDialogChange,
    editEdu,
    onEditEduChange,
    deleteEdu,
    onDeleteEduChange,
    isDeleting,
    onDeleteConfirm,
}: EducationDialogsProps) {
    return (
        <>
            <AddEducationDialog
                open={addDialogOpen}
                onOpenChange={onAddDialogChange}
            />

            {editEdu && (
                <EditEducationDialog
                    education={editEdu}
                    open={!!editEdu}
                    onOpenChange={(open) => {
                        if (!open) onEditEduChange(null);
                    }}
                />
            )}

            {deleteEdu && (
                <DeleteConfirmDialog
                    institution={deleteEdu.institution}
                    degree={deleteEdu.degree}
                    open={!!deleteEdu}
                    isLoading={isDeleting}
                    onConfirm={onDeleteConfirm}
                    onOpenChange={(open) => {
                        if (!open) onDeleteEduChange(null);
                    }}
                />
            )}
        </>
    );
}