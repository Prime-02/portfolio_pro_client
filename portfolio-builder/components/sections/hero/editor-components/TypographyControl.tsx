// portfolio-builder/components/sections/hero/editor-components/TypographyControl.tsx

"use client";

import { useCallback } from "react";
import type { HeroTypography } from "@/portfolio-builder/types/hero";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { Textinput } from "@/src/app/components/inputs/Textinput";

interface TypographyControlProps {
  label: string;
  value: HeroTypography;
  onChange: (value: HeroTypography) => void;
}

const WEIGHT_OPTIONS = [
  { id: 100, code: "100 — Thin" },
  { id: 200, code: "200 — Extra Light" },
  { id: 300, code: "300 — Light" },
  { id: 400, code: "400 — Regular" },
  { id: 500, code: "500 — Medium" },
  { id: 600, code: "600 — Semi Bold" },
  { id: 700, code: "700 — Bold" },
  { id: 800, code: "800 — Extra Bold" },
  { id: 900, code: "900 — Black" },
];

const TRANSFORM_OPTIONS = [
  { id: "none", code: "None" },
  { id: "uppercase", code: "UPPERCASE" },
  { id: "lowercase", code: "lowercase" },
  { id: "capitalize", code: "Capitalize" },
];

export function TypographyControl({
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
        <Textinput
          type="number"
          label="Size"
          min={8}
          max={200}
          value={value.size ?? 16}
          onChange={(e) => update({ size: Number(e) })}
        />
      </div>

      {/* Weight */}
      <div className={rowClass}>
        <Dropdown
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
        <Textinput
          type="number"
          label="Line Height (em)"
          min={0.5}
          max={3}
          step={0.05}
          value={value.lineHeight ?? 1.5}
          onChange={(e) => update({ lineHeight: Number(e) })}
        />
      </div>

      {/* Letter Spacing */}
      <div className={rowClass}>
        <Textinput
          label=" Letter Spacing (px)"
          type="number"
          min={-5}
          max={20}
          step={0.1}
          value={value.letterSpacing ?? 0}
          onChange={(e) => update({ letterSpacing: Number(e) })}
        />
      </div>

      {/* Transform */}
      <div className={rowClass}>
        <Dropdown
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