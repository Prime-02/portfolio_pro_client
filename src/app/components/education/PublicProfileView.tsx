// components/education/PublicProfileView.tsx
import { GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme/ThemeContext";
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
    miniView?: boolean;
}

export function PublicProfileView({ username, educations, isLoading, error, onClearError, miniView = false }: PublicProfileViewProps) {
    const router = useRouter();
    const { profileContext } = useTheme();
    const usernamePath = profileContext?.username ? `/${profileContext.username}` : "";
    const displayedEducations = miniView ? educations.slice(0, 3) : educations;
    const showSeeAll = miniView && educations.length > 0;

    return (
        <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-6xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto"}>
            <PageHeader
                icon={<GraduationCap className="w-6 h-6 text-[var(--accent)]" />}
                title={`${username}'s Education`}
                description="Academic background and qualifications"
            />
            {error && <ErrorMessage message={error} onDismiss={onClearError} />}
            <EducationsGrid
                educations={displayedEducations}
                isLoading={isLoading}
                onEdit={() => { }}
                onDelete={() => { }}
                onAddClick={() => { }}
                isOwner={false}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/education` : `/${username}/education`)}
                        className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                    >
                        See all
                    </button>
                </div>
            )}
        </div>
    );
}