import { registerBackground } from "../../editor/BackgroundRegistry";
import ColorBends from "@/components/ColorBends";

registerBackground({
    type: "colorBends",
    label: "Color Bends",
    fields: [
        { kind: "slider", label: "Rotation", key: "colorBendsRotation", defaultValue: 90, min: 0, max: 360, step: 1 },
        { kind: "slider", label: "Speed", key: "colorBendsSpeed", defaultValue: 0.2, min: 0, max: 5, step: 0.05 },
        {
            kind: "group",
            label: "Colors",
            fields: [
                { kind: "color", label: "Color 1", key: "colorBendsColor1", defaultValue: "#5227FF" },
                { kind: "color", label: "Color 2", key: "colorBendsColor2", defaultValue: "#FF9FFC" },
                { kind: "color", label: "Color 3", key: "colorBendsColor3", defaultValue: "#7cff67" },
            ],
        },
        { kind: "checkbox", label: "Transparent", key: "colorBendsTransparent", defaultValue: true },
        { kind: "slider", label: "Auto Rotate", key: "colorBendsAutoRotate", defaultValue: 0, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Scale", key: "colorBendsScale", defaultValue: 1, min: 0.1, max: 3, step: 0.1 },
        { kind: "slider", label: "Frequency", key: "colorBendsFrequency", defaultValue: 1, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Warp Strength", key: "colorBendsWarpStrength", defaultValue: 1, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Mouse Influence", key: "colorBendsMouseInfluence", defaultValue: 1, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Parallax", key: "colorBendsParallax", defaultValue: 0.5, min: 0, max: 2, step: 0.1 },
        { kind: "slider", label: "Noise", key: "colorBendsNoise", defaultValue: 0.15, min: 0, max: 1, step: 0.01 },
        { kind: "slider", label: "Iterations", key: "colorBendsIterations", defaultValue: 1, min: 1, max: 10, step: 1 },
        { kind: "slider", label: "Intensity", key: "colorBendsIntensity", defaultValue: 1.5, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Bandwidth", key: "colorBendsBandWidth", defaultValue: 6, min: 1, max: 20, step: 1 },
    ],
    defaults: {
        type: "colorBends",
        colorBendsRotation: 90,
        colorBendsSpeed: 0.2,
        colorBendsColor1: "#5227FF",
        colorBendsColor2: "#FF9FFC",
        colorBendsColor3: "#7cff67",
        colorBendsTransparent: true,
        colorBendsAutoRotate: 0,
        colorBendsScale: 1,
        colorBendsFrequency: 1,
        colorBendsWarpStrength: 1,
        colorBendsMouseInfluence: 1,
        colorBendsParallax: 0.5,
        colorBendsNoise: 0.15,
        colorBendsIterations: 1,
        colorBendsIntensity: 1.5,
        colorBendsBandWidth: 6,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <ColorBends
            {...({
                rotation: background.colorBendsRotation ?? 90,
                speed: background.colorBendsSpeed ?? 0.2,
                colors: [
                    background.colorBendsColor1 ?? "#5227FF",
                    background.colorBendsColor2 ?? "#FF9FFC",
                    background.colorBendsColor3 ?? "#7cff67",
                ],
                transparent: background.colorBendsTransparent ?? true,
                autoRotate: background.colorBendsAutoRotate ?? 0,
                scale: background.colorBendsScale ?? 1,
                frequency: background.colorBendsFrequency ?? 1,
                warpStrength: background.colorBendsWarpStrength ?? 1,
                mouseInfluence: background.colorBendsMouseInfluence ?? 1,
                parallax: background.colorBendsParallax ?? 0.5,
                noise: background.colorBendsNoise ?? 0.15,
                iterations: background.colorBendsIterations ?? 1,
                intensity: background.colorBendsIntensity ?? 1.5,
                bandWidth: background.colorBendsBandWidth ?? 6,
            } as React.ComponentProps<typeof ColorBends>)}
        />
    ),
    supportsOverlay: false,
});