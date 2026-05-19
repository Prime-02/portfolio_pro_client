// components/social/EmptySocialState.tsx
"use client";

import { motion } from "framer-motion";
import { Share2, Plus, ArrowRight } from "lucide-react";
import Button from "../buttons/Buttons";

interface EmptySocialStateProps {
    onAddClick?: () => void;
}

export function EmptySocialState({ onAddClick }: EmptySocialStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4"
        >
            <div className="p-5 rounded-2xl bg-[var(--accent)]/10 mb-6">
                <Share2 className="w-12 h-12 text-[var(--accent)]" />
            </div>

            <h2 className="text-2xl font-league-600 mb-2">No links yet</h2>
            <p className="text-[var(--foreground)]/60 text-center max-w-sm mb-8">
                {`Start building your presence by adding links to your social profiles,
                portfolios, or any other platform you're active on.`}
            </p>

            <Button onClick={onAddClick} size="lg"
                icon={<Plus className="w-5 h-5" />}
                text="Add Your First Link"
            />

            <div className="mt-12 grid gap-3 w-full max-w-xs">
                <p className="text-xs text-[var(--foreground)]/40 text-center mb-2">
                    Popular platforms you can connect
                </p>
                {["Twitter", "GitHub", "LinkedIn", "YouTube", "Instagram"].map((platform) => (
                    <div
                        key={platform}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--foreground)]/5 
                       border border-[var(--foreground)]/5"
                    >
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]/50" />
                        <span className="text-sm text-[var(--foreground)]/60">{platform}</span>
                        <ArrowRight className="w-3 h-3 ml-auto text-[var(--foreground)]/30" />
                    </div>
                ))}
            </div>
        </motion.div>
    );
}