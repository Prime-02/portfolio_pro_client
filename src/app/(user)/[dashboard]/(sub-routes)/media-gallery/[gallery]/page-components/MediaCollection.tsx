import React, { useCallback, useEffect, useState } from "react";
import { useGlobalState } from "@/app/globalStateProvider";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import EmptyState from "@/app/components/containers/cards/EmptyState";
import Modal from "@/app/components/containers/modals/Modal";
import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import MediaActions from "./MediaActions";
import { AlbumData } from "./MediaView";
import { createAlbumUniversalActions } from "../../imageActions";
import GalleryCardActions, {
  ActionType,
} from "../../page-components/GalleryCardActions";
import { ImageCardProps } from "@/app/components/types and interfaces/ImageCardTypes";

interface AllMedia {
  media: ImageCardProps[];
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
  } = useGlobalState();
  const { loader, accentColor } = useTheme();

  const [albumMedia, setAlbumMedia] = useState<AllMedia>({
    media: [],
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const uploadAction = checkParams("upload") === "true";
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
      allowCreate: true,
    },
    "Album Cover"
  );

  return (
    <div>
      <Modal
        isOpen={checkValidId(currentAction || "") || uploadAction}
        onClose={() => {
          clearQuerryParam();
        }}
        title={`${updateAction === "true" ? "Update" : deleteAction === "true" ? "Delete" : ""} Media`}
        size="md"
      >
        <MediaActions
          id={props.id}
          fetchAllAlbumMedia={fetchAllAlbumMedia}
        />{" "}
      </Modal>

      <div className="w-full flex flex-col gap-4">
        {props?.name && (
          <div className="flex flex-col  max-w-3xl gap-4">
            <h2 className={`text-2xl sm:text-3xl font-semibold`}>
              {props.name}
            </h2>
            <p className={`opacity-70 mt-2`}>
              {props.description || "Album media collection"}
            </p>
            <GalleryCardActions
              albumId={props.id}
              albumTitle={props.name}
              actions={actions}
              userType={userType}
              displayMode="buttons"
            />
          </div>
        )}

        <div className="w-full bg-[var(--background)] border-[var(--accent)] border rounded-2xl py-1">
          {albumMedia.total < 1 && !isInitialLoading ? (
            <div className="w-sm">
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
            <div className="w-sm h-[10rem] flex items-center justify-center  mx-auto ">
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
                titleWeight={props.media?.titleWeight}
                titleSize={props.media?.titleSize}
                overlayOpacity={props.media?.overlayOpacity}
                contentPadding={props.media?.contentPadding}
                disableHover={props.media?.disableHover}
                showGradientOverlay={props.media?.showGradientOverlay}
                borderColor={props.media?.borderColor}
                borderStyle={props.media?.borderStyle}
                borderWidth={props.media?.borderWidth}
                fullText={props.media?.fullText}
                width={props.media?.width}
                height={props.media?.height}
                aspectRatio={props.media?.aspectRatio}
                borderRadius={props.media?.borderRadius}
                shadow={props.media?.shadow}
                hoverShadow={props.media?.hoverShadow}
                showContent={props.media?.showContent}
                contentPosition={props.media?.contentPosition}
                hoverScale={props.media?.hoverScale}
                transition={props.media?.transition}
                titleLines={props.media?.titleLines}
                hoverEffect={props.media?.hoverEffect}
                descriptionLines={props.media?.descriptionLines}
                priority={props.media?.priority}
                quality={props.media?.quality}
                placeholder="empty"
                fallbackImage="/vectors/undraw_monitor_ypga.svg"
                loadingHeight={`${props.media?.height}px`}
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
                    extendRouteWithQuery: extendRouteWithQuery,
                    isAlbum: false,
                    extendRoute: extendRoute,
                  },
                  String(media.media_type)
                );
                return (
                  <ImageCard
                    key={`${media.id}-${i}`}
                    showGradientOverlay
                    media_type={media.media_type}
                    image_url={
                      media.media_url || "/vectors/undraw_monitor_ypga.svg"
                    }
                    contentPosition="overlay"
                    titleLines={1}
                    aspectRatio="auto"
                    hoverEffect="lift"
                    id={String(media.id)}
                    onClick={() => {
                      extendRoute(String(media.id));
                    }}
                    title={media.title}
                    fallbackImage="/vectors/undraw_monitor_ypga.svg"
                    description={media.description}
                    actions={() => (
                      <GalleryCardActions
                        albumId={String(media.id)}
                        albumTitle={String(media.title)}
                        actions={actions}
                        userType={userType}
                        popoverPosition="bottom-left"
                        displayMode="circular-icons-horizontal"
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
