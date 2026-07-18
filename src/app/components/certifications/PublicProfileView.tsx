// components/certifications/PublicProfileView.tsx
import { Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../context/ThemeContext";
import { PageHeader } from "../ui/PageHeader";
import { CertificationsGrid } from "./CertificationsGrid";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { Certification } from "@/lib/stores/certifications/useCertifications";

interface PublicProfileViewProps {
    username: string;
    certifications: Certification[];
    isLoading: boolean;
    error: string | null;
    onClearError: () => void;
    miniView?: boolean;
}

export function PublicProfileView({ username, certifications, isLoading, error, onClearError, miniView = false }: PublicProfileViewProps) {
    const router = useRouter();
    const { profileContext } = useTheme();
    const usernamePath = profileContext?.username ? `${profileContext.username}` : "";
    const displayedCertifications = miniView ? certifications.slice(0, 3) : certifications;
    const showSeeAll = miniView && certifications.length > 0;

    return (
        <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-6xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto"}>
            <PageHeader
                icon={<Award className="w-6 h-6 text-[var(--accent)]" />}
                title={`${username}'s Certifications`}
                description="Professional certifications and credentials"
            />
            {error && <ErrorMessage message={error} onDismiss={onClearError} />}
            <CertificationsGrid
                certifications={displayedCertifications}
                isLoading={isLoading}
                onEdit={() => { }}
                onDelete={() => { }}
                onAddClick={() => { }}
                isOwner={false}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/certification` : `/${username}/certification`)}
                        className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                    >
                        See all
                    </button>
                </div>
            )}
        </div>
    );
}