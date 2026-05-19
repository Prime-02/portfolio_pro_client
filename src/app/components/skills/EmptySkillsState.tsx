// components/skills/EmptySkillsState.tsx
"use client";

import { motion } from "framer-motion";
import { Zap, Plus, Sparkles } from "lucide-react";
import Button from "../buttons/Buttons";

interface EmptySkillsStateProps {
    onAddClick: () => void;
    isOwner?: boolean;
}

export function EmptySkillsState({ onAddClick, isOwner = false }: EmptySkillsStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4"
        >
            <div className="relative p-5 rounded-2xl bg-[var(--accent)]/10 mb-6">
                <Zap className="w-12 h-12 text-[var(--accent)]" />
                <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute -top-1 -right-1"
                >
                    <Sparkles className="w-5 h-5 text-[var(--accent)]/60" />
                </motion.div>
            </div>

            <h2 className="text-2xl font-league-600 mb-2">
                {isOwner ? "No skills yet" : "Nothing to show here"}
            </h2>
            <p className="text-[var(--foreground)]/60 text-center max-w-sm mb-8">
                {isOwner
                    ? "Highlight your expertise by adding technical and professional skills to your profile."
                    : "This user hasn't added any skills yet."}
            </p>

            {isOwner && (
                <Button
                    onClick={onAddClick}
                    size="lg"
                    icon={<Plus className="w-5 h-5" />}
                    text="Add Your First Skill"
                />
            )}

            {isOwner && (
                <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-md">
                    {["React", "TypeScript", "Python", "Leadership", "Design", "Communication"].map((skill) => (
                        <div
                            key={skill}
                            className="px-3 py-1.5 rounded-full bg-[var(--foreground)]/5 
                                       border border-[var(--foreground)]/5 text-sm text-[var(--foreground)]/50"
                        >
                            {skill}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}