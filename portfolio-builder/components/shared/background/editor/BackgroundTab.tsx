// portfolio-builder/components/shared/editor/BackgroundTab.tsx

import { useState } from "react";
import type { SectionBackground, SectionBackgroundType, GradientType } from "@/portfolio-builder/types/sectionBackground";
import { getBackgroundStyle } from "@/portfolio-builder/lib/sectionBackground";
import { PBDropdown } from "../../ui/inputs";
import ColorPicker from "@/src/app/components/inputs/ColorPicker";


// --- Reusable sub-components (can be extracted further) ---

interface BackgroundTabProps<T extends { background?: SectionBackground }> {
    data: T;
    onUpdate: (value: Partial<SectionBackground>) => void;
    /** Limit which background types are available (e.g., bio only needs none/solid/gradient) */
    allowedTypes?: SectionBackgroundType[];
}

const ALL_BACKGROUND_TYPES: { value: SectionBackgroundType; label: string }[] = [
    { value: "none", label: "None (transparent)" },
    { value: "solid", label: "Solid Color" },
    { value: "gradient", label: "Gradient" },
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
    { value: "mesh", label: "Mesh Gradient" },
    { value: "particles", label: "Particles" },
];

export default function BackgroundTab<T extends { background?: SectionBackground }>({
    data,
    onUpdate,
    allowedTypes,
}: BackgroundTabProps<T>) {
    const bg = data.background ?? { type: "none" as SectionBackgroundType };
    const type = bg.type || "none";

    const availableTypes = allowedTypes
        ? ALL_BACKGROUND_TYPES.filter((t) => allowedTypes.includes(t.value))
        : ALL_BACKGROUND_TYPES;

    const handleTypeChange = (selectedValue: string | string[]) => {
        const newType = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;
        if (newType) {
            onUpdate({ type: newType as SectionBackgroundType });
        }
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Type selector - using PBDropdown */}
            <div>
                <PBDropdown
                    options={availableTypes.map(type => ({
                        id: type.value,
                        code: type.label
                    }))}
                    onSelect={handleTypeChange}
                    value={type}
                    placeholder="Background Type"
                    valueKey="id"
                    displayKey="code"
                    size="md"
                    variant="outlined"
                    className="w-full"
                />
            </div>

            {/* ── SOLID ── */}
            {type === "solid" && <SolidFields bg={bg} onUpdate={onUpdate} />}

            {/* ── GRADIENT ── */}
            {type === "gradient" && <GradientFields bg={bg} onUpdate={onUpdate} />}

            {/* ── IMAGE ── */}
            {type === "image" && <ImageFields bg={bg} onUpdate={onUpdate} />}

            {/* ── VIDEO ── */}
            {type === "video" && <VideoFields bg={bg} onUpdate={onUpdate} />}

            {/* ── MESH ── */}
            {type === "mesh" && <MeshFields bg={bg} onUpdate={onUpdate} />}

            {/* ── PARTICLES ── */}
            {type === "particles" && <ParticlesFields bg={bg} onUpdate={onUpdate} />}

            {/* ── OVERLAY (shared for image/video/mesh/particles) ── */}
            {["image", "video", "mesh", "particles"].includes(type) && (
                <OverlayFields bg={bg} onUpdate={onUpdate} />
            )}
        </div>
    );
}

// --- Sub-components for each background type ---

function SolidFields({ bg, onUpdate }: { bg: SectionBackground; onUpdate: (v: Partial<SectionBackground>) => void }) {
    return (
        <ColorField
            label="Background Color"
            value={bg.color || "#0a0a0a"}
            onChange={(v) => onUpdate({ color: v })}
        />
    );
}

function GradientFields({ bg, onUpdate }: { bg: SectionBackground; onUpdate: (v: Partial<SectionBackground>) => void }) {
    const [gradientType, setGradientType] = useState<GradientType>(bg.gradientType || "linear");

    return (
        <div className="space-y-4">
            {/* Live preview */}
            <div
                className="w-full h-10 rounded-lg border border-[var(--pb-border)]"
                style={getBackgroundStyle(bg)}
            />

            {/* Gradient type */}
            <div className="flex gap-2">
                {(["linear", "radial"] as GradientType[]).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => {
                            setGradientType(t);
                            onUpdate({ gradientType: t });
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-md text-xs border capitalize ${gradientType === t
                            ? "border-[var(--pb-foreground)] bg-[var(--pb-foreground-10)]"
                            : "border-[var(--pb-border)] text-[var(--pb-text-muted)]"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <ColorField label="From" value={bg.gradientFrom || "#1a1a2e"} onChange={(v) => onUpdate({ gradientFrom: v })} />
            <ColorField label="To" value={bg.gradientTo || "#0a0a0a"} onChange={(v) => onUpdate({ gradientTo: v })} />

            {gradientType === "linear" && (
                <SliderField
                    label="Angle"
                    value={resolveAngle(bg.gradientAngle)}
                    min={0}
                    max={360}
                    step={1}
                    unit="°"
                    onChange={(v) => onUpdate({ gradientAngle: v })}
                />
            )}

            {gradientType === "radial" && (
                <div>
                    <label className="block text-xs text-[var(--pb-text-muted)] mb-1">Position</label>
                    <input
                        type="text"
                        value={bg.radialPosition || "center"}
                        onChange={(e) => onUpdate({ radialPosition: e.target.value })}
                        className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm"
                        placeholder="center, top left, 50% 50%, etc."
                    />
                </div>
            )}
        </div>
    );
}

function ImageFields({ bg, onUpdate }: { bg: SectionBackground; onUpdate: (v: Partial<SectionBackground>) => void }) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-[var(--pb-text-secondary)] mb-1.5">Image URL</label>
                <input
                    type="text"
                    value={bg.imageUrl || ""}
                    onChange={(e) => onUpdate({ imageUrl: e.target.value })}
                    className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm"
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-[var(--pb-text-muted)] mb-1">Size</label>
                    <PBDropdown
                        options={[
                            { id: "cover", code: "Cover" },
                            { id: "contain", code: "Contain" },
                            { id: "auto", code: "Auto" }
                        ]}
                        onSelect={(v) => onUpdate({ backgroundSize: v as string })}
                        value={bg.backgroundSize || "cover"}
                        size="sm"
                        variant="outlined"
                    />
                </div>
                <div>
                    <label className="block text-xs text-[var(--pb-text-muted)] mb-1">Position</label>
                    <input
                        type="text"
                        value={bg.backgroundPosition || "center"}
                        onChange={(e) => onUpdate({ backgroundPosition: e.target.value })}
                        className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm"
                        placeholder="center"
                    />
                </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={bg.backgroundRepeat || false}
                    onChange={(e) => onUpdate({ backgroundRepeat: e.target.checked })}
                    className="rounded"
                />
                <span className="text-sm text-[var(--pb-text-secondary)]">Repeat background</span>
            </label>
        </div>
    );
}

function VideoFields({ bg, onUpdate }: { bg: SectionBackground; onUpdate: (v: Partial<SectionBackground>) => void }) {
    return (
        <div>
            <label className="block text-sm font-medium text-[var(--pb-text-secondary)] mb-1.5">Video URL</label>
            <input
                type="text"
                value={bg.videoUrl || ""}
                onChange={(e) => onUpdate({ videoUrl: e.target.value })}
                className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm"
                placeholder="https://example.com/video.mp4"
            />
        </div>
    );
}

function MeshFields({ bg, onUpdate }: { bg: SectionBackground; onUpdate: (v: Partial<SectionBackground>) => void }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <ColorField label="Color 1" value={bg.meshColor1 || "#7c3aed"} onChange={(v) => onUpdate({ meshColor1: v })} />
                <ColorField label="Color 2" value={bg.meshColor2 || "#2563eb"} onChange={(v) => onUpdate({ meshColor2: v })} />
                <ColorField label="Color 3" value={bg.meshColor3 || "#0891b2"} onChange={(v) => onUpdate({ meshColor3: v })} />
                <ColorField label="Color 4" value={bg.meshColor4 || "var(--pb-background)"} onChange={(v) => onUpdate({ meshColor4: v })} />
            </div>
            <ColorField label="Base Color" value={bg.meshBase || "#050510"} onChange={(v) => onUpdate({ meshBase: v })} />

            <SliderField label="Speed" value={bg.meshSpeed ?? 6} min={1} max={20} step={0.5} onChange={(v) => onUpdate({ meshSpeed: v })} />
            <SliderField label="Blur" value={bg.meshBlur ?? 80} min={10} max={200} step={5} unit="px" onChange={(v) => onUpdate({ meshBlur: v })} />
            <SliderField label="Size" value={bg.meshSize ?? 60} min={10} max={150} step={5} unit="vmin" onChange={(v) => onUpdate({ meshSize: v })} />
            <SliderField label="Opacity" value={bg.meshOpacity ?? 1} min={0} max={1} step={0.05} onChange={(v) => onUpdate({ meshOpacity: v })} />
        </div>
    );
}

function ParticlesFields({ bg, onUpdate }: { bg: SectionBackground; onUpdate: (v: Partial<SectionBackground>) => void }) {
    return (
        <div className="space-y-4">
            <ColorField label="Particle Color" value={bg.particleColor || "var(--pb-foreground)"} onChange={(v) => onUpdate({ particleColor: v })} />
            <ColorField label="Background Color" value={bg.particleBg || "var(--pb-background)"} onChange={(v) => onUpdate({ particleBg: v })} />

            <SliderField label="Count" value={bg.particleCount ?? 80} min={10} max={300} step={10} onChange={(v) => onUpdate({ particleCount: v })} />
            <SliderField label="Size" value={bg.particleSize ?? 2} min={0.5} max={10} step={0.5} unit="px" onChange={(v) => onUpdate({ particleSize: v })} />
            <SliderField label="Speed" value={bg.particleSpeed ?? 0.5} min={0.1} max={5} step={0.1} onChange={(v) => onUpdate({ particleSpeed: v })} />
            <SliderField label="Opacity" value={bg.particleOpacity ?? 0.6} min={0.05} max={1} step={0.05} onChange={(v) => onUpdate({ particleOpacity: v })} />
            <SliderField label="Connection Distance" value={bg.particleLineDist ?? 120} min={50} max={300} step={10} unit="px" onChange={(v) => onUpdate({ particleLineDist: v })} />

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={bg.particleLines ?? true}
                    onChange={(e) => onUpdate({ particleLines: e.target.checked })}
                    className="rounded"
                />
                <span className="text-sm text-[var(--pb-text-secondary)]">Show connection lines</span>
            </label>
        </div>
    );
}

function OverlayFields({ bg, onUpdate }: { bg: SectionBackground; onUpdate: (v: Partial<SectionBackground>) => void }) {
    return (
        <div className="space-y-4 border-t border-[var(--pb-border)] pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--pb-text-muted)]">Overlay</h4>
            <ColorField
                label="Overlay Color"
                value={bg.overlayColor || "var(--pb-background)"}
                onChange={(v) => onUpdate({ overlayColor: v })}
            />
            <SliderField
                label="Overlay Opacity"
                value={bg.overlayOpacity ?? 0}
                min={0}
                max={100}
                step={5}
                unit="%"
                onChange={(v) => onUpdate({ overlayOpacity: v })}
            />
        </div>
    );
}

// --- Reusable field components ---

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label className="block text-xs text-[var(--pb-text-muted)] mb-1">{label}</label>
            <div className="flex gap-2">
                <ColorPicker
                    value={value}
                    onChange={(e) => onChange(e)}
                />
            </div>
        </div>
    );
}

function SliderField({
    label,
    value,
    min,
    max,
    step,
    unit = "",
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (v: number) => void;
}) {
    return (
        <div>
            <div className="flex justify-between mb-1">
                <label className="text-xs text-[var(--pb-text-muted)]">{label}</label>
                <span className="text-xs text-[var(--pb-text-muted)] tabular-nums">
                    {value}
                    {unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 appearance-none bg-[var(--pb-foreground-20)] rounded-full accent-[var(--pb-foreground)] cursor-pointer"
            />
        </div>
    );
}

function resolveAngle(raw: number | string | undefined): number {
    if (raw === undefined || raw === null) return 135;
    const n = typeof raw === "string" ? parseFloat(raw) : raw;
    return isNaN(n) ? 135 : n;
}