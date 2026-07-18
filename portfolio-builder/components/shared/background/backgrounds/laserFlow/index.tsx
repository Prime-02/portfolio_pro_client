import { registerBackground } from "../../editor/BackgroundRegistry";
import LaserFlow from "@/components/LaserFlow";

registerBackground({
    type: "laserFlow",
    label: "LaserFlow",
    fields: [
        { kind: "color", label: "Color", key: "laserFlowColor", defaultValue: "#FF79C6" },
        { kind: "slider", label: "Decay", key: "laserFlowDecay", defaultValue: 1.1, min: 0, max: 3, step: 0.01 },
        { kind: "slider", label: "Flow Speed", key: "laserFlowFlowSpeed", defaultValue: 0.35, min: 0, max: 2, step: 0.1 },
        { kind: "slider", label: "Flow Strength", key: "laserFlowFlowStrength", defaultValue: 0.25, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Fog Intensity", key: "laserFlowFogIntensity", defaultValue: 0.45, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Fog Scale", key: "laserFlowFogScale", defaultValue: 0.3, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Horizontal Beam Offset", key: "laserFlowHorizontalBeamOffset", defaultValue: 0, min: -0.5, max: 0.5, step: 0.1 },
        { kind: "slider", label: "Horizontal Sizing", key: "laserFlowHorizontalSizing", defaultValue: 0.5, min: 0, max: 3, step: 0.1 },
        { kind: "slider", label: "Vertical Beam Offset", key: "laserFlowVerticalBeamOffset", defaultValue: -0.5, min: -0.5, max: 0.5, step: 0.1 },
        { kind: "slider", label: "Vertical Sizing", key: "laserFlowVerticalSizing", defaultValue: 2, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Wisp Density", key: "laserFlowWispDensity", defaultValue: 1, min: 0, max: 2, step: 0.2 },
        { kind: "slider", label: "Wisp Intensity", key: "laserFlowWispIntensity", defaultValue: 5, min: 0, max: 15, step: 1 },
        { kind: "slider", label: "Wisp Speed", key: "laserFlowWispSpeed", defaultValue: 15, min: 0, max: 30, step: 1 },
    ],
    defaults: {
        type: "laserFlow",
        laserFlowColor: "#FF79C6",
        laserFlowDecay: 1.1,
        laserFlowFlowSpeed: 0.35,
        laserFlowFlowStrength: 0.25,
        laserFlowFogIntensity: 0.45,
        laserFlowFogScale: 0.3,
        laserFlowHorizontalBeamOffset: 0,
        laserFlowHorizontalSizing: 0.5,
        laserFlowVerticalBeamOffset: -0.5,
        laserFlowVerticalSizing: 2,
        laserFlowWispDensity: 1,
        laserFlowWispIntensity: 5,
        laserFlowWispSpeed: 15,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <LaserFlow
                className=""
                style={{}}
                dpr={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
                color={background.laserFlowColor || "#FF79C6"}
                decay={background.laserFlowDecay ?? 1.1}
                flowSpeed={background.laserFlowFlowSpeed ?? 0.35}
                flowStrength={background.laserFlowFlowStrength ?? 0.25}
                fogIntensity={background.laserFlowFogIntensity ?? 0.45}
                fogScale={background.laserFlowFogScale ?? 0.3}
                horizontalBeamOffset={background.laserFlowHorizontalBeamOffset ?? 0}
                horizontalSizing={background.laserFlowHorizontalSizing ?? 0.5}
                verticalBeamOffset={background.laserFlowVerticalBeamOffset ?? -0.5}
                verticalSizing={background.laserFlowVerticalSizing ?? 2}
                wispDensity={background.laserFlowWispDensity ?? 1}
                wispIntensity={background.laserFlowWispIntensity ?? 5}
                wispSpeed={background.laserFlowWispSpeed ?? 15}
            />
        </div>
    ),
    supportsOverlay: true,
});