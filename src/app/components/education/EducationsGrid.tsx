// components/education/EducationsGrid.tsx
import { EducationCard } from "./EducationCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyEducationsState } from "./EmptyEducationsState";
import type { Education } from "@/lib/stores/education/useEducation";

interface EducationsGridProps {
    educations: Education[];
    isLoading: boolean;
    onEdit: (edu: Education) => void;
    onDelete: (edu: Education) => void;
    onAddClick: () => void;
    isOwner?: boolean;
}

export function EducationsGrid({
    educations,
    isLoading,
    onEdit,
    onDelete,
    onAddClick,
    isOwner = false,
}: EducationsGridProps) {
    if (isLoading) return <LoadingSkeleton />;

    if (educations.length === 0) {
        return <EmptyEducationsState onAddClick={onAddClick} isOwner={isOwner} />;
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {educations.map((edu) => (
                <EducationCard
                    key={edu.id}
                    education={edu}
                    onEdit={() => onEdit(edu)}
                    onDelete={() => onDelete(edu)}
                    isOwner={isOwner}
                />
            ))}
        </div>
    );
}