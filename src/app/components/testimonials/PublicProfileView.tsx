// components/testimonials/PublicProfileView.tsx
import { useState } from "react";
import { Quote, PenLine, User } from "lucide-react";
import Button from "../buttons/Buttons";
import { Testimonial, TestimonialStats } from "@/lib/stores/testimonials/useTestimonial";
import { StatsBar } from "./StatsBar";
import { ErrorMessage } from "../ui/ErrorMessage";
import { TestimonialsGrid } from "./TestimonialsGrid";
import { TestimonialDialogs } from "./TestimonialDialogs";
import { PageHeader } from "../ui/PageHeader";

interface PublicProfileViewProps {
    username: string;
    theirTestimonials: Testimonial[];
    myAuthoredTestimonials: Testimonial[];
    isLoading: boolean;
    isLoadingAuthored: boolean;
    error: string | null;
    onClearError: () => void;
    deleteTestimonial: Testimonial | null;
    onDeleteTestimonialChange: (testimonial: Testimonial | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
    stats?: TestimonialStats;
    onNavigateToWrite: () => void;
    onNavigateToEdit: (testimonial: Testimonial) => void;
    isAuthenticated: boolean;
}

type TabType = "their" | "mine";

export function PublicProfileView({
    username,
    theirTestimonials,
    myAuthoredTestimonials,
    isLoading,
    isLoadingAuthored,
    error,
    onClearError,
    deleteTestimonial,
    onDeleteTestimonialChange,
    isDeleting,
    onDeleteConfirm,
    stats,
    onNavigateToWrite,
    onNavigateToEdit,
    isAuthenticated,
}: PublicProfileViewProps) {
    const [activeTab, setActiveTab] = useState<TabType>("their");

    const isTheirTab = activeTab === "their";
    const currentTestimonials = isTheirTab ? theirTestimonials : myAuthoredTestimonials;
    const currentLoading = isTheirTab ? isLoading : isLoadingAuthored;

    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <PageHeader
                icon={<Quote className="w-6 h-6 text-[var(--accent)]" />}
                title={`${username}'s Testimonials`}
                description={`What people are saying about ${username}`}
                action={
                    <Button
                        onClick={onNavigateToWrite}
                        className="self-start sm:self-auto"
                        text="Write Testimonial"
                        icon={<PenLine className="w-4 h-4" />}
                    />
                }
            />

            {!isLoading && <StatsBar stats={stats} />}

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
                   {` ${username}'s Testimonials (${theirTestimonials.length})`}
                </button>
                {isAuthenticated && (
                    <button
                        onClick={() => setActiveTab("mine")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isTheirTab
                            ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                            : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                            }`}
                    >
                        My Testimonials ({myAuthoredTestimonials.length})
                    </button>
                )}
            </div>

            <TestimonialsGrid
                testimonials={currentTestimonials}
                isLoading={currentLoading}
                onEdit={!isTheirTab ? onNavigateToEdit : undefined}
                onDelete={!isTheirTab ? onDeleteTestimonialChange : undefined}
                showApprovalStatus={false}
                emptyTitle={isTheirTab
                    ? `No testimonials for ${username} yet`
                    : "You haven't written any testimonials yet"
                }
                emptyDescription={isTheirTab
                    ? "Be the first to share your experience working with them."
                    : "Write a testimonial for someone you've worked with."
                }
                emptyAction={isTheirTab && isAuthenticated ? (
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
                ) : undefined}
                isOwner={!isTheirTab}
            />

            <TestimonialDialogs
                deleteTestimonial={deleteTestimonial}
                onDeleteTestimonialChange={onDeleteTestimonialChange}
                isDeleting={isDeleting}
                onDeleteConfirm={onDeleteConfirm}
            />
        </div>
    );
}