// components/skills/StatsBar.tsx
import { Zap, BarChart3, Crown, Layers } from "lucide-react";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";

interface StatsBarProps {
    skills: ProfessionalSkill[];
    className?: string;
}

export function StatsBar({ skills, className = "" }: StatsBarProps) {
    const getCategoriesCount = () => {
        const unique = new Set(skills.map((s) => s.category).filter(Boolean));
        return unique.size;
    };

    const getMajorCount = () => {
        return skills.filter((s) => s.is_major).length;
    };

    const getExpertCount = () => {
        return skills.filter((s) =>
            s.proficiency_level.toLowerCase().includes("expert")
        ).length;
    };

    if (skills.length === 0) return null;

    return (
        <div className={`flex gap-4 mb-8 flex-wrap ${className}`}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <Zap className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {skills.length} {skills.length === 1 ? "skill" : "skills"}
                </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <Layers className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {getCategoriesCount()} {getCategoriesCount() === 1 ? "category" : "categories"}
                </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <Crown className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {getMajorCount()} major
                </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {getExpertCount()} expert
                </span>
            </div>
        </div>
    );
}