// portfolio-builder/components/sections/skills/renderer-components/ListLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import SkillCard from "./SkillCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-2", medium: "gap-3", large: "gap-4" } as const;

export default function ListLayout({ skills, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
    const gapClass = GAP_CLASS[data.gap];

    const defaults = {
        // List respects the user's card style choice — no silent override
        style: data.cardStyle,
        showLogo: data.showLogo,
        // Description is shown in list layout if the user enabled it and the card
        // style supports it (standard / detailed). Compact and badge cards ignore
        // it themselves, so this is safe to pass through.
        showDescription: data.showDescription,
        showProficiency: data.showProficiency,
        showDifficulty: data.showDifficulty,
        showCategory: data.showCategory,
        proficiencyDisplay: data.proficiencyDisplay,
        difficultyDisplay: data.difficultyDisplay,
    } as const;

    return (
        <div className={`flex flex-col ${gapClass} w-full`}>
            {skills.map((skill, index) => (
                <MotionItem
                    key={skill.id || index}
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                >
                    {/* Ensure each card fills the full row */}
                    <div className="w-full">
                        <SkillCard
                            skill={skill}
                            config={resolveCardOverride(skill, data.cardOverrides, defaults)}
                            cardSize={data.cardSize}
                            fullWidth={true}
                        />
                    </div>
                </MotionItem>
            ))}
        </div>
    );
}