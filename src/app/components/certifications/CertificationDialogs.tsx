// components/certifications/CertificationDialogs.tsx
import type { Certification } from "@/lib/stores/certifications/useCertifications";
import { AddCertificationDialog } from "./AddCertificationDialog";
import { EditCertificationDialog } from "./EditCertificationDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface CertificationDialogsProps {
    addDialogOpen: boolean;
    onAddDialogChange: (open: boolean) => void;
    editCert: Certification | null;
    onEditCertChange: (cert: Certification | null) => void;
    deleteCert: Certification | null;
    onDeleteCertChange: (cert: Certification | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
}

export function CertificationDialogs({
    addDialogOpen,
    onAddDialogChange,
    editCert,
    onEditCertChange,
    deleteCert,
    onDeleteCertChange,
    isDeleting,
    onDeleteConfirm,
}: CertificationDialogsProps) {
    return (
        <>
            <AddCertificationDialog
                open={addDialogOpen}
                onOpenChange={onAddDialogChange}
            />

            {editCert && (
                <EditCertificationDialog
                    certification={editCert}
                    open={!!editCert}
                    onOpenChange={(open) => {
                        if (!open) onEditCertChange(null);
                    }}
                />
            )}

            {deleteCert && (
                <DeleteConfirmDialog
                    certificationName={deleteCert.certification_name}
                    issuingOrganization={deleteCert.issuing_organization}
                    open={!!deleteCert}
                    isLoading={isDeleting}
                    onConfirm={onDeleteConfirm}
                    onOpenChange={(open) => {
                        if (!open) onDeleteCertChange(null);
                    }}
                />
            )}
        </>
    );
}