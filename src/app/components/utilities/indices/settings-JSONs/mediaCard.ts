import { AlbumData } from "@/app/(user)/[dashboard]/(sub-routes)/media-gallery/[gallery]/page-components/MediaView";
import { ImageCardProps } from "@/app/components/types and interfaces/ImageCardTypes";

export const mediaCardDefault: ImageCardProps = {
  // Image Optimization
  width: 350,
  height: 400,
  aspectRatio: "auto",
  priority: false,
  quality: 100,
  placeholder: "blur",
  blurDataURL:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCABSAFIDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAECAwb/xAAWEAEBAQAAAAAAAAAAAAAAAAAAARH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A9mAACAogCgAiKgAgDYJQKmlZBrTWdXQaGVAQQFEAdEolBKytQBUAVUAAQFEAdEqpQZqNVAQUAFARFQAAHVFQGaKgAKAigIioCCgOiACIACgAACIAAAP/2Q==",
  sizes: "",
  fill: false,
  imageHeight: "auto",

  id: "",
  image_url: "",
  title: "",

  // Content Display & Layout
  contentPosition: "bottom",
  contentPadding: "xs",
  showContent: true,
  titleLines: 1,
  descriptionLines: 2,
  fullText: false,

  // Typography Props
  titleSize: "sm",
  descriptionSize: "sm",
  titleWeight: "semibold",
  descriptionWeight: "light",

  // Styling & Appearance
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "default",
  borderRadius: "2xl",
  backgroundVariant: "accent",
  textVariant: "primary",
  overlayOpacity: 100,
  showGradientOverlay: true,

  // Effects & Animation
  shadow: "2xl",
  hoverShadow: "none",
  transition: "normal",
  hoverEffect: "scale",
  hoverScale: 5,
  animation: "none",

  // Interaction & Behavior
  disableHover: false,
  disabled: false,
  hideAction: false,
  actionPosition: "top-right",
};

export function createMediaConfig(
  response: AlbumData & { cover_media_url: string }
) {
  return {
    // Basic Identification
    id: response.id || mediaCardDefault.id,
    image_url: response.cover_media_url || mediaCardDefault.image_url,

    // Dimensions
    width: response.media?.width ?? mediaCardDefault.width,
    height: response.media?.height ?? mediaCardDefault.height,
    aspectRatio: response.media?.aspectRatio || mediaCardDefault.aspectRatio,
    fill: response.media?.fill ?? mediaCardDefault.fill,

    // Content Display & Layout
    contentPosition:
      response.media?.contentPosition || mediaCardDefault.contentPosition,
    contentPadding:
      response.media?.contentPadding || mediaCardDefault.contentPadding,
    showContent: response.media?.showContent ?? mediaCardDefault.showContent,
    titleLines: response.media?.titleLines ?? mediaCardDefault.titleLines,
    descriptionLines:
      response.media?.descriptionLines ?? mediaCardDefault.descriptionLines,
    fullText: response.media?.fullText ?? mediaCardDefault.fullText,

    // Typography Props
    titleSize: response.media?.titleSize || mediaCardDefault.titleSize,
    descriptionSize:
      response.media?.descriptionSize || mediaCardDefault.descriptionSize,
    titleWeight: response.media?.titleWeight || mediaCardDefault.titleWeight,
    descriptionWeight:
      response.media?.descriptionWeight || mediaCardDefault.descriptionWeight,

    // Styling & Appearance
    borderStyle: response.media?.borderStyle || mediaCardDefault.borderStyle,
    borderWidth: response.media?.borderWidth ?? mediaCardDefault.borderWidth,
    borderColor: response.media?.borderColor || mediaCardDefault.borderColor,
    borderRadius: response.media?.borderRadius || mediaCardDefault.borderRadius,
    backgroundVariant:
      response.media?.backgroundVariant || mediaCardDefault.backgroundVariant,
    textVariant: response.media?.textVariant || mediaCardDefault.textVariant,
    overlayOpacity:
      response.media?.overlayOpacity ?? mediaCardDefault.overlayOpacity,
    showGradientOverlay:
      response.media?.showGradientOverlay ??
      mediaCardDefault.showGradientOverlay,

    // Effects & Animation
    shadow: response.media?.shadow || mediaCardDefault.shadow,
    hoverShadow: response.media?.hoverShadow || mediaCardDefault.hoverShadow,
    transition: response.media?.transition || mediaCardDefault.transition,
    hoverEffect: response.media?.hoverEffect || mediaCardDefault.hoverEffect,
    hoverScale: response.media?.hoverScale ?? mediaCardDefault.hoverScale,
    animation: response.media?.animation || mediaCardDefault.animation,

    // Interaction & Behavior
    disableHover: response.media?.disableHover ?? mediaCardDefault.disableHover,
    disabled: response.media?.disabled ?? mediaCardDefault.disabled,
    hideAction: response.media?.hideAction ?? mediaCardDefault.hideAction,
    actionPosition:
      response.media?.actionPosition || mediaCardDefault.actionPosition,
  };
}
