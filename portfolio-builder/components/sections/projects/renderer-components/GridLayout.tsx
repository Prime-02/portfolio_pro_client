// portfolio-builder/components/sections/projects/renderer-components/GridLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import ProjectCard from "./ProjectCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const COL_CLASS: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

const GAP_CLASS = { small: "gap-3", medium: "gap-4", large: "gap-6" } as const;

export default function GridLayout({ projects, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
    const colClass = COL_CLASS[data.columns] ?? "grid-cols-3";
    const gapClass = GAP_CLASS[data.gap];

    const defaults = {
        style: data.cardStyle,
        showImage: data.showImage,
        showDescription: data.showDescription,
        showUrl: data.showUrl,
        showDates: data.showDates,
        showStatus: data.showStatus,
        showPlatform: data.showPlatform,
        showCategory: data.showCategory,
        showStack: data.showStack,
        showBudget: data.showBudget,
        showClient: data.showClient,
        showContribution: data.showContribution,
        dateDisplay: data.dateDisplay,
        statusDisplay: data.statusDisplay,
        platformDisplay: data.platformDisplay,
        categoryDisplay: data.categoryDisplay,
    } as const;

    return (
        <div className={`grid ${colClass} ${gapClass}`}>
            {projects.map((project, index) => (
                <MotionItem
                    key={project.id || index}
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                >
                    <ProjectCard
                        project={project}
                        config={resolveCardOverride(project, data.cardOverrides, defaults)}
                        cardSize={data.cardSize}
                    />
                </MotionItem>
            ))}
        </div>
    );
}
