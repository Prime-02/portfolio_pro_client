import React, { useCallback, useEffect, useState } from "react";
import { useGlobalState } from "@/app/globalStateProvider";
import {
  GetAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import EmptyState from "@/app/components/containers/cards/EmptyState";
import Modal from "@/app/components/containers/modals/Modal";
import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import MediaActions from "./MediaActions";
import { AlbumData } from "./AlbumView";
import { createAlbumUniversalActions } from "../../imageActions";
import GalleryCardActions, {
  ActionType,
} from "../../page-components/GalleryCardActions";
import { ImageCardProps } from "@/app/components/types and interfaces/ImageCardTypes";
import { mediaCardDefault } from "@/app/components/utilities/indices/settings-JSONs/mediaCard";
import Button from "@/app/components/buttons/Buttons";
import TextFormatter from "@/app/components/containers/TextFormatters/TextFormatter";
import ImageCardControlPanel from "../[media]/page-component/ImageCardControlPanel";
import { toast } from "@/app/components/toastify/Toastify";

interface AllMedia {
  media: AlbumData[];
  total: number;
}
interface MediaCollectionProps {
  props: AlbumData;
  collectionId: string;
}

const MediaCollection = ({ props, collectionId }: MediaCollectionProps) => {
  const {
    loading,
    setLoading,
    accessToken,
    currentUser,
    userData,
    extendRouteWithQuery,
    checkParams,
    clearQuerryParam,
    checkValidId,
    extendRoute,
    currentPath,
    router,
  } = useGlobalState();
  const { loader, accentColor } = useTheme();

  const [albumMedia, setAlbumMedia] = useState<AllMedia>({
    media: [],
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [coverLayout, setCoverLayout] = useState<ImageCardProps>(
    props.image_card_layout as ImageCardProps
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const uploadAction = checkParams("upload") === "true";
  const personaliseAction = checkParams("personalise") === "true";
  const updateAction = checkParams("update");
  const deleteAction = checkParams("delete");
  const currentAction =
    updateAction || deleteAction ? checkParams("media") : "";

  const LoaderComponent = getLoader(loader) || null;

  const fetchAllAlbumMedia = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setLoading("fetching_media");
        }

        const url = currentUser
          ? `${V1_BASE_URL}/media-gallery/users/${currentUser}/collections/${collectionId}/media?page=${pageNum}`
          : `${V1_BASE_URL}/media-gallery/collections/${collectionId}/media?page=${pageNum}`;

        const mediaRes: AllMedia = await GetAllData({
          access: accessToken,
          url: url,
        });

        if (mediaRes) {
          setAlbumMedia((prev) => ({
            total: mediaRes.total || 0,
            media: append ? [...prev.media, ...mediaRes.media] : mediaRes.media,
          }));
          if (append) {
            setPage(pageNum);
          }
        }
      } catch (error) {
        console.log("Error fetching media: ", error);
        throw error;
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setLoading("fetching_media");
        }
      }
    },
    [accessToken, currentUser, collectionId, setLoading, userData.username]
  );

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    await fetchAllAlbumMedia(nextPage, true);
  }, [fetchAllAlbumMedia, page]);

  useEffect(() => {
    if (accessToken && collectionId && currentPath.endsWith(collectionId)) {
      fetchAllAlbumMedia();
    }
  }, [accessToken, currentUser, collectionId, currentPath]);

  const isInitialLoading = loading.includes("fetching_media") && page === 1;

  const getUserType = (): ActionType => {
    if (!currentUser) return "owner";
    return "others";
  };

  const userType = getUserType();
  const actions = createAlbumUniversalActions(
    props.id,
    props.name || "",
    props.image_url || "",
    {
      allowOpen: false,
      extendRoute: extendRoute,
      extendRouteWithQuery: extendRouteWithQuery,
    },
    "Album Cover"
  );

  const updateCoverLayout = async () => {
    setLoading("updating_cover_layout");
    try {
      const updateRes = await UpdateAllData({
        url: `${V1_BASE_URL}/media-gallery/collections/${collectionId}`,
        access: accessToken,
        field: { image_card_layout: coverLayout },
        method: "patch",
      });
      if (updateRes) {
        toast.success("Cover layout updated successfully!", {
          title: "Success",
        });
        clearQuerryParam();
      }
    } catch (error) {
      console.log("Error updating cover layout: ", error);
    } finally {
      setLoading("updating_cover_layout");
    }
  };

  useEffect(() => {
    setCoverLayout(props.image_card_layout as ImageCardProps);
  }, [props.image_card_layout]);

  return (
    <div className="p-4 md:p-6">
      <Modal
        showMinimizeButton={personaliseAction}
        isOpen={
          checkValidId(currentAction || "") || uploadAction || personaliseAction
        }
        onClose={() => {
          clearQuerryParam();
        }}
        title={`${updateAction === "true" ? "Update" : deleteAction === "true" ? "Delete" : ""} Media`}
        size="md"
      >
        {personaliseAction ? (
          <ImageCardControlPanel
            mediaData={coverLayout}
            setMediaData={setCoverLayout}
            onClick={updateCoverLayout}
            loading={loading.includes("updating_cover_layout")}
          />
        ) : (
          <MediaActions id={props.id} fetchAllAlbumMedia={fetchAllAlbumMedia} />
        )}
      </Modal>

      <div className="w-full flex  flex-col">
        {props?.name && (
          <div className="flex flex-col mb-5 max-w-3xl">
            <h2 className={`text-2xl sm:text-3xl font-semibold`}>
              {props.name}
            </h2>
            <p className={`opacity-70 `}>
              <TextFormatter>
                {props.description || "Album media collection"}
              </TextFormatter>
            </p>
            {!currentUser && (
              <div className="flex flex-wrap justify-start gap-x-3">
                <span>
                  <Button
                    text="Upload new media"
                    size="sm"
                    onClick={() => {
                      extendRouteWithQuery({ upload: "true" });
                    }}
                  />
                </span>
                {!personaliseAction && (
                  <span>
                    <Button
                      text="Personalise"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        extendRouteWithQuery({ personalise: "true" });
                      }}
                    />
                  </span>
                )}
                <GalleryCardActions
                  albumId={props.id}
                  albumTitle={props.name}
                  actions={actions}
                  userType={userType}
                  displayMode="popover"
                />
              </div>
            )}
          </div>
        )}

        <div className="">
          {albumMedia.total < 1 && !isInitialLoading ? (
            <div className="">
              <EmptyState
                imageHeight={200}
                imageWidth={200}
                imageUrl="/vectors/undraw_drag-and-drop_v4po.svg"
                actionText="Upload media"
                description="Start uploading media to this album"
                onAction={() => {
                  extendRouteWithQuery({ upload: "true" });
                }}
              />
            </div>
          ) : isInitialLoading ? (
            <div className=" h-[10rem] flex items-center justify-center  mx-auto ">
              {LoaderComponent ? (
                <LoaderComponent color={accentColor.color} />
              ) : (
                "Fetching album's media, please wait..."
              )}
            </div>
          ) : (
            <MasonryGrid
              gap={10}
              totalItems={albumMedia.total}
              customMessage={`Showing All media in album`}
              loadedItems={albumMedia.media.length}
              page={page}
              setPage={setPage}
              onLoadMore={handleLoadMore}
              isLoading={isLoadingMore}
              loadingIndicator={
                LoaderComponent ? (
                  <LoaderComponent color={accentColor.color} />
                ) : (
                  "Loading more..."
                )
              }
            >
              <ImageCard
                id={props.id}
                image_url={
                  props.image_url || "/vectors/undraw_monitor_ypga.svg"
                }
                isLoading={
                  loading.includes("fetching_cover_data") ||
                  loading.includes("fetching_album")
                }
                title={"Album Cover Photo"}
                titleWeight={coverLayout?.titleWeight}
                titleSize={coverLayout?.titleSize}
                overlayOpacity={coverLayout?.overlayOpacity}
                contentPadding={coverLayout?.contentPadding}
                disableHover={coverLayout?.disableHover}
                showGradientOverlay={coverLayout?.showGradientOverlay}
                borderColor={coverLayout?.borderColor}
                borderStyle={coverLayout?.borderStyle}
                borderWidth={coverLayout?.borderWidth}
                fullText={coverLayout?.fullText}
                width={coverLayout?.width}
                height={coverLayout?.height}
                aspectRatio={coverLayout?.aspectRatio}
                borderRadius={coverLayout?.borderRadius}
                shadow={coverLayout?.shadow}
                hoverShadow={coverLayout?.hoverShadow}
                showContent={coverLayout?.showContent}
                contentPosition={coverLayout?.contentPosition}
                hoverScale={coverLayout?.hoverScale}
                transition={coverLayout?.transition}
                titleLines={coverLayout?.titleLines}
                hoverEffect={coverLayout?.hoverEffect}
                descriptionLines={coverLayout?.descriptionLines}
                priority={coverLayout?.priority}
                quality={coverLayout?.quality}
                animation={coverLayout?.animation}
                disabled={coverLayout?.disabled}
                hideAction={false}
                loadingHeight={`${500}px`}
                actionPosition={coverLayout?.actionPosition}
                backgroundVariant={coverLayout?.backgroundVariant}
                placeholder="empty"
                fallbackImage="/vectors/undraw_monitor_ypga.svg"
                alt={props.name ? `Cover for ${props.name}` : "Album cover"}
              />
              {albumMedia.media.map((media, i) => {
                const getUserType = (): ActionType => {
                  if (!currentUser) return "owner";
                  return "others";
                };
                const userType = getUserType();
                const actions = createAlbumUniversalActions(
                  String(media.id),
                  String(media.title),
                  String(media.image_url),
                  {
                    isAlbum: false,
                    newUrl: `${currentPath}/${media?.id || ""}`,
                    router: router,
                  },
                  String(media.media_type)
                );
                return (
                  <ImageCard
                    key={`${media.id}-${i}`}
                    media_type={media.media_type}
                    image_url={
                      media.media_url || "/vectors/undraw_monitor_ypga.svg"
                    }
                    id={String(media.id)}
                    description={media.description}
                    titleWeight={media.image_card_layout?.titleWeight}
                    titleSize={media.image_card_layout?.titleSize}
                    overlayOpacity={media.image_card_layout?.overlayOpacity}
                    contentPadding={media.image_card_layout?.contentPadding}
                    disableHover={media.image_card_layout?.disableHover}
                    showGradientOverlay={
                      media.image_card_layout?.showGradientOverlay
                    }
                    borderColor={media.image_card_layout?.borderColor}
                    borderStyle={media.image_card_layout?.borderStyle}
                    borderWidth={media.image_card_layout?.borderWidth}
                    fullText={media.image_card_layout?.fullText}
                    width={media.image_card_layout?.width}
                    height={media.image_card_layout?.height}
                    aspectRatio={media.image_card_layout?.aspectRatio}
                    borderRadius={media.image_card_layout?.borderRadius}
                    shadow={media.image_card_layout?.shadow}
                    hoverShadow={media.image_card_layout?.hoverShadow}
                    showContent={media.image_card_layout?.showContent}
                    contentPosition={media.image_card_layout?.contentPosition}
                    hoverScale={media.image_card_layout?.hoverScale}
                    transition={media.image_card_layout?.transition}
                    titleLines={media.image_card_layout?.titleLines}
                    hoverEffect={media.image_card_layout?.hoverEffect}
                    descriptionLines={media.image_card_layout?.descriptionLines}
                    priority={media.image_card_layout?.priority}
                    quality={media.image_card_layout?.quality}
                    animation={media?.image_card_layout?.animation}
                    disabled={media?.image_card_layout?.disabled}
                    hideAction={false}
                    backgroundVariant={
                      media?.image_card_layout?.backgroundVariant
                    }
                    loadingHeight={`${500}px`}
                    actionPosition={
                      media?.image_card_layout?.PopoverdisplayPosition
                    }
                    onClick={() => {
                      extendRoute(String(media.id));
                    }}
                    title={media.title}
                    fallbackImage="/vectors/undraw_monitor_ypga.svg"
                    actions={() => (
                      <GalleryCardActions
                        albumId={String(media.id)}
                        albumTitle={String(media.title)}
                        actions={actions}
                        userType={userType}
                        displayMode={
                          media.image_card_layout?.PopoverdisplayMode ??
                          mediaCardDefault.PopoverdisplayMode
                        }
                      />
                    )}
                  />
                );
              })}
            </MasonryGrid>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaCollection;
