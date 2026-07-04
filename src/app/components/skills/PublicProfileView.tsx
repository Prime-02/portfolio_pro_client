// components/skills/PublicProfileView.tsx
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme/ThemeContext";
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
    miniView?: boolean;
}

export function PublicProfileView({ username, skills, isLoading, error, onClearError, miniView = false }: PublicProfileViewProps) {
    const router = useRouter();
    const { profileContext } = useTheme();
    const usernamePath = profileContext?.username ? `/${profileContext.username}` : "";
    const displayedSkills = miniView ? skills.slice(0, 3) : skills;
    const showSeeAll = miniView && skills.length > 0;

    return (
        <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-6xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto"}>
            <PageHeader
                icon={<Zap className="w-6 h-6 text-[var(--accent)]" />}
                title={`${username}'s Skills`}
                description="Expertise and professional abilities"
            />
            {error && <ErrorMessage message={error} onDismiss={onClearError} />}
            <SkillsGrid
                skills={displayedSkills}
                isLoading={isLoading}
                onEdit={() => { }}
                onDelete={() => { }}
                onAddClick={() => { }}
                isOwner={false}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/skills` : `/${username}/skills`)}
                        className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                    >
                        See all
                    </button>
                </div>
            )}
        </div>
    );
}