// portfolio-builder/components/shared/background/types/sectionBackground.ts

import { AntigravityParticleShapeTypes } from "../backgrounds/antigravity";

export type SectionBackgroundType =
  | "none"
  | "solid"
  | "gradient"
  | "image"
  | "video"
  | "mesh"
  | "particles"
  | "antigravity"
  | "aurora"
  | "balatro"
  | "ballpit"
  | "beams"
  | "colorBends"
  | "darkVeil"
  | "dither"
  | "dotField"
  | "dotGrid";

export type GradientType = "linear" | "radial";

export interface SectionBackground {
  type: SectionBackgroundType;

  // Solid
  color?: string;

  // Gradient (linear & radial)
  gradientType?: GradientType;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number | string; // string for legacy data
  radialPosition?: string;

  // Image
  imageUrl?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: boolean;

  // Video
  videoUrl?: string;

  // Mesh
  meshColor1?: string;
  meshColor2?: string;
  meshColor3?: string;
  meshColor4?: string;
  meshSpeed?: number;
  meshBlur?: number;
  meshSize?: number;
  meshBase?: string;
  meshOpacity?: number;

  // Particles
  particleColor?: string;
  particleCount?: number;
  particleSize?: number;
  particleSpeed?: number;
  particleOpacity?: number;
  particleLines?: boolean;
  particleLineDist?: number;
  particleBg?: string;

  // Antigravity
  antigravityColor?: string;
  antigravityCount?: number;
  antigravityMagnetRadius?: number;
  antigravityRingRadius?: number;
  antigravityWaveSpeed?: number;
  antigravityWaveAmplitude?: number;
  antigravityParticleSize?: number;
  antigravityLerpSpeed?: number;
  antigravityParticleVariance?: number;
  antigravityRotationSpeed?: number;
  antigravityDepthFactor?: number;
  antigravityPulseSpeed?: number;
  antigravityFieldStrength?: number;
  antigravityParticleShape?: AntigravityParticleShapeTypes;
  antigravityAutoAnimate?: boolean;

  // Aurora
  auroraColor1?: string;
  auroraColor2?: string;
  auroraColor3?: string;
  auroraAmplitude?: number;
  auroraBlend?: number;

  // Balatro
  balatroSpinRotation?: number;
  balatroSpinSpeed?: number;
  balatroColor1?: string;
  balatroColor2?: string;
  balatroColor3?: string;
  balatroContrast?: number;
  balatroLighting?: number;
  balatroSpinAmount?: number;
  balatroPixelFilter?: number;
  balatroIsRotate?: boolean;
  balatroMouseInteraction?: boolean;

  // Ballpit
  ballpitCount?: number;
  ballpitGravity?: number;
  ballpitFriction?: number;
  ballpitWallBounce?: number;
  ballpitFollowCursor?: boolean;
  ballpitColor1?: string;
  ballpitColor2?: string;
  ballpitColor3?: string;

  // Beams
  beamsBeamWidth?: number;
  beamsBeamHeight?: number;
  beamsBeamNumber?: number;
  beamsLightColor?: string;
  beamsSpeed?: number;
  beamsNoiseIntensity?: number;
  beamsScale?: number;
  beamsRotation?: number;

  // ColorBends
  colorBendsRotation?: number;
  colorBendsSpeed?: number;
  colorBendsColor1?: string;
  colorBendsColor2?: string;
  colorBendsColor3?: string;
  colorBendsTransparent?: boolean;
  colorBendsAutoRotate?: number;
  colorBendsScale?: number;
  colorBendsFrequency?: number;
  colorBendsWarpStrength?: number;
  colorBendsMouseInfluence?: number;
  colorBendsParallax?: number;
  colorBendsNoise?: number;
  colorBendsIterations?: number;
  colorBendsIntensity?: number;
  colorBendsBandWidth?: number;

  // DarkVeil
  darkVeilHueShift?: number;
  darkVeilNoiseIntensity?: number;
  darkVeilScanlineIntensity?: number;
  darkVeilSpeed?: number;
  darkVeilScanlineFrequency?: number;
  darkVeilWarpAmount?: number;
  darkVeilResolutionScale?: number;

  // Dither
  ditherWaveSpeed?: number;
  ditherWaveFrequency?: number;
  ditherWaveAmplitude?: number;
  ditherWaveColor?: string;
  ditherColorNum?: number;
  ditherPixelSize?: number;
  ditherDisableAnimation?: boolean;
  ditherEnableMouseInteraction?: boolean;
  ditherMouseRadius?: number;

  // DotField
  dotFieldDotRadius?: number;
  dotFieldDotSpacing?: number;
  dotFieldCursorRadius?: number;
  dotFieldCursorForce?: number;
  dotFieldBulgeOnly?: boolean;
  dotFieldBulgeStrength?: number;
  dotFieldGlowRadius?: number;
  dotFieldSparkle?: boolean;
  dotFieldWaveAmplitude?: number;
  dotFieldGradientFrom?: string;
  dotFieldGradientTo?: string;
  dotFieldGlowColor?: string;

  // DotGrid
  dotGridDotSize?: number;
  dotGridGap?: number;
  dotGridBaseColor?: string;
  dotGridActiveColor?: string;
  dotGridProximity?: number;
  dotGridSpeedTrigger?: number;
  dotGridShockRadius?: number;
  dotGridShockStrength?: number;
  dotGridMaxSpeed?: number;
  dotGridResistance?: number;
  dotGridReturnDuration?: number;

  // Overlay (shared across image/video/mesh/particles)
  overlayColor?: string;
  overlayOpacity?: number; // 0-100
}

export const defaultSectionBackground: SectionBackground = {
  type: "none",
};
