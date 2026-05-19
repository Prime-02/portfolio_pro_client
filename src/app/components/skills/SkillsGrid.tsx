// components/skills/SkillsGrid.tsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import { SkillBadge } from "./SkillBadge";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptySkillsState } from "./EmptySkillsState";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";

interface SkillsGridProps {
    skills: ProfessionalSkill[];
    isLoading: boolean;
    onEdit: (skill: ProfessionalSkill) => void;
    onDelete: (skill: ProfessionalSkill) => void;
    onAddClick: () => void;
    groupByCategory?: boolean;
    isOwner?: boolean;
}

export function SkillsGrid({
    skills,
    isLoading,
    onEdit,
    onDelete,
    onAddClick,
    groupByCategory = true,
    isOwner = false,
}: SkillsGridProps) {
    // Group skills by category
    const groupedSkills = useMemo(() => {
        if (!groupByCategory) return { "All Skills": skills };

        return skills.reduce((acc, skill) => {
            const category = skill.category || "Uncategorized";
            if (!acc[category]) acc[category] = [];
            acc[category].push(skill);
            return acc;
        }, {} as Record<string, ProfessionalSkill[]>);
    }, [skills, groupByCategory]);
    if (isLoading) return <LoadingSkeleton />;

    if (skills.length === 0) {
        return <EmptySkillsState onAddClick={onAddClick} isOwner={isOwner} />;
    }


    return (
        <div className="space-y-8">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <div key={category}>
                    {groupByCategory && category !== "All Skills" && (
                        <motion.h3
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm font-medium text-[var(--foreground)]/40 uppercase tracking-wider mb-4
                                     flex items-center gap-2"
                        >
                            <div className="w-8 h-px bg-[var(--foreground)]/20" />
                            {category}
                            <span className="text-[var(--foreground)]/20">
                                ({categorySkills.length})
                            </span>
                        </motion.h3>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {categorySkills.map((skill, idx) => (
                            <SkillBadge
                                key={skill.id}
                                skill={skill}
                                onEdit={() => onEdit(skill)}
                                onDelete={() => onDelete(skill)}
                                index={idx}
                                isOwner={isOwner}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}