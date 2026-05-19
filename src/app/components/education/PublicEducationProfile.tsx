// components/education/PublicEducationProfile.tsx
"use client";

import { useEffect } from "react";
import { useEducation } from "@/lib/stores/education/useEducation";
import { motion } from "framer-motion";
import { GraduationCap, Building2, Calendar, CheckCircle2 } from "lucide-react";

interface PublicEducationProfileProps {
    username: string;
}

export function PublicEducationProfile({ username }: PublicEducationProfileProps) {
    const { publicEducations, publicUsername, fetchPublicUserEducations, isLoadingPublicByUsername } = useEducation();

    useEffect(() => {
        if (username && username !== publicUsername) {
            fetchPublicUserEducations(username);
        }
    }, [username, publicUsername, fetchPublicUserEducations]);

    if (isLoadingPublicByUsername) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (publicEducations.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--foreground)]/50">No education entries yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {publicEducations.map((edu, index) => (
                <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--foreground)]/10 
                               hover:border-[var(--foreground)]/20 bg-[var(--background)] 
                               transition-all duration-200"
                >
                    <div className="p-2.5 rounded-xl bg-[var(--accent)]/10 flex-shrink-0">
                        {edu.institution_logo_url ? (
                            <img src={edu.institution_logo_url} alt={edu.institution} className="w-5 h-5 object-contain" />
                        ) : (
                            <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-league-600">{edu.institution}</p>
                        <div className="flex items-center gap-1.5 text-sm text-[var(--foreground)]/60">
                            <Building2 className="w-3 h-3" />
                            <span>{edu.degree}</span>
                            {edu.field_of_study && <span>· {edu.field_of_study}</span>}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)]/40 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                                {edu.start_year ? new Date(edu.start_year).getFullYear() : ""}
                                {edu.is_current ? " - Present" : edu.end_year ? ` - ${new Date(edu.end_year).getFullYear()}` : ""}
                            </span>
                            {edu.is_current && (
                                <span className="flex items-center gap-1 text-green-500">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Current
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}