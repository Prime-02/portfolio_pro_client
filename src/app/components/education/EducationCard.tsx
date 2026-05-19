"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Pencil, Trash2, GraduationCap, Building2, Calendar, Clock,
    CheckCircle2, BookOpen, ChevronDown, Lock, ExternalLink
} from "lucide-react";
import type { Education } from "@/lib/stores/education/useEducation";

interface EducationCardProps {
    education: Education;
    onEdit: () => void;
    onDelete: () => void;
    isOwner?: boolean;
}

function formatYear(yearStr: string | null | undefined): string {
    if (!yearStr) return "";
    const date = new Date(yearStr);
    return date.getFullYear().toString();
}

export function EducationCard({ education, onEdit, onDelete, isOwner = false }: EducationCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isCurrent = education.is_current;
    const hasEndYear = !!education.end_year;

    const accentColor = isCurrent ? "var(--accent)" : "#6366f1";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative rounded-2xl border border-[var(--foreground)]/10 
                       bg-[var(--background)] hover:border-[var(--foreground)]/20 
                       transition-all duration-300 overflow-hidden"
        >
            {/* Color accent bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: accentColor }}
            />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                            className="p-2.5 rounded-xl flex-shrink-0"
                            style={{ backgroundColor: `${accentColor}20` }}
                        >
                            {education.institution_logo_url ? (
                                <img
                                    src={education.institution_logo_url}
                                    alt={education.institution}
                                    className="w-5 h-5 object-contain"
                                />
                            ) : (
                                <GraduationCap className="w-5 h-5" style={{ color: accentColor }} />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-league-600 text-base leading-tight truncate">
                                {education.institution}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Building2 className="w-3 h-3 text-[var(--foreground)]/40 flex-shrink-0" />
                                <p className="text-xs text-[var(--foreground)]/50 truncate">
                                    {education.degree}
                                    {education.field_of_study && ` · ${education.field_of_study}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions — only for owner */}
                    {isOwner && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                            <button
                                onClick={onEdit}
                                className="p-2 rounded-lg hover:bg-[var(--foreground)]/10 transition-colors"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onDelete}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Status badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 
                                ${isCurrent ? "bg-green-500/10 text-green-500" : hasEndYear ? "bg-blue-500/10 text-blue-500" : "bg-[var(--foreground)]/5 text-[var(--foreground)]/50"}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {isCurrent ? "Currently Studying" : hasEndYear ? "Completed" : "Education"}
                </div>

                {/* Dates */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                    {education.start_year && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
                            <Calendar className="w-3 h-3" />
                            <span>Started {formatYear(education.start_year)}</span>
                        </div>
                    )}
                    {education.end_year && !isCurrent && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
                            <Clock className="w-3 h-3" />
                            <span>Graduated {formatYear(education.end_year)}</span>
                        </div>
                    )}
                    {isCurrent && (
                        <div className="flex items-center gap-1.5 text-xs text-green-500">
                            <Clock className="w-3 h-3" />
                            <span>Present</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                {education.description && (
                    <div className="mt-2">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1 text-xs text-[var(--foreground)]/40 hover:text-[var(--foreground)]/60 transition-colors"
                        >
                            <BookOpen className="w-3 h-3" />
                            <span>Details</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        <motion.div
                            initial={false}
                            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <p className="mt-1.5 text-xs text-[var(--foreground)]/50 leading-relaxed">
                                {education.description}
                            </p>
                        </motion.div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}