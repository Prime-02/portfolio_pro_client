"use client";
import Modal from "@/app/components/containers/modals/Modal";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import { Media } from "../../page-components/MediaCollection";
import { getMediaData } from "../../page-components/MediaActions";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { getLoader } from "@/app/components/loaders/Loader";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import GalleryCardActions, {
  ActionType,
} from "../../../page-components/GalleryCardActions";
import { createAlbumUniversalActions } from "../../../imageActions";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";

const MediaModal = () => {
  const {
    router,
    currentPath,
    accessToken,
    setLoading,
    loading,
    extendRouteWithQuery,
    currentUser,
    checkValidId,
  } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const collectionId = PathUtil.getPathSegment(currentPath, 2);
  const mediaId = PathUtil.getPathSegment(currentPath, 3);
  const backToAlbum = PathUtil.removeSegmentByValue(currentPath, mediaId);

  const [mediaData, setMediaData] = useState<Media>({
    id: "",
    title: "",
    description: "",
    is_featured: false,
    allow_download: false,
    is_public: false,
    media_type: undefined,
    media_url: "",
  });
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

  return (
    <Modal
      isOpen={checkValidId(collectionId) && checkValidId(mediaId)}
      onClose={() => {
        router.back();
      }}
      title={"Media"}
      size="sm"
      centered
    >
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
          <ImageCard
            id={mediaData.id || ""}
            image_url={
              mediaData?.media_url || "/vectors/undraw_monitor_ypga.svg"
            }
            title={mediaData?.title}
            description={mediaData?.description}
            fullText
            width={350}
            height={300}
            aspectRatio={"auto"}
            borderRadius={"2xl"}
            shadow={"xl"}
            hoverShadow={"lg"}
            showContent={true}
            contentPosition={"overlay"}
            hoverScale={1.2}
            transition="fast"
            hoverEffect="lift"
            priority={true}
            quality={100}
            placeholder="empty"
            fallbackImage="/vectors/undraw_monitor_ypga.svg"
            loadingHeight={`${500}px`}
            alt={mediaData ? `Cover for ${mediaData.title}` : "Album cover"}
            actions={() => (
              <GalleryCardActions
                albumId={mediaData.id || ""}
                albumTitle={mediaData.title || ""}
                actions={actions}
                userType={userType}
                popoverPosition="bottom-left"
                displayMode="circular-icons-horizontal"
              />
            )}
          />
        </div>
      )}
    </Modal>
  );
};

export default MediaModal;
