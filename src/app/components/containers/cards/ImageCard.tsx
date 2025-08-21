import React from "react";
import styled, { css } from "styled-components";
import Image from "next/image";
import {
  AnimationVariant,
  BorderColorVariant,
  BorderRadiusVariant,
  BorderStyleVariant,
  ColorVariant,
  HoverEffectVariant,
  HoverShadowVariant,
  ImageCardProps,
  ShadowVariant,
  SpacingVariant,
  TextSizeVariant,
  TextWeightVariant,
  TransitionVariant,
} from "../../types and interfaces/ImageCardTypes";
import {
  bounce,
  float,
  useBorderCSS,
  getBorderRadius,
  useColorTheme,
  getFontWeight,
  getPadding,
  getShadow,
  getTextSize,
  getTransitionDuration,
  gradientShift,
  positionMap,
  pulse,
  shake,
  spin,
} from "./imageCardUtils/stylesFucntions";
import { mediaCardDefault } from "../../utilities/indices/settings-JSONs/mediaCard";
import { PopOverPosition } from "../divs/PopOver";
import TextFormatter from "../TextFormatters/TextFormatter";

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
  border: ${(props) =>
    useBorderCSS(props.$borderStyle, props.$borderWidth, props.$borderColor)};
  box-shadow: ${(props) => getShadow(props.$shadow)};
  background-color: ${(props) => useColorTheme(props.$colorVariant).bg};
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
    background-color: ${(props) => useColorTheme(props.$colorVariant).bgDark};
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

const StyledVideo = styled.video<{
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

const AudioContainer = styled.div<{
  $height: string | number;
  $colorVariant: ColorVariant;
}>`
  width: 100%;
  height: ${(props) =>
    typeof props.$height === "number" ? `${props.$height}px` : props.$height};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${(props) => useColorTheme(props.$colorVariant).bg};

  @media (prefers-color-scheme: dark) {
    background: ${(props) => useColorTheme(props.$colorVariant).bgDark};
  }
`;

const StyledAudio = styled.audio`
  width: 90%;
  max-width: 300px;
`;

const AudioIcon = styled.div<{
  $colorVariant: ColorVariant;
}>`
  font-size: 3rem;
  color: ${(props) => useColorTheme(props.$colorVariant).text};
  margin-bottom: 1rem;

  @media (prefers-color-scheme: dark) {
    color: ${(props) => useColorTheme(props.$colorVariant).textDark};
  }
`;

const ActionsOverlay = styled.div<{
  $transition: TransitionVariant;
  $disableHover: boolean;
  $hideAction?: boolean;
  $position?: PopOverPosition;
}>`
  position: absolute;
  ${(props) => positionMap[props.$position || "top-right"]}
  z-index: 30;
  opacity: ${(props) => (props.$hideAction ? "0" : "1")};
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
          background-color: ${useColorTheme(props.$colorVariant).bg};
          color: ${useColorTheme(props.$colorVariant).text};

          @media (prefers-color-scheme: dark) {
            background-color: ${useColorTheme(props.$colorVariant).bgDark};
            color: ${useColorTheme(props.$colorVariant).textDark};
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
    ${(props) => useColorTheme(props.$colorVariant).bg},
    ${(props) => useColorTheme(props.$colorVariant).text}20,
    ${(props) => useColorTheme(props.$colorVariant).bg}
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
    ${(props) => useColorTheme(props.$colorVariant).bg},
    ${(props) => useColorTheme(props.$colorVariant).text}20,
    ${(props) => useColorTheme(props.$colorVariant).bg}
  );
  background-size: 400% 400%;
  animation: ${gradientShift} 2s ease infinite;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
`;

const ImageCard: React.FC<ImageCardProps> = (props) => {
  const {
    media_type = "image",
    media_url = "",
    videoProps = {
      autoplay: true,
      loop: true,
      muted: true,
      controls: true,
    },
    audioProps = {
      autoplay: false,
      loop: false,
      controls: true,
      preload: "metadata",
    },
    actions,
    isLoading = false,
    onClick,

    // Layout & Sizing
    width = mediaCardDefault.width || 300,
    height = mediaCardDefault.height || 450,
    aspectRatio = mediaCardDefault.aspectRatio || "auto",
    imageHeight = mediaCardDefault.imageHeight || "auto",

    // Border Props
    borderStyle = mediaCardDefault.borderStyle || "solid",
    borderWidth = mediaCardDefault.borderWidth || 1,
    borderColor = mediaCardDefault.borderColor || "current",
    borderRadius = mediaCardDefault.borderRadius || "2xl",
    shadow = mediaCardDefault.shadow || "none",
    hoverShadow = mediaCardDefault.hoverShadow || "none",
    titleSize = mediaCardDefault.titleSize || "base",
    descriptionSize = mediaCardDefault.descriptionSize || "sm",
    contentPadding = mediaCardDefault.contentPadding || "md",
    transition = mediaCardDefault.transition || "none",
    hoverEffect = mediaCardDefault.hoverEffect || "none",
    titleWeight = mediaCardDefault.titleWeight || "bold",
    descriptionWeight = mediaCardDefault.descriptionWeight || "normal",
    overlayOpacity = mediaCardDefault.overlayOpacity || 50,
    animation = mediaCardDefault.animation || "none",

    // Content
    titleLines = mediaCardDefault.titleLines,
    descriptionLines = mediaCardDefault.descriptionLines,
    fullText = mediaCardDefault.fullText,
    showContent = mediaCardDefault.showContent,
    contentPosition = mediaCardDefault.contentPosition,

    // Animation & Effects
    hoverScale = mediaCardDefault.hoverScale,
    showGradientOverlay = mediaCardDefault.showGradientOverlay,

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
    disabled = mediaCardDefault.disabled || false,
    disableHover = mediaCardDefault.disableHover || false,
    hideAction = mediaCardDefault.hideAction,
    actionPosition = mediaCardDefault.actionPosition,

    // Error Handling
    fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='18' fill='%239ca3af' text-anchor='middle'%3EImage not found%3C/text%3E%3C/svg%3E",
    onImageError,

    // Background & Colors
    backgroundVariant = mediaCardDefault.backgroundVariant || "primary",
    textVariant = mediaCardDefault.textVariant || "primary",

    ...cardProps
  } = props;

  const mediaUrl = media_url || props.image_url;

  // Custom loading content or default loading placeholder
  if (isLoading) {
    if (customLoadingContent) {
      return (
        <div style={{ borderRadius: getBorderRadius(borderRadius || "2xl") }}>
          {customLoadingContent}
        </div>
      );
    }

    return (
      <LoadingContainer
        $borderStyle={borderStyle }
        $borderWidth={borderWidth}
        $borderColor={borderColor}
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
          <div style={{ padding: getPadding(contentPadding || "md") }}>
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
  const isClickable = Boolean(
    !isLoading && !disabled && (mediaUrl || props.image_url) && onClick
  );

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
  const handleImageError = (error: unknown) => {
    if (onImageError) {
      onImageError(error);
    }
  };

  const renderMedia = () => {
    const mediaSource = mediaUrl || fallbackImage;

    switch (media_type) {
      case "video":
        return fill ? (
          <StyledVideo
            src={mediaSource}
            $transition={transition}
            $hoverScale={hoverEffect === "none" ? hoverScale : undefined}
            $disableHover={disableHover}
            autoPlay={videoProps.autoplay}
            loop={videoProps.loop}
            muted={videoProps.muted}
            controls={videoProps.controls}
            poster={videoProps.poster}
            onError={handleImageError}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
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
            <StyledVideo
              src={mediaSource}
              $transition={transition}
              $hoverScale={hoverEffect === "none" ? hoverScale : undefined}
              $disableHover={disableHover}
              autoPlay={videoProps.autoplay}
              loop={videoProps.loop}
              muted={videoProps.muted}
              controls={videoProps.controls}
              poster={videoProps.poster}
              onError={handleImageError}
            />
          </div>
        );

      case "audio":
        const audioHeight =
          typeof imageHeight === "number" ? `${imageHeight}px` : imageHeight;
        return (
          <AudioContainer
            $height={audioHeight}
            $colorVariant={backgroundVariant}
          >
            <AudioIcon $colorVariant={backgroundVariant}>🎵</AudioIcon>
            <StyledAudio
              src={mediaSource}
              autoPlay={audioProps.autoplay}
              loop={audioProps.loop}
              controls={audioProps.controls}
              preload={audioProps.preload}
              onError={handleImageError}
            />
          </AudioContainer>
        );

      default: // "image"
        return fill ? (
          <StyledImage
            src={mediaSource}
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
              src={mediaSource}
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
        );
    }
  };

  return (
    <CardContainer
      $borderStyle={borderStyle}
      $borderWidth={borderWidth}
      $borderColor={borderColor}
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
        {renderMedia()}

        {/* Actions Overlay */}
        {actions && (
          <ActionsOverlay
            $transition={transition}
            $disableHover={disableHover}
            onClick={handleActionClick}
            $hideAction={hideAction}
            $position={actionPosition}
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
                <TextFormatter>{props.description}</TextFormatter>
              </Description>
            )}
          </ContentContainer>
        )}
    </CardContainer>
  );
};

export default ImageCard;
