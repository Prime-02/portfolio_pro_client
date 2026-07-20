// portfolio-builder/components/sections/skills/renderer-components/SkillCard.tsx

import Image from "next/image";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import type { CardConfig } from "./resolveCardOverride";
import {
    ProficiencyDots,
    ProficiencyRenderer,
    DifficultyRenderer,
} from "./ProficiencyDisplay";

interface SkillCardProps {
    skill: ProfessionalSkill;
    config: CardConfig;
    cardSize: "small" | "medium" | "large";
    /** When true the card stretches to fill its grid/flex container */
    fullWidth?: boolean;
}

const SIZE_PADDING = { small: "p-3", medium: "p-4", large: "p-5" } as const;
const LOGO_SIZE = { small: "w-8 h-8", medium: "w-10 h-10", large: "w-12 h-12" } as const;
const LOGO_DIMENSIONS = { small: 32, medium: 40, large: 48 } as const;
const NAME_SIZE = { small: "text-sm", medium: "text-base", large: "text-lg" } as const;

export default function SkillCard({ skill, config, cardSize, fullWidth = true }: SkillCardProps) {
    const {
        style,
        showLogo,
        showDescription,
        showProficiency,
        showDifficulty,
        showCategory,
        proficiencyDisplay,
        difficultyDisplay,
        accentColor,
    } = config;

    const pad = SIZE_PADDING[cardSize];
    const logo = LOGO_SIZE[cardSize];
    const logoDimension = LOGO_DIMENSIONS[cardSize];
    const nameText = NAME_SIZE[cardSize];
    const widthClass = fullWidth ? "w-full" : "";

    const accentStyle = accentColor
        ? ({ "--card-accent": accentColor } as React.CSSProperties)
        : undefined;

    // ── Compact ──────────────────────────────────────────────────────────────
    if (style === "compact") {
        return (
            <div
                className={`${widthClass} ${pad} rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] flex items-center gap-3 transition-all hover:border-[var(--pb-foreground-20)]`}
                style={accentStyle}
            >
                {showLogo && skill.skill_logo_url && (
                    <img
                        src={skill.skill_logo_url}
                        alt={skill.skill_name || "Skill logo"}
                        width={logoDimension}
                        height={logoDimension}
                        className={`${logo} rounded-md object-contain shrink-0`}
                    />
                )}
                <div className="flex-1 min-w-0">
                    <p className={`${nameText} font-medium text-[var(--pb-text-primary)] truncate`}>
                        {skill.skill_name}
                    </p>
                    {showCategory && skill.category && (
                        <p className="text-xs text-[var(--pb-text-muted)]">{skill.category}</p>
                    )}
                </div>
                {showProficiency && (
                    <div className="shrink-0">
                        <ProficiencyDots level={skill.proficiency_level} size="sm" />
                    </div>
                )}
            </div>
        );
    }

    // ── Badge ─────────────────────────────────────────────────────────────────
    if (style === "badge") {
        return (
            <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all hover:scale-105 ${accentColor
                    ? ""
                    : "border-[var(--pb-border)] bg-[var(--pb-surface)] text-[var(--pb-text-primary)]"
                    }`}
                style={
                    accentColor
                        ? {
                            borderColor: `${accentColor}40`,
                            backgroundColor: `${accentColor}15`,
                            color: accentColor,
                        }
                        : undefined
                }
            >
                {showLogo && skill.skill_logo_url && (
                    <img
                        src={skill.skill_logo_url}
                        alt={skill.skill_name || "Skill logo"}
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded object-contain"
                    />
                )}
                <span className="font-medium">{skill.skill_name}</span>
                {showProficiency && (
                    <span className="text-xs opacity-60">{skill.proficiency_level}</span>
                )}
            </div>
        );
    }

    // ── Progress ──────────────────────────────────────────────────────────────
    if (style === "progress") {
        return (
            <div
                className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-3`}
                style={accentStyle}
            >
                <div className="flex items-center gap-3">
                    {showLogo && skill.skill_logo_url && (
                        <img
                            src={skill.skill_logo_url}
                            alt={skill.skill_name || "Skill logo"}
                            width={logoDimension}
                            height={logoDimension}
                            className={`${logo} rounded-lg object-contain shrink-0`}
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className={`${nameText} font-semibold text-[var(--pb-text-primary)]`}>
                            {skill.skill_name}
                        </p>
                        {showCategory && skill.category && (
                            <p className="text-xs text-[var(--pb-text-muted)]">{skill.category}</p>
                        )}
                    </div>
                </div>
                {showProficiency && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--pb-text-muted)]">Proficiency</span>
                            <span className="text-[var(--pb-text-primary)] font-medium">
                                {skill.proficiency_level}
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--pb-border)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--pb-foreground)] rounded-full transition-all duration-500"
                                style={{
                                    width: `${(({ Beginner: 1, Intermediate: 2, Expert: 3 } as Record<string, number>)[skill.proficiency_level] || 1) / 3 * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
                {showDifficulty && skill.difficulty_level && (
                    <DifficultyRenderer
                        level={skill.difficulty_level}
                        display={difficultyDisplay}
                        accentColor={accentColor}
                    />
                )}
            </div>
        );
    }

    // ── Detailed ─────────────────────────────────────────────────────────────
    if (style === "detailed") {
        return (
            <div
                className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-3 transition-all hover:border-[var(--pb-foreground-20)]`}
                style={accentStyle}
            >
                <div className="flex items-start gap-3">
                    {showLogo && skill.skill_logo_url && (
                        <img
                            src={skill.skill_logo_url}
                            alt={skill.skill_name || "Skill logo"}
                            width={logoDimension}
                            height={logoDimension}
                            className={`${logo} rounded-xl object-contain shrink-0`}
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className={`${nameText} font-semibold text-[var(--pb-text-primary)]`}>
                            {skill.skill_name}
                        </p>
                        {showCategory && skill.category && (
                            <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">{skill.category}</p>
                        )}
                    </div>
                </div>

                {showDescription && skill.description && (
                    <p className="text-sm text-[var(--pb-text-secondary)] leading-relaxed">
                        {skill.description}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {showProficiency && (
                        <ProficiencyRenderer
                            level={skill.proficiency_level}
                            display={proficiencyDisplay}
                            size="sm"
                        />
                    )}
                    {showDifficulty && skill.difficulty_level && (
                        <DifficultyRenderer
                            level={skill.difficulty_level}
                            display={difficultyDisplay}
                            accentColor={accentColor}
                        />
                    )}
                    {skill.is_major && (
                        <span className="inline-block text-xs px-2 py-1 rounded-md bg-[var(--pb-accent-20)] text-[var(--pb-accent)] border border-[var(--pb-accent-30)]">
                            Major
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // ── Standard (default) ────────────────────────────────────────────────────
    return (
        <div
            className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-2.5 transition-all hover:border-[var(--pb-foreground-20)]`}
            style={accentStyle}
        >
            <div className="flex items-center gap-3">
                {showLogo && skill.skill_logo_url && (
                    <img
                        src={skill.skill_logo_url}
                        alt={skill.skill_name || "Skill logo"}
                        width={logoDimension}
                        height={logoDimension}
                        className={`${logo} rounded-lg object-contain shrink-0`}
                    />
                )}
                <div className="flex-1 min-w-0">
                    <p className={`${nameText} font-semibold text-[var(--pb-text-primary)] truncate`}>
                        {skill.skill_name}
                    </p>
                    {showCategory && skill.category && (
                        <p className="text-xs text-[var(--pb-text-muted)]">{skill.category}</p>
                    )}
                </div>
            </div>

            {showDescription && skill.description && (
                <p className="text-sm text-[var(--pb-text-secondary)] line-clamp-2">{skill.description}</p>
            )}

            <div className="flex items-center justify-between pt-1 gap-2">
                {showProficiency && (
                    <ProficiencyRenderer
                        level={skill.proficiency_level}
                        display={proficiencyDisplay}
                    />
                )}
                {showDifficulty && skill.difficulty_level && (
                    <DifficultyRenderer
                        level={skill.difficulty_level}
                        display={difficultyDisplay}
                        accentColor={accentColor}
                    />
                )}
            </div>
        </div>
    );
}