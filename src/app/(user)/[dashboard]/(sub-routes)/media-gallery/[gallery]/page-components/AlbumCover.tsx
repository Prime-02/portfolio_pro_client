import React, { useState } from "react";
import { AlbumData } from "./MediaView";
import { useGlobalState } from "@/app/globalStateProvider";
import {
  copyToClipboard,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";
import Modal from "@/app/components/containers/modals/Modal";
import GalleryActions from "../../page-components/GalleryActions";
import { toast } from "@/app/components/toastify/Toastify";
import {
  BorderRadiusVariant,
  HoverShadowVariant,
  ShadowVariant,
} from "@/app/components/types and interfaces/ImageCardTypes";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import GalleryCardActions, {
  ActionType,
} from "../../page-components/GalleryCardActions";
import { createAlbumUniversalActions } from "../../imageActions";

interface AlbumCoverProps {
  albumData: AlbumData;
  fetchAlbumData: () => void;
  className?: string;
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

const AlbumCover: React.FC<AlbumCoverProps> = ({
  
}) => {
  const {
    loading,
    currentUser,
    searchParams,
    clearQuerryParam,
    extendRouteWithQuery,
    extendRoute,
    checkValidId,
  } = useGlobalState();

  // Get the current action from search params
  const updateAction = searchParams.get("update");
  const deleteAction = searchParams.get("delete");
  const currentAction =
    updateAction || deleteAction ? searchParams.get("albumCover") : "";
  const isEditMode = updateAction === "true";

  const getUserType = (): ActionType => {
    if (!currentUser) return "owner";
    return "others";
  };

  const userType = getUserType();
  const actions = createAlbumUniversalActions(
    albumData.id,
    albumData.name,
    albumData.cover_media_url,
    {
      allowOpen: false,
      extendRoute: extendRoute,
      extendRouteWithQuery: extendRouteWithQuery,
    },
    "Album Cover"
  );

  return (
    <>
      <div>
        <ImageCard
          id={albumData.id}
          image_url={
            albumData.cover_media_url || "/vectors/undraw_monitor_ypga.svg"
          }
          title={albumData?.name}
          description={albumData?.description}
          isLoading={
            loading.includes("fetching_cover_data") ||
            loading.includes("fetching_album")
          }
          fullText
          width={width}
          height={height}
          aspectRatio={preserveAspectRatio ? undefined : aspectRatio}
          borderRadius={borderRadius}
          shadow={shadow}
          hoverShadow={hoverShadow}
          showContent={showContent}
          contentPosition={contentPosition}
          hoverScale={hoverScale}
          transition="fast"
          titleLines={2}
          hoverEffect="lift"
          descriptionLines={3}
          priority={priority}
          quality={quality}
          placeholder="empty"
          fallbackImage="/vectors/undraw_monitor_ypga.svg"
          loadingHeight={`${height}px`}
          alt={albumData ? `Cover for ${albumData.name}` : "Album cover"}
          actions={() => (
            <GalleryCardActions
              albumId={albumData.id}
              albumTitle={albumData.name}
              actions={actions}
              userType={userType}
              popoverPosition="bottom-left"
              displayMode="circular-icons-horizontal"
            />
          )}
        />
      </div>
    </>
  );
};

export default AlbumCover;
