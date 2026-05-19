// app/(dashboard)/testimonials/write/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Quote, Star, Send, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";
import { useUserStore } from "@/lib/stores/user/userStore";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import { TextArea } from "../inputs/TextArea";
import { AvatarUpload } from "../profile/AvatarUpload";
import StarRating from "../inputs/StarRating";
import { PageHeader } from "../ui/PageHeader";

export default function WriteTestimonialPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const forUsername = searchParams.get("for") || "";

    const { createTestimonial, creating, createError } = useTestimonialsStore();
    const { userData } = useUserStore();

    const [username, setUsername] = useState(forUsername);
    const [authorName, setAuthorName] = useState(userData?.username || "");
    const [authorTitle, setAuthorTitle] = useState("");
    const [authorCompany, setAuthorCompany] = useState("");
    const [authorRelationship, setAuthorRelationship] = useState("");
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(5);
    const [authorAvatar, setAuthorAvatar] = useState<File | null>(null);

    // Update username if provided in URL
    useEffect(() => {
        if (forUsername) {
            setUsername(forUsername);
        }
    }, [forUsername]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !authorName || !content) return;

        const result = await createTestimonial(
            {
                username,
                author_name: authorName,
                author_title: authorTitle || undefined,
                author_company: authorCompany || undefined,
                author_relationship: authorRelationship || undefined,
                content,
                rating,
            },
            authorAvatar || undefined
        );

        if (result) {
            router.push(forUsername ? `/${forUsername}/testimonials` : "/testimonials");
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-3xl mx-auto">
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-[var(--foreground)]/50 hover:text-[var(--foreground)] 
                         transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <PageHeader
                icon={<Quote className="w-6 h-6 text-[var(--accent)]" />}
                title="Write a Testimonial"
                description="Share your experience working with this person"
            />

            {createError && <ErrorMessage message={createError} onDismiss={() => { }} />}

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* Recipient */}
                <Textinput
                    label="For (Username)"
                    desc="Enter the username of the person"
                    value={username}
                    onChange={(e) => setUsername(e)}
                    required
                    disabled={!!forUsername}
                />

                {/* Author Info */}
                <div className="p-4 rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5">
                    <h3 className="text-sm font-medium mb-4">Your Information</h3>
                    <div className="w-full flex justify-start flex-col gap-x-3">
                        <label className="block text-sm font-medium mb-2">
                            Your Avatar (optional)
                        </label>
                        <div>
                            <AvatarUpload
                                currentImage={userData.profile_picture}
                                onFileSelect={(file) => setAuthorAvatar(file)}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Textinput
                            label="Your Name"
                            desc="How should they know you?"
                            value={authorName}
                            onChange={(e) => setAuthorName(e)}
                            required
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Textinput
                                label="Title (optional)"
                                desc="e.g., Product Manager"
                                value={authorTitle}
                                onChange={(e) => setAuthorTitle(e)}
                            />
                            <Textinput
                                label="Company (optional)"
                                desc="e.g., Acme Inc."
                                value={authorCompany}
                                onChange={(e) => setAuthorCompany(e)}
                            />
                        </div>
                        <Textinput
                            label="Relationship (optional)"
                            desc="e.g., Colleague, Client, Manager"
                            value={authorRelationship}
                            onChange={(e) => setAuthorRelationship(e)}
                        />
                    </div>
                </div>

                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium mb-3">
                        Rating
                    </label>
                    <div className="flex items-center gap-3">
                        <StarRating
                            value={rating}
                            size={35}
                            onChange={setRating}
                        />
                        <span className="text-sm text-[var(--foreground)]/60 font-medium">
                            {rating} out of 5
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Your Testimonial *
                    </label>
                    <TextArea
                        value={content}
                        onChange={(e) => setContent(e)}
                        desc="Share your experience working with this person..."
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[var(--foreground)]/10 
                                 bg-transparent focus:outline-none focus:border-[var(--accent)] 
                                 transition-colors placeholer:text-[var(--foreground)]/40
                                 resize-none text-sm leading-relaxed"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleBack}
                        text="Cancel"
                    />
                    <Button
                        type="submit"
                        disabled={!username || !authorName || !content || creating}
                        loading={creating}
                        text="Submit Testimonial"
                        icon={<Send size={16} />}
                    />
                </div>
            </motion.form>
        </div>
    );
}