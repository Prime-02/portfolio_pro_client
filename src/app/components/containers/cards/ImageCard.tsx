import React, { ReactNode, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import Image from "next/image";
import { AnimationVariant, BorderColorVariant, BorderRadiusVariant, BorderStyleVariant, ColorVariant, HoverEffectVariant, HoverShadowVariant, ShadowVariant, SpacingVariant, TextSizeVariant, TextWeightVariant, TransitionVariant } from "../../types and interfaces/ImageCardTypes";


// Styled components
const CardContainer = styled.div<{
  $borderStyle: BorderStyleVariant;
  $borderWidth: number;
  $borderColor: BorderColorVariant | string;
  $borderRadius: BorderRadiusVariant;
  $shadow: ShadowVariant;
  $hoverShadow: HoverShadowVariant;
  $transition: TransitionVariant;
  $hoverEffect: HoverEffectVariant;
  $colorVariant: ColorVariant;
  $isClickable: boolean;
  $disabled: boolean;
  $animation: AnimationVariant;
  $disableHover: boolean;
}>`
  border-radius: ${(props) => getBorderRadius(props.$borderRadius)};
  border: ${(props) => getBorderCSS(props.$borderStyle, props.$borderWidth, props.$borderColor)};
  box-shadow: ${(props) => getShadow(props.$shadow)};
  background-color: ${(props) => getColorTheme(props.$colorVariant).bg};
  transition: all ${(props) => getTransitionDuration(props.$transition)}
    ease-in-out;
  overflow: hidden;
  cursor: ${(props) =>
    props.$disabled
      ? "not-allowed"
      : props.$isClickable
        ? "pointer"
        : "default"};
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};

  ${(props) =>
    props.$animation === "spin" &&
    css`
      animation: ${spin} 1s linear infinite;
    `}

  ${(props) =>
    props.$animation === "pulse" &&
    css`
      animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    `}
  
  ${(props) =>
    props.$animation === "bounce" &&
    css`
      animation: ${bounce} 1s infinite;
    `}
  
  ${(props) =>
    props.$animation === "float" &&
    css`
      animation: ${float} 3s ease-in-out infinite;
    `}
  
  ${(props) =>
    props.$animation === "shake" &&
    css`
      animation: ${shake} 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    `}

  ${(props) =>
    !props.$disableHover &&
    css`
      &:hover {
        ${props.$hoverShadow !== "none" &&
        css`
          box-shadow: ${getShadow(props.$hoverShadow as ShadowVariant)};
        `}

        ${props.$hoverShadow === "glow" &&
        css`
          box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.5);
          filter: drop-shadow(0 20px 13px rgb(0 0 0 / 0.03));
        `}
      
      ${props.$hoverEffect === "scale" &&
        css`
          transform: scale(1.05);
        `}
      
      ${props.$hoverEffect === "rotate" &&
        css`
          transform: rotate(3deg);
        `}
      
      ${props.$hoverEffect === "lift" &&
        css`
          transform: translateY(-8px);
        `}
      
      ${props.$hoverEffect === "tilt" &&
        css`
          transform: rotate(6deg) scale(1.05);
        `}
      
      ${props.$hoverEffect === "blur" &&
        css`
          filter: blur(2px);
        `}
      
      ${props.$hoverEffect === "brightness" &&
        css`
          filter: brightness(1.1);
        `}
      
      ${props.$hoverEffect === "fade" &&
        css`
          opacity: 0.75;
        `}
      
      ${props.$hoverEffect === "glow" &&
        css`
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5)) brightness(1.1);
        `}
      }
    `}

  @media (prefers-color-scheme: dark) {
    background-color: ${(props) => getColorTheme(props.$colorVariant).bgDark};
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const StyledImage = styled(Image)<{
  $transition: TransitionVariant;
  $hoverScale?: number;
  $disableHover: boolean;
}>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform ${(props) => getTransitionDuration(props.$transition)}
    ease-in-out;

  ${(props) =>
    !props.$disableHover &&
    props.$hoverScale &&
    css`
      ${CardContainer}:hover & {
        transform: scale(${props.$hoverScale});
      }
    `}
`;

const ActionsOverlay = styled.div<{
  $transition: TransitionVariant;
  $disableHover: boolean;
}>`
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  z-index: 30;
  opacity: 0;
  transition: opacity ${(props) => getTransitionDuration(props.$transition)}
    ease-in-out;

  ${(props) =>
    !props.$disableHover &&
    css`
      ${CardContainer}:hover & {
        opacity: 1;
      }
    `}
`;

const GradientOverlay = styled.div<{
  $overlayOpacity: number;
}>`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, ${(props) => props.$overlayOpacity / 100}),
    transparent 50%,
    transparent
  );
  z-index: 20;
`;

const ContentContainer = styled.div<{
  $padding: SpacingVariant;
  $colorVariant: ColorVariant;
  $position: "bottom" | "overlay";
}>`
  padding: ${(props) => getPadding(props.$padding)};

  ${(props) =>
    props.$position === "overlay"
      ? css`
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 20;
          color: white;
        `
      : css`
          background-color: ${getColorTheme(props.$colorVariant).bg};
          color: ${getColorTheme(props.$colorVariant).text};

          @media (prefers-color-scheme: dark) {
            background-color: ${getColorTheme(props.$colorVariant).bgDark};
            color: ${getColorTheme(props.$colorVariant).textDark};
          }
        `}
`;

const Title = styled.h3<{
  $size: TextSizeVariant;
  $weight: TextWeightVariant;
  $lines?: number;
}>`
  font-size: ${(props) => getTextSize(props.$size)};
  font-weight: ${(props) => getFontWeight(props.$weight)};
  margin-bottom: 0.5rem;
  line-height: 1.25;

  ${(props) =>
    props.$lines &&
    css`
      display: -webkit-box;
      -webkit-line-clamp: ${props.$lines};
      -webkit-box-orient: vertical;
      overflow: hidden;
    `}
`;

const Description = styled.p<{
  $size: TextSizeVariant;
  $weight: TextWeightVariant;
  $lines?: number;
  $position: "bottom" | "overlay";
}>`
  font-size: ${(props) => getTextSize(props.$size)};
  font-weight: ${(props) => getFontWeight(props.$weight)};
  line-height: 1.5;
  opacity: ${(props) => (props.$position === "overlay" ? 0.9 : 0.7)};

  ${(props) =>
    props.$lines &&
    css`
      display: -webkit-box;
      -webkit-line-clamp: ${props.$lines};
      -webkit-box-orient: vertical;
      overflow: hidden;
    `}
`;

const LoadingContainer = styled(CardContainer)`
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const LoadingImagePlaceholder = styled.div<{
  $height: string | number;
  $colorVariant: ColorVariant;
}>`
  width: 100%;
  height: ${(props) =>
    typeof props.$height === "number" ? `${props.$height}px` : props.$height};
  background: linear-gradient(
    -45deg,
    ${(props) => getColorTheme(props.$colorVariant).bg},
    ${(props) => getColorTheme(props.$colorVariant).text}20,
    ${(props) => getColorTheme(props.$colorVariant).bg}
  );
  background-size: 400% 400%;
  animation: ${gradientShift} 2s ease infinite;
`;

const LoadingTextPlaceholder = styled.div<{
  $width: string;
  $height: string;
  $colorVariant: ColorVariant;
}>`
  width: ${(props) => props.$width};
  height: ${(props) => props.$height};
  background: linear-gradient(
    -45deg,
    ${(props) => getColorTheme(props.$colorVariant).bg},
    ${(props) => getColorTheme(props.$colorVariant).text}20,
    ${(props) => getColorTheme(props.$colorVariant).bg}
  );
  background-size: 400% 400%;
  animation: ${gradientShift} 2s ease infinite;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
`;

// Props interface
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

  // Styling Props
  // Border Props
  borderStyle?: BorderStyleVariant;
  borderWidth?: number;
  borderColor?: BorderColorVariant | string;
  borderRadius?: BorderRadiusVariant;
  shadow?: ShadowVariant;
  hoverShadow?: HoverShadowVariant;
  titleSize?: TextSizeVariant;
  descriptionSize?: TextSizeVariant;
  contentPadding?: SpacingVariant;
  transition?: TransitionVariant;
  hoverEffect?: HoverEffectVariant;
  titleWeight?: TextWeightVariant;
  descriptionWeight?: TextWeightVariant;
  overlayOpacity?: number;
  animation?: AnimationVariant;

  // Content Props
  titleLines?: number;
  descriptionLines?: number;
  fullText?: boolean;
  showContent?: boolean;
  contentPosition?: "bottom" | "overlay" | "none";

  // Animation & Effects Props
  hoverScale?: number;
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
}

const ImageCard: React.FC<ImageCardProps> = (props) => {
  const {
    actions,
    isLoading = false,
    onClick,

    // Layout & Sizing
    width = 400,
    height = 300,
    aspectRatio,
    imageHeight = "auto",

    // Border Props
    borderStyle = "none",
    borderWidth = 0,
    borderColor = "transparent",
    borderRadius = "2xl",
    shadow = "sm",
    hoverShadow = "lg",
    titleSize = "base",
    descriptionSize = "sm",
    contentPadding = "md",
    transition = "normal",
    hoverEffect = "scale",
    titleWeight = "semibold",
    descriptionWeight = "normal",
    overlayOpacity = 50,
    animation = "none",

    // Content
    titleLines = 1,
    descriptionLines = 2,
    fullText = false,
    showContent = true,
    contentPosition = "overlay",

    // Animation & Effects
    hoverScale = 1.05,
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

    ...cardProps
  } = props;

  const [imageError, setImageError] = useState(false);

  // Custom loading content or default loading placeholder
  if (isLoading) {
    if (customLoadingContent) {
      return (
        <div style={{ borderRadius: getBorderRadius(borderRadius) }}>
          {customLoadingContent}
        </div>
      );
    }

    return (
      <LoadingContainer
        $borderRadius={borderRadius}
        $shadow={shadow}
        $hoverShadow="none"
        $transition={transition}
        $hoverEffect="none"
        $colorVariant={loadingVariant}
        $isClickable={false}
        $disabled={false}
        $animation="none"
        $disableHover={true}
      >
        <LoadingImagePlaceholder
          $height={loadingHeight}
          $colorVariant={loadingVariant}
        />

        {showContent && contentPosition === "bottom" && (
          <div style={{ padding: getPadding(contentPadding) }}>
            <LoadingTextPlaceholder
              $width="75%"
              $height="1rem"
              $colorVariant={loadingVariant}
            />
            <div>
              <LoadingTextPlaceholder
                $width="100%"
                $height="0.75rem"
                $colorVariant={loadingVariant}
              />
              <LoadingTextPlaceholder
                $width="66%"
                $height="0.75rem"
                $colorVariant={loadingVariant}
              />
            </div>
          </div>
        )}
      </LoadingContainer>
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
    setImageError(true);
    if (onImageError) {
      onImageError(error);
    }
  };

  return (
    <CardContainer
      $borderRadius={borderRadius}
      $shadow={shadow}
      $hoverShadow={hoverShadow}
      $transition={transition}
      $hoverEffect={hoverEffect}
      $colorVariant={backgroundVariant}
      $isClickable={isClickable}
      $disabled={disabled}
      $animation={animation}
      $disableHover={disableHover}
      onClick={!disabled ? handleCardClick : undefined}
      role={role}
      tabIndex={!disabled ? tabIndex : -1}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Image Container */}
      <ImageContainer style={aspectRatio ? { flex: 1 } : undefined}>
        {fill ? (
          <StyledImage
            src={props.image_url}
            alt={alt || props.title || "Image"}
            fill
            $transition={transition}
            $hoverScale={hoverEffect === "none" ? hoverScale : undefined}
            $disableHover={disableHover}
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
            <StyledImage
              src={props.image_url}
              alt={alt || props.title || "Image"}
              width={width}
              height={height}
              $transition={transition}
              $hoverScale={hoverEffect === "none" ? hoverScale : undefined}
              $disableHover={disableHover}
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
          <ActionsOverlay
            $transition={transition}
            $disableHover={disableHover}
            onClick={handleActionClick}
          >
            {actions(cardProps)}
          </ActionsOverlay>
        )}

        {/* Gradient Overlay */}
        {showGradientOverlay &&
          contentPosition === "overlay" &&
          (props.title || props.description) && (
            <GradientOverlay $overlayOpacity={overlayOpacity} />
          )}

        {/* Overlay Content */}
        {showContent &&
          contentPosition === "overlay" &&
          (props.title || props.description) && (
            <ContentContainer
              $padding={contentPadding}
              $colorVariant={textVariant}
              $position="overlay"
            >
              {props.title && (
                <Title
                  $size={titleSize}
                  $weight={titleWeight}
                  $lines={!fullText ? titleLines : undefined}
                >
                  {props.title}
                </Title>
              )}

              {props.description && (
                <Description
                  $size={descriptionSize}
                  $weight={descriptionWeight}
                  $lines={!fullText ? descriptionLines : undefined}
                  $position="overlay"
                >
                  {props.description}
                </Description>
              )}
            </ContentContainer>
          )}
      </ImageContainer>

      {/* Bottom Content */}
      {showContent &&
        contentPosition === "bottom" &&
        (props.title || props.description) && (
          <ContentContainer
            $padding={contentPadding}
            $colorVariant={textVariant}
            $position="bottom"
          >
            {props.title && (
              <Title
                $size={titleSize}
                $weight={titleWeight}
                $lines={!fullText ? titleLines : undefined}
              >
                {props.title}
              </Title>
            )}

            {props.description && (
              <Description
                $size={descriptionSize}
                $weight={descriptionWeight}
                $lines={!fullText ? descriptionLines : undefined}
                $position="bottom"
              >
                {props.description}
              </Description>
            )}
          </ContentContainer>
        )}
    </CardContainer>
  );
};

export default ImageCard;
