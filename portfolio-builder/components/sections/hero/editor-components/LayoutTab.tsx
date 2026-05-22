// portfolio-builder/components/sections/hero/editor-components/LayoutTab.tsx

import {
    HeroData,
    HeroLayout,
    HeroAlignment,
    HeroHeight,
    HeroMediaPosition,
    HeroVerticalAlignment,
} from "@/portfolio-builder/types/hero";
import SelectField from "./SelectField";
import Switch from "@/src/app/components/inputs/Switch";
import { Textinput } from "@/src/app/components/inputs/Textinput";

interface LayoutTabProps {
    data: HeroData;
    onChange: <K extends keyof HeroData>(key: K, value: HeroData[K]) => void;
}

// ---------------------------------------------------------------------------
// Option definitions
// ---------------------------------------------------------------------------

const LAYOUT_OPTIONS: {
    value: HeroLayout;
    label: string;
    description: string;
    preview: React.ReactNode;
}[] = [
        {
            value: "centered",
            label: "Centered",
            description: "Everything stacked, middle-aligned",
            preview: (
                <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect x="14" y="4" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
                    <rect x="10" y="10" width="28" height="5" rx="1.5" fill="currentColor" opacity="0.6" />
                    <rect x="16" y="18" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
                    <rect x="18" y="25" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.25" />
                </svg>
            ),
        },
        {
            value: "split",
            label: "Split",
            description: "Text on one side, media on the other",
            preview: (
                <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect x="4" y="6" width="18" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
                    <rect x="4" y="12" width="18" height="2" rx="1" fill="currentColor" opacity="0.5" />
                    <rect x="4" y="17" width="14" height="2" rx="1" fill="currentColor" opacity="0.4" />
                    <rect x="4" y="23" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.25" />
                    <rect x="28" y="4" width="16" height="24" rx="3" fill="currentColor" opacity="0.15" />
                    <circle cx="36" cy="16" r="6" fill="currentColor" opacity="0.3" />
                </svg>
            ),
        },
        {
            value: "minimal",
            label: "Minimal",
            description: "Just name and title, no extras",
            preview: (
                <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect x="4" y="11" width="24" height="4" rx="2" fill="currentColor" opacity="0.9" />
                    <rect x="4" y="19" width="16" height="2.5" rx="1.25" fill="currentColor" opacity="0.45" />
                </svg>
            ),
        },
    ];

const ALIGNMENT_OPTIONS: { value: HeroAlignment; label: string }[] = [
    { value: "center", label: "Center" },
    { value: "left", label: "Left" },
];

const HEIGHT_OPTIONS: {
    value: HeroHeight;
    label: string;
    hint: string;
}[] = [
        {
            value: "screen",
            label: "Full Screen",
            hint: "Exactly 100vh — always fills the viewport",
        },
        {
            value: "min-screen",
            label: "Min Full Screen",
            hint: "At least 100vh, expands if content overflows",
        },
        {
            value: "auto",
            label: "Auto",
            hint: "Shrinks to fit content — no forced height",
        },
    ];

const VERTICAL_ALIGNMENT_OPTIONS: {
    value: HeroVerticalAlignment;
    label: string;
}[] = [
        { value: "top", label: "Top" },
        { value: "center", label: "Center" },
        { value: "bottom", label: "Bottom" },
    ];

const MEDIA_POSITION_OPTIONS: {
    value: HeroMediaPosition;
    label: string;
}[] = [
        { value: "right", label: "Right (media on right)" },
        { value: "left", label: "Left (media on left)" },
    ];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Inline toggle switch */
function Toggle({
    label,
    hint,
    checked,
    onChange,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-3 py-2">
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{label}</span>
                {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
            </div>
            <Switch
                isSwitched={checked}
                onSwitch={onChange}
            />
        </div>
    );
}

/** Number input with label and unit label */
function NumberField({
    label,
    hint,
    value,
    unit,
    min,
    max,
    step,
    onChange,
}: {
    label: string;
    hint?: string;
    value: number;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <Textinput
                type="number"
                value={`${value} ${unit ?? ""}`}
                min={min}
                desc={hint}
                label={label}
                max={max}
                step={step ?? 1}
                onChange={(e) => onChange(Number(e))}
            />
        </div>
    );
}

/** Section divider with label */
function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
            </span>
            <div className="flex-1 h-px bg-border" />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LayoutTab({ data, onChange }: LayoutTabProps) {
    const isSplit = data.layout === "split";
    const heightHint = HEIGHT_OPTIONS.find((o) => o.value === (data.height ?? "screen"))?.hint;

    // Helpers for nested updates
    function handleEffectChange(key: "scrollIndicator", value: boolean) {
        onChange("effects", { ...data.effects, [key]: value });
    }

    function handlePaddingChange(side: "top" | "bottom", value: number) {
        onChange("padding", { ...data.padding, [side]: value });
    }

    return (
        <div className="flex flex-col gap-4 ">
            {/* ── Layout picker ─────────────────────────────────────── */}
            <SectionDivider label="Layout" />

            <div className="grid grid-cols-3 gap-2">
                {LAYOUT_OPTIONS.map(({ value, label, description, preview }) => {
                    const active = data.layout === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onChange("layout", value)}
                            className={[
                                "flex flex-col items-center gap-2 rounded-xl border-2 p-3",
                                "transition-all duration-150 focus-visible:outline-none",
                                "focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/60",
                                active
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-background text-foreground/50 hover:bg-muted/40",
                            ].join(" ")}
                        >
                            {/* Mini preview */}
                            <div className="h-10 w-full">{preview}</div>

                            <div className="flex flex-col items-center gap-0.5 text-center">
                                <span
                                    className={[
                                        "text-xs font-semibold",
                                        active ? "text-primary" : "text-foreground",
                                    ].join(" ")}
                                >
                                    {label}
                                </span>
                                <span className="text-[10px] leading-tight text-muted-foreground">
                                    {description}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ── Alignment ─────────────────────────────────────────── */}
            <SectionDivider label="Alignment" />

            {isSplit ? (
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                    Horizontal alignment is fixed in <span className="font-semibold text-foreground">Split</span> layout — text fills its column automatically.
                </div>
            ) : (
                <SelectField
                    label="Horizontal"
                    id="alignment"
                    value={data.alignment ?? "center"}
                    onChange={(value) => onChange("alignment", value as HeroAlignment)}
                    options={ALIGNMENT_OPTIONS}
                />
            )}

            <SelectField
                label="Vertical"
                id="verticalAlignment"
                value={data.verticalAlignment ?? "center"}
                onChange={(value) =>
                    onChange("verticalAlignment", value as HeroVerticalAlignment)
                }
                options={VERTICAL_ALIGNMENT_OPTIONS}
            />

            {/* ── Height ────────────────────────────────────────────── */}
            <SectionDivider label="Height" />

            <SelectField
                label="Height"
                id="height"
                value={data.height ?? "screen"}
                onChange={(value) => onChange("height", value as HeroHeight)}
                options={HEIGHT_OPTIONS.map(({ value, label }) => ({ value, label }))}
            />

            {/* Hint text for the selected height option */}
            {heightHint && (
                <p className="text-xs text-muted-foreground -mt-2 pl-0.5">{heightHint}</p>
            )}

            {/* ── Padding ───────────────────────────────────────────── */}
            <SectionDivider label="Padding" />

            <div className="grid grid-cols-2 gap-3">
                <NumberField
                    label="Top"
                    value={data.padding?.top ?? 0}
                    unit="px"
                    min={0}
                    max={400}
                    step={4}
                    onChange={(v) => handlePaddingChange("top", v)}
                />
                <NumberField
                    label="Bottom"
                    value={data.padding?.bottom ?? 0}
                    unit="px"
                    min={0}
                    max={400}
                    step={4}
                    onChange={(v) => handlePaddingChange("bottom", v)}
                />
            </div>

            {/* ── Split-specific options ────────────────────────────── */}
            {isSplit && (
                <>
                    <SectionDivider label="Split Options" />
                    <SelectField
                        label="Media Position"
                        id="mediaPosition"
                        value={data.mediaPosition ?? "right"}
                        onChange={(value) =>
                            onChange("mediaPosition", value as HeroMediaPosition)
                        }
                        options={MEDIA_POSITION_OPTIONS}
                    />
                </>
            )}

            {/* ── Extras ────────────────────────────────────────────── */}
            <SectionDivider label="Extras" />

            <Toggle
                label="Scroll Indicator"
                hint="Shows a subtle down-arrow at the bottom of the section"
                checked={data.effects?.scrollIndicator ?? true}
                onChange={(v) => handleEffectChange("scrollIndicator", v)}
            />
        </div>
    );
}