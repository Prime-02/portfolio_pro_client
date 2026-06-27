// portfolio-builder/components/sections/projects/renderer-components/ListLayout.tsx

import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import ProjectCard from "./ProjectCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-2", medium: "gap-3", large: "gap-4" } as const;

export default function ListLayout({ projects, data, isAnimated, shouldAnimate, anim }: LayoutProps) {
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
        <div className={`flex flex-col ${gapClass} w-full`}>
            {projects.map((project, index) => (
                <MotionItem
                    key={project.id || index}
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                >
                    {/* Ensure each card fills the full row */}
                    <div className="w-full">
                        <ProjectCard
                            project={project}
                            config={resolveCardOverride(project, data.cardOverrides, defaults)}
                            cardSize={data.cardSize}
                            fullWidth={true}
                        />
                    </div>
                </MotionItem>
            ))}
        </div>
    );
}
