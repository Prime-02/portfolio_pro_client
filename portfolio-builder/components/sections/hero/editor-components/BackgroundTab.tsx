// portfolio-builder/components/sections/hero/editor-components/BackgroundTab.tsx

import { useState } from "react";
import {
    HeroData,
    HeroBackgroundType,
    HeroGradientType,
    HeroBackgroundSize,
    HeroBackgroundPosition,
} from "@/portfolio-builder/types/hero";
import SelectField from "./SelectField";
import Field from "./Field";
import ColorPicker from "./ColorPicker";
import { ImageField } from "@/src/app/components/cloudinary/ImageField";
import { inputClass } from "./styles";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useParams } from "next/navigation";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { useCloudinaryCore } from "@/lib/stores/cloudinary/useCloudinaryCore";

interface BackgroundTabProps {
    data: HeroData;
    onUpdate: (value: Partial<HeroData["background"]>) => void;
}

const BACKGROUND_TYPE_OPTIONS: { value: HeroBackgroundType; label: string }[] = [
    { value: "solid", label: "Solid Color" },
    { value: "gradient", label: "Gradient" },
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
    { value: "particles", label: "Particles" },
    { value: "mesh", label: "Mesh Gradient" },
];

const BACKGROUND_SIZE_OPTIONS: { value: HeroBackgroundSize; label: string }[] = [
    { value: "cover", label: "Cover (fill, crop if needed)" },
    { value: "contain", label: "Contain (fit, show all)" },
    { value: "auto", label: "Auto (natural size)" },
];

const BACKGROUND_POSITION_OPTIONS: { value: HeroBackgroundPosition; label: string }[] = [
    { value: "center", label: "Center" },
    { value: "top", label: "Top" },
    { value: "bottom", label: "Bottom" },
    { value: "left", label: "Left" },
    { value: "right", label: "Right" },
    { value: "top left", label: "Top Left" },
    { value: "top right", label: "Top Right" },
    { value: "bottom left", label: "Bottom Left" },
    { value: "bottom right", label: "Bottom Right" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getUrlForType(bg: HeroData["background"]): string | null {
    if (!bg) return null;
    switch (bg.type) {
        case "image": return bg.imageUrl || null;
        case "video": return bg.videoUrl || null;
        default: return null;
    }
}

function extractCloudinaryInfo(url: string): { publicId: string; resourceType: "image" | "video" | "raw" } | null {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/");
        const uploadIndex = pathParts.indexOf("upload");
        if (uploadIndex === -1) return null;
        const publicIdWithExt = pathParts.slice(uploadIndex + 2).join("/");
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
        let resourceType: "image" | "video" | "raw" = "image";
        if (pathParts.includes("video")) resourceType = "video";
        else if (publicIdWithExt.endsWith(".json")) resourceType = "raw";
        return { publicId, resourceType };
    } catch {
        return null;
    }
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2">
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
        <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5 flex-shrink-0">
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
                <div className={`w-9 h-5 rounded-full transition-colors ${checked ? "bg-white" : "bg-neutral-700"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <div>
                <p className="text-sm text-neutral-300">{label}</p>
                {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
            </div>
        </label>
    );
}

function SliderField({
    label, htmlFor, value, min, max, step, unit, onChange,
}: {
    label: string; htmlFor: string; value: number;
    min: number; max: number; step: number; unit?: string;
    onChange: (v: number) => void;
}) {
    return (
        <Field label={label} htmlFor={htmlFor}>
            <Textinput
                id={htmlFor}
                type="range"
                min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(Number(e))}
                className="flex-1 h-1.5 appearance-none bg-neutral-700 rounded-full accent-white cursor-pointer"
            />
            <span className="text-sm text-neutral-300 tabular-nums w-16 text-right">
                {value}{unit}
            </span>
        </Field>
    );
}

/** Live gradient preview strip */
function GradientPreview({ from, to, angle, gradientType, radialPosition }: {
    from: string;
    to: string;
    angle: number;
    gradientType: HeroGradientType;
    radialPosition?: string;
}) {
    const bg = gradientType === "radial"
        ? `radial-gradient(circle at ${radialPosition || "center"}, ${from}, ${to})`
        : `linear-gradient(${angle}deg, ${from}, ${to})`;
    return (
        <div
            className="w-full h-10 rounded-lg border border-neutral-700"
            style={{ background: bg }}
        />
    );
}

/** 3×3 background position grid picker */
function PositionPicker({ value, onChange }: {
    value: HeroBackgroundPosition;
    onChange: (v: HeroBackgroundPosition) => void;
}) {
    const positions: HeroBackgroundPosition[] = [
        "top left", "top", "top right",
        "left", "center", "right",
        "bottom left", "bottom", "bottom right",
    ];
    return (
        <div className="grid grid-cols-3 gap-1 w-28">
            {positions.map((pos) => (
                <button
                    key={pos}
                    type="button"
                    onClick={() => onChange(pos)}
                    title={pos}
                    className={[
                        "h-8 rounded transition-colors",
                        value === pos
                            ? "bg-white"
                            : "bg-neutral-700 hover:bg-neutral-600",
                    ].join(" ")}
                />
            ))}
        </div>
    );
}

// ── Overlay section — shared across image, video, mesh, particles ─────────────

function OverlaySection({ bg, onUpdate }: {
    bg: HeroData["background"];
    onUpdate: (v: Partial<HeroData["background"]>) => void;
}) {
    return (
        <Section title="Overlay">
            <SliderField
                label="Opacity"
                htmlFor="overlayOpacity"
                value={bg?.overlayOpacity ?? 0}
                min={0} max={100} step={1} unit="%"
                onChange={(v) => onUpdate({ overlayOpacity: v })}
            />
            {(bg?.overlayOpacity ?? 0) > 0 && (
                <Field label="Overlay Color" htmlFor="overlayColor">
                    <ColorPicker
                        id="overlayColor"
                        value={bg?.overlayColor || "#000000"}
                        onChange={(value) => onUpdate({ overlayColor: value })}
                        placeholder="#000000"
                    />
                </Field>
            )}
        </Section>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BackgroundTab({ data, onUpdate }: BackgroundTabProps) {
    const bg = data.background;
    const type = bg?.type || "solid";
    const currentUrl = getUrlForType(bg);
    const { userInfo } = useUserSettings();
    const params = useParams();
    const portfolioId = params.portfolio as string;
    const { deleteAsset } = useCloudinaryCore();

    const [pendingType, setPendingType] = useState<HeroBackgroundType | null>(null);

    const handleTypeChange = (value: HeroBackgroundType) => {
        const typesWithMedia: HeroBackgroundType[] = ["image", "video"];
        const currentHasMedia = typesWithMedia.includes(type);
        if (currentHasMedia && currentUrl && value !== type) {
            setPendingType(value);
        } else {
            commitTypeChange(value);
        }
    };

    const commitTypeChange = async (value: HeroBackgroundType) => {
        if (currentUrl) {
            const info = extractCloudinaryInfo(currentUrl);
            if (info) {
                try {
                    await deleteAsset(info.publicId, info.resourceType, true);
                } catch {
                    console.warn("Failed to delete old Cloudinary background asset");
                }
            }
        }
        onUpdate({ type: value, imageUrl: "", videoUrl: "" });
        setPendingType(null);
    };

    const gradientType: HeroGradientType = bg?.gradientType ?? "linear";
    // Sanitize: legacy data may have stored gradientAngle as a string like "135deg"
    const rawAngle = bg?.gradientAngle;
    const gradientAngle = typeof rawAngle === "string" ? (parseFloat(rawAngle) || 135) : (rawAngle ?? 135);
    const radialPosition = bg?.radialPosition ?? "center";

    return (
        <div className="space-y-8">
            <SelectField
                label="Background Type"
                id="bgType"
                value={type}
                onChange={(value) => handleTypeChange(value as HeroBackgroundType)}
                options={BACKGROUND_TYPE_OPTIONS}
            />

            {/* ── Type switch warning ─────────────────────────────────── */}
            {pendingType && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3 flex flex-col gap-2">
                    <p className="text-xs text-amber-300 leading-snug">
                        Switching to <span className="font-semibold">{pendingType}</span> will clear your current upload. Continue?
                    </p>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => commitTypeChange(pendingType)} className="text-xs font-medium px-3 py-1 rounded-md bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 transition-colors">
                            Yes, switch
                        </button>
                        <button type="button" onClick={() => setPendingType(null)} className="text-xs font-medium px-3 py-1 rounded-md bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ── SOLID ───────────────────────────────────────────────── */}
            {type === "solid" && (
                <Section title="Color">
                    <Field label="Background Color" htmlFor="bgColor">
                        <ColorPicker
                            id="bgColor"
                            value={bg?.color || "#0a0a0a"}
                            onChange={(value) => onUpdate({ color: value })}
                            placeholder="#0a0a0a"
                        />
                    </Field>
                </Section>
            )}

            {/* ── GRADIENT ────────────────────────────────────────────── */}
            {type === "gradient" && (
                <Section title="Gradient">
                    {/* Live preview */}
                    <GradientPreview
                        from={bg?.gradientFrom || "#1a1a2e"}
                        to={bg?.gradientTo || "#0a0a0a"}
                        angle={gradientAngle}
                        gradientType={gradientType}
                        radialPosition={radialPosition}
                    />

                    {/* Linear / Radial toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-neutral-700">
                        {(["linear", "radial"] as HeroGradientType[]).map((gt) => (
                            <button
                                key={gt}
                                type="button"
                                onClick={() => onUpdate({ gradientType: gt })}
                                className={[
                                    "flex-1 py-1.5 text-xs font-medium capitalize transition-colors",
                                    gradientType === gt
                                        ? "bg-white text-black"
                                        : "text-neutral-400 hover:text-white",
                                ].join(" ")}
                            >
                                {gt}
                            </button>
                        ))}
                    </div>

                    <Field label="From" htmlFor="gradFrom">
                        <ColorPicker id="gradFrom" value={bg?.gradientFrom || "#1a1a2e"} onChange={(v) => onUpdate({ gradientFrom: v })} placeholder="#1a1a2e" />
                    </Field>
                    <Field label="To" htmlFor="gradTo">
                        <ColorPicker id="gradTo" value={bg?.gradientTo || "#0a0a0a"} onChange={(v) => onUpdate({ gradientTo: v })} placeholder="#0a0a0a" />
                    </Field>

                    {/* Angle slider — linear only */}
                    {gradientType === "linear" && (
                        <SliderField
                            label="Angle"
                            htmlFor="gradAngle"
                            value={gradientAngle}
                            min={0} max={360} step={1} unit="°"
                            onChange={(v) => onUpdate({ gradientAngle: v })}
                        />
                    )}

                    {/* Radial center position picker */}
                    {gradientType === "radial" && (
                        <Field label="Center Position" htmlFor="radialPosition">
                            <div className="flex flex-col gap-2">
                                <PositionPicker
                                    value={radialPosition as HeroBackgroundPosition}
                                    onChange={(v) => onUpdate({ radialPosition: v })}
                                />
                                <p className="text-xs text-neutral-500">
                                    Controls where the gradient radiates outward from.
                                </p>
                            </div>
                        </Field>
                    )}
                </Section>
            )}

            {/* ── IMAGE ───────────────────────────────────────────────── */}
            {type === "image" && (
                <>
                    <Section title="Image">
                        <Field label="Upload Background Image" htmlFor="bgImageUrl">
                            <ImageField
                                url={bg?.imageUrl || null}
                                onChange={(url) => onUpdate({ imageUrl: url || "" })}
                                folder={`${userInfo?.id}/portfolio/${portfolioId}/hero/background`}
                                accept={"image"}
                            />
                        </Field>
                    </Section>

                    <Section title="Display">
                        <SelectField
                            label="Size"
                            id="bgSize"
                            value={bg?.backgroundSize ?? "cover"}
                            onChange={(v) => onUpdate({ backgroundSize: v as HeroBackgroundSize })}
                            options={BACKGROUND_SIZE_OPTIONS}
                        />

                        <Field label="Position" htmlFor="bgPosition">
                            <div className="flex flex-col gap-2">
                                <PositionPicker
                                    value={bg?.backgroundPosition ?? "center"}
                                    onChange={(v) => onUpdate({ backgroundPosition: v })}
                                />
                                <p className="text-xs text-neutral-500">
                                    Controls which part of the image stays visible when cropped to fill the section.
                                </p>
                            </div>
                        </Field>

                        {/* Repeat only makes sense when not cover */}
                        {bg?.backgroundSize !== "cover" && (
                            <Toggle
                                label="Repeat / tile"
                                description="Tiles the image when smaller than the section"
                                checked={bg?.backgroundRepeat ?? false}
                                onChange={(v) => onUpdate({ backgroundRepeat: v })}
                            />
                        )}
                    </Section>

                    <OverlaySection bg={bg} onUpdate={onUpdate} />
                </>
            )}

            {/* ── VIDEO ───────────────────────────────────────────────── */}
            {type === "video" && (
                <>
                    <Section title="Video">
                        <Field label="Upload Background Video" htmlFor="bgVideoUrl">
                            <ImageField
                                url={bg?.videoUrl || null}
                                onChange={(url) => onUpdate({ videoUrl: url || "" })}
                                folder={`${userInfo?.id}/portfolio/${portfolioId}/hero/background`}
                                accept={"video"}
                            />
                        </Field>
                    </Section>
                    <OverlaySection bg={bg} onUpdate={onUpdate} />
                </>
            )}

            {/* ── MESH ────────────────────────────────────────────────── */}
            {type === "mesh" && (
                <>
                    <Section title="Mesh Colors">
                        <p className="text-xs text-neutral-500">
                            Up to 4 floating color orbs that drift and blend together.
                        </p>
                        {([
                            { key: "meshColor1", label: "Orb 1", default: "#7c3aed" },
                            { key: "meshColor2", label: "Orb 2", default: "#2563eb" },
                            { key: "meshColor3", label: "Orb 3", default: "#0891b2" },
                            { key: "meshColor4", label: "Orb 4", default: "#0a0a0a" },
                        ] as const).map(({ key, label, default: def }) => (
                            <Field key={key} label={label} htmlFor={key}>
                                <ColorPicker
                                    id={key}
                                    value={bg?.[key] || def}
                                    onChange={(value) => onUpdate({ [key]: value })}
                                    placeholder={def}
                                />
                            </Field>
                        ))}
                    </Section>

                    <Section title="Mesh Behavior">
                        <SliderField
                            label="Animation Speed"
                            htmlFor="meshSpeed"
                            value={bg?.meshSpeed ?? 6}
                            min={1} max={20} step={1} unit="s"
                            onChange={(v) => onUpdate({ meshSpeed: v })}
                        />
                        <SliderField
                            label="Blur Amount"
                            htmlFor="meshBlur"
                            value={bg?.meshBlur ?? 80}
                            min={20} max={160} step={5} unit="px"
                            onChange={(v) => onUpdate({ meshBlur: v })}
                        />
                        <SliderField
                            label="Orb Size"
                            htmlFor="meshSize"
                            value={bg?.meshSize ?? 60}
                            min={20} max={100} step={5} unit="%"
                            onChange={(v) => onUpdate({ meshSize: v })}
                        />
                        <SliderField
                            label="Orb Opacity"
                            htmlFor="meshOpacity"
                            value={Math.round((bg?.meshOpacity ?? 1) * 100)}
                            min={10} max={100} step={5} unit="%"
                            onChange={(v) => onUpdate({ meshOpacity: v / 100 })}
                        />
                        <Field label="Base Color" htmlFor="meshBase">
                            <ColorPicker
                                id="meshBase"
                                value={bg?.meshBase || "#050510"}
                                onChange={(value) => onUpdate({ meshBase: value })}
                                placeholder="#050510"
                            />
                        </Field>
                    </Section>

                    <OverlaySection bg={bg} onUpdate={onUpdate} />
                </>
            )}

            {/* ── PARTICLES ───────────────────────────────────────────── */}
            {type === "particles" && (
                <>
                    <Section title="Particles">
                        <p className="text-xs text-neutral-500">
                            Floating dots rendered on a canvas layer behind your content.
                        </p>

                        {/* Colors together */}
                        <Field label="Particle Color" htmlFor="particleColor">
                            <ColorPicker
                                id="particleColor"
                                value={bg?.particleColor || "#ffffff"}
                                onChange={(value) => onUpdate({ particleColor: value })}
                                placeholder="#ffffff"
                            />
                        </Field>
                        <Field label="Background Color" htmlFor="particleBg">
                            <ColorPicker
                                id="particleBg"
                                value={bg?.particleBg || "#050510"}
                                onChange={(value) => onUpdate({ particleBg: value })}
                                placeholder="#050510"
                            />
                        </Field>

                        <SliderField
                            label="Count"
                            htmlFor="particleCount"
                            value={bg?.particleCount ?? 80}
                            min={10} max={300} step={10}
                            onChange={(v) => onUpdate({ particleCount: v })}
                        />
                        {(bg?.particleCount ?? 80) > 200 && (
                            <p className="text-xs text-amber-400">
                                High particle counts may affect performance on slower devices.
                            </p>
                        )}
                        <SliderField
                            label="Size"
                            htmlFor="particleSize"
                            value={bg?.particleSize ?? 2}
                            min={0.5} max={6} step={0.5} unit="px"
                            onChange={(v) => onUpdate({ particleSize: v })}
                        />
                        <SliderField
                            label="Speed"
                            htmlFor="particleSpeed"
                            value={bg?.particleSpeed ?? 0.5}
                            min={0.1} max={3} step={0.1} unit="×"
                            onChange={(v) => onUpdate({ particleSpeed: v })}
                        />
                        <SliderField
                            label="Opacity"
                            htmlFor="particleOpacity"
                            value={bg?.particleOpacity ?? 0.6}
                            min={0.1} max={1} step={0.05} unit="×"
                            onChange={(v) => onUpdate({ particleOpacity: v })}
                        />
                    </Section>

                    <Section title="Connections">
                        <Toggle
                            label="Draw connection lines"
                            description="Lines drawn between nearby particles"
                            checked={bg?.particleLines ?? true}
                            onChange={(v) => onUpdate({ particleLines: v })}
                        />
                        {(bg?.particleLines ?? true) && (
                            <SliderField
                                label="Max connection distance"
                                htmlFor="particleLineDist"
                                value={bg?.particleLineDist ?? 120}
                                min={40} max={250} step={10} unit="px"
                                onChange={(v) => onUpdate({ particleLineDist: v })}
                            />
                        )}
                    </Section>

                    <OverlaySection bg={bg} onUpdate={onUpdate} />
                </>
            )}
        </div>
    );
}