// components/experience/PublicProfileView.tsx
"use client";

import { Briefcase } from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { StatsBar } from "./StatsBar";
import { ExperienceTimeline } from "./ExperienceTimeline";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { Experience } from "@/lib/stores/experiences/useExperience";

interface PublicProfileViewProps {
    username: string;
    experiences: Experience[];
    isLoading: boolean;
    error: string | null;
    onClearError: () => void;
}

export function PublicProfileView({
    username,
    experiences,
    isLoading,
    error,
    onClearError,
}: PublicProfileViewProps) {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-4xl mx-auto">
            <PageHeader
                icon={<Briefcase className="w-6 h-6 text-[var(--accent)]" />}
                title={`${username}'s Experience`}
                description="Professional journey and career history"
            />

            {!isLoading && experiences.length > 0 && (
                <StatsBar experiences={experiences} />
            )}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            <ExperienceTimeline
                experiences={experiences}
                isLoading={isLoading}
                onEdit={() => {}}
                onDelete={() => {}}
                onAddClick={() => {}}
                isOwner={false}
            />
        </div>
    );
}
