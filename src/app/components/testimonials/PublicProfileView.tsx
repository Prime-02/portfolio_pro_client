// components/testimonials/PublicProfileView.tsx
"use client";

import { useState } from "react";
import { Quote, PenLine } from "lucide-react";
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

interface PublicProfileViewProps {
    username: string;
    theirTestimonials: Testimonial[];
    totalTestimonials: number;
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    myAuthoredTestimonials: Testimonial[];
    myAuthoredTotal: number;
    isLoadingAuthored: boolean;
    hasMoreAuthored: boolean;
    onLoadMoreAuthored: () => void;
    error: string | null;
    onClearError: () => void;
    deleteTestimonial: Testimonial | null;
    onDeleteTestimonialChange: (testimonial: Testimonial | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
    stats?: TestimonialStats;
    onNavigateToWrite: () => void;
    isAuthenticated: boolean;
    miniView?: boolean;
}

type TabType = "their" | "mine";

export function PublicProfileView({
    username,
    theirTestimonials,
    totalTestimonials,
    isLoading,
    hasMore,
    onLoadMore,
    myAuthoredTestimonials,
    myAuthoredTotal,
    isLoadingAuthored,
    hasMoreAuthored,
    onLoadMoreAuthored,
    error,
    onClearError,
    deleteTestimonial,
    onDeleteTestimonialChange,
    isDeleting,
    onDeleteConfirm,
    stats,
    onNavigateToWrite,
    isAuthenticated,
    miniView = false,
}: PublicProfileViewProps) {
    const [activeTab, setActiveTab] = useState<TabType>("their");

    const isTheirTab = activeTab === "their";
    const currentTestimonials = isTheirTab ? theirTestimonials : myAuthoredTestimonials;
    const currentTotal = isTheirTab ? totalTestimonials : myAuthoredTotal;
    const currentLoading = isTheirTab ? isLoading : isLoadingAuthored;
    const currentHasMore = isTheirTab ? hasMore : hasMoreAuthored;
    const currentOnLoadMore = isTheirTab ? onLoadMore : onLoadMoreAuthored;
    const router = useRouter();
    const { profileContext } = useTheme();
    const usernamePath = profileContext?.username ? `${profileContext.username}` : "";
    const displayedTestimonials = miniView ? currentTestimonials.slice(0, 3) : currentTestimonials;
    const showSeeAll = miniView && currentTestimonials.length > 0;

    // Show loading skeleton only on initial load (no data yet)
    if (isLoading && theirTestimonials.length === 0 && isTheirTab) {
        return <LoadingSkeleton />;
    }

    return (
        <div className={miniView ? "p-6 md:p-8 lg:p-10 max-w-6xl mx-auto" : "min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto"}>
            <PageHeader
                icon={<Quote className="w-6 h-6 text-[var(--accent)]" />}
                title={`${username}'s Testimonials`}
                description={
                    isTheirTab
                        ? `${totalTestimonials} testimonial${totalTestimonials !== 1 ? "s" : ""} from the community`
                        : `${myAuthoredTotal} testimonial${myAuthoredTotal !== 1 ? "s" : ""} you've written`
                }
                action={!miniView ? (
                    <Button
                        onClick={onNavigateToWrite}
                        className="self-start sm:self-auto"
                        text="Write Testimonial"
                        icon={<PenLine className="w-4 h-4" />}
                    />
                ) : undefined}
            />

            {!isLoading && isTheirTab && <StatsBar stats={stats} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[var(--foreground)]/5 w-fit">
                <button
                    onClick={() => setActiveTab("their")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isTheirTab
                        ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                        : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                        }`}
                >
                    {`${username}'s Testimonials (${totalTestimonials})`}
                </button>
                {isAuthenticated && (
                    <button
                        onClick={() => setActiveTab("mine")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isTheirTab
                            ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                            : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                            }`}
                    >
                        My Testimonials ({myAuthoredTotal})
                    </button>
                )}
            </div>

            {/* Testimonials Grid with Infinite Scroll */}
            <TestimonialsGrid
                testimonials={displayedTestimonials}
                isLoading={currentLoading && currentTestimonials.length === 0}
                onDelete={!isTheirTab ? onDeleteTestimonialChange : undefined}
                showApprovalStatus={false}
                emptyTitle={
                    isTheirTab
                        ? `No testimonials for ${username} yet`
                        : "You haven't written any testimonials yet"
                }
                emptyDescription={
                    isTheirTab
                        ? "Be the first to share your experience working with them."
                        : "Write a testimonial for someone you've worked with."
                }
                emptyAction={
                    isTheirTab && isAuthenticated ? (
                        <Button
                            onClick={onNavigateToWrite}
                            icon={<PenLine className="w-4 h-4" />}
                            text={`Write a Testimonial for ${username}`}
                        />
                    ) : !isTheirTab ? (
                        <Button
                            onClick={onNavigateToWrite}
                            icon={<PenLine className="w-4 h-4" />}
                            text="Write a Testimonial"
                        />
                    ) : undefined
                }
                isOwner={!isTheirTab}
            />

            {showSeeAll && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => router.push(usernamePath ? `/${usernamePath}/testimonials` : `/${username}/testimonials`)}
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