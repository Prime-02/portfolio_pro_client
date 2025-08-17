"use client";
import Modal from "@/app/components/containers/modals/Modal";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import { Media } from "../../page-components/MediaCollection";
import { getMediaData } from "../../page-components/MediaActions";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { getLoader } from "@/app/components/loaders/Loader";
import ImageCard from "@/app/components/containers/cards/ImageCard";

const MediaModal = () => {
  const {
    router,
    currentPath,
    accessToken,
    setLoading,
    loading,
    getPathSegment,
  } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const collectionId = getPathSegment(currentPath, 2);
  const mediaId = getPathSegment(currentPath, 3);
  const [mediaData, setMediaData] = useState<Media>({
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
      currentAction: mediaId,
      setLoading,
      setMediaData,
    });
  };

  useEffect(() => {
    console.log(mediaData);
  }, [mediaData]);

  useEffect(() => {
    if (accessToken) {
      handleGetMediaData();
    }
  }, [accessToken]);

  return (
    <Modal
      isOpen
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
              id={mediaData.id}
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
              titleLines={2}
              hoverEffect="lift"
              descriptionLines={3}
              priority={true}
              quality={100}
              placeholder="empty"
              fallbackImage="/vectors/undraw_monitor_ypga.svg"
              loadingHeight={`${500}px`}
              alt={mediaData ? `Cover for ${mediaData.title}` : "Album cover"}
            />
          </div>
      )}
    </Modal>
  );
};

export default MediaModal;
