// components/certifications/PublicProfileView.tsx
import { Award } from "lucide-react";
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
}

export function PublicProfileView({ username, certifications, isLoading, error, onClearError }: PublicProfileViewProps) {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <PageHeader
                icon={<Award className="w-6 h-6 text-[var(--accent)]" />}
                title={`${username}'s Certifications`}
                description="Professional certifications and credentials"
            />
            {error && <ErrorMessage message={error} onDismiss={onClearError} />}
            <CertificationsGrid
                certifications={certifications}
                isLoading={isLoading}
                onEdit={() => { }}
                onDelete={() => { }}
                onAddClick={() => { }}
                isOwner={false}
            />
        </div>
    );
}