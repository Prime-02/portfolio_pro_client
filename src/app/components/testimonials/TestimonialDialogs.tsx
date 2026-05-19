// components/testimonials/TestimonialDialogs.tsx

import { Testimonial } from "@/lib/stores/testimonials/useTestimonial";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface TestimonialDialogsProps {
    deleteTestimonial: Testimonial | null;
    onDeleteTestimonialChange: (testimonial: Testimonial | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
}

export function TestimonialDialogs({
    deleteTestimonial,
    onDeleteTestimonialChange,
    isDeleting,
    onDeleteConfirm,
}: TestimonialDialogsProps) {
    return (
        <>
            {deleteTestimonial && (
                <DeleteConfirmDialog
                    authorName={deleteTestimonial.author_name}
                    content={deleteTestimonial.content}
                    open={!!deleteTestimonial}
                    isLoading={isDeleting}
                    onConfirm={onDeleteConfirm}
                    onOpenChange={(open) => {
                        if (!open) onDeleteTestimonialChange(null);
                    }}
                />
            )}
        </>
    );
}