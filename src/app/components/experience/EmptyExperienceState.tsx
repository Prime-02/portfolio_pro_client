// components/experience/EmptyExperienceState.tsx
"use client";

import { motion } from "framer-motion";
import { Briefcase, Plus } from "lucide-react";
import Button from "../buttons/Buttons";

interface EmptyExperienceStateProps {
    onAddClick: () => void;
    isOwner: boolean;
}

const EXAMPLE_ROLES = [
    "Software Engineer",
    "Product Manager",
    "UX Designer",
    "Data Analyst",
    "DevOps Lead",
    "CTO",
];

export function EmptyExperienceState({ onAddClick, isOwner }: EmptyExperienceStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4"
        >
            <div className="relative p-5 rounded-2xl bg-[var(--accent)]/10 mb-6">
                <Briefcase className="w-12 h-12 text-[var(--accent)]" />
                <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--accent)]/30"
                />
            </div>

            <h2 className="text-2xl font-league-600 mb-2">
                {isOwner ? "No experience yet" : "Nothing to show here"}
            </h2>
            <p className="text-[var(--foreground)]/60 text-center max-w-sm mb-8">
                {isOwner
                    ? "Document your professional journey — add the roles and companies that shaped your career."
                    : "This user hasn't added any work experience yet."}
            </p>

            {isOwner && (
                <Button
                    onClick={onAddClick}
                    size="lg"
                    icon={<Plus className="w-5 h-5" />}
                    text="Add Your First Role"
                />
            )}

            {isOwner && (
                <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-md">
                    {EXAMPLE_ROLES.map((role) => (
                        <div
                            key={role}
                            className="px-3 py-1.5 rounded-full bg-[var(--foreground)]/5
                                       border border-[var(--foreground)]/5 text-sm text-[var(--foreground)]/50"
                        >
                            {role}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
