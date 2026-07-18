// app/(dashboard)/certifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useCertifications } from "@/lib/stores/certifications/useCertifications";
import type { Certification } from "@/lib/stores/certifications/useCertifications";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useTheme } from "../../../context/ThemeContext";

export default function CertificationsPage({ miniView = false }: { miniView?: boolean }) {
    const {
        certifications,
        isLoading,
        error,
        fetchAllCertifications,
        deleteCertification,
        isDeleting,
        clearError,
        fetchPublicCertifications,
        publicCertifications,
        isLoadingPublic,
    } = useCertifications();

    // Get profile context from ThemeContext instead of re-validating
    const { profileContext } = useTheme();

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editCert, setEditCert] = useState<Certification | null>(null);
    const [deleteCert, setDeleteCert] = useState<Certification | null>(null);

    // Derived state from profileContext
    const isOwnProfile = profileContext.kind === "own";
    const publicUsername = profileContext.kind === "public" ? profileContext.username : null;

    // Fetch data based on profile context
    useEffect(() => {
        if (profileContext.kind === "pending" || profileContext.kind === "unauthenticated" || profileContext.kind === "not-found") {
            return;
        }

        const fetchCerts = async () => {
            if (profileContext.kind === "public") {
                await fetchPublicCertifications(profileContext.username);
            } else if (profileContext.kind === "own") {
                await fetchAllCertifications();
            }
        };

        fetchCerts();
    }, [profileContext.kind, publicUsername]);

    const displayCerts = isOwnProfile ? certifications : publicCertifications;
    const displayLoading = isOwnProfile ? isLoading : isLoadingPublic;

    const handleDelete = async () => {
        if (!deleteCert?.id) return;
        await deleteCertification(deleteCert.id);
        setDeleteCert(null);
    };

    // UI states
    if (profileContext.kind === "pending") return <LoadingSkeleton />;

    if (profileContext.kind === "not-found" || profileContext.kind === "unauthenticated") {
        return <div>Profile not found</div>;
    }

    // Public profile view
    if (publicUsername) {
        return (
            <PublicProfileView
                username={publicUsername}
                certifications={displayCerts}
                miniView={miniView}
                isLoading={displayLoading}
                error={error}
                onClearError={clearError}
            />
        );
    }

    // Own profile view
    return (
        <OwnProfileView
            certifications={displayCerts}
            miniView={miniView}
            isLoading={displayLoading}
            error={error}
            onClearError={clearError}
            addDialogOpen={addDialogOpen}
            onAddDialogChange={setAddDialogOpen}
            editCert={editCert}
            onEditCertChange={setEditCert}
            deleteCert={deleteCert}
            onDeleteCertChange={setDeleteCert}
            isDeleting={isDeleting}
            onDeleteConfirm={handleDelete}
        />
    );
}