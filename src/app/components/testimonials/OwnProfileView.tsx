// components/testimonials/OwnProfileView.tsx
import { useState } from "react";
import { Quote, Plus } from "lucide-react";
import Button from "../buttons/Buttons";
import { Testimonial, TestimonialStats } from "@/lib/stores/testimonials/useTestimonial";
import { StatsBar } from "./StatsBar";
import { ErrorMessage } from "../ui/ErrorMessage";
import { TestimonialsGrid } from "./TestimonialsGrid";
import { TestimonialDialogs } from "./TestimonialDialogs";
import { PageHeader } from "../ui/PageHeader";

interface OwnProfileViewProps {
    receivedTestimonials: Testimonial[];
    authoredTestimonials: Testimonial[];
    isLoadingReceived: boolean;
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
    onApproveTestimonial?: (testimonial: Testimonial) => void;
}

type TabType = "received" | "authored";

export function OwnProfileView({
    receivedTestimonials,
    authoredTestimonials,
    isLoadingReceived,
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
    onApproveTestimonial,
}: OwnProfileViewProps) {
    const [activeTab, setActiveTab] = useState<TabType>("received");

    const isReceived = activeTab === "received";
    const currentTestimonials = isReceived ? receivedTestimonials : authoredTestimonials;
    const currentLoading = isReceived ? isLoadingReceived : isLoadingAuthored;

    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <PageHeader
                icon={<Quote className="w-6 h-6 text-[var(--accent)]" />}
                title="My Testimonials"
                description="Manage testimonials you've received and written"
            />

            {!currentLoading && <StatsBar stats={stats} totalCount={receivedTestimonials.length} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[var(--foreground)]/5 w-fit">
                <button
                    onClick={() => setActiveTab("received")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isReceived
                        ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                        : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                        }`}
                >
                    Received ({receivedTestimonials.length})
                </button>
                <button
                    onClick={() => setActiveTab("authored")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isReceived
                        ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                        : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                        }`}
                >
                    Written by Me ({authoredTestimonials.length})
                </button>
            </div>

            <TestimonialsGrid
                testimonials={currentTestimonials}
                isLoading={currentLoading}
                onEdit={isReceived ? undefined : onNavigateToEdit}
                onDelete={onDeleteTestimonialChange}
                onApprove={isReceived ? onApproveTestimonial : undefined}
                showApprovalStatus={isReceived}
                emptyTitle={isReceived ? "No testimonials received yet" : "No testimonials written yet"}
                emptyDescription={isReceived
                    ? "Share your profile to receive testimonials from colleagues and clients."
                    : "Write a testimonial for someone you've worked with."
                }
                emptyAction={!isReceived ? (
                    <Button
                        onClick={onNavigateToWrite}
                        icon={<Plus className="w-4 h-4" />}
                        text="Write a Testimonial"
                    />
                ) : undefined}
                isOwner={true}
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