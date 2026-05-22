// portfolio-builder/components/sections/hero/editor-components/CTATab.tsx

import { useState } from "react";
import { HeroData, HeroCTA, CTAVariant, CTAColorOverride } from "@/portfolio-builder/types/hero";
import Field from './Field';
import ColorPicker from './ColorPicker';
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { Textinput } from "@/src/app/components/inputs/Textinput";

interface CTATabProps {
    data: HeroData;
    onAdd: () => void;
    onUpdate: (index: number, value: Partial<HeroCTA>) => void;
    onRemove: (index: number) => void;
    onReorder: (from: number, to: number) => void;
}

const MAX_BUTTONS = 3;

const CTA_VARIANT_OPTIONS: { id: CTAVariant; code: string }[] = [
    { id: "primary", code: "Primary — Solid filled, highest emphasis" },
    { id: "secondary", code: "Secondary — Muted fill, supporting action" },
    { id: "outline", code: "Outline — Bordered, transparent fill" },
    { id: "ghost", code: "Ghost — No border or fill until hovered" },
    { id: "link", code: "Link — Underlined text, no button chrome" },
];

// ── URL validation ───────────────────────────────────────────────────────────

function validateUrl(url: string): string | null {
    if (!url.trim()) return null; // empty is caught by the required check elsewhere
    const valid =
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/") ||
        url.startsWith("#") ||
        url.startsWith("mailto:") ||
        url.startsWith("tel:");
    return valid ? null : 'URL must start with "https://", "/", "#", "mailto:", or "tel:"';
}

// ── Sub-components ───────────────────────────────────────────────────────────

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

function ColorOverrideSection({
    override,
    onChange,
}: {
    override?: CTAColorOverride;
    onChange: (v: CTAColorOverride) => void;
}) {
    const [open, setOpen] = useState(
        !!(override?.bg || override?.text || override?.border)
    );

    const update = (key: keyof CTAColorOverride, value: string) => {
        onChange({ ...override, [key]: value || undefined });
    };

    const clear = (key: keyof CTAColorOverride) => {
        const next = { ...override };
        delete next[key];
        onChange(next);
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
            >
                <span
                    className={`inline-block transition-transform duration-150 ${open ? "rotate-90" : ""}`}
                >
                    ▶
                </span>
                Theme Color Overrides
                {(override?.bg || override?.text || override?.border) && (
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">
                        active
                    </span>
                )}
            </button>

            {open && (
                <div className="pl-3 border-l border-neutral-700 space-y-3">
                    <p className="text-xs text-neutral-500 leading-relaxed">
                        Overrides the variant's default colors. Leave blank to use the variant default.
                    </p>

                    {/* Background */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <Field label="Background" htmlFor="ctaBg">
                                <ColorPicker
                                    id="ctaBg"
                                    value={override?.bg || ""}
                                    onChange={(v) => update("bg", v)}
                                    placeholder="Variant default"
                                />
                            </Field>
                        </div>
                        {override?.bg && (
                            <button
                                type="button"
                                onClick={() => clear("bg")}
                                className="mt-5 text-xs text-neutral-500 hover:text-red-400 transition-colors"
                                title="Clear override"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Text */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <Field label="Text" htmlFor="ctaText">
                                <ColorPicker
                                    id="ctaText"
                                    value={override?.text || ""}
                                    onChange={(v) => update("text", v)}
                                    placeholder="Variant default"
                                />
                            </Field>
                        </div>
                        {override?.text && (
                            <button
                                type="button"
                                onClick={() => clear("text")}
                                className="mt-5 text-xs text-neutral-500 hover:text-red-400 transition-colors"
                                title="Clear override"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Border */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <Field label="Border" htmlFor="ctaBorder">
                                <ColorPicker
                                    id="ctaBorder"
                                    value={override?.border || ""}
                                    onChange={(v) => update("border", v)}
                                    placeholder="Variant default"
                                />
                            </Field>
                        </div>
                        {override?.border && (
                            <button
                                type="button"
                                onClick={() => clear("border")}
                                className="mt-5 text-xs text-neutral-500 hover:text-red-400 transition-colors"
                                title="Clear override"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CTATab({ data, onAdd, onUpdate, onRemove, onReorder }: CTATabProps) {
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
    const buttons = data.ctaButtons || [];
    const atLimit = buttons.length >= MAX_BUTTONS;

    const toggleCollapsed = (index: number) =>
        setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));

    return (
        <div className="flex flex-col gap-4">
            {/* ── Header ───────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-medium text-neutral-300">
                        Call-to-Action Buttons
                    </h3>
                    <p className="text-xs text-neutral-500">
                        {buttons.length} / {MAX_BUTTONS} buttons
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onAdd}
                    disabled={atLimit}
                    className={[
                        "text-sm transition-colors px-3 py-1 rounded-md",
                        atLimit
                            ? "text-neutral-600 cursor-not-allowed"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-800",
                    ].join(" ")}
                    title={atLimit ? `Maximum of ${MAX_BUTTONS} buttons allowed` : undefined}
                >
                    + Add Button
                </button>
            </div>

            {/* ── Empty state ───────────────────────────────────────── */}
            {buttons.length === 0 && (
                <div className="rounded-lg border border-dashed border-neutral-700 px-4 py-6 text-center">
                    <p className="text-sm text-neutral-500">No buttons yet.</p>
                    <p className="text-xs text-neutral-600 mt-1">
                        Add up to {MAX_BUTTONS} call-to-action buttons to guide visitors.
                    </p>
                </div>
            )}

            {/* ── Button cards ──────────────────────────────────────── */}
            {buttons.map((btn, index) => {
                const isCollapsed = collapsed[index];
                const urlError = validateUrl(btn.url);
                const cardLabel = btn.label.trim() || `Button ${index + 1}`;

                return (
                    <div key={index} className="border border-neutral-800 rounded-lg overflow-hidden">
                        {/* Card header */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800/40">
                            {/* Reorder arrows */}
                            <div className="flex flex-col gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => onReorder(index, index - 1)}
                                    disabled={index === 0}
                                    className="text-neutral-600 hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed leading-none text-[10px]"
                                    title="Move up"
                                >
                                    ▲
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onReorder(index, index + 1)}
                                    disabled={index === buttons.length - 1}
                                    className="text-neutral-600 hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed leading-none text-[10px]"
                                    title="Move down"
                                >
                                    ▼
                                </button>
                            </div>

                            {/* Label + variant badge */}
                            <button
                                type="button"
                                onClick={() => toggleCollapsed(index)}
                                className="flex-1 flex items-center gap-2 text-left min-w-0"
                            >
                                <span className="text-sm text-neutral-200 truncate font-medium">
                                    {cardLabel}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-400 shrink-0 capitalize">
                                    {btn.variant}
                                </span>
                                {urlError && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 shrink-0">
                                        invalid url
                                    </span>
                                )}
                                <span className="ml-auto text-neutral-600 text-xs">
                                    {isCollapsed ? "▼" : "▲"}
                                </span>
                            </button>

                            {/* Remove */}
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="text-xs text-neutral-600 hover:text-red-400 transition-colors shrink-0 px-1"
                                title="Remove button"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Card body */}
                        {!isCollapsed && (
                            <div className="p-4 space-y-4">
                                <div className="w-full">
                                    <Textinput
                                        label="Label"
                                        value={btn.label}
                                        onChange={(e) => onUpdate(index, { label: e })}
                                        placeholder='e.g. "View My Work"'
                                    />
                                </div>

                                <div className="w-full">
                                    <Textinput
                                        label="URL"
                                        value={btn.url}
                                        onChange={(e) => onUpdate(index, { url: e })}
                                        placeholder='e.g. "#projects" or "https://..."'
                                        error={urlError || undefined}
                                    />
                                </div>

                                <div className="w-full">
                                    <Dropdown
                                        options={CTA_VARIANT_OPTIONS}
                                        label="Variant"
                                        value={btn.variant}
                                        onSelect={(val) => onUpdate(index, { variant: val as CTAVariant })}
                                        placeholder="Select variant"
                                        size="sm"
                                        includeNoneOption={false}
                                        clearable={false}
                                    />
                                </div>

                                <Toggle
                                    label="Open in new tab"
                                    checked={btn.openInNewTab || false}
                                    onChange={(v) => onUpdate(index, { openInNewTab: v })}
                                />

                                <ColorOverrideSection
                                    override={btn.colorOverride}
                                    onChange={(v) => onUpdate(index, { colorOverride: v })}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}