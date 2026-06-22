// portfolio-builder/components/sections/hero/HeroSectionController.tsx

"use client";

import { useState } from "react";
import HeroRenderer from "@/portfolio-builder/components/sections/hero/HeroRenderer";
import HeroEditor from "@/portfolio-builder/components/sections/hero/HeroEditor";
import { HeroData, getEmptyHeroData } from "@/portfolio-builder/types/hero";
import { ResolvedTheme } from "@/portfolio-builder/hooks/usePortfolioTheme";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HeroSectionControllerProps {
    heroData: HeroData | null;
    onSave: (updatedHeroData: HeroData) => Promise<void>;
    theme: ResolvedTheme;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HeroSectionController({ heroData, onSave, theme }: HeroSectionControllerProps) {
    const [isEditing, setIsEditing] = useState(false);

    // ---- Save ----------------------------------------------------------------
    const handleSave = async (updatedHeroData: HeroData) => {
        await onSave(updatedHeroData);
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
                    <p className="text-[var(--pb-text-muted)] text-sm mb-4">Hero section not set up</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
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
                theme={theme}
                setFullScreen={()=> setIsEditing(!isEditing)}
            />
        );
    }

    // ---- Viewing — show renderer ---------------------------------------------
    return (
        <div className="relative">
            <HeroRenderer data={heroData!} theme={theme} />

            {/* Edit button */}
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 z-50 px-4 py-2 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors"
            >
                Edit
            </button>
        </div>
    );
}