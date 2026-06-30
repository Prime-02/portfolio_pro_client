import { registerBackground } from "../../editor/BackgroundRegistry";
import Prism from "@/components/Prism";

registerBackground({
    type: "prism",
    label: "Prism",
    fields: [
        { kind: "dropdown", label: "Animation Type", key: "prismAnimationType", defaultValue: "rotate", options: [{ id: "rotate3d", code: "Rotate 3D" }, { id: "rotate", code: "Rotate" }, { id: "hover", code: "Hover" }] },
        { kind: "slider", label: "Base Width", key: "prismBaseWidth", defaultValue: 5.5, min: 0, max: 15, step: 0.1 },
        { kind: "slider", label: "Bloom", key: "prismBloom", defaultValue: 1, min: 0, max: 3, step: 0.1 },
        { kind: "slider", label: "Color Frequency", key: "prismColorFrequency", defaultValue: 1, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Glow", key: "prismGlow", defaultValue: 1, min: 0, max: 3, step: 0.1 },
        { kind: "slider", label: "Height", key: "prismHeight", defaultValue: 3.5, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Hover Strength", key: "prismHoverStrength", defaultValue: 2, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Hue Shift", key: "prismHueShift", defaultValue: 0, min: 0, max: 360, step: 1 },
        { kind: "slider", label: "Inertia", key: "prismInertia", defaultValue: 0.05, min: 0, max: 1, step: 0.01 },
        { kind: "slider", label: "Noise", key: "prismNoise", defaultValue: 0.5, min: 0, max: 2, step: 0.1 },
        { kind: "slider", label: "Scale", key: "prismScale", defaultValue: 3.6, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Time Scale", key: "prismTimeScale", defaultValue: 0.5, min: 0, max: 3, step: 0.1 },
        { kind: "checkbox", label: "Transparent", key: "prismTransparent", defaultValue: true },
    ],
    defaults: {
        type: "prism",
        prismAnimationType: "rotate",
        prismBaseWidth: 5.5,
        prismBloom: 1,
        prismColorFrequency: 1,
        prismGlow: 1,
        prismHeight: 3.5,
        prismHoverStrength: 2,
        prismHueShift: 0,
        prismInertia: 0.05,
        prismNoise: 0.5,
        prismScale: 3.6,
        prismTimeScale: 0.5,
        prismTransparent: true,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Prism
                animationType={background.prismAnimationType || "rotate"}
                baseWidth={background.prismBaseWidth ?? 5.5}
                bloom={background.prismBloom ?? 1}
                colorFrequency={background.prismColorFrequency ?? 1}
                glow={background.prismGlow ?? 1}
                height={background.prismHeight ?? 3.5}
                hoverStrength={background.prismHoverStrength ?? 2}
                hueShift={background.prismHueShift ?? 0}
                inertia={background.prismInertia ?? 0.05}
                noise={background.prismNoise ?? 0.5}
                scale={background.prismScale ?? 3.6}
                timeScale={background.prismTimeScale ?? 0.5}
                transparent={background.prismTransparent ?? true}
            />
        </div>
    ),
    supportsOverlay: true,
});