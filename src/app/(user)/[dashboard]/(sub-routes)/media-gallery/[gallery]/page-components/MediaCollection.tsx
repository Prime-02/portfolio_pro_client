import React, { useCallback, useEffect, useState } from "react";
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
import { AlbumData } from "./MediaView";
import { createAlbumUniversalActions } from "../../imageActions";
import GalleryCardActions, {
  ActionType,
} from "../../page-components/GalleryCardActions";
import Link from "next/link";

export interface Media {
  id?: string;
  title?: string;
  media_type?: string;
  description?: string;
  media_url?: string;
  is_public: boolean;
  is_featured: boolean;
  allow_download: boolean;
  created_at?: string;
}

interface AllMedia {
  items: Media[];
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
  } = useGlobalState();
  const { loader, accentColor } = useTheme();

  const [albumMedia, setAlbumMedia] = useState<AllMedia>({
    items: [],
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
    [accessToken, currentUser, collectionId, setLoading, userData.username]
  );

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    await fetchAllAlbumMedia(nextPage, true);
  }, [fetchAllAlbumMedia, page]);

  useEffect(() => {
    if (accessToken && collectionId) {
      fetchAllAlbumMedia();
    }
  }, [accessToken, currentUser, collectionId]);

  const isInitialLoading = loading.includes("fetching_media") && page === 1;

  return (
    <div
      className={`flex-col w-full md:w-[75%] gap-y-3 rounded-2xl flex items-center justify-center h-full `}
    >
      <Modal
        isOpen={checkValidId(currentAction || "")}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-semibold`}>
                {props.name}
              </h2>
              <p className={`opacity-70 mt-2`}>
                {props.description || "Album media collection"}
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

        <div className="w-full bg-[var(--background)] md:max-h-screen overflow-auto hide-scrollbar border-[var(--accent)] border rounded-2xl p-2">
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
              {albumMedia.items.map((media, i) => {
                const getUserType = (): ActionType => {
                  if (!currentUser) return "owner";
                  return "others";
                };
                const userType = getUserType();
                const actions = createAlbumUniversalActions(
                  String(media.id),
                  String(media.title),
                  String(media.media_url),
                  {
                    extendRouteWithQuery: extendRouteWithQuery,
                    isAlbum: false,
                  },
                  String(media.media_type)
                );
                return (
                  <Link
                    href={`/${userData.username}/media-gallery/${collectionId}/${media.id}`}
                    scroll={false}
                    key={`${media.id}-${i}`}
                  >
                    <ImageCard
                      key={`${media.id}-${i}`}
                      showGradientOverlay
                      image_url={media.media_url || ""}
                      contentPosition="overlay"
                      titleLines={1}
                      aspectRatio="auto"
                      hoverEffect="lift"
                      id={String(media.id)}
                      title={media.title}
                      description={media.description}
                      actions={() => (
                        <GalleryCardActions
                          albumId={String(media.id)}
                          albumTitle={String(media.title)}
                          actions={actions}
                          userType={userType}
                          popoverPosition="bottom-left"
                        />
                      )}
                    />
                  </Link>
                );
              })}

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
