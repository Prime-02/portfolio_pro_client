// components/certifications/StatsBar.tsx
import { Award, Building2, Clock } from "lucide-react";
import type { Certification } from "@/lib/stores/certifications/useCertifications";

interface StatsBarProps {
    certifications: Certification[];
    className?: string;
}

export function StatsBar({ certifications, className = "" }: StatsBarProps) {
    const getOrgsCount = () => {
        const unique = new Set(certifications.map((c) => c.issuing_organization));
        return unique.size;
    };

    const getActiveCount = () => {
        const now = new Date();
        return certifications.filter((c) => {
            if (!c.expiration_date) return true;
            return new Date(c.expiration_date) > now;
        }).length;
    };

    if (certifications.length === 0) return null;

    return (
        <div className={`flex gap-4 mb-8 flex-wrap ${className}`}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <Award className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {certifications.length} {certifications.length === 1 ? "certification" : "certifications"}
                </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <Building2 className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {getOrgsCount()} {getOrgsCount() === 1 ? "issuer" : "issuers"}
                </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
                <Clock className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium">
                    {getActiveCount()} active
                </span>
            </div>
        </div>
    );
}