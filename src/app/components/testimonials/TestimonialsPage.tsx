// app/(dashboard)/testimonials/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";
import { isAuthenticated } from "@/lib/client/api";
import { useRouter } from "next/navigation";
import { Testimonial } from "@/lib/stores/testimonials/useTestimonial";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { PublicProfileView } from "./PublicProfileView";
import { OwnProfileView } from "./OwnProfileView";
import { useTheme } from "../theme/ThemeContext ";

const PAGE_SIZE = 20;

export default function TestimonialsPage() {
    const {
        // User testimonials by username (public view)
        userTestimonials,
        userTestimonialsTotal,
        userTestimonialsPage,
        userTestimonialsHasMore,
        userTestimonialsLoading,
        userTestimonialsError,

        // My received testimonials (own view)
        myReceivedTestimonials,
        myReceivedTestimonialsTotal,
        myReceivedTestimonialsPage,
        myReceivedTestimonialsHasMore,
        myReceivedTestimonialsLoading,
        myReceivedTestimonialsError,

        // My authored testimonials
        myAuthoredTestimonials,
        myAuthoredTestimonialsTotal,
        myAuthoredTestimonialsPage,
        myAuthoredTestimonialsHasMore,
        myAuthoredTestimonialsLoading,
        myAuthoredTestimonialsError,

        // Stats
        userStats,
        fetchUserTestimonials,
        fetchMyAuthoredTestimonials,
        fetchMyReceivedTestimonials,
        fetchUserTestimonialStats,

        // Mutations
        deleteTestimonial: deleteTestimonialAction,
        approveTestimonial,
        deleting,
        approving,
        createError,
        updateError,
        deleteError,
        approveError,
    } = useTestimonialsStore();

    // Get profile context from ThemeContext instead of re-validating
    const { profileContext } = useTheme();
    const router = useRouter();

    const [deleteTestimonialState, setDeleteTestimonialState] = useState<Testimonial | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"received" | "authored">("received");

    // Derived state from profileContext
    const isOwnProfile = profileContext.kind === "own";
    const currentUsername = profileContext.username;

    // Combine store errors
    const combinedError = createError || updateError || deleteError || approveError || localError;

    const clearAllErrors = () => {
        setLocalError(null);
    };

    // ── Initial data fetch (always page 1) ───────────────────────────────
    useEffect(() => {
        if (
            profileContext.kind === "pending" ||
            profileContext.kind === "unauthenticated" ||
            profileContext.kind === "not-found"
        ) {
            return;
        }

        if (!currentUsername) return;

        const fetchData = async () => {
            if (profileContext.kind === "public") {
                await Promise.all([
                    fetchUserTestimonials({ username: currentUsername, skip: 0, limit: PAGE_SIZE }),
                    fetchUserTestimonialStats(currentUsername),
                    ...(isAuthenticated()
                        ? [fetchMyAuthoredTestimonials({ skip: 0, limit: PAGE_SIZE })]
                        : []
                    ),
                ]);
            } else if (profileContext.kind === "own") {
                // Don't call fetchUserTestimonials here — own view uses myReceivedTestimonials,
                // not userTestimonials. Running it sequentially before the others was causing
                // the received/authored fetches to miss their window in production.
                await Promise.all([
                    fetchMyReceivedTestimonials({ skip: 0, limit: PAGE_SIZE }),
                    fetchMyAuthoredTestimonials({ skip: 0, limit: PAGE_SIZE }),
                    fetchUserTestimonialStats(currentUsername),
                ]);
            }
        };

        fetchData();
    }, [
        profileContext.kind,
        currentUsername,
        fetchUserTestimonials,
        fetchMyAuthoredTestimonials,
        fetchMyReceivedTestimonials,
        fetchUserTestimonialStats,
    ]);

    // ── Store error sync ─────────────────────────────────────────────────
    useEffect(() => {
        const storeError =
            userTestimonialsError ||
            myReceivedTestimonialsError ||
            myAuthoredTestimonialsError;
        if (storeError) setLocalError(storeError);
    }, [userTestimonialsError, myReceivedTestimonialsError, myAuthoredTestimonialsError]);

    // ── Load-more handlers ───────────────────────────────────────────────
    const handleLoadMoreUserTestimonials = useCallback(async () => {
        if (!userTestimonialsHasMore || userTestimonialsLoading || !currentUsername) return;

        const nextPage = userTestimonialsPage + 1;
        const skip = (nextPage - 1) * PAGE_SIZE;

        await fetchUserTestimonials({
            username: currentUsername,
            skip,
            limit: PAGE_SIZE,
        });
    }, [
        userTestimonialsHasMore,
        userTestimonialsLoading,
        userTestimonialsPage,
        currentUsername,
        fetchUserTestimonials,
    ]);

    const handleLoadMoreAuthored = useCallback(async () => {
        if (!myAuthoredTestimonialsHasMore || myAuthoredTestimonialsLoading) return;

        await fetchMyAuthoredTestimonials({
            skip: myAuthoredTestimonialsPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        });
    }, [
        myAuthoredTestimonialsHasMore,
        myAuthoredTestimonialsLoading,
        myAuthoredTestimonialsPage,
        fetchMyAuthoredTestimonials,
    ]);

    const handleLoadMoreReceived = useCallback(async () => {
        if (!myReceivedTestimonialsHasMore || myReceivedTestimonialsLoading) return;

        await fetchMyReceivedTestimonials({
            skip: myReceivedTestimonialsPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        });
    }, [
        myReceivedTestimonialsHasMore,
        myReceivedTestimonialsLoading,
        myReceivedTestimonialsPage,
        fetchMyReceivedTestimonials,
    ]);

    // ── Actions ──────────────────────────────────────────────────────────
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
        if (!currentUsername) return;
        const query = `?for=${encodeURIComponent(currentUsername)}`;
        router.push(`/${currentUsername}/testimonials/write${query}`);
    };

    const handleNavigateToEdit = (testimonial: Testimonial) => {
        if (!currentUsername) return;
        router.push(`/${currentUsername}/testimonials/edit/${testimonial.id}`);
    };

    // ── Loading state ────────────────────────────────────────────────────
    const isLoading =
        userTestimonialsLoading ||
        myReceivedTestimonialsLoading ||
        myAuthoredTestimonialsLoading;

    // ── Render ───────────────────────────────────────────────────────────
    if (profileContext.kind === "pending") return <LoadingSkeleton />;

    if (profileContext.kind === "not-found" || profileContext.kind === "unauthenticated") {
        return <div>Profile not found</div>;
    }

    // Public profile view
    if (!isOwnProfile && profileContext.kind === "public") {
        return (
            <PublicProfileView
                username={currentUsername || ""}
                theirTestimonials={userTestimonials}
                totalTestimonials={userTestimonialsTotal}
                isLoading={userTestimonialsLoading}
                hasMore={userTestimonialsHasMore}
                onLoadMore={handleLoadMoreUserTestimonials}
                myAuthoredTestimonials={myAuthoredTestimonials}
                myAuthoredTotal={myAuthoredTestimonialsTotal}
                isLoadingAuthored={myAuthoredTestimonialsLoading}
                hasMoreAuthored={myAuthoredTestimonialsHasMore}
                onLoadMoreAuthored={handleLoadMoreAuthored}
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

    // Own profile view
    return (
        <OwnProfileView
            receivedTestimonials={myReceivedTestimonials}
            totalReceived={myReceivedTestimonialsTotal}
            isLoadingReceived={myReceivedTestimonialsLoading}
            hasMoreReceived={myReceivedTestimonialsHasMore}
            onLoadMoreReceived={handleLoadMoreReceived}
            authoredTestimonials={myAuthoredTestimonials}
            totalAuthored={myAuthoredTestimonialsTotal}
            isLoadingAuthored={myAuthoredTestimonialsLoading}
            hasMoreAuthored={myAuthoredTestimonialsHasMore}
            onLoadMoreAuthored={handleLoadMoreAuthored}
            activeTab={activeTab}
            onTabChange={setActiveTab}
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