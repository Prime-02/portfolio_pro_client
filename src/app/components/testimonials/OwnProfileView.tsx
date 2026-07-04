// components/testimonials/OwnProfileView.tsx
"use client";

import { Quote, PenLine, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme/ThemeContext";
import Button from "../buttons/Buttons";
import { Testimonial, TestimonialStats } from "@/lib/stores/testimonials/useTestimonial";
import { StatsBar } from "./StatsBar";
import { ErrorMessage } from "../ui/ErrorMessage";
import { TestimonialsGrid } from "./TestimonialsGrid";
import { TestimonialDialogs } from "./TestimonialDialogs";
import { PageHeader } from "../ui/PageHeader";
import { InfiniteScrollTrigger } from "../blogs/InfiniteScrollTrigger";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { handleShareProfile } from "@/lib/utilities/syncFunctions/syncs";

interface OwnProfileViewProps {
    receivedTestimonials: Testimonial[];
    totalReceived: number;
    isLoadingReceived: boolean;
    hasMoreReceived: boolean;
    onLoadMoreReceived: () => void;
    authoredTestimonials: Testimonial[];
    totalAuthored: number;
    isLoadingAuthored: boolean;
    hasMoreAuthored: boolean;
    onLoadMoreAuthored: () => void;
    activeTab: "received" | "authored";
    onTabChange: (tab: "received" | "authored") => void;
    error: string | null;
    onClearError: () => void;
    deleteTestimonial: Testimonial | null;
    onDeleteTestimonialChange: (testimonial: Testimonial | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
    stats?: TestimonialStats;
    onNavigateToWrite: () => void;
    onNavigateToEdit: (testimonial: Testimonial) => void;
    onApproveTestimonial: (testimonial: Testimonial) => Promise<void>;
    miniView?: boolean;
}

export function OwnProfileView({
    receivedTestimonials,
    totalReceived,
    isLoadingReceived,
    hasMoreReceived,
    onLoadMoreReceived,
    authoredTestimonials,
    totalAuthored,
    isLoadingAuthored,
    hasMoreAuthored,
    onLoadMoreAuthored,
    activeTab,
    onTabChange,
    error,
    onClearError,
    deleteTestimonial,
    onDeleteTestimonialChange,
    isDeleting,
    onDeleteConfirm,
    stats,
    onNavigateToWrite,
    onNavigateToEdit,
    onApproveTestimonial,
    miniView = false,
}: OwnProfileViewProps) {
    const router = useRouter();
    const { profileContext } = useTheme();
    const usernamePath = profileContext?.username ? `/${profileContext.username}` : "";
    const isReceivedTab = activeTab === "received";
    const currentTestimonials = isReceivedTab ? receivedTestimonials : authoredTestimonials;
    const currentTotal = isReceivedTab ? totalReceived : totalAuthored;
    const currentLoading = isReceivedTab ? isLoadingReceived : isLoadingAuthored;
    const currentHasMore = isReceivedTab ? hasMoreReceived : hasMoreAuthored;
    const currentOnLoadMore = isReceivedTab ? onLoadMoreReceived : onLoadMoreAuthored;
    const displayedTestimonials = miniView ? currentTestimonials.slice(0, 3) : currentTestimonials;
    const showSeeAll = miniView && currentTestimonials.length > 0;

    // Show loading skeleton only on initial load (no data yet)
    if (isLoadingReceived && receivedTestimonials.length === 0 && isReceivedTab) {
        return <LoadingSkeleton />;
    }

    // Count pending (unapproved) testimonials in received tab
    const pendingCount = receivedTestimonials.filter((t) => !t.is_approved).length;

    return (
        <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-6xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto"}>
            <PageHeader
                icon={<Quote className="w-6 h-6 text-[var(--accent)]" />}
                title="My Testimonials"
                description={
                    isReceivedTab
                        ? `${totalReceived} testimonial${totalReceived !== 1 ? "s" : ""} received${pendingCount > 0 ? ` (${pendingCount} pending approval)` : ""}`
                        : `${totalAuthored} testimonial${totalAuthored !== 1 ? "s" : ""} written by you`
                }
                action={!miniView ? (
                    <div className="flex items-center gap-x-2">
                        <Button
                            onClick={handleShareProfile}
                            className="self-start sm:self-auto"
                            text="Share Your Testimonials"
                            icon={<Share2 className="w-4 h-4" />}
                            variant="outline"
                        />
                        <Button
                            onClick={onNavigateToWrite}
                            className="self-start sm:self-auto"
                            text="Write Testimonial"
                            icon={<PenLine className="w-4 h-4" />}
                        />
                    </div>
                ) : undefined}
            />

            {!isLoadingReceived && isReceivedTab && <StatsBar stats={stats} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[var(--foreground)]/5 w-fit">
                <button
                    onClick={() => onTabChange("received")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isReceivedTab
                        ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                        : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                        }`}
                >
                    Received ({totalReceived})
                    {pendingCount > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                            {pendingCount} new
                        </span>
                    )}
                </button>
                <button
                    onClick={() => onTabChange("authored")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isReceivedTab
                        ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                        : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                        }`}
                >
                    Written by Me ({totalAuthored})
                </button>
            </div>

            {/* Testimonials Grid with Infinite Scroll */}
            <TestimonialsGrid
                testimonials={displayedTestimonials}
                isLoading={currentLoading && currentTestimonials.length === 0}
                onEdit={onNavigateToEdit}
                onDelete={onDeleteTestimonialChange}
                onApprove={isReceivedTab ? onApproveTestimonial : undefined}
                showApprovalStatus={isReceivedTab}
                emptyTitle={
                    isReceivedTab
                        ? "No testimonials received yet"
                        : "You haven't written any testimonials yet"
                }
                emptyDescription={
                    isReceivedTab
                        ? "Share your profile to start collecting testimonials from people you've worked with."
                        : "Write a testimonial for someone you've worked with to help them build their reputation."
                }
                emptyAction={
                    <Button
                        onClick={onNavigateToWrite}
                        icon={<PenLine className="w-4 h-4" />}
                        text="Write a Testimonial"
                    />
                }
                isOwner={true}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/testimonials` : "/testimonials")}
                        className="rounded-full border border-[var(--accent)]/30 px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                    >
                        See all
                    </button>
                </div>
            )}

            {/* Infinite Scroll Trigger */}
            {!miniView && currentTestimonials.length > 0 && (
                <InfiniteScrollTrigger
                    hasMore={currentHasMore}
                    isLoading={currentLoading}
                    onLoadMore={currentOnLoadMore}
                />
            )}

            <TestimonialDialogs
                deleteTestimonial={deleteTestimonial}
                onDeleteTestimonialChange={onDeleteTestimonialChange}
                isDeleting={isDeleting}
                onDeleteConfirm={onDeleteConfirm}
            />
        </div>
    );
}