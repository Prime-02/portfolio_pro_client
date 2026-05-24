// portfolio-builder/components/sections/hero/editor-components/EffectsTab.tsx

import { HeroData } from "@/portfolio-builder/types/hero";
import Field from "./Field";
import { inputClass } from "./styles";
import { Textinput } from "@/src/app/components/inputs/Textinput";

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
                    <div className="relative mt-0.5 flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={data.effects?.typewriter || false}
                            onChange={(e) => onUpdate({ typewriter: e.target.checked })}
                            className="sr-only"
                        />
                        <div
                            className={`w-9 h-5 rounded-full transition-colors ${data.effects?.typewriter
                                    ? "bg-[var(--foreground)]"
                                    : "bg-[color-mix(in_srgb,var(--foreground)_20%,transparent)]"
                                }`}
                        />
                        <div
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--background)] transition-transform ${data.effects?.typewriter ? "translate-x-4" : "translate-x-0"
                                }`}
                        />
                    </div>
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
                    <Textinput
                        id="typewriterSpeed"
                        type="number"
                        label="Speed (ms per character)"
                        min={10}
                        max={500}
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
                    <div className="relative mt-0.5 flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={data.effects?.scrollIndicator ?? true}
                            onChange={(e) => onUpdate({ scrollIndicator: e.target.checked })}
                            className="sr-only"
                        />
                        <div
                            className={`w-9 h-5 rounded-full transition-colors ${data.effects?.scrollIndicator !== false
                                    ? "bg-[var(--foreground)]"
                                    : "bg-[color-mix(in_srgb,var(--foreground)_20%,transparent)]"
                                }`}
                        />
                        <div
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--background)] transition-transform ${data.effects?.scrollIndicator !== false ? "translate-x-4" : "translate-x-0"
                                }`}
                        />
                    </div>
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