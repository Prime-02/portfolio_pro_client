// portfolio-builder/components/shared/background/backgrounds/antigravity/index.tsx

import { registerBackground } from "../../editor/BackgroundRegistry";
import Antigravity from "@/components/Antigravity"

export type AntigravityParticleShapeTypes = "capsule" | "sphere" | "box" | "tetrahedron"

registerBackground({
    type: "antigravity",
    label: "Antigravity",
    fields: [
        { kind: "color", label: "Color", key: "antigravityColor", defaultValue: "#FF9FFC" },
        { kind: "slider", label: "Count", key: "antigravityCount", defaultValue: 300, min: 50, max: 1000, step: 50 },
        { kind: "slider", label: "Magnet Radius", key: "antigravityMagnetRadius", defaultValue: 10, min: 1, max: 50, step: 1 },
        { kind: "slider", label: "Ring Radius", key: "antigravityRingRadius", defaultValue: 10, min: 1, max: 50, step: 1 },
        { kind: "slider", label: "Wave Speed", key: "antigravityWaveSpeed", defaultValue: 0.4, min: 0.1, max: 2, step: 0.1 },
        { kind: "slider", label: "Wave Amplitude", key: "antigravityWaveAmplitude", defaultValue: 1, min: 0, max: 5, step: 0.5 },
        { kind: "slider", label: "Particle Size", key: "antigravityParticleSize", defaultValue: 2, min: 0.5, max: 10, step: 0.5 },
        { kind: "slider", label: "Lerp Speed", key: "antigravityLerpSpeed", defaultValue: 0.1, min: 0.01, max: 1, step: 0.01 },
        { kind: "slider", label: "Particle Variance", key: "antigravityParticleVariance", defaultValue: 1, min: 0, max: 5, step: 0.5 },
        { kind: "slider", label: "Rotation Speed", key: "antigravityRotationSpeed", defaultValue: 0, min: -2, max: 2, step: 0.1 },
        { kind: "slider", label: "Depth Factor", key: "antigravityDepthFactor", defaultValue: 1, min: 0, max: 3, step: 0.1 },
        { kind: "slider", label: "Pulse Speed", key: "antigravityPulseSpeed", defaultValue: 3, min: 0, max: 10, step: 0.5 },
        { kind: "slider", label: "Field Strength", key: "antigravityFieldStrength", defaultValue: 10, min: 1, max: 50, step: 1 },
        {
            kind: "dropdown",
            label: "Particle Shape",
            key: "antigravityParticleShape",
            defaultValue: "capsule",
            options: [
                { id: "sphere", code: "Sphere" },
                { id: "box", code: "Box" },
                { id: "capsule", code: "Capsule" },
                { id: "tetrahedron", code: "Tetrahedron" },
            ],
        },
        { kind: "checkbox", label: "Auto Animate", key: "antigravityAutoAnimate", defaultValue: false },
    ],
    defaults: {
        type: "antigravity",
        antigravityColor: "#FF9FFC",
        antigravityCount: 300,
        antigravityMagnetRadius: 10,
        antigravityRingRadius: 10,
        antigravityWaveSpeed: 0.4,
        antigravityWaveAmplitude: 1,
        antigravityParticleSize: 2,
        antigravityLerpSpeed: 0.1,
        antigravityParticleVariance: 1,
        antigravityRotationSpeed: 0,
        antigravityDepthFactor: 1,
        antigravityPulseSpeed: 3,
        antigravityFieldStrength: 10,
        antigravityParticleShape: "capsule",
        antigravityAutoAnimate: false,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <Antigravity
                count={background.antigravityCount ?? 300}
                magnetRadius={background.antigravityMagnetRadius ?? 10}
                ringRadius={background.antigravityRingRadius ?? 10}
                waveSpeed={background.antigravityWaveSpeed ?? 0.4}
                waveAmplitude={background.antigravityWaveAmplitude ?? 1}
                particleSize={background.antigravityParticleSize ?? 2}
                lerpSpeed={background.antigravityLerpSpeed ?? 0.1}
                color={background.antigravityColor || "#FF9FFC"}
                autoAnimate={background.antigravityAutoAnimate ?? false}
                particleVariance={background.antigravityParticleVariance ?? 1}
                rotationSpeed={background.antigravityRotationSpeed ?? 0}
                depthFactor={background.antigravityDepthFactor ?? 1}
                pulseSpeed={background.antigravityPulseSpeed ?? 3}
                particleShape={background.antigravityParticleShape || "capsule"}
                fieldStrength={background.antigravityFieldStrength ?? 10}
            />
        </div>
    ),
    supportsOverlay: true,
});