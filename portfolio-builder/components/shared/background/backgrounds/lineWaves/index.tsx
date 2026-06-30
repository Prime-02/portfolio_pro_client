import { registerBackground } from "../../editor/BackgroundRegistry";
import LineWaves from "@/components/LineWaves";

registerBackground({
    type: "lineWaves",
    label: "LineWaves",
    fields: [
        { kind: "slider", label: "Brightness", key: "lineWavesBrightness", defaultValue: 0.2, min: 0, max: 3, step: 0.1 },
        { kind: "color", label: "Color1", key: "lineWavesColor1", defaultValue: "#ffffff" },
        { kind: "color", label: "Color2", key: "lineWavesColor2", defaultValue: "#ffffff" },
        { kind: "color", label: "Color3", key: "lineWavesColor3", defaultValue: "#ffffff" },
        { kind: "slider", label: "Color Cycle Speed", key: "lineWavesColorCycleSpeed", defaultValue: 1, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Edge Fade Width", key: "lineWavesEdgeFadeWidth", defaultValue: 0, min: 0, max: 1, step: 0.1 },
        { kind: "checkbox", label: "Enable Mouse Interaction", key: "lineWavesEnableMouseInteraction", defaultValue: true },
        { kind: "slider", label: "Inner Line Count", key: "lineWavesInnerLineCount", defaultValue: 32, min: 0, max: 40, step: 1 },
        { kind: "slider", label: "Mouse Influence", key: "lineWavesMouseInfluence", defaultValue: 2, min: 0, max: 2, step: 0.1 },
        { kind: "slider", label: "Outer Line Count", key: "lineWavesOuterLineCount", defaultValue: 36, min: 0, max: 40, step: 1 },
        { kind: "slider", label: "Rotation", key: "lineWavesRotation", defaultValue: -45, min: -360, max: 360, step: 1 },
        { kind: "slider", label: "Speed", key: "lineWavesSpeed", defaultValue: 0.3, min: 0, max: 3, step: 0.1 },
        { kind: "slider", label: "Warp Intensity", key: "lineWavesWarpIntensity", defaultValue: 1, min: 0, max: 3, step: 1 },
    ],
    defaults: {
        type: "lineWaves",
        lineWavesBrightness: 0.2,
        lineWavesColor1: "#ffffff",
        lineWavesColor2: "#ffffff",
        lineWavesColor3: "#ffffff",
        lineWavesColorCycleSpeed: 1,
        lineWavesEdgeFadeWidth: 0,
        lineWavesEnableMouseInteraction: true,
        lineWavesInnerLineCount: 32,
        lineWavesMouseInfluence: 2,
        lineWavesOuterLineCount: 36,
        lineWavesRotation: -45,
        lineWavesSpeed: 0.3,
        lineWavesWarpIntensity: 1,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <LineWaves
                brightness={background.lineWavesBrightness ?? 0.2}
                color1={background.lineWavesColor1 || "#ffffff"}
                color2={background.lineWavesColor2 || "#ffffff"}
                color3={background.lineWavesColor3 || "#ffffff"}
                colorCycleSpeed={background.lineWavesColorCycleSpeed ?? 1}
                edgeFadeWidth={background.lineWavesEdgeFadeWidth ?? 0}
                enableMouseInteraction={background.lineWavesEnableMouseInteraction ?? true}
                innerLineCount={background.lineWavesInnerLineCount ?? 32}
                mouseInfluence={background.lineWavesMouseInfluence ?? 2}
                outerLineCount={background.lineWavesOuterLineCount ?? 36}
                rotation={background.lineWavesRotation ?? -45}
                speed={background.lineWavesSpeed ?? 0.3}
                warpIntensity={background.lineWavesWarpIntensity ?? 1}
            />
        </div>
    ),
    supportsOverlay: true,
});