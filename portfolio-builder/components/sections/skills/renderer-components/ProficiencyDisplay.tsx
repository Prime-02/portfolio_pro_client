// portfolio-builder/components/sections/skills/renderer-components/ProficiencyDisplay.tsx

import type { ProficiencyDisplay, DifficultyDisplay } from "@/portfolio-builder/types/skills";

// ---------------------------------------------------------------------------
// Order maps
// ---------------------------------------------------------------------------

export const PROFICIENCY_ORDER: Record<string, number> = {
    Beginner: 1,
    Intermediate: 2,
    Expert: 3,
};

export const DIFFICULTY_ORDER: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
};

// ---------------------------------------------------------------------------
// Proficiency dots
// ---------------------------------------------------------------------------

export function ProficiencyDots({
    level,
    size = "md",
}: {
    level: string;
    size?: "sm" | "md" | "lg";
}) {
    const total = 3;
    const filled = PROFICIENCY_ORDER[level] || 1;
    const dotSize =
        size === "sm" ? "w-1.5 h-1.5" : size === "lg" ? "w-2.5 h-2.5" : "w-2 h-2";

    return (
        <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={`${dotSize} rounded-full transition-colors ${i < filled ? "bg-[var(--pb-foreground)]" : "bg-[var(--pb-border)]"
                        }`}
                />
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Proficiency bar
// ---------------------------------------------------------------------------

export function ProficiencyBar({ level }: { level: string }) {
    const pct = ((PROFICIENCY_ORDER[level] || 1) / 3) * 100;
    return (
        <div className="w-full h-1.5 bg-[var(--pb-border)] rounded-full overflow-hidden">
            <div
                className="h-full bg-[var(--pb-foreground)] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Unified proficiency renderer — respects proficiencyDisplay setting
// ---------------------------------------------------------------------------

export function ProficiencyRenderer({
    level,
    display,
    size = "md",
}: {
    level: string;
    display: ProficiencyDisplay;
    size?: "sm" | "md" | "lg";
}) {
    if (display === "hidden" || !level) return null;

    if (display === "bar") {
        return (
            <div className="space-y-1">
                <div className="flex justify-between gap-1 text-xs">
                    <span className="text-[var(--pb-text-muted)]">Proficiency</span>
                    <span className="text-[var(--pb-text-primary)] font-medium">{level}</span>
                </div>
                <ProficiencyBar level={level} />
            </div>
        );
    }

    if (display === "badge") {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)]">
                <ProficiencyDots level={level} size="sm" />
                {level}
            </span>
        );
    }

    if (display === "text") {
        return (
            <span className="text-xs text-[var(--pb-text-muted)]">{level}</span>
        );
    }

    // "dots" (default)
    return (
        <div className="flex items-center gap-2">
            <ProficiencyDots level={level} size={size} />
            <span className="text-xs text-[var(--pb-text-muted)]">{level}</span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Difficulty renderer — respects difficultyDisplay setting
// ---------------------------------------------------------------------------

export function DifficultyRenderer({
    level,
    display,
    accentColor,
}: {
    level: string | undefined | null;
    display: DifficultyDisplay;
    accentColor?: string;
}) {
    if (display === "hidden" || !level) return null;

    if (display === "badge") {
        return (
            <span
                className="inline-block text-xs px-2 py-0.5 rounded-full"
                style={{
                    backgroundColor: accentColor ? `${accentColor}20` : "var(--pb-surface-elevated)",
                    color: accentColor || "var(--pb-text-muted)",
                }}
            >
                {level}
            </span>
        );
    }

    // "text"
    return <span className="text-xs text-[var(--pb-text-muted)]">{level}</span>;
}