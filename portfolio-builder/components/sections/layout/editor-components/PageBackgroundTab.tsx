// portfolio-builder/components/sections/layout/editor-components/PageBackgroundTab.tsx

"use client";

import { PageBackgroundData } from "@/portfolio-builder/types/layout";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";
import { SectionBackground } from "@/portfolio-builder/types/sectionBackground";

interface PageBackgroundTabProps {
    data: PageBackgroundData;
    onChange: (updated: PageBackgroundData) => void;
}

export default function PageBackgroundTab({ data, onChange }: PageBackgroundTabProps) {
    return (
        <div className="flex flex-col gap-5">
            {/* Enable */}
            <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-[var(--pb-text-secondary)]">
                    Enable Page Background
                </span>
                <button
                    type="button"
                    onClick={() => onChange({ ...data, enabled: !data.enabled })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${data.enabled ? "bg-[var(--pb-foreground)]" : "bg-[var(--pb-foreground-20)]"
                        }`}
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.enabled ? "translate-x-5" : "translate-x-0"
                            }`}
                    />
                </button>
            </label>

            {data.enabled && (
                <>
                    <p className="text-xs text-[var(--pb-text-muted)]">
                        Applied as a fixed layer behind all sections. Individual sections can still override
                        their own backgrounds.
                    </p>
                    <BackgroundTab
                        data={data}
                        onUpdate={(partial: Partial<SectionBackground>) =>
                            onChange({
                                ...data,
                                background: { ...data.background, ...partial },
                            })
                        }
                    />
                </>
            )}
        </div>
    );
}