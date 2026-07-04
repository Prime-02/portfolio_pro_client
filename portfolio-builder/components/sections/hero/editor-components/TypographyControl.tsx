// portfolio-builder/components/sections/hero/editor-components/TypographyControl.tsx

"use client";

import { useCallback } from "react";
import type { HeroTypography } from "@/portfolio-builder/types/hero";
import { PBDropdown, PBRangeInput } from "@/portfolio-builder/components/shared/ui/inputs";

interface TypographyControlProps {
  label: string;
  value: HeroTypography;
  onChange: (value: HeroTypography) => void;
}

const WEIGHT_OPTIONS = [
  { id: 100, code: "Thin" },
  { id: 200, code: "Extra Light" },
  { id: 300, code: "Light" },
  { id: 400, code: "Regular" },
  { id: 500, code: "Medium" },
  { id: 600, code: "Semi Bold" },
  { id: 700, code: "Bold" },
  { id: 800, code: "Extra Bold" },
  { id: 900, code: "Black" },
];

const TRANSFORM_OPTIONS = [
  { id: "none", code: "None" },
  { id: "uppercase", code: "UPPERCASE" },
  { id: "lowercase", code: "lowercase" },
  { id: "capitalize", code: "Capitalize" },
];

export default function TypographyControl({
  label,
  value,
  onChange,
}: TypographyControlProps) {
  const update = useCallback(
    (patch: Partial<HeroTypography>) => {
      onChange({ ...value, ...patch });
    },
    [value, onChange]
  );

  const rowClass = "w-full items-center gap-2";

  return (
    <div
      className="rounded-sm p-3 flex flex-col gap-4 bg-[var(--pb-surface)] border border-[var(--pb-border)]"
    >
      <span
        className="text-[10px] tracking-[0.15em] font-mono uppercase"
        style={{ color: "var(--pb-text-muted)" }}
      >
        {label}
      </span>

      {/* Size */}
      <div className={rowClass}>
        <PBRangeInput
          label="Size"
          min={8}
          max={200}
          value={value.size ?? 16}
          onChange={(val) => update({ size: val })}
        />
      </div>

      {/* Weight */}
      <div className={rowClass}>
        <PBDropdown
          options={WEIGHT_OPTIONS}
          label="Weight"
          value={value.weight ?? 400}
          onSelect={(val) => update({ weight: Number(val) })}
          placeholder="400"
          size="sm"
          includeNoneOption={false}
          clearable={false}
        />
      </div>

      {/* Line Height */}
      <div className={rowClass}>
        <PBRangeInput
          label="Line Height (em)"
          min={0.5}
          max={3}
          step={0.05}
          value={value.lineHeight ?? 1.5}
          onChange={(val) => update({ lineHeight: val })}
        />
      </div>

      {/* Letter Spacing */}
      <div className={rowClass}>
        <PBRangeInput
          label="Letter Spacing (px)"
          min={-5}
          max={20}
          step={0.1}
          value={value.letterSpacing ?? 0}
          onChange={(val) => update({ letterSpacing: val })}
        />
      </div>

      {/* Transform */}
      <div className={rowClass}>
        <PBDropdown
          options={TRANSFORM_OPTIONS}
          label="Transform"
          value={value.transform ?? "none"}
          onSelect={(val) => update({ transform: val as any })}
          placeholder="None"
          size="sm"
          includeNoneOption={false}
          clearable={false}
        />
      </div>
    </div>
  );
}