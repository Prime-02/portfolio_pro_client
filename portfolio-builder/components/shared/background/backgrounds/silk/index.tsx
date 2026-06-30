import { registerBackground } from "../../editor/BackgroundRegistry";
import Silk from "@/components/Silk";

registerBackground({
    type: "silk",
    label: "Silk",
    fields: [
        { kind: "color", label: "Color", key: "silkColor", defaultValue: "#7B7481" },
        { kind: "slider", label: "Noise Intensity", key: "silkNoiseIntensity", defaultValue: 1.5, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Rotation", key: "silkRotation", defaultValue: 0, min: -360, max: 360, step: 1 },
        { kind: "slider", label: "Scale", key: "silkScale", defaultValue: 1, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Speed", key: "silkSpeed", defaultValue: 5, min: 0, max: 10, step: 1 },
    ],
    defaults: {
        type: "silk",
        silkColor: "#7B7481",
        silkNoiseIntensity: 1.5,
        silkRotation: 0,
        silkScale: 1,
        silkSpeed: 5,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={ { position: "absolute", inset: 0, width: "100%", height: "100%" } }>
            <Silk
                color={background.silkColor || "#7B7481"}
                noiseIntensity={background.silkNoiseIntensity ?? 1.5}
                rotation={background.silkRotation ?? 0}
                scale={background.silkScale ?? 1}
                speed={background.silkSpeed ?? 5}
            />
        </div>
    ),
    supportsOverlay: true,
});
