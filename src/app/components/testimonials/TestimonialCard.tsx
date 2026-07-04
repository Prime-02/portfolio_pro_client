"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, Trash2, CheckCircle2, Clock, User, Loader2 } from "lucide-react";
import { Testimonial } from "@/lib/stores/testimonials/useTestimonial";

interface TestimonialCardProps {
    testimonial: Testimonial;
    onToggleFeature?: () => void;
    onDelete?: () => void;
    onApprove?: () => void;
    showApprovalStatus?: boolean;
    isOwner?: boolean;
    isTogglingFeature?: boolean;
    isApproving?: boolean;
}

function StarRating({ rating }: { rating?: number }) {
    if (!rating) return null;
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-[var(--foreground)]/20"
                        }`}
                />
            ))}
        </div>
    );
}

export function TestimonialCard({
    testimonial,
    onToggleFeature,
    onDelete,
    onApprove,
    showApprovalStatus = false,
    isOwner = false,
    isTogglingFeature = false,
    isApproving = false,
}: TestimonialCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const contentIsLong = testimonial.content.length > 200;
    const displayContent = isExpanded || !contentIsLong
        ? testimonial.content
        : testimonial.content.slice(0, 200) + "...";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden
                        ${testimonial.is_featured
                    ? "border-[var(--accent)]/30 bg-[var(--accent)]/5"
                    : "border-[var(--foreground)]/10 bg-[var(--background)]"
                }
                        hover:border-[var(--foreground)]/20 hover:shadow-lg`}
        >
            {/* Featured badge */}
            {testimonial.is_featured && (
                <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent)]/15">
                        <Star className="w-3 h-3 text-[var(--accent)] fill-[var(--accent)]" />
                        <span className="text-[10px] font-medium text-[var(--accent)]">Featured</span>
                    </div>
                </div>
            )}

            {/* Approval status — only for owner */}
            {isOwner && showApprovalStatus && (
                <div className={`absolute top-3 ${testimonial.is_featured ? "right-24" : "right-3"}`}>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full 
                                    ${testimonial.is_approved
                            ? "bg-green-500/10 text-green-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}>
                        {testimonial.is_approved ? (
                            <CheckCircle2 className="w-3 h-3" />
                        ) : (
                            <Clock className="w-3 h-3" />
                        )}
                        <span className="text-[10px] font-medium">
                            {testimonial.is_approved ? "Approved" : "Pending"}
                        </span>
                    </div>
                </div>
            )}

            <div className="p-6">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-[var(--accent)]/20 mb-3" />

                {/* Content */}
                <p className="text-sm text-[var(--foreground)]/80 leading-relaxed mb-4">
                    {displayContent}
                    {contentIsLong && !isExpanded && (
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="text-[var(--accent)] text-xs ml-1 hover:underline"
                        >
                            Read more
                        </button>
                    )}
                    {contentIsLong && isExpanded && (
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-[var(--accent)] text-xs ml-1 hover:underline"
                        >
                            Show less
                        </button>
                    )}
                </p>

                {/* Rating */}
                {testimonial.rating && <StarRating rating={testimonial.rating} />}

                {/* Author info */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--foreground)]/5">
                    {testimonial.avatar_url ? (
                        <img
                            src={testimonial.avatar_url}
                            alt={testimonial.author_name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{testimonial.author_name}</p>
                        {(testimonial.author_title || testimonial.author_company) && (
                            <p className="text-xs text-[var(--foreground)]/50 truncate">
                                {testimonial.author_title}
                                {testimonial.author_title && testimonial.author_company && " · "}
                                {testimonial.author_company}
                            </p>
                        )}
                        {testimonial.author_relationship && (
                            <p className="text-[10px] text-[var(--foreground)]/40 capitalize">
                                {testimonial.author_relationship}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions — only for owner */}
                {isOwner && (
                    <AnimatePresence>
                        {(isHovered || isTogglingFeature || isApproving) && (onToggleFeature || onDelete || onApprove) && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="flex gap-2 mt-4 pt-3 border-t border-[var(--foreground)]/5"
                            >
                                {onApprove && !testimonial.is_approved && (
                                    <button
                                        onClick={onApprove}
                                        disabled={isApproving}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                                                 text-xs font-medium text-green-600 hover:bg-green-500/5 transition-colors
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isApproving ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        )}
                                        {isApproving ? "Approving..." : "Approve"}
                                    </button>
                                )}
                                {onToggleFeature && (
                                    <button
                                        onClick={onToggleFeature}
                                        disabled={isTogglingFeature}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                                                 text-xs font-medium transition-colors
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 ${testimonial.is_featured
                                                ? "text-[var(--accent)] hover:bg-[var(--accent)]/5"
                                                : "hover:bg-[var(--foreground)]/5"
                                            }`}
                                    >
                                        {isTogglingFeature ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Star
                                                className={`w-3.5 h-3.5 ${testimonial.is_featured ? "fill-[var(--accent)]" : ""
                                                    }`}
                                            />
                                        )}
                                        {isTogglingFeature
                                            ? "Updating..."
                                            : testimonial.is_featured
                                                ? "Unfeature"
                                                : "Feature"}
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={onDelete}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                                                 text-xs font-medium text-red-500 hover:bg-red-500/5 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}