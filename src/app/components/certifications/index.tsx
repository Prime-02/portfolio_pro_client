// app/(dashboard)/certifications/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useCertifications } from "@/lib/stores/certifications/useCertifications";
import type { Certification } from "@/lib/stores/certifications/useCertifications";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useValidation } from "@/lib/hooks/validation/useValidation";
import { useUserStore } from "@/lib/stores/user/userStore";
import { useRouting } from "@/lib/hooks/routing/useRouting";

type CertificationsScenario =
    | { kind: "public"; username: string }
    | { kind: "own" }
    | { kind: "not-found" }
    | { kind: "user-not-found"; username: string }
    | { kind: "pending" };

export default function CertificationsPage() {
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
    const { checkIfOwnProfile, validateProfileUsername } = useValidation();
    const { userData, fetchUserData } = useUserStore();
    const { pathname } = useRouting();

    const [scenario, setScenario] = useState<CertificationsScenario>({ kind: "pending" });
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editCert, setEditCert] = useState<Certification | null>(null);
    const [deleteCert, setDeleteCert] = useState<Certification | null>(null);

    const resolveInProgress = useRef(false);

    useEffect(() => {
        const resolveScenario = async () => {
            if (resolveInProgress.current) return;
            resolveInProgress.current = true;
            try {
                if (userData && !userData.username) await fetchUserData();

                const profileCheck = checkIfOwnProfile();
                const usernameInUrl = profileCheck?.username ?? null;
                const isAuthenticated = !!userData?.username;

                if (usernameInUrl) {
                    const validation = await validateProfileUsername(usernameInUrl);
                    if (validation.isValid && validation.isOwnProfile) {
                        setScenario({ kind: "own" });
                    } else if (validation.isValid && validation.username) {
                        setScenario({ kind: "public", username: validation.username });
                    } else if (isAuthenticated) {
                        setScenario({ kind: "user-not-found", username: usernameInUrl });
                    } else {
                        setScenario({ kind: "not-found" });
                    }
                } else if (isAuthenticated) {
                    setScenario({ kind: "own" });
                } else {
                    setScenario({ kind: "not-found" });
                }
            } finally {
                resolveInProgress.current = false;
            }
        };
        resolveScenario();
    }, [pathname, userData?.username]);

    // Fetch data based on scenario
    useEffect(() => {
        if (scenario.kind === "pending") return;

        const fetchCerts = async () => {
            if (scenario.kind === "public") {
                await fetchPublicCertifications(scenario.username);
            } else if (scenario.kind === "own" || scenario.kind === "user-not-found") {
                await fetchAllCertifications();
            }
        };

        fetchCerts();
    }, [scenario]);

    const isOwnProfile = scenario.kind === "own" || scenario.kind === "user-not-found";
    const displayCerts = isOwnProfile ? certifications : publicCertifications;
    const displayLoading = isOwnProfile ? isLoading : isLoadingPublic;

    const handleDelete = async () => {
        if (!deleteCert?.id) return;
        await deleteCertification(deleteCert.id);
        setDeleteCert(null);
    };

    // UI states
    if (scenario.kind === "pending") return <LoadingSkeleton />;
    if (scenario.kind === "not-found") return <div>Profile not found</div>;

    // Public profile view
    if (!isOwnProfile && scenario.kind === "public") {
        return (
            <PublicProfileView
                username={scenario.username}
                certifications={displayCerts}
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