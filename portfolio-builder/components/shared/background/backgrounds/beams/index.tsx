import { registerBackground } from "../../editor/BackgroundRegistry";
import Beams from "@/components/Beams";

registerBackground({
    type: "beams",
    label: "Beams",
    fields: [
        { kind: "slider", label: "Beam Width", key: "beamsBeamWidth", defaultValue: 2, min: 1, max: 30, step: 1 },
        { kind: "slider", label: "Beam Height", key: "beamsBeamHeight", defaultValue: 15, min: 1, max: 40, step: 1 },
        { kind: "slider", label: "Beam Count", key: "beamsBeamNumber", defaultValue: 12, min: 1, max: 30, step: 1 },
        { kind: "color", label: "Light Color", key: "beamsLightColor", defaultValue: "#ffffff" },
        { kind: "slider", label: "Speed", key: "beamsSpeed", defaultValue: 2, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Noise", key: "beamsNoiseIntensity", defaultValue: 1.75, min: 0, max: 5, step: 0.05 },
        { kind: "slider", label: "Scale", key: "beamsScale", defaultValue: 0.2, min: 0.05, max: 1, step: 0.05 },
        { kind: "slider", label: "Rotation", key: "beamsRotation", defaultValue: 0, min: -180, max: 180, step: 1 },
    ],
    defaults: {
        type: "beams",
        beamsBeamWidth: 2,
        beamsBeamHeight: 15,
        beamsBeamNumber: 12,
        beamsLightColor: "#ffffff",
        beamsSpeed: 2,
        beamsNoiseIntensity: 1.75,
        beamsScale: 0.2,
        beamsRotation: 0,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <Beams
            beamWidth={background.beamsBeamWidth ?? 2}
            beamHeight={background.beamsBeamHeight ?? 15}
            beamNumber={background.beamsBeamNumber ?? 12}
            lightColor={background.beamsLightColor || "#ffffff"}
            speed={background.beamsSpeed ?? 2}
            noiseIntensity={background.beamsNoiseIntensity ?? 1.75}
            scale={background.beamsScale ?? 0.2}
            rotation={background.beamsRotation ?? 0}
        />
    ),
    supportsOverlay: false,
});
