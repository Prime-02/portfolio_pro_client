// components/skills/PublicSkillsProfile.tsx
"use client";

import { useEffect } from "react";
import { useSkills } from "@/lib/stores/skills/useSkills";
import { motion } from "framer-motion";
import { Zap, Award, TrendingUp } from "lucide-react";

interface PublicSkillsProfileProps {
    username: string;
}

const getProficiencyColor = (level: string): string => {
    const lower = level.toLowerCase();
    if (lower.includes("expert")) return "#a855f7";
    if (lower.includes("intermediate")) return "#3b82f6";
    return "#22c55e";
};

const getProficiencyPercent = (level: string): number => {
    const lower = level.toLowerCase();
    if (lower.includes("expert")) return 100;
    if (lower.includes("intermediate")) return 60;
    return 30;
};

export function PublicSkillsProfile({ username }: PublicSkillsProfileProps) {
    const { publicSkills, publicUsername, fetchPublicSkillsByUsername, isLoadingPublicByUsername } = useSkills();

    useEffect(() => {
        if (username && username !== publicUsername) {
            fetchPublicSkillsByUsername(username);
        }
    }, [username, publicUsername, fetchPublicSkillsByUsername]);

    if (isLoadingPublicByUsername) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (publicSkills.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--foreground)]/50">No skills yet</p>
            </div>
        );
    }

    // Group by category
    const grouped = publicSkills.reduce((acc, skill) => {
        const cat = skill.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {} as Record<string, typeof publicSkills>);

    return (
        <div className="space-y-8">
            {Object.entries(grouped).map(([category, skills]) => (
                <div key={category}>
                    <h3 className="text-sm font-medium text-[var(--foreground)]/40 uppercase tracking-wider mb-4
                                 flex items-center gap-2">
                        <div className="w-8 h-px bg-[var(--foreground)]/20" />
                        {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => {
                            const color = getProficiencyColor(skill.proficiency_level);
                            const percent = getProficiencyPercent(skill.proficiency_level);

                            return (
                                <motion.div
                                    key={skill.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative flex items-center gap-2 px-4 py-2 rounded-full
                                             border border-[var(--foreground)]/10 bg-[var(--background)]
                                             hover:border-[var(--accent)]/30 transition-all duration-200"
                                >
                                    {skill.skill_logo_url ? (
                                        <img src={skill.skill_logo_url} alt="" className="w-4 h-4 object-contain" />
                                    ) : (
                                        <Zap className="w-4 h-4" style={{ color }} />
                                    )}
                                    <span className="text-sm font-medium">{skill.skill_name}</span>

                                    {/* Proficiency dot */}
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: color }}
                                        title={`${skill.proficiency_level} (${percent}%)`}
                                    />

                                    {skill.is_major && (
                                        <Award className="w-3 h-3 text-[var(--accent)]" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}