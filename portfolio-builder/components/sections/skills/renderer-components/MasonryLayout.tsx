// portfolio-builder/components/sections/skills/renderer-components/MasonryLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import SkillCard from "./SkillCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

// Masonry caps at 4 cols — beyond that columns-CSS gets unwieldy
const COL_CLASS: Record<number, string> = {
    1: "columns-1",
    2: "columns-1 sm:columns-2",
    3: "columns-1 sm:columns-2 lg:columns-3",
    4: "columns-1 sm:columns-2 lg:columns-4",
    5: "columns-2 sm:columns-3 lg:columns-5",
    6: "columns-2 sm:columns-3 lg:columns-6",
};

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;
const MB_CLASS = { small: "mb-3", medium: "mb-4", large: "mb-6" } as const;

export default function MasonryLayout({
    skills,
    data,
    isAnimated,
    shouldAnimate,
    anim,
}: LayoutProps) {
    const colClass = COL_CLASS[data.columns] ?? "columns-3";
    const gapClass = GAP_CLASS[data.gap];
    const mbClass = MB_CLASS[data.gap];

    const defaults = {
        style: data.cardStyle,
        showLogo: data.showLogo,
        showDescription: data.showDescription,
        showProficiency: data.showProficiency,
        showDifficulty: data.showDifficulty,
        showCategory: data.showCategory,
        proficiencyDisplay: data.proficiencyDisplay,
        difficultyDisplay: data.difficultyDisplay,
    } as const;

    return (
        <div className={`${colClass} ${gapClass}`}>
            {skills.map((skill, index) => (
                <div key={skill.id || index} className={`break-inside-avoid ${mbClass}`}>
                    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                        <SkillCard
                            skill={skill}
                            config={resolveCardOverride(skill, data.cardOverrides, defaults)}
                            cardSize={data.cardSize}
                        />
                    </MotionItem>
                </div>
            ))}
        </div>
    );
}