// portfolio-builder/components/shared/background/backgrounds/particles/index.ts

import { ParticlesBackground } from "@/portfolio-builder/components/sections/hero/renderer-components/ParticlesBackground";
import { registerBackground } from "../../editor/BackgroundRegistry";


registerBackground({
  type: "particles",
  label: "Particles",
  fields: [
    { kind: "color", label: "Particle Color", key: "particleColor", defaultValue: "#ffffff" },
    { kind: "color", label: "Background Color", key: "particleBg", defaultValue: "#0a0a0a" },
    { kind: "slider", label: "Count", key: "particleCount", defaultValue: 80, min: 10, max: 300, step: 10 },
    { kind: "slider", label: "Size", key: "particleSize", defaultValue: 2, min: 0.5, max: 10, step: 0.5, unit: "px" },
    { kind: "slider", label: "Speed", key: "particleSpeed", defaultValue: 0.5, min: 0.1, max: 5, step: 0.1 },
    { kind: "slider", label: "Opacity", key: "particleOpacity", defaultValue: 0.6, min: 0.05, max: 1, step: 0.05 },
    { kind: "slider", label: "Connection Distance", key: "particleLineDist", defaultValue: 120, min: 50, max: 300, step: 10, unit: "px" },
    { kind: "checkbox", label: "Show connection lines", key: "particleLines", defaultValue: true },
  ],
  defaults: {
    type: "particles",
    particleColor: "#ffffff",
    particleBg: "#0a0a0a",
    particleCount: 80,
    particleSize: 2,
    particleSpeed: 0.5,
    particleOpacity: 0.6,
    particleLines: true,
    particleLineDist: 120,
    overlayColor: "#0a0a0a",
    overlayOpacity: 0,
  },
  renderer: ({ background }) => (
    <ParticlesBackground
      color={background.particleColor || "var(--pb-foreground)"}
      count={background.particleCount ?? 80}
      size={background.particleSize ?? 2}
      speed={background.particleSpeed ?? 0.5}
      opacity={background.particleOpacity ?? 0.6}
      lines={background.particleLines ?? true}
      lineDist={background.particleLineDist ?? 120}
      bgColor={background.particleBg || "var(--pb-background)"}
      overlayColor={background.overlayColor || "var(--pb-background)"}
      overlayOpacity={background.overlayOpacity ?? 0}
    />
  ),
  supportsOverlay: true,
});
