// portfolio-builder/components/sections/bio/editor-components/AnimationsTab.tsx

import { BioData, BioAnimations } from "@/portfolio-builder/types/bio";
import SelectField from "./SelectField";
import SliderField from "./SliderField";
import Toggle from "./Toggle";
import { sectionClass, sectionTitleClass } from "./styles";

interface AnimationsTabProps {
  data: BioData;
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

export default function AnimationsTab({ data, onUpdate }: AnimationsTabProps) {
  const anim = data.animations ?? ({} as Partial<BioAnimations>);
  const preset = anim.preset ?? "fadeIn";
  const duration = anim.duration ?? 0.6;
  const delay = anim.delay ?? 0.1;
  const easing = anim.easing ?? "easeOut";
  const staggerChildren = anim.staggerChildren ?? true;
  const staggerDelay = anim.staggerDelay ?? 0.12;
  const scrollTrigger = anim.scrollTrigger ?? true;
  const scrollOnce = anim.scrollOnce ?? true;

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
            description="Each element animates in sequence"
            checked={staggerChildren}
            onChange={(v) => onUpdate({ staggerChildren: v })}
          />

          {staggerChildren && (
            <SliderField
              label="Delay between elements"
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
    </div>
  );
}