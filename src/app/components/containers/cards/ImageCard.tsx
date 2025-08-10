import React, { ReactNode, useState, useRef } from "react";

export type CardVariant =
  | "default"
  | "minimal"
  | "elevated"
  | "outlined"
  | "glass"
  | "flat";
export type CardSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ImageAspectRatio =
  | "square"
  | "video"
  | "photo"
  | "wide"
  | "ultrawide"
  | "auto";
export type ImageFit = "cover" | "contain" | "fill" | "scale-down" | "none";
export type ImagePosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
export type OverlayPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | "top-center"
  | "bottom-center";
export type TextPlacement = "bottom" | "overlay" | "top" | "side";
export type HoverEffect =
  | "none"
  | "lift"
  | "scale"
  | "tilt"
  | "glow"
  | "blur"
  | "brightness"
  | "zoom-in"
  | "zoom-out";
export type LoadingState = "lazy" | "eager";

export interface BorderRadius {
  card?: string;
  image?: string;
}

export interface Spacing {
  padding?:
    | number
    | {
        x?: number;
        y?: number;
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      };
  gap?: number;
}

export interface ImageCardProps {
  // Core props
  title?: string;
  description?: string;
  image_url: string;
  actions?: ReactNode;

  // Layout & Structure
  variant?: CardVariant;
  size?: CardSize;
  aspectRatio?: ImageAspectRatio | number; // Custom aspect ratio as number (width/height)
  textPlacement?: TextPlacement;

  // Image properties
  imageAlt?: string;
  imageFit?: ImageFit;
  imagePosition?: ImagePosition;
  imageQuality?: "low" | "medium" | "high";
  loading?: LoadingState;
  placeholder?: string | ReactNode; // Placeholder while loading

  // Styling
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;

  // Border radius
  borderRadius?: BorderRadius | number | string;

  // Spacing
  spacing?: Spacing;

  // Colors & Theme
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  titleColor?: string;
  descriptionColor?: string;

  // Shadow & Elevation
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | string;
  hoverShadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | string;
  elevation?: number; // 0-24

  // Animation & Interactions
  animated?: boolean;
  animationDuration?: number;
  hoverEffect?: HoverEffect;
  clickable?: boolean;
  selectable?: boolean;
  selected?: boolean;

  // Overlay
  overlay?: ReactNode;
  overlayPosition?: OverlayPosition;
  overlayClassName?: string;
  showOverlayOnHover?: boolean;

  // Actions
  actionsPosition?: OverlayPosition;
  actionsClassName?: string;
  showActionsOnHover?: boolean;

  // Content configuration
  titleLines?: number; // Number of lines to clamp
  descriptionLines?: number;
  showContent?: boolean;
  contentPosition?: "inside" | "outside";

  // Badge/Label
  badge?: ReactNode;
  badgePosition?: OverlayPosition;
  badgeClassName?: string;

  // Loading & Error states
  isLoading?: boolean;
  hasError?: boolean;
  errorFallback?: ReactNode;
  loadingComponent?: ReactNode;

  // Custom styles
  style?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;

  // Event handlers
  onClick?: (event: React.MouseEvent) => void;
  onImageLoad?: () => void;
  onImageError?: () => void;
  onHover?: (isHovered: boolean) => void;
  onSelect?: (selected: boolean) => void;

  // Advanced
  lazyOffset?: number; // Pixels before triggering lazy load
  preload?: boolean;
  blurDataURL?: string; // Base64 blur placeholder
  priority?: boolean; // Prioritize loading

  // Scroll direction optimization
  scrollDirection?: "vertical" | "horizontal";
}

const ImageCard = ({
  // Core props
  title,
  description,
  image_url,
  actions,

  // Layout & Structure
  variant = "default",
  size = "md",
  aspectRatio = "auto",
  textPlacement = "bottom",

  // Image properties
  imageAlt,
  imageFit = "cover",
  imagePosition = "center",
  imageQuality = "medium",
  loading = "lazy",
  placeholder,

  // Styling
  className = "",
  imageClassName = "",
  contentClassName = "",
  titleClassName = "",
  descriptionClassName = "",

  // Border radius
  borderRadius = "card",

  // Spacing
  spacing = {},

  // Colors & Theme
  backgroundColor,
  borderColor,
  borderWidth,
  textColor,
  titleColor,
  descriptionColor,

  // Shadow & Elevation
  shadow,
  hoverShadow,
  elevation,

  // Animation & Interactions
  animated = true,
  animationDuration = 300,
  hoverEffect = "lift",
  clickable = false,
  selectable = false,
  selected = false,

  // Overlay
  overlay,
  overlayPosition = "center",
  overlayClassName = "",
  showOverlayOnHover = false,

  // Actions
  actionsPosition = "top-right",
  actionsClassName = "",
  showActionsOnHover = true,

  // Content configuration
  titleLines = 2,
  descriptionLines = 3,
  showContent = true,
  contentPosition = "inside",

  // Badge/Label
  badge,
  badgePosition = "top-left",
  badgeClassName = "",

  // Loading & Error states
  isLoading = false,
  hasError = false,
  errorFallback,
  loadingComponent,

  // Custom styles
  style = {},
  imageStyle = {},
  contentStyle = {},

  // Event handlers
  onClick,
  onImageLoad,
  onImageError,
  onHover,
  onSelect,

  // Advanced
  blurDataURL,
  priority = false,

  // Scroll direction
  scrollDirection = "vertical",
}: ImageCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Adjust size and aspect ratio based on scroll direction
  const getOptimizedSizeAndRatio = () => {
    if (scrollDirection === "horizontal") {
      return {
        optimizedSize: size === "md" ? "lg" : size,
        optimizedAspectRatio: aspectRatio === "auto" ? "square" : aspectRatio,
      };
    }
    return {
      optimizedSize: size,
      optimizedAspectRatio: aspectRatio,
    };
  };

  const { optimizedSize, optimizedAspectRatio } = getOptimizedSizeAndRatio();

  // Size configurations
  const getSizeClasses = () => {
    const sizes = {
      xs: {
        padding: "p-2",
        text: { title: "text-xs", description: "text-xs" },
        gap: "gap-1",
      },
      sm: {
        padding: "p-3",
        text: { title: "text-sm", description: "text-xs" },
        gap: "gap-2",
      },
      md: {
        padding: "p-4",
        text: { title: "text-base", description: "text-sm" },
        gap: "gap-2",
      },
      lg: {
        padding: "p-5",
        text: { title: "text-lg", description: "text-base" },
        gap: "gap-3",
      },
      xl: {
        padding: "p-6",
        text: { title: "text-xl", description: "text-lg" },
        gap: "gap-4",
      },
    };
    return sizes[optimizedSize];
  };

  // Variant styles
  const getVariantClasses = () => {
    const variants = {
      default: "bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-lg",
      minimal: "bg-transparent",
      elevated: "bg-gray-100 dark:bg-gray-800 shadow-lg hover:shadow-xl",
      outlined:
        "bg-transparent border border-gray-200 dark:border-gray-700 hover:border-gray-300",
      glass: "bg-white/10 backdrop-blur-2xl border border-white/20",
      flat: "bg-gray-100 dark:bg-gray-700 shadow-none",
    };
    return variants[variant];
  };

  // Aspect ratio classes
  const getAspectRatioClass = () => {
    if (typeof optimizedAspectRatio === "number") {
      return { paddingBottom: `${(1 / optimizedAspectRatio) * 100}%` };
    }

    const ratios = {
      square: "aspect-square",
      video: "aspect-video",
      photo: "aspect-[4/5]",
      wide: "aspect-[16/9]",
      ultrawide: "aspect-[21/9]",
      auto: "",
    };
    return ratios[optimizedAspectRatio as ImageAspectRatio] || "";
  };

  // Position classes
  const getPositionClass = (position: OverlayPosition) => {
    const positions = {
      "top-left": "top-3 left-3",
      "top-right": "top-3 right-3",
      "top-center": "top-3 left-1/2 transform -translate-x-1/2",
      "bottom-left": "bottom-3 left-3",
      "bottom-right": "bottom-3 right-3",
      "bottom-center": "bottom-3 left-1/2 transform -translate-x-1/2",
      center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    };
    return positions[position];
  };

  // Image fit and position
  const getImageClasses = () => {
    const fitClasses = {
      cover: "object-cover",
      contain: "object-contain",
      fill: "object-fill",
      "scale-down": "object-scale-down",
      none: "object-none",
    };

    const positionClasses = {
      center: "object-center",
      top: "object-top",
      bottom: "object-bottom",
      left: "object-left",
      right: "object-right",
      "top-left": "object-left-top",
      "top-right": "object-right-top",
      "bottom-left": "object-left-bottom",
      "bottom-right": "object-right-bottom",
    };

    return `${fitClasses[imageFit]} ${positionClasses[imagePosition]}`;
  };

  // Hover effects
  const getHoverEffectClass = () => {
    const effects = {
      none: "",
      lift: "hover:-translate-y-2",
      scale: "hover:scale-105",
      tilt: "hover:rotate-1",
      glow: "hover:shadow-2xl hover:shadow-blue-500/25",
      blur: "hover:backdrop-blur-sm",
      brightness: "hover:brightness-110",
      "zoom-in": "[&>*]:hover:scale-110",
      "zoom-out": "[&>*]:hover:scale-95",
    };
    return effects[hoverEffect];
  };

  // Parse spacing
  const getSpacing = () => {
    const defaultSpacing = getSizeClasses();
    if (typeof spacing.padding === "number") {
      return `p-${spacing.padding}`;
    }
    if (typeof spacing.padding === "object") {
      const p = spacing.padding;
      if ("x" in p || "y" in p) {
        return `px-${p.x || 4} py-${p.y || 4}`;
      }
      return `pt-${p.top || 4} pr-${p.right || 4} pb-${p.bottom || 4} pl-${p.left || 4}`;
    }
    return defaultSpacing.padding;
  };

  // Get border radius
  const getBorderRadius = () => {
    if (typeof borderRadius === "string") {
      if (borderRadius === "card") return "rounded-2xl";
      if (borderRadius === "image") return "rounded-xl";
      return borderRadius;
    }
    if (typeof borderRadius === "number") {
      return `rounded-[${borderRadius}px]`;
    }
    return "rounded-2xl";
  };

  // Event handlers
  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (selectable) {
      onSelect?.(!selected);
    }
    onClick?.(e);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    onImageLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onImageError?.();
  };

  const sizeConfig = getSizeClasses();
  const aspectRatioStyle =
    typeof optimizedAspectRatio === "number" ? getAspectRatioClass() : {};

  // Card classes with scroll direction optimization
  const getScrollOptimizedClasses = () => {
    const baseClasses = [
      getBorderRadius(),
      getVariantClasses(),
      animated ? `transition-all duration-${animationDuration}` : "",
      clickable ? "cursor-pointer" : "",
      selected ? "ring-2 ring-blue-500" : "",
      getHoverEffectClass(),
      "overflow-hidden group",
      className,
    ];

    // Add scroll direction specific classes
    if (scrollDirection === "horizontal") {
      baseClasses.push("flex-shrink-0", "max-w-sm");
    } else {
      baseClasses.push("w-full");
    }

    return baseClasses.filter(Boolean).join(" ");
  };

  const cardClasses = getScrollOptimizedClasses();

  // Custom styles
  const cardStyle: React.CSSProperties = {
    backgroundColor,
    borderColor,
    borderWidth: borderWidth ? `${borderWidth}px` : undefined,
    color: textColor,
    boxShadow: elevation
      ? `0 ${elevation}px ${elevation * 2}px rgba(0,0,0,0.1)`
      : undefined,
    // Optimize for scroll direction
    ...(scrollDirection === "horizontal" && {
      minWidth: "280px",
      maxWidth: "320px",
    }),
    ...style,
  };

  const imageContainerStyle: React.CSSProperties = {
    ...aspectRatioStyle,
  };

  if (isLoading && loadingComponent) {
    return <div className={cardClasses}>{loadingComponent}</div>;
  }

  if (hasError && errorFallback) {
    return <div className={cardClasses}>{errorFallback}</div>;
  }

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={clickable ? handleClick : undefined}
    >
      {/* Content Above Image */}
      {textPlacement === "top" && showContent && (title || description) && (
        <div
          className={`${getSpacing()} ${contentClassName} bg-[var(--background)] `}
          style={contentStyle}
        >
          {title && (
            <h3
              className={`font-semibold ${sizeConfig.text.title} line-clamp-${titleLines} leading-tight ${titleClassName}`}
              style={{ color: titleColor }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className={`${sizeConfig.text.description} line-clamp-${descriptionLines} leading-relaxed ${descriptionClassName}`}
              style={{ color: descriptionColor }}
            >
              {description}
            </p>
          )}
        </div>
      )}

      {/* Image Container */}
      <div
        className={`relative overflow-hidden ${typeof optimizedAspectRatio === "string" ? getAspectRatioClass() : ""}`}
        style={imageContainerStyle}
      >
        {/* Blur placeholder */}
        {blurDataURL && !imageLoaded && (
          <img
            src={blurDataURL}
            alt=""
            className="absolute inset-0 w-full h-full object-cover filter blur-sm"
          />
        )}

        {/* Main Image */}
        <img
          src={image_url}
          alt={imageAlt || title || "Image"}
          className={`w-full h-full ${getImageClasses()} transition-transform duration-${animationDuration} ${
            hoverEffect === "zoom-in" ? "group-hover:scale-110" : ""
          } ${imageClassName}`}
          style={imageStyle}
          loading={loading}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Badge */}
        {badge && (
          <div
            className={`absolute ${getPositionClass(badgePosition)} ${badgeClassName}`}
          >
            {badge}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div
            className={`absolute ${getPositionClass(actionsPosition)} ${
              showActionsOnHover
                ? "opacity-0 group-hover:opacity-100"
                : "opacity-100"
            } transition-opacity duration-200 ${actionsClassName}`}
          >
            {actions}
          </div>
        )}

        {/* Overlay */}
        {overlay && (
          <div
            className={`absolute ${getPositionClass(overlayPosition)} ${
              showOverlayOnHover
                ? "opacity-0 group-hover:opacity-100"
                : "opacity-100"
            } transition-opacity duration-200 ${overlayClassName}`}
          >
            {overlay}
          </div>
        )}

        {/* Text Overlay */}
        {textPlacement === "overlay" &&
          showContent &&
          (title || description) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4 ">
                {title && (
                  <h3
                    className={`font-semibold ${sizeConfig.text.title} line-clamp-${titleLines} leading-tight ${titleClassName}`}
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p
                    className={`${sizeConfig.text.description} line-clamp-${descriptionLines} leading-relaxed opacity-90 ${descriptionClassName}`}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}
      </div>

      {/* Content Below Image */}
      {textPlacement === "bottom" && showContent && (title || description) && (
        <div
          className={`${getSpacing()} ${contentClassName} bg-[var(--background)] `}
          style={contentStyle}
        >
          {title && (
            <h3
              className={`font-semibold ${sizeConfig.text.title} line-clamp-${titleLines} leading-tight ${titleClassName}`}
              style={{ color: titleColor }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className={`${sizeConfig.text.description} line-clamp-${descriptionLines} leading-relaxed ${descriptionClassName}`}
              style={{ color: descriptionColor }}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageCard;
