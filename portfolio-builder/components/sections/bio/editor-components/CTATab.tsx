// portfolio-builder/components/sections/bio/editor-components/CTATab.tsx

import { useState } from "react";
import { BioData } from "@/portfolio-builder/types/bio";
import Field from "./Field";
import { inputClass } from "./styles";

interface CTATabProps {
  data: BioData;
  onChange: <K extends keyof BioData>(key: K, value: BioData[K]) => void;
}

const VARIANT_OPTIONS: { value: string; label: string }[] = [
  { value: "primary", label: "Primary — Solid filled" },
  { value: "secondary", label: "Secondary — Muted fill" },
  { value: "outline", label: "Outline — Bordered" },
];

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-9 h-5 rounded-full transition-colors ${checked ? "bg-white" : "bg-neutral-700"}`} />
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </div>
      <span className="text-sm text-neutral-300">{label}</span>
    </label>
  );
}

export default function CTATab({ data, onChange }: CTATabProps) {
  const cta = data.cta;
  const hasCTA = !!cta;

  const updateCTA = (updates: Partial<NonNullable<BioData["cta"]>>) => {
    onChange("cta", { ...cta, ...updates } as NonNullable<BioData["cta"]>);
  };

  const addCTA = () => {
    onChange("cta", {
      label: "Get in Touch",
      url: "#contact",
      variant: "primary",
      openInNewTab: false,
    });
  };

  const removeCTA = () => {
    onChange("cta", undefined);
  };

  return (
    <div className="flex flex-col gap-5">
      {!hasCTA ? (
        <div className="rounded-lg border border-dashed border-neutral-700 px-4 py-6 text-center">
          <p className="text-sm text-neutral-500 mb-3">No CTA button configured.</p>
          <button
            type="button"
            onClick={addCTA}
            className="text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded-lg transition-colors"
          >
            + Add CTA Button
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              CTA Button
            </h3>
            <button
              type="button"
              onClick={removeCTA}
              className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>

          <Field label="Label" htmlFor="ctaLabel">
            <input
              id="ctaLabel"
              type="text"
              value={cta?.label || ""}
              onChange={(e) => updateCTA({ label: e.target.value })}
              placeholder="Get in Touch"
              className={inputClass}
            />
          </Field>

          <Field label="URL" htmlFor="ctaUrl">
            <input
              id="ctaUrl"
              type="text"
              value={cta?.url || ""}
              onChange={(e) => updateCTA({ url: e.target.value })}
              placeholder="#contact or https://..."
              className={inputClass}
            />
          </Field>

          <Field label="Variant" htmlFor="ctaVariant">
            <select
              id="ctaVariant"
              value={cta?.variant || "primary"}
              onChange={(e) => updateCTA({ variant: e.target.value as "primary" | "secondary" | "outline" })}
              className={inputClass}
            >
              {VARIANT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <Toggle
            label="Open in new tab"
            checked={cta?.openInNewTab || false}
            onChange={(v) => updateCTA({ openInNewTab: v })}
          />
        </div>
      )}
    </div>
  );
}
