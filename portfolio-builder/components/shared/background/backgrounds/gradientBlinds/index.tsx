import { registerBackground } from "../../editor/BackgroundRegistry";
import GradientBlinds from "@/components/GradientBlinds";

registerBackground({
    type: "gradientBlinds",
    label: "GradientBlinds",
    fields: [
        { kind: "slider", label: "Angle", key: "gradientBlindsAngle", defaultValue: 0, min: -360, max: 360, step: 1 },
        { kind: "slider", label: "Blind Count", key: "gradientBlindsBlindCount", defaultValue: 16, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Blind Min Width", key: "gradientBlindsBlindMinWidth", defaultValue: 60, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Distort Amount", key: "gradientBlindsDistortAmount", defaultValue: 0, min: 0, max: 10, step: 1 },
        {
            kind: "group", label: "Gradient Colors", fields: [
                { kind: "color", label: "Color 1", key: "gradientBlindsGradientColors1", defaultValue: "#FF9FFC" },
                { kind: "color", label: "Color 2", key: "gradientBlindsGradientColors2", defaultValue: "#5227FF" }
            ]
        },
        { kind: "checkbox", label: "Mirror Gradient", key: "gradientBlindsMirrorGradient", defaultValue: false },
        { kind: "slider", label: "Mouse Dampening", key: "gradientBlindsMouseDampening", defaultValue: 0.15, min: 0, max: 2, step: 0.01 },
        { kind: "slider", label: "Noise", key: "gradientBlindsNoise", defaultValue: 0.3, min: 0, max: 5, step: 0.1 },
        { kind: "dropdown", label: "Shine Direction", key: "gradientBlindsShineDirection", defaultValue: "left", options: [{ id: "left", code: "Left" }, { id: "right", code: "Right" }, { id: "top", code: "Top" }, { id: "bottom", code: "Bottom" }] },
        { kind: "slider", label: "Spotlight Opacity", key: "gradientBlindsSpotlightOpacity", defaultValue: 1, min: 0, max: 1, step: 1 },
        { kind: "slider", label: "Spotlight Radius", key: "gradientBlindsSpotlightRadius", defaultValue: 0.5, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Spotlight Softness", key: "gradientBlindsSpotlightSoftness", defaultValue: 1, min: 0, max: 20, step: 1 },
    ],
    defaults: {
        type: "gradientBlinds",
        gradientBlindsAngle: 0,
        gradientBlindsBlindCount: 16,
        gradientBlindsBlindMinWidth: 60,
        gradientBlindsDistortAmount: 0,
        gradientBlindsGradientColors1: "#FF9FFC",
        gradientBlindsGradientColors2: "#5227FF",
        gradientBlindsMirrorGradient: false,
        gradientBlindsMouseDampening: 0.15,
        gradientBlindsNoise: 0.3,
        gradientBlindsShineDirection: "left",
        gradientBlindsSpotlightOpacity: 1,
        gradientBlindsSpotlightRadius: 0.5,
        gradientBlindsSpotlightSoftness: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <GradientBlinds
                className=""
                dpr={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
                angle={background.gradientBlindsAngle ?? 0}
                blindCount={background.gradientBlindsBlindCount ?? 16}
                blindMinWidth={background.gradientBlindsBlindMinWidth ?? 60}
                distortAmount={background.gradientBlindsDistortAmount ?? 0}
                gradientColors={[background.gradientBlindsGradientColors1 || '#FF9FFC', background.gradientBlindsGradientColors2 || '#5227FF']}
                mirrorGradient={background.gradientBlindsMirrorGradient ?? false}
                mouseDampening={background.gradientBlindsMouseDampening ?? 0.15}
                noise={background.gradientBlindsNoise ?? 0.3}
                shineDirection={background.gradientBlindsShineDirection || "left"}
                spotlightOpacity={background.gradientBlindsSpotlightOpacity ?? 1}
                spotlightRadius={background.gradientBlindsSpotlightRadius ?? 0.5}
                spotlightSoftness={background.gradientBlindsSpotlightSoftness ?? 1}
            />
        </div>
    ),
    supportsOverlay: true,
});