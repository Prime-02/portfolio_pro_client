// components/education/OwnProfileView.tsx
import { GraduationCap, Plus } from "lucide-react";
import Button from "../buttons/Buttons";
import { StatsBar } from "./StatsBar";
import { EducationsGrid } from "./EducationsGrid";
import { EducationDialogs } from "./EducationDialogs";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { Education } from "@/lib/stores/education/useEducation";
import { PageHeader } from "../ui/PageHeader";

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
}: OwnProfileViewProps) {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <PageHeader
                icon={<GraduationCap className="w-6 h-6 text-[var(--accent)]" />}
                title="My Education"
                description="Manage your academic background and qualifications"
                action={
                    <Button
                        onClick={() => onAddDialogChange(true)}
                        className="self-start sm:self-auto"
                        text="Add Education"
                        icon={<Plus className="w-4 h-4" />}
                    />
                }
            />

            {!isLoading && <StatsBar educations={educations} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            <EducationsGrid
                educations={educations}
                isLoading={isLoading}
                onEdit={onEditEduChange}
                onDelete={onDeleteEduChange}
                onAddClick={() => onAddDialogChange(true)}
                isOwner={true}
            />

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