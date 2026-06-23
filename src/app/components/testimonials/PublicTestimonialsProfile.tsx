// components/testimonials/PublicTestimonialsProfile.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Quote, Star, User } from "lucide-react";
import { useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";

interface PublicTestimonialsProfileProps {
    username: string;
}

export function PublicTestimonialsProfile({ username }: PublicTestimonialsProfileProps) {
    const {
        userTestimonials,
        userTestimonialsUsername,
        userTestimonialsLoading,
        fetchUserTestimonials,
    } = useTestimonialsStore();

    useEffect(() => {
        if (username && userTestimonialsUsername !== username) {
            fetchUserTestimonials({ username });
        }
    }, [username, userTestimonialsUsername, fetchUserTestimonials]);

    if (userTestimonialsLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (userTestimonials.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--foreground)]/50">No testimonials yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {userTestimonials.map((testimonial, index) => (
                <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-2xl border border-[var(--foreground)]/10 
                               bg-[var(--background)] hover:border-[var(--foreground)]/20 
                               transition-all duration-200"
                >
                    <Quote className="w-6 h-6 text-[var(--accent)]/20 mb-2" />
                    <p className="text-sm text-[var(--foreground)]/80 leading-relaxed mb-3">
                        {testimonial.content}
                    </p>

                    {testimonial.rating && (
                        <div className="flex items-center gap-0.5 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${star <= testimonial.rating!
                                            ? "text-amber-400 fill-amber-400"
                                            : "text-[var(--foreground)]/20"
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        {testimonial.avatar_url ? (
                            <img
                                src={testimonial.avatar_url}
                                alt={testimonial.author_name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-[var(--accent)]" />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium">{testimonial.author_name}</p>
                            {(testimonial.author_title || testimonial.author_company) && (
                                <p className="text-xs text-[var(--foreground)]/50">
                                    {testimonial.author_title}
                                    {testimonial.author_title && testimonial.author_company && " · "}
                                    {testimonial.author_company}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}