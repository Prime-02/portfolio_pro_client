import React, { useCallback, useEffect, useState } from "react";
import { AlbumProps } from "../../page-components/GalleryView";
import { useGlobalState } from "@/app/globalStateProvider";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import EmptyState from "@/app/components/containers/cards/EmptyState";
import Modal from "@/app/components/containers/modals/Modal";
import { toast } from "@/app/components/toastify/Toastify";
import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import Button from "@/app/components/buttons/Buttons";
import { Plus } from "lucide-react";
import MediaActions from "./MediaActions";

export interface MediaCollectionProps {
  className?: string;
  albumData?: AlbumProps;
}

export interface Media {
  id: string;
  title: string;
  media_type: string;
  description: string;
  media_url: string;
  is_public: boolean;
  is_featured: boolean;
  allow_download: boolean;
  created_at: string;
}

interface AllMedia {
  items: Media[];
  total: number;
}

const MediaCollection = (props: MediaCollectionProps) => {
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
  } = useGlobalState();
  const { loader, accentColor } = useTheme();

  const [albumMedia, setAlbumMedia] = useState<AllMedia>({
    items: [],
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const mediaId = checkParams("update");

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
          ? `${V1_BASE_URL}/media-gallery/users/${userData.username}/collections/${props.albumData?.id}/media?page=${pageNum}`
          : `${V1_BASE_URL}/media-gallery/collections/${props.albumData?.id || mediaId}/media?page=${pageNum}`;

        const mediaRes: AllMedia = await GetAllData({
          access: accessToken,
          url: url,
        });

        if (mediaRes) {
          setAlbumMedia((prev) => ({
            ...mediaRes,
            items: append ? [...prev.items, ...mediaRes.items] : mediaRes.items,
          }));
          if (append) {
            setPage(pageNum);
          }
        }
      } catch (error) {
        console.log("Error fetching media: ", error);
        toast.error("Failed to load media");
        throw error;
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setLoading("fetching_media");
        }
      }
    },
    [
      accessToken,
      currentUser,
      mediaId,
      props.albumData?.id,
      setLoading,
      userData.username,
    ]
  );

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    await fetchAllAlbumMedia(nextPage, true);
  }, [fetchAllAlbumMedia, page]);

  const handleDeleteMedia = useCallback((mediaId: string) => {
    extendRouteWithQuery({ delete: mediaId });
  }, []);

  const handleShareMedia = useCallback((mediaId: string) => {
    // Additional share logic if needed
  }, []);

  useEffect(() => {
    if (accessToken && (props.albumData?.id || mediaId)) {
      fetchAllAlbumMedia();
    }
  }, [
    accessToken,
    currentUser,
    mediaId,
    props.albumData?.id,
    fetchAllAlbumMedia,
  ]);

  const isInitialLoading = loading.includes("fetching_media") && page === 1;

  return (
    <div
      className={`flex-col w-full gap-y-3 rounded-2xl flex items-center justify-center h-auto`}
    >
      <Modal
        isOpen={checkParams("upload") === "true" || checkValidId(mediaId || "")}
        onClose={() => {
          clearQuerryParam();
        }}
        title="Upload Media"
        size="full"
      >
      <MediaActions
      fetchAllAlbumMedia={fetchAllAlbumMedia}
      />
      </Modal>

      <div className="w-full flex flex-col gap-4">
        {props.albumData?.name && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-semibold`}>
                {props.albumData.name}
              </h2>
              <p className={`opacity-70 mt-2`}>
                {props.albumData.description || "Album media collection"}
              </p>
            </div>
            <Button
              icon={<Plus />}
              variant="ghost"
              className="self-end sm:self-auto"
              onClick={() => {
                extendRouteWithQuery({ upload: "true" });
              }}
            />
          </div>
        )}

        <div className="w-full bg-[var(--background)] border-[var(--accent)] border rounded-2xl p-4">
          {albumMedia.total < 1 && !isInitialLoading ? (
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
          ) : isInitialLoading ? (
            <div>
              {LoaderComponent ? (
                <div className="w-full h-64 flex items-center justify-center">
                  <LoaderComponent color={accentColor.color} />
                </div>
              ) : (
                "Fetching album's media, please wait..."
              )}
            </div>
          ) : (
            <MasonryGrid
              gap={10}
              totalItems={albumMedia.total}
              loadedItems={albumMedia.items.length}
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
              {albumMedia.items.map((media, i) => (
                <ImageCard
                  key={`${media.id}-${i}`}
                  showGradientOverlay
                  image_url={media.media_url}
                  aspectRatio="auto"
                  contentPosition="bottom"
                  border="thin"
                  titleLines={1}
                  hoverEffect="lift"
                  id={media.id}
                  title={media.title}
                  onClick={(props) => {
                    if (props.id) {
                      extendRoute(props.id);
                    }
                  }}
                  description={media.description}
                  actions={() => (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareMedia(media.id);
                        }}
                        text="Share"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMedia(media.id);
                        }}
                        text="Delete"
                      />
                    </div>
                  )}
                />
              ))}

              {isLoadingMore &&
                Array.from({ length: 3 }).map((_, i) => (
                  <ImageCard
                    key={`loading-${i}`}
                    id={`loading-${i}`}
                    image_url=""
                    isLoading={true}
                  />
                ))}
            </MasonryGrid>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaCollection;
