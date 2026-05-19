// components/education/PublicProfileView.tsx
import { GraduationCap } from "lucide-react";
import { EducationsGrid } from "./EducationsGrid";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { Education } from "@/lib/stores/education/useEducation";
import { PageHeader } from "../ui/PageHeader";

interface PublicProfileViewProps {
    username: string;
    educations: Education[];
    isLoading: boolean;
    error: string | null;
    onClearError: () => void;
}

export function PublicProfileView({ username, educations, isLoading, error, onClearError }: PublicProfileViewProps) {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <PageHeader
                icon={<GraduationCap className="w-6 h-6 text-[var(--accent)]" />}
                title={`${username}'s Education`}
                description="Academic background and qualifications"
            />
            {error && <ErrorMessage message={error} onDismiss={onClearError} />}
            <EducationsGrid
                educations={educations}
                isLoading={isLoading}
                onEdit={() => { }}
                onDelete={() => { }}
                onAddClick={() => { }}
                isOwner={false}
            />
        </div>
    );
}