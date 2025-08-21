import { ReactNode } from "react";
import { PopOverPosition } from "../containers/divs/PopOver";
import { DisplayMode } from "@/app/(user)/[dashboard]/(sub-routes)/media-gallery/page-components/GalleryCardActions";

// Type definitions
export type BorderRadiusVariant =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "full";
export type ShadowVariant =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "inner"
  | "colored";
export type HoverShadowVariant =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "colored"
  | "glow";
export type TextSizeVariant =
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";
export type SpacingVariant =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";
export type TransitionVariant = "none" | "fast" | "normal" | "slow" | "slower";
export type HoverEffectVariant =
  | "none"
  | "scale"
  | "rotate"
  | "lift"
  | "tilt"
  | "blur"
  | "brightness"
  | "fade"
  | "glow";
export type ColorVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info";
export type TextWeightVariant =
  | "thin"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";
export type AnimationVariant =
  | "none"
  | "spin"
  | "pulse"
  | "bounce"
  | "float"
  | "shake";

export type BorderStyleVariant =
  | "none"
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "groove"
  | "ridge"
  | "inset"
  | "outset";

export interface BorderColorVariant {
  default: string;
  transparent: string;
  current: string;
  inherit: string;
  black: string;
  white: string;
  "slate-200": string;
  "slate-400": string;
  "slate-600": string;
  "slate-800": string;
  "gray-100": string;
  "gray-200": string;
  "gray-300": string;
  "gray-400": string;
  "gray-500": string;
  "gray-600": string;
  "gray-700": string;
  "gray-800": string;
  "gray-900": string;
  "zinc-200": string;
  "zinc-400": string;
  "zinc-600": string;
  "zinc-800": string;
  "stone-200": string;
  "stone-400": string;
  "stone-600": string;
  "red-100": string;
  "red-200": string;
  "red-300": string;
  "red-400": string;
  "red-500": string;
  "red-600": string;
  "red-700": string;
  "red-800": string;
  "red-900": string;
  "rose-200": string;
  "rose-500": string;
  "rose-700": string;
  "orange-100": string;
  "orange-200": string;
  "orange-300": string;
  "orange-400": string;
  "orange-500": string;
  "orange-600": string;
  "orange-700": string;
  "orange-800": string;
  "orange-900": string;
  "amber-200": string;
  "amber-500": string;
  "amber-700": string;
  "yellow-100": string;
  "yellow-200": string;
  "yellow-300": string;
  "yellow-400": string;
  "yellow-500": string;
  "yellow-600": string;
  "yellow-700": string;
  "yellow-800": string;
  "yellow-900": string;
  "lime-200": string;
  "lime-500": string;
  "lime-700": string;
  "green-100": string;
  "green-200": string;
  "green-300": string;
  "green-400": string;
  "green-500": string;
  "green-600": string;
  "green-700": string;
  "green-800": string;
  "green-900": string;
  "emerald-200": string;
  "emerald-500": string;
  "emerald-700": string;
  "teal-200": string;
  "teal-500": string;
  "teal-700": string;
  "cyan-200": string;
  "cyan-500": string;
  "cyan-700": string;
  "sky-200": string;
  "sky-500": string;
  "sky-700": string;
  "blue-100": string;
  "blue-200": string;
  "blue-300": string;
  "blue-400": string;
  "blue-500": string;
  "blue-600": string;
  "blue-700": string;
  "blue-800": string;
  "blue-900": string;
  "indigo-100": string;
  "indigo-200": string;
  "indigo-300": string;
  "indigo-400": string;
  "indigo-500": string;
  "indigo-600": string;
  "indigo-700": string;
  "indigo-800": string;
  "indigo-900": string;
  "violet-200": string;
  "violet-500": string;
  "violet-700": string;
  "purple-100": string;
  "purple-200": string;
  "purple-300": string;
  "purple-400": string;
  "purple-500": string;
  "purple-600": string;
  "purple-700": string;
  "purple-800": string;
  "purple-900": string;
  "fuchsia-200": string;
  "fuchsia-500": string;
  "fuchsia-700": string;
  "pink-100": string;
  "pink-200": string;
  "pink-300": string;
  "pink-400": string;
  "pink-500": string;
  "pink-600": string;
  "pink-700": string;
  "pink-800": string;
  "pink-900": string;
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export type ContentPosition = "bottom" | "overlay" | "none";

export interface AlbumCoverProps {
  width?: number;
  height?: number;
  aspectRatio?: string;
  showContent?: boolean;
  contentPosition?: ContentPosition;
  hoverScale?: number;
  priority?: boolean;
  quality?: number;
  borderRadius?: BorderRadiusVariant;
  shadow?: ShadowVariant;
  hoverShadow?: HoverShadowVariant;
  preserveAspectRatio?: boolean;
}

export type MediaType = "image" | "video" | "audio";

export interface ImageCardProps {
  // Core Identification Props
  id: string;
  title?: string;
  description?: string;
  alt?: string;
  role?: string;
  tabIndex?: number;
  is_public?: boolean;

  // Media Related Props
  media_type?: MediaType;
  media_url?: string;
  image_url: string | undefined;
  fallbackImage?: string;
  onImageError?: (error: unknown) => void;

  // Media Player Configuration
  videoProps?: {
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    poster?: string;
  };
  audioProps?: {
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    preload?: "none" | "metadata" | "auto";
  };

  // Layout & Sizing Props
  width?: number;
  height?: number;
  aspectRatio?: string;
  imageHeight?: string | number;
  fill?: boolean;

  // Content Display & Layout
  contentPosition?: ContentPosition;
  contentPadding?: SpacingVariant;
  showContent?: boolean;
  titleLines?: number;
  descriptionLines?: number;
  fullText?: boolean;

  // Typography Props
  titleSize?: TextSizeVariant;
  descriptionSize?: TextSizeVariant;
  titleWeight?: TextWeightVariant;
  descriptionWeight?: TextWeightVariant;

  // Styling & Appearance
  borderStyle?: BorderStyleVariant;
  borderWidth?: number;
  borderColor?: keyof BorderColorVariant | string;
  borderRadius?: BorderRadiusVariant;
  backgroundVariant?: ColorVariant;
  textVariant?: ColorVariant;
  overlayOpacity?: number;
  showGradientOverlay?: boolean;

  // Effects & Animation
  shadow?: ShadowVariant;
  hoverShadow?: HoverShadowVariant;
  transition?: TransitionVariant;
  hoverEffect?: HoverEffectVariant;
  hoverScale?: number;
  animation?: AnimationVariant;

  // Image Optimization Props
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;

  // Interaction & Behavior
  actions?: (props: Omit<ImageCardProps, "actions">) => ReactNode;
  onClick?: (props: Omit<ImageCardProps, "actions" | "onClick">) => void;
  disabled?: boolean;
  disableHover?: boolean;
  hideAction?: boolean;
  actionPosition?: PopOverPosition;
  PopoverdisplayMode?: DisplayMode;
  PopoverdisplayPosition?: PopOverPosition;

  // Loading State
  isLoading?: boolean;
  loadingHeight?: string | number;
  customLoadingContent?: ReactNode;
  loadingVariant?: ColorVariant;
  [key: string]: unknown;
}
