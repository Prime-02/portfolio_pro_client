"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Zap, TrendingUp, Award } from "lucide-react";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";

interface SkillBadgeProps {
    skill: ProfessionalSkill;
    onEdit: () => void;
    onDelete: () => void;
    index: number;
    isOwner?: boolean;
}

const proficiencyConfig: Record<string, { color: string; ring: string; label: string; icon: typeof Zap }> = {
    "Beginner": { color: "#22c55e", ring: "stroke-green-500", label: "Beginner", icon: Zap },
    "Intermediate": { color: "#3b82f6", ring: "stroke-blue-500", label: "Intermediate", icon: TrendingUp },
    "Expert": { color: "#a855f7", ring: "stroke-purple-500", label: "Expert", icon: Award },
};

const getProficiency = (level: string) => {
    const key = Object.keys(proficiencyConfig).find(k =>
        level.toLowerCase().includes(k.toLowerCase())
    );
    return proficiencyConfig[key || "Beginner"] || proficiencyConfig["Beginner"];
};

const getProficiencyPercent = (level: string): number => {
    const lower = level.toLowerCase();
    if (lower.includes("expert")) return 100;
    if (lower.includes("intermediate")) return 60;
    if (lower.includes("beginner")) return 30;
    return 50;
};

function ProficiencyRing({ percent, color }: { percent: number; color: string }) {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
                <circle
                    cx="22" cy="22" r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-[var(--foreground)]/10"
                />
                <motion.circle
                    cx="22" cy="22" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                />
            </svg>
            <span className="absolute text-[10px] font-bold" style={{ color }}>
                {percent}%
            </span>
        </div>
    );
}

export function SkillBadge({ skill, onEdit, onDelete, index, isOwner = false }: SkillBadgeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const prof = getProficiency(skill.proficiency_level);
    const ProfIcon = prof.icon;
    const percent = getProficiencyPercent(skill.proficiency_level);
    const isMajor = skill.is_major;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden
                        ${isMajor
                    ? "border-[var(--accent)]/15 bg-[var(--accent)]/2"
                    : "border-[var(--foreground)]/5 bg-[var(--background)]"
                }
                        hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/5`}
        >
            {/* Major skill indicator */}
            {isMajor && (
                <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent)]/15">
                        <Zap className="w-3 h-3 text-[var(--accent)]" />
                        <span className="text-[10px] font-medium text-[var(--accent)]">Major</span>
                    </div>
                </div>
            )}

            <div className="p-4">
                {/* Top row: Logo + Name + Proficiency Ring */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className="w-12 h-12 overflow-clip rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${prof.color}15` }}
                        >
                            {skill.skill_logo_url ? (
                                <img
                                    src={skill.skill_logo_url}
                                    alt={skill.skill_name}
                                    className="object-cover"
                                />
                            ) : (
                                <ProfIcon className="w-6 h-6" style={{ color: prof.color }} />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-league-600 text-sm truncate">{skill.skill_name}</h3>
                        {skill.category && (
                            <p className="text-[10px] text-[var(--foreground)]/40 uppercase tracking-wider">
                                {skill.category}
                                {skill.subcategory && ` · ${skill.subcategory}`}
                            </p>
                        )}
                    </div>

                    <ProficiencyRing percent={percent} color={prof.color} />
                </div>

                {/* Description */}
                {skill.description && (
                    <p className="mt-3 text-xs text-[var(--foreground)]/50 line-clamp-2">
                        {skill.description}
                    </p>
                )}

                {/* Difficulty & Trending tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {skill.difficulty_level && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium
                                       bg-[var(--foreground)]/5 text-[var(--foreground)]/50">
                            {skill.difficulty_level}
                        </span>
                    )}
                    {skill.is_trending && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium
                                       bg-orange-500/10 text-orange-500 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Trending
                        </span>
                    )}
                </div>

                {/* Actions - only for owner, appear on hover */}
                {isOwner && (
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="flex gap-1 mt-3 pt-3 border-t border-[var(--foreground)]/5"
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