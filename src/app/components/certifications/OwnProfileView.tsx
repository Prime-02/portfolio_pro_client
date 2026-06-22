// components/certifications/OwnProfileView.tsx
import { Award, Plus, Share2 } from "lucide-react";
import Button from "../buttons/Buttons";
import { PageHeader } from "../ui/PageHeader";
import { CertificationsGrid } from "./CertificationsGrid";
import { CertificationDialogs } from "./CertificationDialogs";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { Certification } from "@/lib/stores/certifications/useCertifications";
import { StatsBar } from "./StatsBar";
import { handleShareProfile } from "@/lib/utilities/syncFunctions/syncs";

interface OwnProfileViewProps {
    certifications: Certification[];
    isLoading: boolean;
    error: string | null;
    onClearError: () => void;
    addDialogOpen: boolean;
    onAddDialogChange: (open: boolean) => void;
    editCert: Certification | null;
    onEditCertChange: (cert: Certification | null) => void;
    deleteCert: Certification | null;
    onDeleteCertChange: (cert: Certification | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
}

export function OwnProfileView({
    certifications,
    isLoading,
    error,
    onClearError,
    addDialogOpen,
    onAddDialogChange,
    editCert,
    onEditCertChange,
    deleteCert,
    onDeleteCertChange,
    isDeleting,
    onDeleteConfirm,
}: OwnProfileViewProps) {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <PageHeader
                icon={<Award className="w-6 h-6 text-[var(--accent)]" />}
                title="My Certifications"
                description="Manage your professional certifications and credentials"
                action={
                    <div className="flex items-center gap-x-2">
                        <Button
                            onClick={handleShareProfile}
                            className="self-start sm:self-auto"
                            text="Share Your Certifications"
                            icon={<Share2 className="w-4 h-4" />}
                            variant="outline"
                        />
                        <Button
                            onClick={() => onAddDialogChange(true)}
                            className="self-start sm:self-auto"
                            text="Add Certification"
                            icon={<Plus className="w-4 h-4" />}
                        />
                    </div>
                }
            />

            {!isLoading && <StatsBar certifications={certifications} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            <CertificationsGrid
                certifications={certifications}
                isLoading={isLoading}
                onEdit={onEditCertChange}
                onDelete={onDeleteCertChange}
                onAddClick={() => onAddDialogChange(true)}
                isOwner={true}
            />

            <CertificationDialogs
                addDialogOpen={addDialogOpen}
                onAddDialogChange={onAddDialogChange}
                editCert={editCert}
                onEditCertChange={onEditCertChange}
                deleteCert={deleteCert}
                onDeleteCertChange={onDeleteCertChange}
                isDeleting={isDeleting}
                onDeleteConfirm={onDeleteConfirm}
            />
        </div>
    );
}