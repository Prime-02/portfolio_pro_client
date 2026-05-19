// components/testimonials/TestimonialsGrid.tsx
import { Testimonial } from "@/lib/stores/testimonials/useTestimonial";
import { TestimonialCard } from "./TestimonialCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyTestimonialsState } from "./EmptyTestimonialsState";

interface TestimonialsGridProps {
    testimonials: Testimonial[];
    isLoading: boolean;
    onEdit?: (testimonial: Testimonial) => void;
    onDelete?: (testimonial: Testimonial) => void;
    onApprove?: (testimonial: Testimonial) => void;
    showApprovalStatus?: boolean;
    emptyAction?: React.ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    isOwner?: boolean;
}

export function TestimonialsGrid({
    testimonials,
    isLoading,
    onEdit,
    onDelete,
    onApprove,
    showApprovalStatus = false,
    emptyAction,
    emptyTitle,
    emptyDescription,
    isOwner = false,
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
                    onEdit={onEdit ? () => onEdit(testimonial) : undefined}
                    onDelete={onDelete ? () => onDelete(testimonial) : undefined}
                    onApprove={onApprove ? () => onApprove(testimonial) : undefined}
                    showApprovalStatus={showApprovalStatus}
                    isOwner={isOwner}
                />
            ))}
        </div>
    );
}