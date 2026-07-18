import { registerBackground } from "../../editor/BackgroundRegistry";
import SideRays from "@/components/SideRays";

registerBackground({
    type: "sideRays",
    label: "SideRays",
    fields: [
        { kind: "slider", label: "Blend", key: "sideRaysBlend", defaultValue: 0.75, min: 0, max: 2, step: 0.1 },
        { kind: "slider", label: "Falloff", key: "sideRaysFalloff", defaultValue: 1.6, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Intensity", key: "sideRaysIntensity", defaultValue: 2, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Opacity", key: "sideRaysOpacity", defaultValue: 1, min: 0, max: 1, step: 0.1 },
        { kind: "dropdown", label: "Origin", key: "sideRaysOrigin", defaultValue: "top-right", options: [{ id: "top-right", code: "Top Right" }, { id: "top-left", code: "Top Left" }, { id: "bottom-right", code: "Bottom Right" }, { id: "bottom-left", code: "Bottom Left" }] },
        { kind: "color", label: "Ray Color1", key: "sideRaysRayColor1", defaultValue: "#EAB308" },
        { kind: "color", label: "Ray Color2", key: "sideRaysRayColor2", defaultValue: "#96c8ff" },
        { kind: "slider", label: "Saturation", key: "sideRaysSaturation", defaultValue: 1.5, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Speed", key: "sideRaysSpeed", defaultValue: 2.5, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Spread", key: "sideRaysSpread", defaultValue: 2, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Tilt", key: "sideRaysTilt", defaultValue: 0, min: -90, max: 90, step: 1 },
    ],
    defaults: {
        type: "sideRays",
        sideRaysBlend: 0.75,
        sideRaysFalloff: 1.6,
        sideRaysIntensity: 2,
        sideRaysOpacity: 1,
        sideRaysOrigin: "top-right",
        sideRaysRayColor1: "#EAB308",
        sideRaysRayColor2: "#96c8ff",
        sideRaysSaturation: 1.5,
        sideRaysSpeed: 2.5,
        sideRaysSpread: 2,
        sideRaysTilt: 0,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <SideRays
                blend={background.sideRaysBlend ?? 0.75}
                falloff={background.sideRaysFalloff ?? 1.6}
                intensity={background.sideRaysIntensity ?? 2}
                opacity={background.sideRaysOpacity ?? 1}
                origin={background.sideRaysOrigin || "top-right"}
                rayColor1={background.sideRaysRayColor1 || "#EAB308"}
                rayColor2={background.sideRaysRayColor2 || "#96c8ff"}
                saturation={background.sideRaysSaturation ?? 1.5}
                speed={background.sideRaysSpeed ?? 2.5}
                spread={background.sideRaysSpread ?? 2}
                tilt={background.sideRaysTilt ?? 0}
            />
        </div>
    ),
    supportsOverlay: true,
});
