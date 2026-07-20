// portfolio-builder/components/sections/hero/HeroSectionController.tsx

"use client";

import { useState } from "react";
import HeroRenderer from "@/portfolio-builder/components/sections/hero/HeroRenderer";
import HeroEditor from "@/portfolio-builder/components/sections/hero/HeroEditor";
import { HeroData, getDefaultHeroData } from "@/portfolio-builder/types/hero";
import { ResolvedTheme } from "@/portfolio-builder/hooks/usePortfolioTheme";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HeroSectionControllerProps {
    heroData: HeroData | null;
    onChange: (updatedHeroData: HeroData) => void;
    theme: ResolvedTheme;
    viewOnly: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HeroSectionController({ heroData, onChange, theme, viewOnly }: HeroSectionControllerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const { userInfo } = useUserSettings()

    const buildSeed = () =>
        getDefaultHeroData({
            name: `${userInfo?.firstname} ${userInfo?.lastname}`,
            avatar: `${userInfo?.profile_picture}`
        });

    // ---- Add section -----------------------------------------------------
    const handleAdd = () => {
        onChange(heroData ?? buildSeed());
        setIsEditing(true);
    };

    // ---- No hero data, not editing — show placeholder ------------------------
    if (!heroData && !isEditing) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-[var(--pb-text-muted)] text-sm mb-4">Hero section not set up</p>
                    <button
                        onClick={handleAdd}
                        className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                        Add Hero Section
                    </button>
                </div>
            </div>
        );
    }

    const resolvedData = heroData ?? buildSeed();

    // ---- Editing — show editor -----------------------------------------------
    if (isEditing) {
        return (
            <HeroEditor
                data={resolvedData}
                onChange={onChange}
                theme={theme}
                onDone={() => setIsEditing(false)}
            />
        );
    }

    // ---- Viewing — show renderer ---------------------------------------------
    return (
        <div className="relative">
            <HeroRenderer data={resolvedData} theme={theme} />

            {/* Edit button */}
            {
                !viewOnly &&
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 z-50 px-4 py-2 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors"
                >
                    Edit
                </button>
            }
        </div>
    );
}