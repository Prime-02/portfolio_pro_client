// components/certifications/EmptyCertificationsState.tsx
"use client";

import { motion } from "framer-motion";
import { Award, Plus, ArrowRight } from "lucide-react";
import Button from "../buttons/Buttons";

interface EmptyCertificationsStateProps {
    onAddClick: () => void;
    isOwner?: boolean;
}

export function EmptyCertificationsState({ onAddClick, isOwner = false }: EmptyCertificationsStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4"
        >
            <div className="p-5 rounded-2xl bg-[var(--accent)]/10 mb-6">
                <Award className="w-12 h-12 text-[var(--accent)]" />
            </div>

            <h2 className="text-2xl font-league-600 mb-2">
                {isOwner ? "No certifications yet" : "Nothing to show here"}
            </h2>
            <p className="text-[var(--foreground)]/60 text-center max-w-sm mb-8">
                {isOwner
                    ? "Showcase your professional achievements by adding certifications, licenses, or credentials you've earned."
                    : "This user hasn't added any certifications yet."}
            </p>

            {isOwner && (
                <Button
                    onClick={onAddClick}
                    size="lg"
                    icon={<Plus className="w-5 h-5" />}
                    text="Add Your First Certification"
                />
            )}

            {isOwner && (
                <div className="mt-12 grid gap-3 w-full max-w-xs">
                    <p className="text-xs text-[var(--foreground)]/40 text-center mb-2">
                        Popular certifications you can add
                    </p>
                    {["AWS Solutions Architect", "Google Cloud Professional", "PMP", "Certified Scrum Master", "CompTIA Security+"].map((cert) => (
                        <div
                            key={cert}
                            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--foreground)]/5 
                                       border border-[var(--foreground)]/5"
                        >
                            <div className="w-2 h-2 rounded-full bg-[var(--accent)]/50" />
                            <span className="text-sm text-[var(--foreground)]/60">{cert}</span>
                            <ArrowRight className="w-3 h-3 ml-auto text-[var(--foreground)]/30" />
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}