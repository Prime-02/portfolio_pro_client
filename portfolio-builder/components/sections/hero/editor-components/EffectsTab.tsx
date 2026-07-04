// portfolio-builder/components/sections/hero/editor-components/EffectsTab.tsx

import { HeroData } from "@/portfolio-builder/types/hero";
import Field from "./Field";
import { inputClass } from "./styles";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { PBRangeInput, PBSwitch } from "@/portfolio-builder/components/shared/ui/inputs";

interface EffectsTabProps {
    data: HeroData;
    onUpdate: (value: Partial<HeroData["effects"]>) => void;
}

export default function EffectsTab({ data, onUpdate }: EffectsTabProps) {
    return (
        <div className="space-y-6">
            {/* Typewriter */}
            <div className="space-y-4">
                <h3 className="text-xs font-league-600 uppercase tracking-widest text-[color-mix(in_srgb,var(--foreground)_50%,transparent)] border-b border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] pb-2">
                    Typewriter
                </h3>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <PBSwitch
                        isSwitched={data.effects?.typewriter || false}
                        onSwitch={(e) => onUpdate({ typewriter: e })}
                    />
                    <div>
                        <p className="text-sm text-[var(--foreground)] group-hover:text-[color-mix(in_srgb,var(--foreground)_80%,transparent)] transition-colors">
                            Typewriter effect on title
                        </p>
                        <p className="text-xs text-[color-mix(in_srgb,var(--foreground)_50%,transparent)] mt-0.5">
                            Characters type out one by one
                        </p>
                    </div>
                </label>

                {data.effects?.typewriter && (
                    <PBRangeInput
                        id="typewriterSpeed"
                        label="Speed (ms per character)"
                        min={10}
                        max={500}
                        step={5}
                        value={data.effects?.typewriterSpeed ?? 50}
                        onChange={(e) => onUpdate({ typewriterSpeed: Number(e) })}
                        className={inputClass}
                    />
                )}
            </div>

            {/* Scroll indicator */}
            <div className="space-y-4">
                <h3 className="text-xs font-league-600 uppercase tracking-widest text-[color-mix(in_srgb,var(--foreground)_50%,transparent)] border-b border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] pb-2">
                    Scroll Indicator
                </h3>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <PBSwitch
                        onSwitch={(e) => onUpdate({ scrollIndicator: e })}
                        isSwitched={data.effects?.scrollIndicator ?? true}
                    />
                    <div>
                        <p className="text-sm text-[var(--foreground)] group-hover:text-[color-mix(in_srgb,var(--foreground)_80%,transparent)] transition-colors">
                            Show scroll-down indicator
                        </p>
                        <p className="text-xs text-[color-mix(in_srgb,var(--foreground)_50%,transparent)] mt-0.5">
                            Animated arrow at the bottom of the hero
                        </p>
                    </div>
                </label>
            </div>

            {/* Hint */}
            <div className="rounded-lg card border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] px-4 py-3 text-xs text-[color-mix(in_srgb,var(--foreground)_50%,transparent)]">
                <span className="text-[var(--foreground)]">✦</span> For entrance animations, parallax, hover effects, and stagger timing — see the{" "}
                <span className="text-[var(--foreground)] font-league-500">
                    Animations
                </span>{" "}
                tab.
            </div>
        </div>
    );
}