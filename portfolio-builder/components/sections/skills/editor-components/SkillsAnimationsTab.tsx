// portfolio-builder/components/sections/skills/editor-components/SkillsAnimationsTab.tsx

import { SkillsData } from "@/portfolio-builder/types/skills";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import SelectField from "../../bio/editor-components/SelectField";
import SliderField from "../../bio/editor-components/SliderField";
import Toggle from "../../bio/editor-components/Toggle";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";

interface SkillsAnimationsTabProps {
  data: SkillsData;
  onUpdate: (value: Partial<BioAnimations>) => void;
}

const PRESET_OPTIONS = [
  { value: "none", label: "None" },
  { value: "fadeIn", label: "Fade In" },
  { value: "slideUp", label: "Slide Up" },
  { value: "slideDown", label: "Slide Down" },
  { value: "slideLeft", label: "Slide from Left" },
  { value: "slideRight", label: "Slide from Right" },
  { value: "scaleUp", label: "Scale Up" },
  { value: "blurIn", label: "Blur In" },
];

const EASING_OPTIONS = [
  { value: "easeOut", label: "Ease Out" },
  { value: "easeIn", label: "Ease In" },
  { value: "easeInOut", label: "Ease In-Out" },
  { value: "linear", label: "Linear" },
  { value: "spring", label: "Spring" },
];

export default function SkillsAnimationsTab({ data, onUpdate }: SkillsAnimationsTabProps) {
  const anim = data.animations ?? ({} as Partial<BioAnimations>);
  const preset = anim.preset ?? "fadeIn";
  const duration = anim.duration ?? 0.5;
  const delay = anim.delay ?? 0.1;
  const easing = anim.easing ?? "easeOut";
  const staggerChildren = anim.staggerChildren ?? true;
  const staggerDelay = anim.staggerDelay ?? 0.08;
  const scrollTrigger = anim.scrollTrigger ?? true;
  const scrollOnce = anim.scrollOnce ?? true;
  const hoverEffect = anim.hoverEffect ?? "scale";
  const hoverScale = anim.hoverScale ?? 1.03;
  const parallax = anim.parallax ?? false;
  const parallaxIntensity = anim.parallaxIntensity ?? 20;
  const textReveal = anim.textReveal ?? false;
  const textRevealDelay = anim.textRevealDelay ?? 0.2;

  const isAnimated = preset !== "none";

  return (
    <div className="flex flex-col gap-6">
      {/* ── Entrance ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Entrance Animation</h3>
        <SelectField
          label="Preset"
          id="animPreset"
          value={preset}
          onChange={(v) => onUpdate({ preset: v as BioAnimations["preset"] })}
          options={PRESET_OPTIONS}
        />

        {isAnimated && (
          <>
            <SelectField
              label="Easing"
              id="animEasing"
              value={easing}
              onChange={(v) => onUpdate({ easing: v as BioAnimations["easing"] })}
              options={EASING_OPTIONS}
            />

            <SliderField
              label="Duration"
              htmlFor="animDuration"
              value={duration}
              min={0.1}
              max={2}
              step={0.05}
              unit="s"
              onChange={(v) => onUpdate({ duration: v })}
            />

            <SliderField
              label="Initial Delay"
              htmlFor="animDelay"
              value={delay}
              min={0}
              max={2}
              step={0.05}
              unit="s"
              onChange={(v) => onUpdate({ delay: v })}
            />
          </>
        )}
      </div>

      {/* ── Stagger ── */}
      {isAnimated && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Stagger</h3>
          <Toggle
            label="Stagger child elements"
            description="Each skill card animates in sequence"
            checked={staggerChildren}
            onChange={(v) => onUpdate({ staggerChildren: v })}
          />

          {staggerChildren && (
            <SliderField
              label="Delay between cards"
              htmlFor="staggerDelay"
              value={staggerDelay}
              min={0.02}
              max={0.5}
              step={0.01}
              unit="s"
              onChange={(v) => onUpdate({ staggerDelay: v })}
            />
          )}
        </div>
      )}

      {/* ── Scroll Trigger ── */}
      {isAnimated && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Scroll Trigger</h3>
          <Toggle
            label="Trigger on scroll"
            description="Animation plays when section enters viewport"
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
        </div>
      )}

      {/* ── Parallax ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Parallax</h3>
        <Toggle
          label="Enable parallax"
          description="Section moves at a different speed while scrolling"
          checked={parallax}
          onChange={(v) => onUpdate({ parallax: v })}
        />
        {parallax && (
          <SliderField
            label="Parallax intensity"
            htmlFor="parallaxIntensity"
            value={parallaxIntensity}
            min={5}
            max={100}
            step={5}
            unit="px"
            onChange={(v) => onUpdate({ parallaxIntensity: v })}
          />
        )}
      </div>

      {/* ── Text Reveal ── */}
      {isAnimated && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Text Reveal</h3>
          <Toggle
            label="Enable text reveal"
            description="Headline and subheadline animate in with a typewriter-like effect"
            checked={textReveal}
            onChange={(v) => onUpdate({ textReveal: v })}
          />
          {textReveal && (
            <SliderField
              label="Reveal delay"
              htmlFor="textRevealDelay"
              value={textRevealDelay}
              min={0}
              max={1}
              step={0.05}
              unit="s"
              onChange={(v) => onUpdate({ textRevealDelay: v })}
            />
          )}
        </div>
      )}

      {/* ── Hover Effect ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Hover Effect</h3>
        <SelectField
          label="Hover behavior"
          id="hoverEffect"
          value={hoverEffect}
          onChange={(v) => onUpdate({ hoverEffect: v as BioAnimations["hoverEffect"] })}
          options={[
            { value: "none", label: "None" },
            { value: "scale", label: "Scale up" },
            { value: "lift", label: "Lift (translate Y)" },
            { value: "glow", label: "Glow shadow" },
          ]}
        />
        {hoverEffect === "scale" && (
          <SliderField
            label="Scale amount"
            htmlFor="hoverScale"
            value={hoverScale}
            min={1.01}
            max={1.1}
            step={0.01}
            onChange={(v) => onUpdate({ hoverScale: v })}
          />
        )}
      </div>
    </div>
  );
}