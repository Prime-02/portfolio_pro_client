// portfolio-builder/components/sections/projects/renderer-components/MasonryLayout.tsx

import { useMemo } from "react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import ProjectCard from "./ProjectCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const GAP_PX = { small: 12, medium: 16, large: 24 } as const;

function splitIntoColumns<T>(items: T[], numCols: number): T[][] {
    if (numCols <= 1) return [items];
    const cols: T[][] = Array.from({ length: numCols }, () => []);
    items.forEach((item, i) => cols[i % numCols].push(item));
    return cols;
}

export default function MasonryLayout({
    projects,
    data,
    isAnimated,
    shouldAnimate,
    anim,
}: LayoutProps) {
    const gapPx = GAP_PX[data.gap];

    const numCols = Math.min(Math.max(data.columns, 1), 6);
    const columns = useMemo(() => splitIntoColumns(projects, numCols), [projects, numCols]);

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
        <div
            className="flex items-start w-full overflow-hidden" // ← w-full + overflow-hidden added
            style={{ gap: `${gapPx}px` }}                      // ← unitless number → "Npx" string
        >
            {columns.map((col, colIndex) => (
                <div
                    key={colIndex}
                    className="flex-1 min-w-0 flex flex-col"
                    style={{ gap: `${gapPx}px` }}              // ← same fix here
                >
                    {col.map((project, index) => (
                        <MotionItem
                            key={project.id || `${colIndex}-${index}`}
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
            ))}
        </div>
    );
}