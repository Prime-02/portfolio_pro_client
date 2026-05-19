"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Quote, Save, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";
import Button from "../buttons/Buttons";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Textinput } from "../inputs/Textinput";
import { StarRating } from "./StarRating";
import { FileInput } from "../inputs/FileInput";
import { TextArea } from "../inputs/TextArea";
import { isAuthenticated } from "@/lib/client/api";
import { PageHeader } from "../ui/PageHeader";

export default function EditTestimonialPage() {
    const router = useRouter();
    const params = useParams();
    const testimonialId = params.id as string;

    const {
        myAuthoredTestimonials,
        updateTestimonial,
        updating,
        updateError,
        fetchMyAuthoredTestimonials
    } = useTestimonialsStore();

    const testimonial = myAuthoredTestimonials.find(t => t.id === testimonialId);

    const [authorName, setAuthorName] = useState("");
    const [authorTitle, setAuthorTitle] = useState("");
    const [authorCompany, setAuthorCompany] = useState("");
    const [authorRelationship, setAuthorRelationship] = useState("");
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(5);
    const [authorAvatar, setAuthorAvatar] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!testimonial && isAuthenticated()) {
                await fetchMyAuthoredTestimonials();
            }
            setIsLoading(false);
        };
        loadData();
    }, [testimonial, fetchMyAuthoredTestimonials]);

    useEffect(() => {
        if (testimonial) {
            setAuthorName(testimonial.author_name);
            setAuthorTitle(testimonial.author_title || "");
            setAuthorCompany(testimonial.author_company || "");
            setAuthorRelationship(testimonial.author_relationship || "");
            setContent(testimonial.content);
            setRating(testimonial.rating || 5);
        }
    }, [testimonial]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testimonialId || !authorName || !content) return;

        await updateTestimonial(
            testimonialId,
            {
                author_name: authorName,
                author_title: authorTitle || undefined,
                author_company: authorCompany || undefined,
                author_relationship: authorRelationship || undefined,
                content,
                rating,
            },
            authorAvatar || undefined
        );

        if (!updateError) {
            router.push("/testimonials");
        }
    };

    const handleBack = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            </div>
        );
    }

    if (!testimonial) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[var(--foreground)]/60">Testimonial not found</p>
                    <Button onClick={handleBack} text="Go Back" variant="ghost" className="mt-4" />
                </div>
            </div>
        );
    }

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
                title="Edit Testimonial"
                description="Update your testimonial"
            />

            {updateError && <ErrorMessage message={updateError} onDismiss={() => { }} />}

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <div className="p-4 rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5">
                    <h3 className="text-sm font-medium mb-4">Your Information</h3>
                    <div className="space-y-4">
                        <Textinput
                            label="Your Name"
                            value={authorName}
                            onChange={(e) => setAuthorName(e)}
                            required
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Textinput
                                label="Title (optional)"
                                value={authorTitle}
                                onChange={(e) => setAuthorTitle(e)}
                            />
                            <Textinput
                                label="Company (optional)"
                                value={authorCompany}
                                onChange={(e) => setAuthorCompany(e)}
                            />
                        </div>
                        <Textinput
                            label="Relationship (optional)"
                            value={authorRelationship}
                            onChange={(e) => setAuthorRelationship(e)}
                        />
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Your Avatar (optional)
                            </label>
                            <FileInput
                                value={authorAvatar}
                                onChange={(file) => setAuthorAvatar(file)}
                            />
                        </div>
                    </div>
                </div>

                {/* Star Rating using the imported component */}
                <div>
                    <label className="block text-sm font-medium mb-3">
                        Rating
                    </label>
                    <div className="flex items-center gap-3">
                        <StarRating
                            rating={rating}
                            size="lg"
                            interactive
                            onChange={setRating}
                        />
                        <span className="text-sm text-[var(--foreground)]/60 font-medium">
                            {rating} out of 5
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Your Testimonial *
                    </label>
                    <TextArea
                        value={content}
                        onChange={(e) => setContent(e)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[var(--foreground)]/10 
                                 bg-transparent focus:outline-none focus:border-[var(--accent)] 
                                 transition-colors placeholder:text-[var(--foreground)]/40
                                 resize-none text-sm leading-relaxed"
                    />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleBack}
                        text="Cancel"
                    />
                    <Button
                        type="submit"
                        disabled={!authorName || !content || updating}
                        loading={updating}
                        text="Save Changes"
                        icon={<Save size={16} />}
                    />
                </div>
            </motion.form>
        </div>
    );
}