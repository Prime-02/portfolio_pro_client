import { AlbumData } from "@/app/(user)/[dashboard]/(sub-routes)/media-gallery/[gallery]/page-components/MediaView";
import { ImageCardProps } from "@/app/components/types and interfaces/ImageCardTypes";

export const mediaCardDefault: ImageCardProps = {
  // Image Optimization
  width: 350,
  height: 400,
  is_public: true,
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
  hoverEffect: "none",
  hoverScale: 1,
  animation: "none",

  // Interaction & Behavior
  disableHover: false,
  disabled: false,
  hideAction: true,
  actionPosition: "top-right",
  PopoverdisplayMode: "popover",
  PopoverdisplayPosition: "top-left",
};

export function createMediaConfig(response: AlbumData) {
  return {
    // Basic Identification
    id: response.id || mediaCardDefault.id,
    image_url: response.cover_media_url || mediaCardDefault.image_url,
    is_public:
      Boolean(response.cover_media_url) || Boolean(mediaCardDefault.is_public),

    // Dimensions
    width: response.image_card_layout?.width ?? mediaCardDefault.width,
    height: response.image_card_layout?.height ?? mediaCardDefault.height,
    aspectRatio:
      response.image_card_layout?.aspectRatio || mediaCardDefault.aspectRatio,
    fill: response.image_card_layout?.fill ?? mediaCardDefault.fill,

    // Content Display & Layout
    contentPosition:
      response.image_card_layout?.contentPosition ||
      mediaCardDefault.contentPosition,
    contentPadding:
      response.image_card_layout?.contentPadding ||
      mediaCardDefault.contentPadding,
    showContent:
      response.image_card_layout?.showContent ?? mediaCardDefault.showContent,
    titleLines:
      response.image_card_layout?.titleLines ?? mediaCardDefault.titleLines,
    descriptionLines:
      response.image_card_layout?.descriptionLines ??
      mediaCardDefault.descriptionLines,
    fullText: response.image_card_layout?.fullText ?? mediaCardDefault.fullText,

    // Typography Props
    titleSize:
      response.image_card_layout?.titleSize || mediaCardDefault.titleSize,
    descriptionSize:
      response.image_card_layout?.descriptionSize ||
      mediaCardDefault.descriptionSize,
    titleWeight:
      response.image_card_layout?.titleWeight || mediaCardDefault.titleWeight,
    descriptionWeight:
      response.image_card_layout?.descriptionWeight ||
      mediaCardDefault.descriptionWeight,

    // Styling & Appearance
    borderStyle:
      response.image_card_layout?.borderStyle || mediaCardDefault.borderStyle,
    borderWidth:
      response.image_card_layout?.borderWidth ?? mediaCardDefault.borderWidth,
    borderColor:
      response.image_card_layout?.borderColor || mediaCardDefault.borderColor,
    borderRadius:
      response.image_card_layout?.borderRadius || mediaCardDefault.borderRadius,
    backgroundVariant:
      response.image_card_layout?.backgroundVariant ||
      mediaCardDefault.backgroundVariant,
    textVariant:
      response.image_card_layout?.textVariant || mediaCardDefault.textVariant,
    overlayOpacity:
      response.image_card_layout?.overlayOpacity ??
      mediaCardDefault.overlayOpacity,
    showGradientOverlay:
      response.image_card_layout?.showGradientOverlay ??
      mediaCardDefault.showGradientOverlay,

    // Effects & Animation
    shadow: response.image_card_layout?.shadow || mediaCardDefault.shadow,
    hoverShadow:
      response.image_card_layout?.hoverShadow || mediaCardDefault.hoverShadow,
    transition:
      response.image_card_layout?.transition || mediaCardDefault.transition,
    hoverEffect:
      response.image_card_layout?.hoverEffect || mediaCardDefault.hoverEffect,
    hoverScale:
      response.image_card_layout?.hoverScale ?? mediaCardDefault.hoverScale,
    animation:
      response.image_card_layout?.animation || mediaCardDefault.animation,

    // Interaction & Behavior
    disableHover:
      response.image_card_layout?.disableHover ?? mediaCardDefault.disableHover,
    disabled: response.image_card_layout?.disabled ?? mediaCardDefault.disabled,
    hideAction:
      response.image_card_layout?.hideAction ?? mediaCardDefault.hideAction,
    actionPosition:
      response.image_card_layout?.actionPosition ||
      mediaCardDefault.actionPosition,
    PopoverdisplayMode:
      response.image_card_layout?.PopoverdisplayMode ||
      mediaCardDefault.PopoverdisplayMode,
    PopoverdisplayPosition:
      response.image_card_layout?.PopoverdisplayPosition ||
      mediaCardDefault.PopoverdisplayPosition,
  };
}
