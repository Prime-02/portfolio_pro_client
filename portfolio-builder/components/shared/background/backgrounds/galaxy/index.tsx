import { registerBackground } from "../../editor/BackgroundRegistry";
import Galaxy from "@/components/Galaxy";

registerBackground({
    type: "galaxy",
    label: "Galaxy",
    fields: [
        { kind: "slider", label: "Density", key: "galaxyDensity", defaultValue: 1, min: 0, max: 2, step: 1 },
        { kind: "slider", label: "Glow Intensity", key: "galaxyGlowIntensity", defaultValue: 0.3, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Hue Shift", key: "galaxyHueShift", defaultValue: 140, min: 0, max: 360, step: 1 },
        { kind: "checkbox", label: "Mouse Repulsion", key: "galaxyMouseRepulsion", defaultValue: true },
        { kind: "slider", label: "Repulsion Strength", key: "galaxyRepulsionStrength", defaultValue: 2, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Rotation Speed", key: "galaxyRotationSpeed", defaultValue: 0.1, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Saturation", key: "galaxySaturation", defaultValue: 0, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Speed", key: "galaxySpeed", defaultValue: 1, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Star Speed", key: "galaxyStarSpeed", defaultValue: 0.5, min: 0, max: 10, step: 0.1 },
        { kind: "checkbox", label: "Transparent", key: "galaxyTransparent", defaultValue: true },
        { kind: "slider", label: "Twinkle Intensity", key: "galaxyTwinkleIntensity", defaultValue: 0.3, min: 0, max: 10, step: 0.1 },
    ],
    defaults: {
        type: "galaxy",
        galaxyDensity: 1,
        galaxyGlowIntensity: 0.3,
        galaxyHueShift: 140,
        galaxyMouseRepulsion: true,
        galaxyRepulsionStrength: 2,
        galaxyRotationSpeed: 0.1,
        galaxySaturation: 0,
        galaxySpeed: 1,
        galaxyStarSpeed: 0.5,
        galaxyTransparent: true,
        galaxyTwinkleIntensity: 0.3,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Galaxy
                density={background.galaxyDensity ?? 1}
                glowIntensity={background.galaxyGlowIntensity ?? 0.3}
                hueShift={background.galaxyHueShift ?? 140}
                mouseRepulsion={background.galaxyMouseRepulsion ?? true}
                repulsionStrength={background.galaxyRepulsionStrength ?? 2}
                rotationSpeed={background.galaxyRotationSpeed ?? 0.1}
                saturation={background.galaxySaturation ?? 0}
                speed={background.galaxySpeed ?? 1}
                starSpeed={background.galaxyStarSpeed ?? 0.5}
                transparent={background.galaxyTransparent ?? true}
                twinkleIntensity={background.galaxyTwinkleIntensity ?? 0.3}
            />
        </div>
    ),
    supportsOverlay: true,
});
