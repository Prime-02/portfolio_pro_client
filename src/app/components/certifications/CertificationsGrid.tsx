// components/certifications/CertificationsGrid.tsx
import { CertificationCard } from "./CertificationCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyCertificationsState } from "./EmptyCertificationsState";
import type { Certification } from "@/lib/stores/certifications/useCertifications";

interface CertificationsGridProps {
    certifications: Certification[];
    isLoading: boolean;
    onEdit: (cert: Certification) => void;
    onDelete: (cert: Certification) => void;
    onAddClick: () => void;
    isOwner?: boolean;
}

export function CertificationsGrid({
    certifications,
    isLoading,
    onEdit,
    onDelete,
    onAddClick,
    isOwner = false,
}: CertificationsGridProps) {
    if (isLoading) return <LoadingSkeleton />;

    if (certifications.length === 0) {
        return <EmptyCertificationsState onAddClick={onAddClick} isOwner={isOwner} />;
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
                <CertificationCard
                    key={cert.id}
                    certification={cert}
                    onEdit={() => onEdit(cert)}
                    onDelete={() => onDelete(cert)}
                    isOwner={isOwner}
                />
            ))}
        </div>
    );
}