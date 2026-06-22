// portfolio-builder/types/sectionBackground.ts

export type SectionBackgroundType =
  | "none"
  | "solid"
  | "gradient"
  | "image"
  | "video"
  | "mesh"
  | "particles";

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

  // Overlay (shared across image/video/mesh/particles)
  overlayColor?: string;
  overlayOpacity?: number; // 0-100
}

export const defaultSectionBackground: SectionBackground = {
  type: "none",
};
