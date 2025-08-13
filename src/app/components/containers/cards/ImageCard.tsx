import React, { ReactNode } from "react";
import Image from "next/image";

// Predefined style enums
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
  | "drop"
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
export type SizeVariant =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";
export type ColorVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "rose"
  | "purple"
  | "indigo"
  | "cyan"
  | "emerald"
  | "amber";
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
export type BorderVariant =
  | "none"
  | "thin"
  | "medium"
  | "thick"
  | "dashed"
  | "dotted"
  | "double";
export type TransitionVariant = "none" | "fast" | "normal" | "slow" | "slower";
export type HoverEffectVariant =
  | "none"
  | "scale"
  | "rotate"
  | "skew"
  | "lift"
  | "tilt"
  | "blur"
  | "brightness"
  | "saturate"
  | "grayscale"
  | "sepia"
  | "hue-rotate"
  | "float"
  | "pulse"
  | "bounce"
  | "wiggle"
  | "shake"
  | "flip"
  | "slide-up"
  | "slide-down"
  | "zoom-in"
  | "zoom-out"
  | "fade"
  | "glow"
  | "rainbow";
export type GradientVariant =
  | "none"
  | "subtle"
  | "vibrant"
  | "rainbow"
  | "sunset"
  | "ocean"
  | "forest"
  | "cosmic"
  | "fire"
  | "ice"
  | "neon"
  | "pastel"
  | "dark";
export type BlendModeVariant =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "color-dodge"
  | "color-burn"
  | "darken"
  | "lighten"
  | "difference"
  | "exclusion";
export type TextWeightVariant =
  | "thin"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";
export type OpacityVariant =
  | "0"
  | "5"
  | "10"
  | "20"
  | "25"
  | "30"
  | "40"
  | "50"
  | "60"
  | "70"
  | "75"
  | "80"
  | "90"
  | "95"
  | "100";
export type BackdropVariant =
  | "none"
  | "blur-sm"
  | "blur-md"
  | "blur-lg"
  | "blur-xl"
  | "brightness"
  | "contrast"
  | "grayscale"
  | "hue-rotate"
  | "invert"
  | "saturate"
  | "sepia";
export type AnimationVariant =
  | "none"
  | "spin"
  | "ping"
  | "pulse"
  | "bounce"
  | "float"
  | "swing"
  | "wobble"
  | "slide"
  | "fade-in"
  | "zoom-in"
  | "flip"
  | "shake"
  | "heartbeat"
  | "flash"
  | "rubber-band"
  | "jello"
  | "roll"
  | "rotate-in";

// Predefined style mappings
const BORDER_RADIUS_STYLES: Record<BorderRadiusVariant, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

const SHADOW_STYLES: Record<ShadowVariant, string> = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  inner: "shadow-inner",
  drop: "drop-shadow-lg",
  colored: "shadow-lg shadow-blue-500/25",
};

const HOVER_SHADOW_STYLES: Record<HoverShadowVariant, string> = {
  none: "",
  sm: "hover:shadow-sm",
  md: "hover:shadow-md",
  lg: "hover:shadow-lg",
  xl: "hover:shadow-xl",
  "2xl": "hover:shadow-2xl",
  colored: "hover:shadow-xl hover:shadow-blue-500/30",
  glow: "hover:shadow-2xl hover:shadow-blue-400/50 hover:drop-shadow-lg",
};

const TEXT_SIZE_STYLES: Record<TextSizeVariant, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

const SPACING_STYLES: Record<SpacingVariant, string> = {
  none: "p-0",
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-10",
  "3xl": "p-12",
};

const BACKGROUND_STYLES: Record<ColorVariant, string> = {
  primary: "bg-blue-50 dark:bg-blue-900/20",
  secondary: "bg-gray-50 dark:bg-gray-900/20",
  accent: "bg-purple-50 dark:bg-purple-900/20",
  neutral: "bg-neutral-50 dark:bg-neutral-900/20",
  success: "bg-green-50 dark:bg-green-900/20",
  warning: "bg-yellow-50 dark:bg-yellow-900/20",
  error: "bg-red-50 dark:bg-red-900/20",
  info: "bg-sky-50 dark:bg-sky-900/20",
  rose: "bg-rose-50 dark:bg-rose-900/20",
  purple: "bg-purple-50 dark:bg-purple-900/20",
  indigo: "bg-indigo-50 dark:bg-indigo-900/20",
  cyan: "bg-cyan-50 dark:bg-cyan-900/20",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20",
  amber: "bg-amber-50 dark:bg-amber-900/20",
};

const TEXT_COLOR_STYLES: Record<ColorVariant, string> = {
  primary: "text-blue-900 dark:text-blue-100",
  secondary: "text-gray-900 dark:text-gray-100",
  accent: "text-purple-900 dark:text-purple-100",
  neutral: "text-neutral-900 dark:text-neutral-100",
  success: "text-green-900 dark:text-green-100",
  warning: "text-yellow-900 dark:text-yellow-100",
  error: "text-red-900 dark:text-red-100",
  info: "text-sky-900 dark:text-sky-100",
  rose: "text-rose-900 dark:text-rose-100",
  purple: "text-purple-900 dark:text-purple-100",
  indigo: "text-indigo-900 dark:text-indigo-100",
  cyan: "text-cyan-900 dark:text-cyan-100",
  emerald: "text-emerald-900 dark:text-emerald-100",
  amber: "text-amber-900 dark:text-amber-100",
};

const LOADING_BACKGROUND_STYLES: Record<ColorVariant, string> = {
  primary: "bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200",
  secondary: "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200",
  accent: "bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200",
  neutral: "bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200",
  success: "bg-gradient-to-r from-green-200 via-green-300 to-green-200",
  warning: "bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200",
  error: "bg-gradient-to-r from-red-200 via-red-300 to-red-200",
  info: "bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200",
  rose: "bg-gradient-to-r from-rose-200 via-rose-300 to-rose-200",
  purple: "bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200",
  indigo: "bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-200",
  cyan: "bg-gradient-to-r from-cyan-200 via-cyan-300 to-cyan-200",
  emerald: "bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200",
  amber: "bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200",
};

const BORDER_STYLES: Record<BorderVariant, string> = {
  none: "border-0",
  thin: "border border-[var(--accent)] ",
  medium: "border-2 border-[var(--accent)] ",
  thick: "border-4 border-[var(--accent)] ",
  dashed: "border-2 border-dashed border-[var(--accent)] ",
  dotted: "border-2 border-dotted border-[var(--accent)] ",
  double: "border-4 border-double border-[var(--accent)] ",
};

const TRANSITION_STYLES: Record<TransitionVariant, string> = {
  none: "",
  fast: "duration-150",
  normal: "duration-300",
  slow: "duration-500",
  slower: "duration-700",
};

const HOVER_EFFECT_STYLES: Record<HoverEffectVariant, string> = {
  none: "",
  scale: "hover:scale-105",
  rotate: "hover:rotate-3",
  skew: "hover:skew-y-3",
  lift: "hover:-translate-y-2",
  tilt: "hover:rotate-6 hover:scale-105",
  blur: "hover:blur-sm",
  brightness: "hover:brightness-110",
  saturate: "hover:saturate-150",
  grayscale: "hover:grayscale",
  sepia: "hover:sepia",
  "hue-rotate": "hover:hue-rotate-30",
  float: "hover:animate-bounce",
  pulse: "hover:animate-pulse",
  bounce: "hover:animate-bounce",
  wiggle: "hover:animate-ping",
  shake: "hover:animate-spin",
  flip: "hover:rotate-180",
  "slide-up": "hover:-translate-y-4",
  "slide-down": "hover:translate-y-4",
  "zoom-in": "hover:scale-125",
  "zoom-out": "hover:scale-75",
  fade: "hover:opacity-75",
  glow: "hover:drop-shadow-2xl hover:filter hover:brightness-110",
  rainbow: "hover:animate-pulse hover:hue-rotate-90",
};

const GRADIENT_STYLES: Record<GradientVariant, string> = {
  none: "",
  subtle:
    "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900",
  vibrant: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500",
  rainbow:
    "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
  sunset: "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600",
  ocean: "bg-gradient-to-br from-blue-400 via-blue-600 to-cyan-600",
  forest: "bg-gradient-to-br from-green-400 via-green-600 to-emerald-600",
  cosmic: "bg-gradient-to-br from-purple-400 via-pink-500 to-red-500",
  fire: "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600",
  ice: "bg-gradient-to-br from-blue-200 via-cyan-200 to-blue-300",
  neon: "bg-gradient-to-br from-lime-400 via-green-400 to-emerald-400",
  pastel: "bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200",
  dark: "bg-gradient-to-br from-gray-700 via-gray-800 to-black",
};

const BLEND_MODE_STYLES: Record<BlendModeVariant, string> = {
  normal: "mix-blend-normal",
  multiply: "mix-blend-multiply",
  screen: "mix-blend-screen",
  overlay: "mix-blend-overlay",
  "soft-light": "mix-blend-soft-light",
  "hard-light": "mix-blend-hard-light",
  "color-dodge": "mix-blend-color-dodge",
  "color-burn": "mix-blend-color-burn",
  darken: "mix-blend-darken",
  lighten: "mix-blend-lighten",
  difference: "mix-blend-difference",
  exclusion: "mix-blend-exclusion",
};

const TEXT_WEIGHT_STYLES: Record<TextWeightVariant, string> = {
  thin: "font-thin",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
};

const OPACITY_STYLES: Record<OpacityVariant, string> = {
  "0": "opacity-0",
  "5": "opacity-5",
  "10": "opacity-10",
  "20": "opacity-20",
  "25": "opacity-25",
  "30": "opacity-30",
  "40": "opacity-40",
  "50": "opacity-50",
  "60": "opacity-60",
  "70": "opacity-70",
  "75": "opacity-75",
  "80": "opacity-80",
  "90": "opacity-90",
  "95": "opacity-95",
  "100": "opacity-100",
};

const BACKDROP_STYLES: Record<BackdropVariant, string> = {
  none: "",
  "blur-sm": "backdrop-blur-sm",
  "blur-md": "backdrop-blur-md",
  "blur-lg": "backdrop-blur-lg",
  "blur-xl": "backdrop-blur-xl",
  brightness: "backdrop-brightness-110",
  contrast: "backdrop-contrast-125",
  grayscale: "backdrop-grayscale",
  "hue-rotate": "backdrop-hue-rotate-15",
  invert: "backdrop-invert",
  saturate: "backdrop-saturate-150",
  sepia: "backdrop-sepia",
};

const ANIMATION_STYLES: Record<AnimationVariant, string> = {
  none: "",
  spin: "animate-spin",
  ping: "animate-ping",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
  float: "hover:animate-bounce",
  swing: "hover:animate-pulse",
  wobble: "hover:animate-ping",
  slide: "transition-transform hover:translate-x-2",
  "fade-in": "animate-pulse",
  "zoom-in": "hover:scale-110 transition-transform",
  flip: "hover:rotate-180 transition-transform",
  shake: "hover:animate-pulse",
  heartbeat: "animate-ping",
  flash: "animate-pulse",
  "rubber-band": "hover:scale-110 hover:skew-x-12 transition-transform",
  jello: "hover:skew-x-12 hover:skew-y-3 transition-transform",
  roll: "hover:rotate-360 transition-transform",
  "rotate-in": "hover:rotate-45 transition-transform",
};

export interface ImageCardProps {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  actions?: (props: Omit<ImageCardProps, "actions">) => ReactNode;
  isLoading?: boolean;
  onClick?: (props: Omit<ImageCardProps, "actions" | "onClick">) => void;

  // Layout & Sizing Props
  width?: number;
  height?: number;
  aspectRatio?: string;
  imageHeight?: string | number;

  // Enhanced Styling Props
  borderRadius?: BorderRadiusVariant;
  shadow?: ShadowVariant;
  hoverShadow?: HoverShadowVariant;
  titleSize?: TextSizeVariant;
  descriptionSize?: TextSizeVariant;
  contentPadding?: SpacingVariant;
  border?: BorderVariant;
  transition?: TransitionVariant;
  hoverEffect?: HoverEffectVariant;
  gradient?: GradientVariant;
  blendMode?: BlendModeVariant;
  titleWeight?: TextWeightVariant;
  descriptionWeight?: TextWeightVariant;
  overlayOpacity?: OpacityVariant;
  backdrop?: BackdropVariant;
  animation?: AnimationVariant;

  // Content Props
  titleLines?: number;
  descriptionLines?: number;
  fullText?: boolean;
  showContent?: boolean;
  contentPosition?: "bottom" | "overlay" | "none";

  // Animation & Effects Props
  hoverScale?: number;
  transitionDuration?: string;
  showGradientOverlay?: boolean;

  // Loading Props
  loadingHeight?: string | number;
  customLoadingContent?: ReactNode;
  loadingVariant?: ColorVariant;

  // Accessibility Props
  alt?: string;
  role?: string;
  tabIndex?: number;

  // Image Optimization Props
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;

  // Interaction Props
  disabled?: boolean;
  disableHover?: boolean;

  // Error Handling Props
  fallbackImage?: string;
  onImageError?: (error: any) => void;

  // Background & Colors
  backgroundVariant?: ColorVariant;
  textVariant?: ColorVariant;
  useGradientBackground?: boolean;
}

const ImageCard = (props: ImageCardProps) => {
  const {
    actions,
    isLoading = false,
    onClick,

    // Layout & Sizing
    width = 400,
    height = 300,
    aspectRatio,
    imageHeight = "auto",

    // Enhanced Styling
    borderRadius = "2xl",
    shadow = "sm",
    hoverShadow = "lg",
    titleSize = "base",
    descriptionSize = "sm",
    contentPadding = "md",
    border = "none",
    transition = "normal",
    hoverEffect = "scale",
    gradient = "none",
    blendMode = "normal",
    titleWeight = "semibold",
    descriptionWeight = "normal",
    overlayOpacity = "50",
    backdrop = "none",
    animation = "none",

    // Content
    titleLines = 1,
    descriptionLines = 2,
    fullText = false,
    showContent = true,
    contentPosition = "overlay",

    // Animation & Effects
    hoverScale = 1.05,
    transitionDuration = "duration-300",
    showGradientOverlay = true,

    // Loading
    loadingHeight = "12rem",
    customLoadingContent,
    loadingVariant = "secondary",

    // Accessibility
    alt,
    role,
    tabIndex,

    // Image Optimization
    priority = false,
    quality = 75,
    placeholder = "empty",
    blurDataURL,
    sizes,
    fill = false,

    // Interaction
    disabled = false,
    disableHover = false,

    // Error Handling
    fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='18' fill='%239ca3af' text-anchor='middle'%3EImage not found%3C/text%3E%3C/svg%3E",
    onImageError,

    // Background & Colors
    backgroundVariant = "neutral",
    textVariant = "neutral",
    useGradientBackground = false,

    ...cardProps
  } = props;

  // Get styles from enums
  const borderRadiusStyle = BORDER_RADIUS_STYLES[borderRadius];
  const shadowStyle = SHADOW_STYLES[shadow];
  const hoverShadowStyle = HOVER_SHADOW_STYLES[hoverShadow];
  const backgroundStyle = useGradientBackground
    ? GRADIENT_STYLES[gradient] || BACKGROUND_STYLES[backgroundVariant]
    : BACKGROUND_STYLES[backgroundVariant];
  const textColorStyle = TEXT_COLOR_STYLES[textVariant];
  const loadingBackgroundStyle = LOADING_BACKGROUND_STYLES[loadingVariant];
  const titleSizeStyle = TEXT_SIZE_STYLES[titleSize];
  const descriptionSizeStyle = TEXT_SIZE_STYLES[descriptionSize];
  const contentPaddingStyle = SPACING_STYLES[contentPadding];
  const borderStyle = BORDER_STYLES[border];
  const transitionStyle = TRANSITION_STYLES[transition];
  const hoverEffectStyle = HOVER_EFFECT_STYLES[hoverEffect];
  const gradientStyle = GRADIENT_STYLES[gradient];
  const blendModeStyle = BLEND_MODE_STYLES[blendMode];
  const titleWeightStyle = TEXT_WEIGHT_STYLES[titleWeight];
  const descriptionWeightStyle = TEXT_WEIGHT_STYLES[descriptionWeight];
  const overlayOpacityStyle = OPACITY_STYLES[overlayOpacity];
  const backdropStyle = BACKDROP_STYLES[backdrop];
  const animationStyle = ANIMATION_STYLES[animation];

  // Custom loading content or default loading placeholder
  if (isLoading) {
    if (customLoadingContent) {
      return (
        <div className={`${borderRadiusStyle} ${animationStyle}`}>
          {customLoadingContent}
        </div>
      );
    }

    return (
      <div
        className={`${backgroundStyle} ${borderRadiusStyle} ${shadowStyle} ${borderStyle} overflow-hidden animate-pulse ${animationStyle}`}
      >
        {/* Image Placeholder */}
        <div className="relative overflow-hidden">
          <div
            className={`w-full ${loadingBackgroundStyle} animate-gradient-x`}
            style={{
              height:
                typeof loadingHeight === "number"
                  ? `${loadingHeight}px`
                  : loadingHeight,
            }}
          />
        </div>

        {/* Content Placeholder */}
        {showContent && contentPosition === "bottom" && (
          <div className={`${contentPaddingStyle} space-y-3`}>
            {/* Title placeholder */}
            <div
              className={`h-4 ${loadingBackgroundStyle} ${borderRadiusStyle} animate-gradient-x w-3/4`}
            />

            {/* Description placeholder lines */}
            <div className="space-y-2">
              <div
                className={`h-3 ${loadingBackgroundStyle} ${borderRadiusStyle} animate-gradient-x w-full`}
              />
              <div
                className={`h-3 ${loadingBackgroundStyle} ${borderRadiusStyle} animate-gradient-x w-2/3`}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Determine if the card should be clickable
  const isClickable = !isLoading && !disabled && props.image_url && onClick;

  // Stop propagation for action clicks
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle card click
  const handleCardClick = () => {
    if (isClickable && onClick) {
      onClick(cardProps);
    }
  };

  // Handle image error
  const handleImageError = (error: any) => {
    if (onImageError) {
      onImageError(error);
    }
  };
  

  // Generate line clamp classes
  const getTitleLineClamp = () =>
    !fullText && titleLines > 0 ? `line-clamp-${titleLines}` : "";
  const getDescriptionLineClamp = () =>
    !fullText && descriptionLines > 0 ? `line-clamp-${descriptionLines}` : "";

  // Generate hover scale transform (fallback for custom hover effects)
  const getHoverTransform = () =>
    !disableHover && hoverEffect === "none"
      ? `group-hover:scale-[${hoverScale}]`
      : "";

  const cardClasses = `
    ${backgroundStyle} 
    ${borderRadiusStyle} 
    ${shadowStyle} 
    ${borderStyle}
    ${!disableHover ? hoverShadowStyle : ""} 
    ${!disableHover ? hoverEffectStyle : ""}
    ${blendModeStyle}
    ${backdropStyle}
    transition-all 
    ${transitionStyle || transitionDuration}
    overflow-hidden 
    group 
    ${animationStyle}
    ${isClickable ? "cursor-pointer" : disabled ? "cursor-not-allowed" : "cursor-default"}
    ${disabled ? "opacity-50" : ""}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <div
      className={cardClasses}
      onClick={!disabled ? handleCardClick : undefined}
      role={role}
      tabIndex={!disabled ? tabIndex : -1}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Image Container */}
      <div
        className="relative overflow-hidden"
        style={aspectRatio ? { flex: 1 } : undefined}
      >
        {fill ? (
          <Image
            src={props.image_url}
            alt={alt || props.title || "Image"}
            fill
            className={`object-cover transition-transform ${transitionStyle || transitionDuration} ${getHoverTransform()}`}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            sizes={sizes}
            onError={handleImageError}
          />
        ) : (
          <div
            style={{
              height:
                typeof imageHeight === "number"
                  ? `${imageHeight}px`
                  : imageHeight,
            }}
          >
            <Image
              src={props.image_url}
              alt={alt || props.title || "Image"}
              width={width}
              height={height}
              className={`w-full h-full object-cover transition-transform ${transitionStyle || transitionDuration} ${getHoverTransform()}`}
              priority={priority}
              quality={quality}
              placeholder={placeholder}
              blurDataURL={blurDataURL}
              sizes={sizes}
              onError={handleImageError}
            />
          </div>
        )}

        {/* Actions Overlay */}
        {actions && (
          <div
            className={`absolute top-3 right-3 z-30 opacity-0 ${!disableHover ? "group-hover:opacity-100" : ""} transition-opacity ${transitionStyle || transitionDuration}`}
            onClick={handleActionClick}
          >
            {actions(cardProps)}
          </div>
        )}

        {showGradientOverlay &&
          contentPosition === "overlay" &&
          (props.title || props.description) && (
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/${overlayOpacity} via-transparent to-transparent z-20`}
            />
          )}

        {/* Overlay Content */}
        {showContent &&
          contentPosition === "overlay" &&
          (props.title || props.description) && (
            <div
              className={`absolute bottom-0 left-0 right-0 ${contentPaddingStyle} text-white z-20 ${backdropStyle}`}
            >
              {props.title && (
                <h3
                  className={`${titleWeightStyle} ${titleSizeStyle} mb-2 ${getTitleLineClamp()} leading-tight`}
                >
                  {props.title}
                </h3>
              )}

              {props.description && (
                <p
                  className={`${descriptionWeightStyle} ${descriptionSizeStyle} ${getDescriptionLineClamp()} leading-relaxed opacity-90`}
                >
                  {props.description}
                </p>
              )}
            </div>
          )}
      </div>

      {/* Bottom Content */}
      {showContent &&
        contentPosition === "bottom" &&
        (props.title || props.description) && (
          <div
            className={`${contentPaddingStyle} bg-[var(--background)] ${textColorStyle}`}
          >
            {props.title && (
              <h3
                className={`${titleWeightStyle} ${titleSizeStyle} mb-2 ${getTitleLineClamp()} leading-tight`}
              >
                {props.title}
              </h3>
            )}

            {props.description && (
              <p
                className={`${descriptionWeightStyle} ${descriptionSizeStyle} ${getDescriptionLineClamp()} leading-relaxed opacity-70`}
              >
                {props.description}
              </p>
            )}
          </div>
        )}
    </div>
  );
};

export default ImageCard;
