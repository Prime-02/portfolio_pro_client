import { ReactNode } from "react";
import { PopOverPosition } from "../containers/divs/PopOver";

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

export type BorderColorVariant =
  | "transparent"
  | "default"
  | "current"
  | "black"
  | "white"
  | "gray-100"
  | "gray-200"
  | "gray-300"
  | "gray-400"
  | "gray-500"
  | "gray-600"
  | "gray-700"
  | "gray-800"
  | "gray-900"
  | "red-100"
  | "red-200"
  | "red-300"
  | "red-400"
  | "red-500"
  | "red-600"
  | "red-700"
  | "red-800"
  | "red-900"
  | "orange-100"
  | "orange-200"
  | "orange-300"
  | "orange-400"
  | "orange-500"
  | "orange-600"
  | "orange-700"
  | "orange-800"
  | "orange-900"
  | "yellow-100"
  | "yellow-200"
  | "yellow-300"
  | "yellow-400"
  | "yellow-500"
  | "yellow-600"
  | "yellow-700"
  | "yellow-800"
  | "yellow-900"
  | "green-100"
  | "green-200"
  | "green-300"
  | "green-400"
  | "green-500"
  | "green-600"
  | "green-700"
  | "green-800"
  | "green-900"
  | "blue-100"
  | "blue-200"
  | "blue-300"
  | "blue-400"
  | "blue-500"
  | "blue-600"
  | "blue-700"
  | "blue-800"
  | "blue-900"
  | "indigo-100"
  | "indigo-200"
  | "indigo-300"
  | "indigo-400"
  | "indigo-500"
  | "indigo-600"
  | "indigo-700"
  | "indigo-800"
  | "indigo-900"
  | "purple-100"
  | "purple-200"
  | "purple-300"
  | "purple-400"
  | "purple-500"
  | "purple-600"
  | "purple-700"
  | "purple-800"
  | "purple-900"
  | "pink-100"
  | "pink-200"
  | "pink-300"
  | "pink-400"
  | "pink-500"
  | "pink-600"
  | "pink-700"
  | "pink-800"
  | "pink-900"
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface AlbumCoverProps {
  width?: number;
  height?: number;
  aspectRatio?: string;
  showContent?: boolean;
  contentPosition?: "bottom" | "overlay" | "none";
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

  // Media Related Props
  media_type?: MediaType;
  media_url?: string;
  image_url: string | undefined;
  fallbackImage?: string;
  onImageError?: (error: any) => void;

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
  contentPosition?: "bottom" | "overlay" | "none";
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
  borderColor?: BorderColorVariant | string;
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

  // Loading State
  isLoading?: boolean;
  loadingHeight?: string | number;
  customLoadingContent?: ReactNode;
  loadingVariant?: ColorVariant;
}