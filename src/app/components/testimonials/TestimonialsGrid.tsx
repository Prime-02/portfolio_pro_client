// components/testimonials/TestimonialsGrid.tsx
import { Testimonial } from "@/lib/stores/testimonials/useTestimonial";
import { TestimonialCard } from "./TestimonialCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyTestimonialsState } from "./EmptyTestimonialsState";

interface TestimonialsGridProps {
    testimonials: Testimonial[];
    isLoading: boolean;
    onToggleFeature?: (testimonial: Testimonial) => void;
    onDelete?: (testimonial: Testimonial) => void;
    onApprove?: (testimonial: Testimonial) => void;
    showApprovalStatus?: boolean;
    emptyAction?: React.ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    isOwner?: boolean;
    featuringIds?: Set<string>;
    approvingIds?: Set<string>;
}

export function TestimonialsGrid({
    testimonials,
    isLoading,
    onToggleFeature,
    onDelete,
    onApprove,
    showApprovalStatus = false,
    emptyAction,
    emptyTitle,
    emptyDescription,
    isOwner = false,
    featuringIds,
    approvingIds,
}: TestimonialsGridProps) {
    if (isLoading) return <LoadingSkeleton />;

    if (testimonials.length === 0) {
        return (
            <EmptyTestimonialsState
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
                isOwner={isOwner}
            />
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
                <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    onToggleFeature={onToggleFeature ? () => onToggleFeature(testimonial) : undefined}
                    onDelete={onDelete ? () => onDelete(testimonial) : undefined}
                    onApprove={onApprove ? () => onApprove(testimonial) : undefined}
                    showApprovalStatus={showApprovalStatus}
                    isOwner={isOwner}
                    isTogglingFeature={featuringIds?.has(testimonial.id) ?? false}
                    isApproving={approvingIds?.has(testimonial.id) ?? false}
                />
            ))}
        </div>
    );
}