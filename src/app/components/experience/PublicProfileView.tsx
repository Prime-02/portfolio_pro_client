// components/experience/PublicProfileView.tsx
"use client";

import { Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme/ThemeContext";
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
    miniView?: boolean;
}

export function PublicProfileView({
    username,
    experiences,
    isLoading,
    error,
    onClearError,
    miniView = false,
}: PublicProfileViewProps) {
    const router = useRouter();
    const { profileContext } = useTheme();
    const usernamePath = profileContext?.username ? `/${profileContext.username}` : "";
    const displayedExperiences = miniView ? experiences.slice(0, 3) : experiences;
    const showSeeAll = miniView && experiences.length > 0;

    return (
        <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-6xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto"}>
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
                experiences={displayedExperiences}
                isLoading={isLoading}
                onEdit={() => { }}
                onDelete={() => { }}
                onAddClick={() => { }}
                isOwner={false}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/experience` : `/${username}/experience`)}
                        className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                    >
                        See all
                    </button>
                </div>
            )}
        </div>
    );
}
