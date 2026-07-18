import { registerBackground } from "../../editor/BackgroundRegistry";
import Orb from "@/components/Orb";

registerBackground({
    type: "orb",
    label: "Orb",
    fields: [
        { kind: "checkbox", label: "Force Hover State", key: "orbForceHoverState", defaultValue: false },
        { kind: "slider", label: "Hover Intensity", key: "orbHoverIntensity", defaultValue: 0.5, min: 0, max: 2, step: 0.1 },
        { kind: "slider", label: "Hue", key: "orbHue", defaultValue: 0, min: 0, max: 360, step: 1 },
        { kind: "checkbox", label: "Rotate On Hover", key: "orbRotateOnHover", defaultValue: true },
    ],
    defaults: {
        type: "orb",
        orbForceHoverState: false,
        orbHoverIntensity: 0.5,
        orbHue: 0,
        orbRotateOnHover: true,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Orb
                forceHoverState={background.orbForceHoverState ?? false}
                hoverIntensity={background.orbHoverIntensity ?? 0.5}
                hue={background.orbHue ?? 0}
                rotateOnHover={background.orbRotateOnHover ?? true}
            />
        </div>
    ),
    supportsOverlay: true,
});
