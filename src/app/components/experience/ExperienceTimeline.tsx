// components/experience/ExperienceTimeline.tsx
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ExperienceCard } from "./ExperienceCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyExperienceState } from "./EmptyExperienceState";
import type { Experience } from "@/lib/stores/experiences/useExperience";

interface ExperienceTimelineProps {
    experiences: Experience[];
    isLoading: boolean;
    onEdit: (experience: Experience) => void;
    onDelete: (experience: Experience) => void;
    onAddClick: () => void;
    isOwner: boolean;
}

export function ExperienceTimeline({
    experiences,
    isLoading,
    onEdit,
    onDelete,
    onAddClick,
    isOwner,
}: ExperienceTimelineProps) {
    
    // Sort: current first, then by start_date descending
    const sorted = useMemo(() => {
        return [...experiences].sort((a, b) => {
                if (a.is_current && !b.is_current) return -1;
                if (!a.is_current && b.is_current) return 1;
                return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
            });
        }, [experiences]);
        
        // Group by year of start_date
        const grouped = useMemo(() => {
            return sorted.reduce((acc, exp) => {
                const year = new Date(exp.start_date).getFullYear().toString();
                if (!acc[year]) acc[year] = [];
                acc[year].push(exp);
                return acc;
            }, {} as Record<string, Experience[]>);
        }, [sorted]);
        
    if (isLoading) return <LoadingSkeleton />;

    if (experiences.length === 0) {
        return <EmptyExperienceState onAddClick={onAddClick} isOwner={isOwner} />;
    }

    const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

    return (
        <div className="relative">
            {/* Vertical timeline line */}
            <div
                className="absolute left-5 top-5 bottom-5 w-px"
                style={{ background: "linear-gradient(to bottom, var(--accent), transparent)" }}
                aria-hidden
            />

            <div className="space-y-10">
                {years.map((year, yearIdx) => (
                    <div key={year}>
                        {/* Year label */}
                        <motion.div
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: yearIdx * 0.08 }}
                            className="flex items-center gap-4 mb-4"
                        >
                            {/* Timeline dot for year */}
                            <div className="relative z-10 flex-shrink-0">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center
                                               border-2 border-[var(--accent)]/40 bg-[var(--background)]"
                                >
                                    <span className="text-[10px] font-league-700 text-[var(--accent)]">
                                        {year.slice(2)}
                                    </span>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-[var(--foreground)]/40 uppercase tracking-wider">
                                {year}
                                <span className="ml-2 text-[var(--foreground)]/20">
                                    ({grouped[year].length})
                                </span>
                            </span>
                        </motion.div>

                        {/* Cards for this year */}
                        <div className="pl-14 space-y-4">
                            {grouped[year].map((exp, idx) => (
                                <ExperienceCard
                                    key={exp.id}
                                    experience={exp}
                                    onEdit={() => onEdit(exp)}
                                    onDelete={() => onDelete(exp)}
                                    index={yearIdx * 4 + idx}
                                    isOwner={isOwner}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
