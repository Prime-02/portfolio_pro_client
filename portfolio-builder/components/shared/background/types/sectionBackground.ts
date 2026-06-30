// portfolio-builder/components/shared/background/types/sectionBackground.ts

import { AntigravityParticleShapeTypes } from "../backgrounds/antigravity";

export type SectionBackgroundType =
  | "none"
  | "image"
  | "video"
  | "solid"
  | "gradient"
  | "antigravity"
  | "aurora"
  | "balatro"
  | "ballpit"
  | "beams"
  | "colorBends"
  | "darkVeil"
  | "dither"
  | "dotField"
  | "dotGrid"
  | "faultyTerminal"
  | "floatingLines"
  | "galaxy"
  | "gradientBlinds"
  | "gridScan"
  | "hyperspeed"
  | "laserFlow"
  | "letterGlitch"
  | "lightPillar"
  | "lightRays"
  | "lightfall"
  | "lineWaves"
  | "liquidChrome"
  | "liquidEther"
  | "mesh"
  | "noise"
  | "orb"
  | "particles"
  | "pixelBlast"
  | "pixelSnow"
  | "plasma"
  | "plasmaWave"
  | "prism"
  | "prismaticBurst"
  | "radar"
  | "rippleGrid"
  | "shapeGrid"
  | "sideRays"
  | "silk"
  | "softAurora"
  | "threads"
  | "waves";

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

  // Faultyterminal
  faultyTerminalBrightness?: number;
  faultyTerminalChromaticAberration?: number;
  faultyTerminalCurvature?: number;
  faultyTerminalDigitSize?: number;
  faultyTerminalDither?: number;
  faultyTerminalFlickerAmount?: number;
  faultyTerminalGlitchAmount?: number;
  faultyTerminalMouseReact?: boolean;
  faultyTerminalMouseStrength?: number;
  faultyTerminalNoiseAmp?: number;
  faultyTerminalScale?: number;
  faultyTerminalScanlineIntensity?: number;
  faultyTerminalTint?: string;

  // Floatinglines
  floatingLinesAnimationSpeed?: number;
  floatingLinesBendRadius?: number;
  floatingLinesBendStrength?: number;
  floatingLinesInteractive?: boolean;
  floatingLinesLinesGradient1?: string;
  floatingLinesLinesGradient2?: string;
  floatingLinesLinesGradient3?: string;
  floatingLinesMouseDamping?: number;
  floatingLinesParallax?: boolean;
  floatingLinesParallaxStrength?: number;
  floatingLinesTopWavePosition?: number;
  floatingLinesMiddleWavePosition?: number;

  // Galaxy
  galaxyDensity?: number;
  galaxyGlowIntensity?: number;
  galaxyHueShift?: number;
  galaxyMouseRepulsion?: boolean;
  galaxyRepulsionStrength?: number;
  galaxyRotationSpeed?: number;
  galaxySaturation?: number;
  galaxySpeed?: number;
  galaxyStarSpeed?: number;
  galaxyTransparent?: boolean;
  galaxyTwinkleIntensity?: number;

  // Gradientblinds
  gradientBlindsAngle?: number;
  gradientBlindsBlindCount?: number;
  gradientBlindsBlindMinWidth?: number;
  gradientBlindsDistortAmount?: number;
  gradientBlindsGradientColors1?: string;
  gradientBlindsGradientColors2?: string;
  gradientBlindsMirrorGradient?: boolean;
  gradientBlindsMouseDampening?: number;
  gradientBlindsNoise?: number;
  gradientBlindsShineDirection?: string;
  gradientBlindsSpotlightOpacity?: number;
  gradientBlindsSpotlightRadius?: number;
  gradientBlindsSpotlightSoftness?: number;

  // Gridscan
  gridScanGridScale?: number;
  gridScanLineJitter?: number;
  gridScanLineStyle?: string;
  gridScanLineThickness?: number;
  gridScanLinesColor?: string;
  gridScanNoiseIntensity?: number;
  gridScanScanColor?: string;
  gridScanScanDelay?: number;
  gridScanScanDirection?: string;
  gridScanScanDuration?: number;
  gridScanScanGlow?: number;
  gridScanScanOnClick?: boolean;
  gridScanScanOpacity?: number;
  gridScanScanSoftness?: number;
  gridScanSensitivity?: number;

  // Hyperspeed
  hyperspeedPreset?: string;

  // Laserflow
  laserFlowColor?: string;
  laserFlowDecay?: number;
  laserFlowFlowSpeed?: number;
  laserFlowFlowStrength?: number;
  laserFlowFogIntensity?: number;
  laserFlowFogScale?: number;
  laserFlowHorizontalBeamOffset?: number;
  laserFlowHorizontalSizing?: number;
  laserFlowVerticalBeamOffset?: number;
  laserFlowVerticalSizing?: number;
  laserFlowWispDensity?: number;
  laserFlowWispIntensity?: number;
  laserFlowWispSpeed?: number;

  // Letterglitch
  letterGlitchCenterVignette?: boolean;
  letterGlitchGlitchColors1?: string;
  letterGlitchGlitchColors2?: string;
  letterGlitchGlitchColors3?: string;
  letterGlitchGlitchSpeed?: number;
  letterGlitchOuterVignette?: boolean;
  letterGlitchSmooth?: boolean;

  // Lightpillar
  lightPillarBottomColor?: string;
  lightPillarGlowAmount?: number;
  lightPillarIntensity?: number;
  lightPillarInteractive?: boolean;
  lightPillarNoiseIntensity?: number;
  lightPillarPillarHeight?: number;
  lightPillarPillarRotation?: number;
  lightPillarPillarWidth?: number;
  lightPillarRotationSpeed?: number;
  lightPillarTopColor?: string;

  // Lightrays
  lightRaysDistortion?: number;
  lightRaysFadeDistance?: number;
  lightRaysFollowMouse?: boolean;
  lightRaysLightSpread?: number;
  lightRaysMouseInfluence?: number;
  lightRaysNoiseAmount?: number;
  lightRaysPulsating?: boolean;
  lightRaysRayLength?: number;
  lightRaysRaysColor?: string;
  lightRaysRaysOrigin?: string;
  lightRaysRaysSpeed?: number;
  lightRaysSaturation?: number;

  // Lightfall
  lightfallBackgroundColor?: string;
  lightfallBackgroundGlow?: number;
  lightfallColors1?: string;
  lightfallColors2?: string;
  lightfallColors3?: string;
  lightfallDensity?: number;
  lightfallGlow?: number;
  lightfallMouseInteraction?: boolean;
  lightfallMouseRadius?: number;
  lightfallMouseStrength?: number;
  lightfallOpacity?: number;
  lightfallSpeed?: number;
  lightfallStreakCount?: number;
  lightfallStreakLength?: number;
  lightfallStreakWidth?: number;
  lightfallTwinkle?: number;
  lightfallZoom?: number;

  // Linewaves
  lineWavesBrightness?: number;
  lineWavesColor1?: string;
  lineWavesColor2?: string;
  lineWavesColor3?: string;
  lineWavesColorCycleSpeed?: number;
  lineWavesEdgeFadeWidth?: number;
  lineWavesEnableMouseInteraction?: boolean;
  lineWavesInnerLineCount?: number;
  lineWavesMouseInfluence?: number;
  lineWavesOuterLineCount?: number;
  lineWavesRotation?: number;
  lineWavesSpeed?: number;
  lineWavesWarpIntensity?: number;

  // Liquidchrome
  liquidChromeAmplitude?: number;
  liquidChromeFrequencyX?: number;
  liquidChromeFrequencyY?: number;
  liquidChromeInteractive?: boolean;
  liquidChromeSpeed?: number;

  // Liquidether
  liquidEtherAutoDemo?: boolean;
  liquidEtherAutoIntensity?: number;
  liquidEtherAutoSpeed?: number;
  liquidEtherColors1?: string;
  liquidEtherColors2?: string;
  liquidEtherColors3?: string;
  liquidEtherCursorSize?: number;
  liquidEtherIsBounce?: boolean;
  liquidEtherIsViscous?: boolean;
  liquidEtherMouseForce?: number;
  liquidEtherResolution?: number;
  liquidEtherViscous?: number;

  // Noise
  noisePatternAlpha?: number;
  noisePatternRefreshInterval?: number;
  noisePatternScaleX?: number;
  noisePatternScaleY?: number;
  noisePatternSize?: number;

  // Orb
  orbForceHoverState?: boolean;
  orbHoverIntensity?: number;
  orbHue?: number;
  orbRotateOnHover?: boolean;

  // Particles
  particlesAlphaParticles?: boolean;
  particlesCameraDistance?: number;
  particlesDisableRotation?: boolean;
  particlesMoveParticlesOnHover?: boolean;
  particlesParticleBaseSize?: number;
  particlesParticleColors1?: string;
  particlesParticleColors2?: string;
  particlesParticleColors3?: string;
  particlesParticleCount?: number;
  particlesParticleHoverFactor?: number;
  particlesParticleSpread?: number;
  particlesSizeRandomness?: number;
  particlesSpeed?: number;

  // Pixelblast
  pixelBlastColor?: string;
  pixelBlastEdgeFade?: number;
  pixelBlastEnableRipples?: boolean;
  pixelBlastPatternDensity?: number;
  pixelBlastPatternScale?: number;
  pixelBlastPixelSize?: number;
  pixelBlastRippleIntensityScale?: number;
  pixelBlastRippleSpeed?: number;
  pixelBlastRippleThickness?: number;
  pixelBlastSpeed?: number;
  pixelBlastTransparent?: boolean;
  pixelBlastVariant?: string;

  // Pixelsnow
  pixelSnowBrightness?: number;
  pixelSnowColor?: string;
  pixelSnowDensity?: number;
  pixelSnowDepthFade?: number;
  pixelSnowDirection?: number;
  pixelSnowFarPlane?: number;
  pixelSnowFlakeSize?: number;
  pixelSnowGamma?: number;
  pixelSnowMinFlakeSize?: number;
  pixelSnowPixelResolution?: number;
  pixelSnowSpeed?: number;
  pixelSnowVariant?: string;

  // Plasma
  plasmaColor?: string;
  plasmaDirection?: string;
  plasmaMouseInteractive?: boolean;
  plasmaOpacity?: number;
  plasmaScale?: number;
  plasmaSpeed?: number;
  plasmaWaveBend1?: number;
  plasmaWaveBend2?: number;
  plasmaWaveColors1?: string;
  plasmaWaveColors2?: string;
  plasmaWaveDir2?: number;
  plasmaWaveFocalLength?: number;
  plasmaWaveSpeed1?: number;
  plasmaWaveSpeed2?: number;

  // Prismaticburst
  prismaticBurstAnimationType?: string;
  prismaticBurstColors1?: string;
  prismaticBurstColors2?: string;
  prismaticBurstColors3?: string;
  prismaticBurstDistort?: number;
  prismaticBurstHoverDampness?: number;
  prismaticBurstIntensity?: number;
  prismaticBurstRayCount?: number;
  prismaticBurstSpeed?: number;

  //Prism
  prismAnimationType?: "rotate3d" | "rotate" | "hover";
  prismBaseWidth?: number;
  prismBloom?: number;
  prismColorFrequency?: number;
  prismGlow?: number;
  prismHeight?: number;
  prismHoverStrength?: number;
  prismHueShift?: number;
  prismInertia?: number;
  prismNoise?: number;
  prismScale?: number;
  prismTimeScale?: number;
  prismTransparent?: boolean;

  // Radar
  radarBackgroundColor?: string;
  radarBrightness?: number;
  radarColor?: string;
  radarEnableMouseInteraction?: boolean;
  radarFalloff?: number;
  radarMouseInfluence?: number;
  radarRingCount?: number;
  radarRingThickness?: number;
  radarScale?: number;
  radarSpeed?: number;
  radarSpokeCount?: number;
  radarSpokeThickness?: number;
  radarSweepLobes?: number;
  radarSweepSpeed?: number;
  radarSweepWidth?: number;

  // Ripplegrid
  rippleGridEnableRainbow?: boolean;
  rippleGridFadeDistance?: number;
  rippleGridGlowIntensity?: number;
  rippleGridGridColor?: string;
  rippleGridGridRotation?: number;
  rippleGridGridSize?: number;
  rippleGridGridThickness?: number;
  rippleGridMouseInteraction?: boolean;
  rippleGridMouseInteractionRadius?: number;
  rippleGridOpacity?: number;
  rippleGridRippleIntensity?: number;
  rippleGridVignetteStrength?: number;

  // Shapegrid
  shapeGridBorderColor?: string;
  shapeGridDirection?: string;
  shapeGridHoverFillColor?: string;
  shapeGridHoverTrailAmount?: number;
  shapeGridShape?: string;
  shapeGridSpeed?: number;
  shapeGridSquareSize?: number;

  // Siderays
  sideRaysBlend?: number;
  sideRaysFalloff?: number;
  sideRaysIntensity?: number;
  sideRaysOpacity?: number;
  sideRaysOrigin?: string;
  sideRaysRayColor1?: string;
  sideRaysRayColor2?: string;
  sideRaysSaturation?: number;
  sideRaysSpeed?: number;
  sideRaysSpread?: number;
  sideRaysTilt?: number;

  // Silk
  silkColor?: string;
  silkNoiseIntensity?: number;
  silkRotation?: number;
  silkScale?: number;
  silkSpeed?: number;

  // Softaurora
  softAuroraBandHeight?: number;
  softAuroraBandSpread?: number;
  softAuroraBrightness?: number;
  softAuroraColor1?: string;
  softAuroraColor2?: string;
  softAuroraColorSpeed?: number;
  softAuroraEnableMouseInteraction?: boolean;
  softAuroraLayerOffset?: number;
  softAuroraMouseInfluence?: number;
  softAuroraNoiseAmplitude?: number;
  softAuroraNoiseFrequency?: number;
  softAuroraOctaveDecay?: number;
  softAuroraScale?: number;
  softAuroraSpeed?: number;

  // Threads
  threadsAmplitude?: number;
  threadsColor?: number[];
  threadsDistance?: number;
  threadsEnableMouseInteraction?: boolean;

  // Waves
  wavesBackgroundColor?: string;
  wavesFriction?: number;
  wavesLineColor?: string;
  wavesMaxCursorMove?: number;
  wavesTension?: number;
  wavesWaveAmpX?: number;
  wavesWaveAmpY?: number;
  wavesWaveSpeedX?: number;
  wavesWaveSpeedY?: number;
  wavesXGap?: number;
  wavesYGap?: number;

  // Overlay (shared across image/video/mesh/particles and new backgrounds)
  overlayColor?: string;
  overlayOpacity?: number; // 0-100
}

export const defaultSectionBackground: SectionBackground = {
  type: "none",
};
