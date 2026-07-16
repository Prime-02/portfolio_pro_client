// components/experience/ExperienceCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Pencil,
    Trash2,
    MapPin,
    ExternalLink,
    Building2,
    Star,
    Calendar,
} from "lucide-react";
import type { Experience, EmploymentType, LocationType } from "@/lib/stores/experiences/useExperience";
import { useUIStore } from "@/lib/stores/ui/useUIStore";

interface ExperienceCardProps {
    experience: Experience;
    onEdit?: () => void;
    onDelete?: () => void;
    index: number;
    isOwner: boolean;
}

const employmentTypeLabels: Record<EmploymentType, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    FREELANCE: "Freelance",
    INTERNSHIP: "Internship",
    SELF_EMPLOYED: "Self-employed",
};

const locationTypeLabels: Record<LocationType, string> = {
    ON_SITE: "On-site",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
};

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getDuration(start: string, end?: string, isCurrent?: boolean): string {
    const startDate = new Date(start);
    const endDate = isCurrent || !end ? new Date() : new Date(end);
    const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());

    if (months < 1) return "< 1 mo";
    if (months < 12) return `${months} mo`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years} yr ${rem} mo` : `${years} yr`;
}

export function ExperienceCard({
    experience,
    onEdit,
    onDelete,
    index,
    isOwner,
}: ExperienceCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const { isDesktop } = useUIStore();

    const isCurrent = experience.is_current;
    const isFeatured = experience.is_featured;
    const duration = getDuration(experience.start_date, experience.end_date, isCurrent);
    const dateRange = `${formatDate(experience.start_date)} — ${isCurrent ? "Present" : experience.end_date ? formatDate(experience.end_date) : ""}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative rounded-2xl border transition-all duration-300 overflow-hidden h-fit
                ${isFeatured
                    ? "border-[var(--accent)]/30 bg-[var(--accent)]/5"
                    : "border-[var(--foreground)]/10 bg-[var(--background)]"
                }
                hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5`}
        >
            {/* Featured badge */}
            {isFeatured && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent)]/15">
                    <Star className="w-3 h-3 text-[var(--accent)]" />
                    <span className="text-[10px] font-medium text-[var(--accent)]">Featured</span>
                </div>
            )}

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start gap-3">
                    {/* Company logo or fallback */}
                    <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                                   bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 overflow-hidden"
                    >
                        {experience.company_logo_url ? (
                            <img
                                src={experience.company_logo_url}
                                alt={experience.company_name || "Company logo"}
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                            />
                        ) : (
                            <Building2 className="w-6 h-6 text-[var(--foreground)]/30" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                        <h3 className="font-league-600 text-base leading-tight truncate">
                            {experience.job_title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm text-[var(--foreground)]/70 font-medium truncate">
                                {experience.company_name}
                            </span>
                            {experience.company_website && (
                                <a
                                    href={experience.company_website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[var(--foreground)]/30 hover:text-[var(--accent)] transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-[var(--foreground)]/50">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateRange}
                        <span className="text-[var(--foreground)]/30">·</span>
                        <span className="text-[var(--foreground)]/40">{duration}</span>
                    </span>
                    {experience.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {experience.location}
                        </span>
                    )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium
                                       bg-emerald-500/10 text-emerald-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Current
                        </span>
                    )}
                    {experience.employment_type && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium
                                       bg-[var(--foreground)]/5 text-[var(--foreground)]/50">
                            {employmentTypeLabels[experience.employment_type] ?? experience.employment_type}
                        </span>
                    )}
                    {experience.location_type && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium
                                       bg-[var(--foreground)]/5 text-[var(--foreground)]/50">
                            {locationTypeLabels[experience.location_type] ?? experience.location_type}
                        </span>
                    )}
                    {experience.industry && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium
                                       bg-[var(--accent)]/10 text-[var(--accent)]/70">
                            {experience.industry}
                        </span>
                    )}
                </div>

                {/* Description (expandable) */}
                {experience.description && (
                    <div className="mt-3">
                        <p
                            className={`text-xs text-[var(--foreground)]/50 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
                        >
                            {experience.description}
                        </p>
                        {experience.description.length > 120 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-[10px] text-[var(--accent)]/70 hover:text-[var(--accent)] mt-1 transition-colors"
                            >
                                {expanded ? "Show less" : "Show more"}
                            </button>
                        )}
                    </div>
                )}

                {/* Achievements */}
                {expanded && experience.achievements && experience.achievements.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 space-y-1"
                    >
                        <p className="text-[10px] font-medium text-[var(--foreground)]/40 uppercase tracking-wider">
                            Achievements
                        </p>
                        <ul className="space-y-0.5">
                            {experience.achievements.map((ach, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--foreground)]/55">
                                    <span className="mt-1.5 w-1 h-1 flex-shrink-0 rounded-full bg-[var(--accent)]/60" />
                                    {ach}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* Skills used */}
                {experience.skills_used && experience.skills_used.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {experience.skills_used.slice(0, expanded ? undefined : 4).map((skill) => (
                            <span
                                key={skill}
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium
                                           bg-[var(--foreground)]/5 text-[var(--foreground)]/40
                                           border border-[var(--foreground)]/5"
                            >
                                {skill}
                            </span>
                        ))}
                        {!expanded && experience.skills_used.length > 4 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-[var(--foreground)]/30">
                                +{experience.skills_used.length - 4} more
                            </span>
                        )}
                    </div>
                )}

                {/* Owner actions — appear on hover (desktop) or always visible (mobile/tablet) */}
                {isOwner && (
                    <AnimatePresence>
                        {(!isDesktop || isHovered) && (
                            <motion.div
                                initial={isDesktop ? { opacity: 0, y: 4 } : { opacity: 1, y: 0 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={isDesktop ? { opacity: 0, y: 4 } : { opacity: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex gap-1 mt-4 pt-3 border-t border-[var(--foreground)]/5"
                            >
                                <button
                                    onClick={onEdit}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                                             text-xs font-medium hover:bg-[var(--foreground)]/5 transition-colors"
                                >
                                    <Pencil className="w-3 h-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                                             text-xs font-medium text-red-500 hover:bg-red-500/5 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Remove
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}