import { registerBackground } from "../../editor/BackgroundRegistry";
import RippleGrid from "@/components/RippleGrid";

registerBackground({
    type: "rippleGrid",
    label: "RippleGrid",
    fields: [
        { kind: "checkbox", label: "Enable Rainbow", key: "rippleGridEnableRainbow", defaultValue: false },
        { kind: "slider", label: "Fade Distance", key: "rippleGridFadeDistance", defaultValue: 1.5, min: 0, max: 50, step: 1 },
        { kind: "slider", label: "Glow Intensity", key: "rippleGridGlowIntensity", defaultValue: 0.1, min: 0, max: 10, step: 0.1 },
        { kind: "color", label: "Grid Color", key: "rippleGridGridColor", defaultValue: "#ffffff" },
        { kind: "slider", label: "Grid Rotation", key: "rippleGridGridRotation", defaultValue: 0, min: -360, max: 360, step: 1 },
        { kind: "slider", label: "Grid Size", key: "rippleGridGridSize", defaultValue: 10, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Grid Thickness", key: "rippleGridGridThickness", defaultValue: 15, min: 0, max: 50, step: 1 },
        { kind: "checkbox", label: "Mouse Interaction", key: "rippleGridMouseInteraction", defaultValue: true },
        { kind: "slider", label: "Mouse Interaction Radius", key: "rippleGridMouseInteractionRadius", defaultValue: 1, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Opacity", key: "rippleGridOpacity", defaultValue: 1, min: 0, max: 1, step: 0.05 },
        { kind: "slider", label: "Ripple Intensity", key: "rippleGridRippleIntensity", defaultValue: 0.05, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Vignette Strength", key: "rippleGridVignetteStrength", defaultValue: 2, min: 0, max: 10, step: 1 },
    ],
    defaults: {
        type: "rippleGrid",
        rippleGridEnableRainbow: false,
        rippleGridFadeDistance: 1.5,
        rippleGridGlowIntensity: 0.1,
        rippleGridGridColor: "#ffffff",
        rippleGridGridRotation: 0,
        rippleGridGridSize: 10,
        rippleGridGridThickness: 15,
        rippleGridMouseInteraction: true,
        rippleGridMouseInteractionRadius: 1,
        rippleGridOpacity: 1,
        rippleGridRippleIntensity: 0.05,
        rippleGridVignetteStrength: 2,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <RippleGrid
                enableRainbow={background.rippleGridEnableRainbow ?? false}
                fadeDistance={background.rippleGridFadeDistance ?? 1.5}
                glowIntensity={background.rippleGridGlowIntensity ?? 0.1}
                gridColor={background.rippleGridGridColor || "#ffffff"}
                gridRotation={background.rippleGridGridRotation ?? 0}
                gridSize={background.rippleGridGridSize ?? 10}
                gridThickness={background.rippleGridGridThickness ?? 15}
                mouseInteraction={background.rippleGridMouseInteraction ?? true}
                mouseInteractionRadius={background.rippleGridMouseInteractionRadius ?? 1}
                opacity={background.rippleGridOpacity ?? 1}
                rippleIntensity={background.rippleGridRippleIntensity ?? 0.05}
                vignetteStrength={background.rippleGridVignetteStrength ?? 2}
            />
        </div>
    ),
    supportsOverlay: true,
});
