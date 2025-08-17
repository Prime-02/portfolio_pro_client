"use client";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import { createAlbumUniversalActions } from "../../../imageActions";
import GalleryCardActions, {
  ActionType,
} from "../../../page-components/GalleryCardActions";
import { getMediaData } from "../../page-components/MediaActions";
import { getLoader } from "@/app/components/loaders/Loader";
import { Media } from "../../page-components/MediaCollection";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import { useTheme } from "@/app/components/theme/ThemeContext ";

const MediaView = () => {
  const {
    router,
    currentPath,
    accessToken,
    setLoading,
    loading,
    extendRouteWithQuery,
    currentUser,
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
    media_type: "File",
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
            <div className="w-min-sm ">
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
              />
            </div>
            <div className="">
              <GalleryCardActions
                albumId={mediaData.id || ""}
                albumTitle={mediaData.title || ""}
                actions={actions}
                userType={userType}
                popoverPosition="bottom-left"
                displayMode="buttons"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaView;
