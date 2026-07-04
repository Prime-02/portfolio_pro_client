// portfolio-builder/components/sections/hero/editor-components/AnimationsTab.tsx

import { HeroData } from "@/portfolio-builder/types/hero";
import type {
    AnimationPreset,
    AnimationEasing,
    HoverEffect,
    HeroAnimations,
} from "@/portfolio-builder/types/hero";
import SelectField from "./SelectField";
import Field from "./Field";
import { inputClass } from "./styles";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { PBRangeInput } from "@/portfolio-builder/components/shared/ui/inputs";
import { SliderField } from "../../bio/editor-components";

interface AnimationsTabProps {
    data: HeroData;
    onUpdate: (value: Partial<HeroAnimations>) => void;
}

const PRESET_OPTIONS: { value: AnimationPreset; label: string }[] = [
    { value: "none", label: "None" },
    { value: "fadeIn", label: "Fade In" },
    { value: "slideUp", label: "Slide Up" },
    { value: "slideDown", label: "Slide Down" },
    { value: "slideLeft", label: "Slide from Left" },
    { value: "slideRight", label: "Slide from Right" },
    { value: "scaleUp", label: "Scale Up" },
    { value: "scaleDown", label: "Scale Down" },
    { value: "blurIn", label: "Blur In" },
    { value: "rotateIn", label: "Rotate In" },
    { value: "flipUp", label: "Flip Up" },
    { value: "bounceIn", label: "Bounce In" },
];

const EASING_OPTIONS: { value: AnimationEasing; label: string }[] = [
    { value: "easeOut", label: "Ease Out (smooth decelerate)" },
    { value: "easeIn", label: "Ease In (slow start)" },
    { value: "easeInOut", label: "Ease In-Out (smooth)" },
    { value: "linear", label: "Linear" },
    { value: "spring", label: "Spring (bouncy)" },
    { value: "anticipate", label: "Anticipate (pull back first)" },
];

const HOVER_OPTIONS: { value: HoverEffect; label: string }[] = [
    { value: "none", label: "None" },
    { value: "lift", label: "Lift (shadow + rise)" },
    { value: "scale", label: "Scale Up" },
    { value: "glow", label: "Glow" },
    { value: "tilt", label: "3D Tilt" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--pb-text-muted)] border-b border-[var(--pb-border)] pb-2">
                {title}
            </h3>
            {children}
        </div>
    );
}

function Toggle({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 flex-shrink-0">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                />
                <div
                    className={`w-9 h-5 rounded-full transition-colors ${checked
                        ? "bg-[var(--pb-foreground)]"
                        : "bg-[var(--pb-foreground-20)]"
                        }`}
                />
                <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--pb-background)] transition-transform ${checked ? "translate-x-4" : "translate-x-0"
                        }`}
                />
            </div>
            <div>
                <p className="text-sm text-[var(--pb-text-secondary)] group-hover:text-[var(--pb-text-primary)] transition-colors">
                    {label}
                </p>
                {description && (
                    <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">
                        {description}
                    </p>
                )}
            </div>
        </label>
    );
}

export default function AnimationsTab({ data, onUpdate }: AnimationsTabProps) {
    const anim = data.animations ?? ({} as Partial<HeroAnimations>);

    const preset = anim.preset ?? "fadeIn";
    const duration = anim.duration ?? 0.6;
    const delay = anim.delay ?? 0.1;
    const easing = anim.easing ?? "easeOut";
    const staggerChildren = anim.staggerChildren ?? true;
    const staggerDelay = anim.staggerDelay ?? 0.12;
    const scrollTrigger = anim.scrollTrigger ?? false;
    const scrollOnce = anim.scrollOnce ?? true;
    const parallax = anim.parallax ?? false;
    const parallaxIntensity = anim.parallaxIntensity ?? 20;
    const hoverEffect = anim.hoverEffect ?? "none";
    const hoverScale = anim.hoverScale ?? 1.03;
    const textReveal = anim.textReveal ?? false;
    const textRevealDelay = anim.textRevealDelay ?? 0.2;

    const isAnimated = preset !== "none";

    return (
        <div className="space-y-8">
            {/* ── Entrance ── */}
            <Section title="Entrance Animation">
                <SelectField
                    label="Preset"
                    id="animPreset"
                    value={preset}
                    onChange={(v) => onUpdate({ preset: v as AnimationPreset })}
                    options={PRESET_OPTIONS}
                />

                {isAnimated && (
                    <>
                        <SelectField
                            label="Easing"
                            id="animEasing"
                            value={easing}
                            onChange={(v) => onUpdate({ easing: v as AnimationEasing })}
                            options={EASING_OPTIONS}
                        />

                        <SliderField
                            label="Duration"
                            value={duration}
                            min={0.1}
                            max={2}
                            step={0.05}
                            onChange={(v) => onUpdate({ duration: v })}
                        />

                        <SliderField
                            label="Initial Delay"
                            value={delay}
                            min={0}
                            max={2}
                            step={0.05}
                            onChange={(v) => onUpdate({ delay: v })}
                        />
                    </>
                )}
            </Section>

            {/* ── Stagger ── */}
            {isAnimated && (
                <Section title="Stagger">
                    <Toggle
                        label="Stagger child elements"
                        description="Each element animates in sequence rather than all at once"
                        checked={staggerChildren}
                        onChange={(v) => onUpdate({ staggerChildren: v })}
                    />

                    {staggerChildren && (
                        <SliderField
                            label="Delay between elements"
                            value={staggerDelay}
                            min={0.02}
                            max={0.5}
                            step={0.01}
                            onChange={(v) => onUpdate({ staggerDelay: v })}
                        />
                    )}
                </Section>
            )}

            {/* ── Scroll Trigger ── */}
            {isAnimated && (
                <Section title="Scroll Trigger">
                    <Toggle
                        label="Trigger on scroll"
                        description="Animation plays when the hero enters the viewport"
                        checked={scrollTrigger}
                        onChange={(v) => onUpdate({ scrollTrigger: v })}
                    />

                    {scrollTrigger && (
                        <Toggle
                            label="Animate only once"
                            description="Won't replay when scrolling back up"
                            checked={scrollOnce}
                            onChange={(v) => onUpdate({ scrollOnce: v })}
                        />
                    )}
                </Section>
            )}

            {/* ── Parallax ── */}
            <Section title="Parallax">
                <Toggle
                    label="Enable parallax"
                    description="Elements shift at different speeds as you scroll"
                    checked={parallax}
                    onChange={(v) => onUpdate({ parallax: v })}
                />

                {parallax && (
                    <SliderField
                        label="Intensity"
                        value={parallaxIntensity}
                        min={5}
                        max={100}
                        step={5}
                        onChange={(v) => onUpdate({ parallaxIntensity: v })}
                    />
                )}
            </Section>

            {/* ── Text Reveal ── */}
            <Section title="Text Reveal">
                <Toggle
                    label="Clip-mask text reveal"
                    description="Text slides up from behind a mask — cinematic entrance"
                    checked={textReveal}
                    onChange={(v) => onUpdate({ textReveal: v })}
                />

                {textReveal && (
                    <SliderField
                        label="Reveal delay"
                        value={textRevealDelay}
                        min={0}
                        max={1.5}
                        step={0.05}
                        onChange={(v) => onUpdate({ textRevealDelay: v })}
                    />
                )}
            </Section>

            {/* ── Hover ── */}
            <Section title="Hover Effects">
                <SelectField
                    label="Hover effect"
                    id="hoverEffect"
                    value={hoverEffect}
                    onChange={(v) => onUpdate({ hoverEffect: v as HoverEffect })}
                    options={HOVER_OPTIONS}
                />

                {(hoverEffect === "scale" || hoverEffect === "lift") && (
                    <SliderField
                        label="Scale amount"
                        value={hoverScale}
                        min={1.01}
                        max={1.15}
                        step={0.01}
                        onChange={(v) => onUpdate({ hoverScale: v })}
                    />
                )}
            </Section>
        </div>
    );
}