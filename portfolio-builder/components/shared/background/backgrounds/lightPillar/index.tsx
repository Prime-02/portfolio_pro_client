import { registerBackground } from "../../editor/BackgroundRegistry";
import LightPillar from "@/components/LightPillar";

registerBackground({
    type: "lightPillar",
    label: "LightPillar",
    fields: [
        { kind: "color", label: "Bottom Color", key: "lightPillarBottomColor", defaultValue: "#FF9FFC" },
        { kind: "slider", label: "Glow Amount", key: "lightPillarGlowAmount", defaultValue: 0.005, min: 0, max: 0.02, step: 0.001 },
        { kind: "slider", label: "Intensity", key: "lightPillarIntensity", defaultValue: 1, min: 0, max: 10, step: 1 },
        { kind: "checkbox", label: "Interactive", key: "lightPillarInteractive", defaultValue: false },
        { kind: "slider", label: "Noise Intensity", key: "lightPillarNoiseIntensity", defaultValue: 0.5, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Pillar Height", key: "lightPillarPillarHeight", defaultValue: 0.4, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Pillar Rotation", key: "lightPillarPillarRotation", defaultValue: 0, min: -360, max: 360, step: 1 },
        { kind: "slider", label: "Pillar Width", key: "lightPillarPillarWidth", defaultValue: 3, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Rotation Speed", key: "lightPillarRotationSpeed", defaultValue: 0.3, min: 0, max: 10, step: 0.1 },
        { kind: "color", label: "Top Color", key: "lightPillarTopColor", defaultValue: "#5227FF" },
    ],
    defaults: {
        type: "lightPillar",
        lightPillarBottomColor: "#FF9FFC",
        lightPillarGlowAmount: 0.005,
        lightPillarIntensity: 1,
        lightPillarInteractive: false,
        lightPillarNoiseIntensity: 0.5,
        lightPillarPillarHeight: 0.4,
        lightPillarPillarRotation: 0,
        lightPillarPillarWidth: 3,
        lightPillarRotationSpeed: 0.3,
        lightPillarTopColor: "#5227FF",
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={ { position: "absolute", inset: 0, width: "100%", height: "100%" } }>
            <LightPillar
                bottomColor={background.lightPillarBottomColor || "#FF9FFC"}
                glowAmount={background.lightPillarGlowAmount ?? 0.005}
                intensity={background.lightPillarIntensity ?? 1}
                interactive={background.lightPillarInteractive ?? false}
                noiseIntensity={background.lightPillarNoiseIntensity ?? 0.5}
                pillarHeight={background.lightPillarPillarHeight ?? 0.4}
                pillarRotation={background.lightPillarPillarRotation ?? 0}
                pillarWidth={background.lightPillarPillarWidth ?? 3}
                rotationSpeed={background.lightPillarRotationSpeed ?? 0.3}
                topColor={background.lightPillarTopColor || "#5227FF"}
            />
        </div>
    ),
    supportsOverlay: true,
});
