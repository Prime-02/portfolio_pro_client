// app/(dashboard)/testimonials/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useValidation } from "@/lib/hooks/validation/useValidation";
import { useUserStore } from "@/lib/stores/user/userStore";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { isAuthenticated } from "@/lib/client/api";
import { useRouter } from "next/navigation";
import { Testimonial, useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

type TestimonialsScenario =
    | { kind: "public"; username: string }
    | { kind: "own" }
    | { kind: "not-found" }
    | { kind: "user-not-found"; username: string }
    | { kind: "pending" };

export default function TestimonialsPage() {
    const {
        userTestimonials,
        myAuthoredTestimonials,
        myReceivedTestimonials,
        userStats,
        userSummary,
        myAuthoredTestimonialsLoading,
        myReceivedTestimonialsLoading,
        userTestimonialsLoading,
        fetchUserTestimonials,
        fetchMyAuthoredTestimonials,
        fetchMyReceivedTestimonials,
        fetchUserTestimonialStats,
        fetchUserTestimonialSummary,
        deleteTestimonial: deleteTestimonialAction,
        approveTestimonial,
        deleting,
        approving,
        createError,
        updateError,
        deleteError,
        approveError,
    } = useTestimonialsStore();
    const { checkIfOwnProfile, validateProfileUsername } = useValidation();
    const { userInfo, fetchUserInfo } = useUserSettings();
    const { pathname } = useRouting();
    const router = useRouter();

    const [scenario, setScenario] = useState<TestimonialsScenario>({ kind: "pending" });
    const [deleteTestimonialState, setDeleteTestimonialState] = useState<Testimonial | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const resolveInProgress = useRef(false);

    // Combine store errors
    const combinedError = createError || updateError || deleteError || approveError || localError;

    const clearAllErrors = () => {
        setLocalError(null);
    };

    useEffect(() => {
        const resolveScenario = async () => {
            if (resolveInProgress.current) return;
            resolveInProgress.current = true;
            try {
                if (userInfo && !userInfo.username) await fetchUserInfo();

                const profileCheck = checkIfOwnProfile();
                const usernameInUrl = profileCheck?.username ?? null;
                const auth = isAuthenticated();

                if (usernameInUrl) {
                    const validation = await validateProfileUsername(usernameInUrl);
                    if (validation.isValid && validation.isOwnProfile) {
                        setScenario({ kind: "own" });
                    } else if (validation.isValid && validation.username) {
                        setScenario({ kind: "public", username: validation.username });
                    } else if (auth) {
                        setScenario({ kind: "user-not-found", username: usernameInUrl });
                    } else {
                        setScenario({ kind: "not-found" });
                    }
                } else if (auth) {
                    setScenario({ kind: "own" });
                } else {
                    setScenario({ kind: "not-found" });
                }
            } finally {
                resolveInProgress.current = false;
            }
        };
        resolveScenario();
    }, [pathname, userInfo?.username]);

    // Fetch data based on scenario
    useEffect(() => {
        if (scenario.kind === "pending") return;

        const fetchData = async () => {
            if (scenario.kind === "public") {
                await fetchUserTestimonials({ username: scenario.username });
                await fetchUserTestimonialStats(scenario.username);
                // Also fetch my authored testimonials if authenticated (for "Mine" tab)
                if (isAuthenticated()) {
                    await fetchMyAuthoredTestimonials();
                }
            } else if (scenario.kind === "own" || scenario.kind === "user-not-found") {
                const username = userInfo?.username;
                if (username) {
                    // Fetch public testimonials for this user (for sharing/public view)
                    await fetchUserTestimonials({ username });
                    // Fetch ALL received testimonials (includes pending) for owner view
                    await fetchMyReceivedTestimonials();
                    // Fetch authored testimonials
                    await fetchMyAuthoredTestimonials();
                    await fetchUserTestimonialStats(username);
                }
            }
        };

        fetchData();
    }, [scenario, userInfo?.username]);

    const isOwnProfile = scenario.kind === "own" || scenario.kind === "user-not-found";
    const currentUsername = isOwnProfile ? userInfo?.username : scenario.kind === "public" ? scenario.username : "";

    const theirTestimonials = currentUsername ? (userTestimonials[currentUsername] || []) : [];
    const stats = currentUsername ? (userStats[currentUsername] || undefined) : undefined;

    const handleDelete = async () => {
        if (!deleteTestimonialState?.id) return;
        try {
            await deleteTestimonialAction(deleteTestimonialState.id);
            setDeleteTestimonialState(null);
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : "Failed to delete testimonial");
        }
    };

    const handleApprove = async (testimonial: Testimonial) => {
        if (!testimonial.id) return;
        try {
            await approveTestimonial(testimonial.id);
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : "Failed to approve testimonial");
        }
    };

    const handleNavigateToWrite = () => {
        const targetUsername = isOwnProfile ? "" : scenario.kind === "public" ? scenario.username : "";
        const query = targetUsername ? `?for=${encodeURIComponent(targetUsername)}` : "";
        if (!targetUsername) return
        router.push(`/${targetUsername}/testimonials/write${query}`);
    };

    const handleNavigateToEdit = (testimonial: Testimonial) => {
        const targetUsername = isOwnProfile ? "" : scenario.kind === "public" ? scenario.username : "";
        if (!targetUsername) return
        router.push(`/${targetUsername}/testimonials/edit/${testimonial.id}`);
    };

    // UI states
    if (scenario.kind === "pending") return <LoadingSkeleton />;
    if (scenario.kind === "not-found") return <div>Profile not found</div>;

    // Public profile view
    if (!isOwnProfile && scenario.kind === "public") {
        return (
            <PublicProfileView
                username={scenario.username}
                theirTestimonials={theirTestimonials}
                myAuthoredTestimonials={myAuthoredTestimonials}
                isLoading={userTestimonialsLoading}
                isLoadingAuthored={myAuthoredTestimonialsLoading}
                error={combinedError}
                onClearError={clearAllErrors}
                deleteTestimonial={deleteTestimonialState}
                onDeleteTestimonialChange={setDeleteTestimonialState}
                isDeleting={deleting}
                onDeleteConfirm={handleDelete}
                stats={stats}
                onNavigateToWrite={handleNavigateToWrite}
                onNavigateToEdit={handleNavigateToEdit}
                isAuthenticated={isAuthenticated()}
            />
        );
    }

    // Own profile view — now passes myReceivedTestimonials for the "Received" tab
    return (
        <OwnProfileView
            receivedTestimonials={myReceivedTestimonials}
            authoredTestimonials={myAuthoredTestimonials}
            isLoadingReceived={myReceivedTestimonialsLoading}
            isLoadingAuthored={myAuthoredTestimonialsLoading}
            error={combinedError}
            onClearError={clearAllErrors}
            deleteTestimonial={deleteTestimonialState}
            onDeleteTestimonialChange={setDeleteTestimonialState}
            isDeleting={deleting}
            onDeleteConfirm={handleDelete}
            stats={stats}
            onNavigateToWrite={handleNavigateToWrite}
            onNavigateToEdit={handleNavigateToEdit}
            onApproveTestimonial={handleApprove}
        />
    );
}