// portfolio-builder/components/sections/hero/editor-components/EffectsTab.tsx

import { HeroData } from "@/portfolio-builder/types/hero";
import Field from "./Field";
import { inputClass } from "./styles";

interface EffectsTabProps {
    data: HeroData;
    onUpdate: (value: Partial<HeroData["effects"]>) => void;
}

export default function EffectsTab({ data, onUpdate }: EffectsTabProps) {
    return (
        <div className="space-y-6">
            {/* Typewriter */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2">
                    Typewriter
                </h3>

                <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5 flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={data.effects?.typewriter || false}
                            onChange={(e) => onUpdate({ typewriter: e.target.checked })}
                            className="sr-only"
                        />
                        <div
                            className={`w-9 h-5 rounded-full transition-colors ${data.effects?.typewriter ? "bg-white" : "bg-neutral-700"
                                }`}
                        />
                        <div
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black transition-transform ${data.effects?.typewriter ? "translate-x-4" : "translate-x-0"
                                }`}
                        />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-300">Typewriter effect on title</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Characters type out one by one</p>
                    </div>
                </label>

                {data.effects?.typewriter && (
                    <Field label="Speed (ms per character)" htmlFor="typewriterSpeed">
                        <input
                            id="typewriterSpeed"
                            type="number"
                            min={10}
                            max={500}
                            value={data.effects?.typewriterSpeed ?? 50}
                            onChange={(e) => onUpdate({ typewriterSpeed: Number(e.target.value) })}
                            className={inputClass}
                        />
                    </Field>
                )}
            </div>

            {/* Scroll indicator */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2">
                    Scroll Indicator
                </h3>

                <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5 flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={data.effects?.scrollIndicator ?? true}
                            onChange={(e) => onUpdate({ scrollIndicator: e.target.checked })}
                            className="sr-only"
                        />
                        <div
                            className={`w-9 h-5 rounded-full transition-colors ${data.effects?.scrollIndicator !== false ? "bg-white" : "bg-neutral-700"
                                }`}
                        />
                        <div
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black transition-transform ${data.effects?.scrollIndicator !== false ? "translate-x-4" : "translate-x-0"
                                }`}
                        />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-300">Show scroll-down indicator</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Animated arrow at the bottom of the hero</p>
                    </div>
                </label>
            </div>

            {/* Hint */}
            <div className="rounded-lg bg-neutral-800/50 border border-neutral-700/50 px-4 py-3 text-xs text-neutral-500">
                ✦ For entrance animations, parallax, hover effects, and stagger timing — see the{" "}
                <span className="text-neutral-300 font-medium">Animations</span> tab.
            </div>
        </div>
    );
}