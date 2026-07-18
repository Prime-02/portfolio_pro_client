import { registerBackground } from "../../editor/BackgroundRegistry";
import Particles from "@/components/Particles";

registerBackground({
    type: "particles",
    label: "Particles",
    fields: [
        { kind: "checkbox", label: "Alpha Particles", key: "particlesAlphaParticles", defaultValue: true },
        { kind: "slider", label: "Camera Distance", key: "particlesCameraDistance", defaultValue: 20, min: 0, max: 50, step: 1 },
        { kind: "checkbox", label: "Disable Rotation", key: "particlesDisableRotation", defaultValue: true },
        { kind: "checkbox", label: "Move Particles On Hover", key: "particlesMoveParticlesOnHover", defaultValue: true },
        { kind: "slider", label: "Particle Base Size", key: "particlesParticleBaseSize", defaultValue: 100, min: 0, max: 100, step: 1 },
        {
            kind: "group", label: "Particle Colors", fields: [
                { kind: "color", label: "Color 1", key: "particlesParticleColors1", defaultValue: "#ffffff" },
                { kind: "color", label: "Color 2", key: "particlesParticleColors2", defaultValue: "#ffffff" },
                { kind: "color", label: "Color 3", key: "particlesParticleColors3", defaultValue: "#ffffff" }
            ]
        },
        { kind: "slider", label: "Particle Count", key: "particlesParticleCount", defaultValue: 200, min: 10, max: 2000, step: 10 },
        { kind: "slider", label: "Particle Hover Factor", key: "particlesParticleHoverFactor", defaultValue: 1, min: 0, max: 20, step: 1 },
        { kind: "slider", label: "Particle Spread", key: "particlesParticleSpread", defaultValue: 10, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Size Randomness", key: "particlesSizeRandomness", defaultValue: 1, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Speed", key: "particlesSpeed", defaultValue: 0.1, min: 0, max: 10, step: 0.1 },
    ],
    defaults: {
        type: "particles",
        particlesAlphaParticles: true,
        particlesCameraDistance: 20,
        particlesDisableRotation: true,
        particlesMoveParticlesOnHover: true,
        particlesParticleBaseSize: 100,
        particlesParticleColors1: "#ffffff",
        particlesParticleColors2: "#ffffff",
        particlesParticleColors3: "#ffffff",
        particlesParticleCount: 200,
        particlesParticleHoverFactor: 1,
        particlesParticleSpread: 10,
        particlesSizeRandomness: 1,
        particlesSpeed: 0.1,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Particles
                className=""
                alphaParticles={background.particlesAlphaParticles ?? true}
                cameraDistance={background.particlesCameraDistance ?? 20}
                disableRotation={background.particlesDisableRotation ?? true}
                moveParticlesOnHover={background.particlesMoveParticlesOnHover ?? true}
                particleBaseSize={background.particlesParticleBaseSize ?? 100}
                particleColors={[background.particlesParticleColors1 || '#ffffff', background.particlesParticleColors2 || '#ffffff', background.particlesParticleColors3 || '#ffffff']}
                particleCount={background.particlesParticleCount ?? 200}
                particleHoverFactor={background.particlesParticleHoverFactor ?? 1}
                particleSpread={background.particlesParticleSpread ?? 10}
                sizeRandomness={background.particlesSizeRandomness ?? 1}
                speed={background.particlesSpeed ?? 0.1}
            />
        </div>
    ),
    supportsOverlay: true,
});