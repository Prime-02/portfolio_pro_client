// components/experience/StatsBar.tsx
"use client";

import { Briefcase, Building2, MapPin, Star } from "lucide-react";
import type { Experience } from "@/lib/stores/experiences/useExperience";

interface StatsBarProps {
    experiences: Experience[];
    className?: string;
}

function getTotalYears(experiences: Experience[]): string {
    if (experiences.length === 0) return "0";

    let totalMonths = 0;
    const now = new Date();

    for (const exp of experiences) {
        const start = new Date(exp.start_date);
        const end = exp.is_current || !exp.end_date ? now : new Date(exp.end_date);
        const months =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
    }

    const years = totalMonths / 12;
    return years < 1 ? "<1" : Math.floor(years).toString();
}

export function StatsBar({ experiences, className = "" }: StatsBarProps) {
    if (experiences.length === 0) return null;

    const uniqueCompanies = new Set(experiences.map((e) => e.company_name)).size;
    const currentRole = experiences.find((e) => e.is_current);
    const featuredCount = experiences.filter((e) => e.is_featured).length;
    const totalYears = getTotalYears(experiences);

    const stats = [
        {
            icon: Briefcase,
            label: `${experiences.length} ${experiences.length === 1 ? "role" : "roles"}`,
        },
        {
            icon: Building2,
            label: `${uniqueCompanies} ${uniqueCompanies === 1 ? "company" : "companies"}`,
        },
        {
            icon: MapPin,
            label: `${totalYears} yrs experience`,
        },
        ...(featuredCount > 0
            ? [{ icon: Star, label: `${featuredCount} featured` }]
            : []),
        ...(currentRole
            ? [{ icon: Briefcase, label: `Currently @ ${currentRole.company_name}` }]
            : []),
    ];

    return (
        <div className={`flex gap-3 mb-8 flex-wrap ${className}`}>
            {stats.map(({ icon: Icon, label }) => (
                <div
                    key={label}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5"
                >
                    <Icon className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-sm font-medium">{label}</span>
                </div>
            ))}
        </div>
    );
}
