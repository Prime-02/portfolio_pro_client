import { registerBackground } from "../../editor/BackgroundRegistry";
import DotField from "@/components/DotField";

registerBackground({
    type: "dotField",
    label: "Dot Field",
    fields: [
        { kind: "slider", label: "Dot Radius", key: "dotFieldDotRadius", defaultValue: 1.5, min: 0.5, max: 10, step: 0.5 },
        { kind: "slider", label: "Dot Spacing", key: "dotFieldDotSpacing", defaultValue: 14, min: 4, max: 50, step: 1 },
        { kind: "slider", label: "Cursor Radius", key: "dotFieldCursorRadius", defaultValue: 500, min: 100, max: 1000, step: 50 },
        { kind: "slider", label: "Cursor Force", key: "dotFieldCursorForce", defaultValue: 0.1, min: 0, max: 1, step: 0.01 },
        { kind: "checkbox", label: "Bulge Only", key: "dotFieldBulgeOnly", defaultValue: true },
        { kind: "slider", label: "Bulge Strength", key: "dotFieldBulgeStrength", defaultValue: 67, min: 0, max: 200, step: 1 },
        { kind: "slider", label: "Glow Radius", key: "dotFieldGlowRadius", defaultValue: 160, min: 50, max: 300, step: 10 },
        { kind: "checkbox", label: "Sparkle", key: "dotFieldSparkle", defaultValue: false },
        { kind: "slider", label: "Wave Amplitude", key: "dotFieldWaveAmplitude", defaultValue: 0, min: 0, max: 20, step: 0.5 },
        { kind: "color", label: "Gradient From", key: "dotFieldGradientFrom", defaultValue: "rgba(168, 85, 247, 0.35)" },
        { kind: "color", label: "Gradient To", key: "dotFieldGradientTo", defaultValue: "rgba(180, 151, 207, 0.25)" },
        { kind: "color", label: "Glow Color", key: "dotFieldGlowColor", defaultValue: "#120F17" },
    ],
    defaults: {
        type: "dotField",
        dotFieldDotRadius: 1.5,
        dotFieldDotSpacing: 14,
        dotFieldCursorRadius: 500,
        dotFieldCursorForce: 0.1,
        dotFieldBulgeOnly: true,
        dotFieldBulgeStrength: 67,
        dotFieldGlowRadius: 160,
        dotFieldSparkle: false,
        dotFieldWaveAmplitude: 0,
        dotFieldGradientFrom: "rgba(168, 85, 247, 0.35)",
        dotFieldGradientTo: "rgba(180, 151, 207, 0.25)",
        dotFieldGlowColor: "#120F17",
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <DotField
            {...({
                dotRadius: background.dotFieldDotRadius ?? 1.5,
                dotSpacing: background.dotFieldDotSpacing ?? 14,
                cursorRadius: background.dotFieldCursorRadius ?? 500,
                cursorForce: background.dotFieldCursorForce ?? 0.1,
                bulgeOnly: background.dotFieldBulgeOnly ?? true,
                bulgeStrength: background.dotFieldBulgeStrength ?? 67,
                glowRadius: background.dotFieldGlowRadius ?? 160,
                sparkle: background.dotFieldSparkle ?? false,
                waveAmplitude: background.dotFieldWaveAmplitude ?? 0,
                gradientFrom: background.dotFieldGradientFrom || "rgba(168, 85, 247, 0.35)",
                gradientTo: background.dotFieldGradientTo || "rgba(180, 151, 207, 0.25)",
                glowColor: background.dotFieldGlowColor || "#120F17",
            } as any)}
        />
    ),
    supportsOverlay: false,
});