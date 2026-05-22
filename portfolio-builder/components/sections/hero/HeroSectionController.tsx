// portfolio-builder/components/sections/hero/HeroSectionController.tsx

"use client";

import { useState } from "react";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";
import HeroRenderer from "@/portfolio-builder/components/sections/hero/HeroRenderer";
import HeroEditor from "@/portfolio-builder/components/sections/hero/HeroEditor";
import { HeroData, getEmptyHeroData } from "@/portfolio-builder/types/hero";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HeroSectionControllerProps {
    portfolioId: string;
    layout: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

interface PortfolioSection {
    type: string;
    data: Record<string, unknown>;
}

interface PortfolioLayout {
    sections: PortfolioSection[];
}

function getHeroDataFromLayout(layout: Record<string, unknown> | null): HeroData | null {
    if (!layout) return null;

    const sections = (layout).sections;
    if (!sections || !Array.isArray(sections)) return null;

    const heroSection = sections.find((s) => s.type === "hero");
    if (!heroSection) return null;

    return heroSection.data as unknown as HeroData;
}

function setHeroDataInLayout(
    layout: Record<string, unknown> | null,
    heroData: HeroData,
): Record<string, unknown> {
    const currentLayout = (layout) || { sections: [] };
    const sections = [...(currentLayout.sections as PortfolioSection[] || [])];

    const heroIndex = sections.findIndex((s) => s.type === "hero");

    if (heroIndex >= 0) {
        sections[heroIndex] = { type: "hero", data: heroData as unknown as Record<string, unknown> };
    } else {
        sections.push({ type: "hero", data: heroData as unknown as Record<string, unknown> });
    }

    return { sections };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HeroSectionController({ portfolioId, layout }: HeroSectionControllerProps) {
    const { updatePortfolio } = usePortfolioStore();
    const [isEditing, setIsEditing] = useState(false);

    const heroData = getHeroDataFromLayout(layout);

    // ---- Save ----------------------------------------------------------------
    const handleSave = async (updatedHeroData: HeroData) => {
        const newLayout = setHeroDataInLayout(layout, updatedHeroData);
        await updatePortfolio(portfolioId, { layout: newLayout });
    };

    // ---- Cancel --------------------------------------------------------------
    const handleCancel = () => {
        setIsEditing(false);
    };

    // ---- No hero data, not editing — show placeholder ------------------------
    if (!heroData && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-neutral-500 text-sm mb-4">Hero section not set up</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-white text-black rounded-lg font-medium text-sm hover:bg-neutral-200 transition-colors"
                    >
                        Add Hero Section
                    </button>
                </div>
            </div>
        );
    }

    // ---- Editing — show editor -----------------------------------------------
    if (isEditing) {
        return (
            <HeroEditor
                initialData={heroData || getEmptyHeroData()}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        );
    }

    // ---- Viewing — show renderer ---------------------------------------------
    return (
        <div className="relative">
            <HeroRenderer data={heroData!} />

            {/* Edit button */}
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 backdrop-blur text-white border border-white/20 rounded-lg font-medium text-sm hover:bg-white/20 transition-colors"
            >
                Edit
            </button>
        </div>
    );
}