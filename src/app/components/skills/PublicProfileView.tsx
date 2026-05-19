// components/skills/PublicProfileView.tsx
import { Zap } from "lucide-react";
import { SkillsGrid } from "./SkillsGrid";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import { PageHeader } from "../ui/PageHeader";

interface PublicProfileViewProps {
    username: string;
    skills: ProfessionalSkill[];
    isLoading: boolean;
    error: string | null;
    onClearError: () => void;
}

export function PublicProfileView({ username, skills, isLoading, error, onClearError }: PublicProfileViewProps) {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <PageHeader
                icon={<Zap className="w-6 h-6 text-[var(--accent)]" />}
                title={`${username}'s Skills`}
                description="Expertise and professional abilities"
            />
            {error && <ErrorMessage message={error} onDismiss={onClearError} />}
            <SkillsGrid
                skills={skills}
                isLoading={isLoading}
                onEdit={() => { }}
                onDelete={() => { }}
                onAddClick={() => { }}
                isOwner={false}
            />
        </div>
    );
}