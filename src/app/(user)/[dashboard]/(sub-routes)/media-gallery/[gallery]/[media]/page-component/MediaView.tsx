"use client";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import { createAlbumUniversalActions } from "../../../imageActions";
import GalleryCardActions, {
  ActionType,
} from "../../../page-components/GalleryCardActions";
import { getMediaData } from "../../page-components/MediaActions";
import { getLoader } from "@/app/components/loaders/Loader";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { ImageCardProps } from "@/app/components/types and interfaces/ImageCardTypes";
import { mediaCardDefault } from "@/app/components/utilities/indices/settings-JSONs/mediaCard";
import Button from "@/app/components/buttons/Buttons";
import { FaBrush } from "react-icons/fa";
import Modal from "@/app/components/containers/modals/Modal";
import ImageCardControlPanel from "./ImageCardControlPanel";
import { UpdateAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { toast } from "@/app/components/toastify/Toastify";
import { AlbumData } from "../../page-components/MediaView";

const MediaView = () => {
  const {
    router,
    currentPath,
    accessToken,
    setLoading,
    loading,
    extendRouteWithQuery,
    currentUser,
    searchParams,
    clearQuerryParam,
  } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const collectionId = PathUtil.getPathSegment(currentPath, 2);
  const mediaId = PathUtil.getPathSegment(currentPath, 3);
  const backToAlbum = PathUtil.removeSegmentByValue(currentPath, mediaId);
  const customize = searchParams.get("customize");

  const [mediaData, setMediaData] = useState<AlbumData>(mediaCardDefault);
  const [mediaLayout, setMediaLayout] = useState<ImageCardProps>(
    mediaData.image_card_layout as ImageCardProps
  );

  const LoaderComponent = getLoader(loader) || null;

  const handleGetMediaData = () => {
    getMediaData({
      accessToken,
      id: collectionId,
      currentAction: mediaData.id || mediaId || "",
      setLoading,
      setMediaData,
      currentUser,
    });
  };

  useEffect(() => {
    if (accessToken) {
      handleGetMediaData();
    }
  }, [accessToken, currentUser]);

  const getUserType = (): ActionType => {
    if (!currentUser) return "owner";
    return "others";
  };

  const userType = getUserType();
  const actions = createAlbumUniversalActions(
    mediaId,
    mediaData.title || "",
    mediaData.media_url || "/",
    {
      allowOpen: false,
      extendRouteWithQuery: extendRouteWithQuery,
      isAlbum: false,
      newUrl: backToAlbum,
      router: router,
    }
  );

  const updateCoverLayout = async () => {
    setLoading("updating_Image_card_layout");
    try {
      const updateRes = await UpdateAllData({
        url: `${V1_BASE_URL}/media-gallery/collections/${collectionId}/media/${mediaId}`,
        access: accessToken,
        field: { image_card_layout: mediaLayout },
        method: "patch",
      });
      if (updateRes) {
        toast.success("Image card layout updated successfully!", {
          title: "Success",
        });
        clearQuerryParam();
      }
    } catch (error) {
      console.log("Error updating Image card layout: ", error);
    } finally {
      setLoading("updating_Image_card_layout");
    }
  };

  useEffect(() => {
    setMediaLayout(mediaData.image_card_layout as ImageCardProps);
  }, [mediaData.image_card_layout]);

  return (
    <>
      <Modal
        showMinimizeButton
        isOpen={Boolean(customize && !currentUser)}
        onClose={clearQuerryParam}
        title={`Customize this ${
          mediaData.media_type ? mediaData.media_type : "media"
        } look`}
      >
        <ImageCardControlPanel
          mediaData={mediaLayout as ImageCardProps}
          setMediaData={setMediaLayout}
          onClick={updateCoverLayout}
          loading={loading.includes("updating_Image_card_layout")}
        />
      </Modal>
      <div>
        {loading.includes("getting_medium_data") ? (
          <div className="w-sm h-[10rem] flex items-center justify-center">
            {LoaderComponent ? (
              <LoaderComponent color={accentColor.color} />
            ) : (
              <div>Loading Media...</div>
            )}
          </div>
        ) : (
          <div>
            <div className="p-6 flex flex-col md:flex-row  items-center gap-3 justify-center">
              <div className="max-w-sm flex flex-col gap-y-3">
                {!currentUser && !customize && (
                  <Button
                    text="Customize Appearance"
                    title="Enhance how this specific image stands out among the rest."
                    icon2={<FaBrush />}
                    onClick={() => {
                      extendRouteWithQuery({ customize: "true" });
                    }}
                  />
                )}
                {!currentUser && customize && (
                  <Button
                    text="Save Changes"
                    variant="outline"
                    onClick={updateCoverLayout}
                    loading={loading.includes("updating_Image_card_layout")}
                    title="Save the changes made to the image card layout."
                  />
                )}
                <ImageCard
                  id={mediaData.id || ""}
                  image_url={
                    mediaData?.image_url || "/vectors/undraw_monitor_ypga.svg"
                  }
                  title={mediaData?.title}
                  media_type={mediaData.media_type}
                  description={mediaData?.description}
                  titleWeight={mediaLayout?.titleWeight}
                  titleSize={mediaLayout?.titleSize}
                  overlayOpacity={mediaLayout?.overlayOpacity}
                  contentPadding={mediaLayout?.contentPadding}
                  disableHover={mediaLayout?.disableHover}
                  showGradientOverlay={mediaLayout?.showGradientOverlay}
                  borderColor={mediaLayout?.borderColor}
                  borderStyle={mediaLayout?.borderStyle}
                  borderWidth={mediaLayout?.borderWidth}
                  fullText={mediaLayout?.fullText}
                  width={mediaLayout?.width}
                  height={mediaLayout?.height}
                  aspectRatio={mediaLayout?.aspectRatio}
                  borderRadius={mediaLayout?.borderRadius}
                  shadow={mediaLayout?.shadow}
                  hoverShadow={mediaLayout?.hoverShadow}
                  showContent={mediaLayout?.showContent}
                  contentPosition={mediaLayout?.contentPosition}
                  hoverScale={mediaLayout?.hoverScale}
                  transition={mediaLayout?.transition}
                  titleLines={mediaLayout?.titleLines}
                  hoverEffect={mediaLayout?.hoverEffect}
                  descriptionLines={mediaLayout?.descriptionLines}
                  priority={mediaLayout?.priority}
                  quality={mediaLayout?.quality}
                  animation={mediaLayout?.animation}
                  disabled={mediaLayout?.disabled}
                  hideAction={mediaLayout?.hideAction}
                  loadingHeight={`${500}px`}
                  actionPosition={mediaLayout?.PopoverdisplayPosition}
                  PopoverdisplayPosition={mediaLayout?.PopoverdisplayPosition}
                  PopoverdisplayMode={mediaLayout?.PopoverdisplayMode}
                  alt={
                    mediaData ? `Cover for ${mediaData.title}` : "Album cover"
                  }
                  actions={() => (
                    <GalleryCardActions
                      albumId={mediaData.id || ""}
                      albumTitle={mediaData.title || ""}
                      actions={actions}
                      userType={userType}
                      popoverPosition={"center-left"}
                      displayMode={mediaLayout?.PopoverdisplayMode}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MediaView;
