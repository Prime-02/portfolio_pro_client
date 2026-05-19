// components/education/StatsBar.tsx
import { GraduationCap, Building2, BookOpen } from "lucide-react";
import type { Education } from "@/lib/stores/education/useEducation";

interface StatsBarProps {
    educations: Education[];
    className?: string;
}

export function StatsBar({ educations, className = "" }: StatsBarProps) {
    const getInstitutionsCount = () => {
        const unique = new Set(educations.map((e) => e.institution));
        return unique.size;
    };

    const getCurrentCount = () => {
        return educations.filter((e) => e.is_current).length;
    };

    if (educations.length === 0) return null;

    return (
        <div className={`flex gap-4 mb-8 flex-wrap ${className}`}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {educations.length} {educations.length === 1 ? "education" : "educations"}
                </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <Building2 className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {getInstitutionsCount()} {getInstitutionsCount() === 1 ? "institution" : "institutions"}
                </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {getCurrentCount()} current
                </span>
            </div>
        </div>
    );
}