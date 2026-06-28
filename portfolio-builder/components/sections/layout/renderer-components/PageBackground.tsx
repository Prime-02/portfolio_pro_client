// portfolio-builder/components/sections/layout/renderer-components/PageBackground.tsx

"use client";

import { SectionBackgroundRenderer } from "@/portfolio-builder/components/shared/background/renderer/SectionBackground";
import { PageBackgroundData } from "@/portfolio-builder/types/layout";

interface PageBackgroundProps {
    data: PageBackgroundData;
}

export default function PageBackground({ data }: PageBackgroundProps) {
    if (!data.enabled) return null;

    return (
        <div
            className="fixed inset-0 z-0 pointer-events-none"
            aria-hidden="true"
            style={{
                pointerEvents: "none",
            }}
        >
            <SectionBackgroundRenderer background={data.background} />
        </div>
    );
}           