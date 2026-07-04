// components/certifications/OwnProfileView.tsx
import { Award, Plus, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme/ThemeContext";
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
    miniView?: boolean;
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
    miniView = false,
}: OwnProfileViewProps) {
    const router = useRouter();
    const { profileContext } = useTheme();
    const usernamePath = profileContext?.username ? `${profileContext.username}` : "";
    const displayedCertifications = miniView ? certifications.slice(0, 3) : certifications;
    const showSeeAll = miniView && certifications.length > 0;

    return (
        <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-6xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto"}>
            <PageHeader
                icon={<Award className="w-6 h-6 text-[var(--accent)]" />}
                title="My Certifications"
                description="Manage your professional certifications and credentials"
                action={!miniView ? (
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
                ) : undefined}
            />

            {!isLoading && <StatsBar certifications={certifications} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            <CertificationsGrid
                certifications={displayedCertifications}
                isLoading={isLoading}
                onEdit={onEditCertChange}
                onDelete={onDeleteCertChange}
                onAddClick={() => onAddDialogChange(true)}
                isOwner={true}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/certification` : "/certification")}
                        className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                    >
                        See all
                    </button>
                </div>
            )}

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