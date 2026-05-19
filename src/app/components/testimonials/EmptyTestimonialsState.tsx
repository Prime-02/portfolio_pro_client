// components/testimonials/EmptyTestimonialsState.tsx
"use client";

import { motion } from "framer-motion";
import { Quote, PenLine } from "lucide-react";

interface EmptyTestimonialsStateProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    isOwner?: boolean;
}

export function EmptyTestimonialsState({
    title,
    description,
    action,
    isOwner = false
}: EmptyTestimonialsStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4"
        >
            <div className="p-5 rounded-2xl bg-[var(--accent)]/10 mb-6">
                <Quote className="w-12 h-12 text-[var(--accent)]" />
            </div>

            <h2 className="text-2xl font-league-600 mb-2">
                {title || (isOwner ? "No testimonials yet" : "Nothing to show here")}
            </h2>
            <p className="text-[var(--foreground)]/60 text-center max-w-sm mb-8">
                {description || (isOwner
                    ? "Share your profile to receive testimonials from colleagues and clients."
                    : "This user hasn't received any testimonials yet.")}
            </p>

            {action}
        </motion.div>
    );
}