import { registerBackground } from "../../editor/BackgroundRegistry";
import LightRays from "@/components/LightRays";

registerBackground({
    type: "lightRays",
    label: "LightRays",
    fields: [
        { kind: "slider", label: "Distortion", key: "lightRaysDistortion", defaultValue: 0, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Fade Distance", key: "lightRaysFadeDistance", defaultValue: 1, min: 0, max: 50, step: 1 },
        { kind: "checkbox", label: "Follow Mouse", key: "lightRaysFollowMouse", defaultValue: true },
        { kind: "slider", label: "Light Spread", key: "lightRaysLightSpread", defaultValue: 1, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Mouse Influence", key: "lightRaysMouseInfluence", defaultValue: 0.1, min: 0, max: 500, step: 1 },
        { kind: "slider", label: "Noise Amount", key: "lightRaysNoiseAmount", defaultValue: 0, min: 0, max: 10, step: 1 },
        { kind: "checkbox", label: "Pulsating", key: "lightRaysPulsating", defaultValue: false },
        { kind: "slider", label: "Ray Length", key: "lightRaysRayLength", defaultValue: 2, min: 0, max: 20, step: 1 },
        { kind: "color", label: "Rays Color", key: "lightRaysRaysColor", defaultValue: "#ffffff" },
        { kind: "dropdown", label: "Rays Origin", key: "lightRaysRaysOrigin", defaultValue: "top-center", options: [{ id: "top-center", code: "Top Center" }, { id: "top-left", code: "Top Left" }, { id: "top-right", code: "Top Right" }, { id: "center", code: "Center" }] },
        { kind: "slider", label: "Rays Speed", key: "lightRaysRaysSpeed", defaultValue: 1, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Saturation", key: "lightRaysSaturation", defaultValue: 1, min: 0, max: 5, step: 1 },
    ],
    defaults: {
        type: "lightRays",
        lightRaysDistortion: 0,
        lightRaysFadeDistance: 1,
        lightRaysFollowMouse: true,
        lightRaysLightSpread: 1,
        lightRaysMouseInfluence: 0.1,
        lightRaysNoiseAmount: 0,
        lightRaysPulsating: false,
        lightRaysRayLength: 2,
        lightRaysRaysColor: "#ffffff",
        lightRaysRaysOrigin: "top-center",
        lightRaysRaysSpeed: 1,
        lightRaysSaturation: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <LightRays
                distortion={background.lightRaysDistortion ?? 0}
                fadeDistance={background.lightRaysFadeDistance ?? 1}
                followMouse={background.lightRaysFollowMouse ?? true}
                lightSpread={background.lightRaysLightSpread ?? 1}
                mouseInfluence={background.lightRaysMouseInfluence ?? 0.1}
                noiseAmount={background.lightRaysNoiseAmount ?? 0}
                pulsating={background.lightRaysPulsating ?? false}
                rayLength={background.lightRaysRayLength ?? 2}
                raysColor={background.lightRaysRaysColor || "#ffffff"}
                raysOrigin={background.lightRaysRaysOrigin || "top-center"}
                raysSpeed={background.lightRaysRaysSpeed ?? 1}
                saturation={background.lightRaysSaturation ?? 1}
            />
        </div>
    ),
    supportsOverlay: true,
});
