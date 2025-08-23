"use client";
import Button from "@/app/components/buttons/Buttons";
import EmptyState from "@/app/components/containers/cards/EmptyState";
import Modal from "@/app/components/containers/modals/Modal";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import { Plus } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import GalleryActions from "./GalleryActions";
import GalleryCardActions, { ActionType } from "./GalleryCardActions"; // Import the new component
import ImageCard from "@/app/components/containers/cards/ImageCard";
import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import { createAlbumUniversalActions } from "../imageActions";
import { AlbumData } from "../[gallery]/page-components/AlbumView";

const GalleryView = () => {
  const {
    accessToken,
    setLoading,
    loading,
    currentUser,
    extendRouteWithQuery,
    searchParams,
    clearQuerryParam,
    extendRoute,
    checkValidId,
  } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const [galleries, setGalleries] = useState<{
    total: number;
    media: AlbumData[];
  }>({
    total: 0,
    media: [],
  });
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const create = searchParams.get("create") === "true";
  const deleteParam =
    searchParams.get("delete") === "true" ? searchParams.get("albumCover") : "";
  const isValidId = deleteParam !== null && checkValidId(deleteParam);
  const LoaderComponent = getLoader(loader) || null;

  const fetchGallery = useCallback(
    async (pageNum = 1, append = false) => {
      // const loadingKey = append ? "loading_more_albums" : "fetching_albums";

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setLoading("fetching_albums");
        }

        const url = currentUser
          ? `${V1_BASE_URL}/media-gallery/users/${currentUser}/collections?page=${pageNum}`
          : `${V1_BASE_URL}/media-gallery/collections?page=${pageNum}`;

        const galleryRes: { total: number; media: AlbumData[] } =
          await GetAllData({
            access: accessToken,
            url: url,
          });

        if (galleryRes) {
          setGalleries((prev) => ({
            ...galleryRes,
            media: append
              ? [...prev.media, ...galleryRes.media]
              : galleryRes?.media?.length > 0 && galleryRes?.media
                ? galleryRes.media
                : [],
          }));
        }
      } catch (error) {
        throw error; // Re-throw to let MasonryGrid handle page reversion
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setLoading("fetching_albums");
        }
      }
    },
    [accessToken, currentUser, setLoading]
  );

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    await fetchGallery(nextPage, true);
  }, [fetchGallery, page]);

  const refreshGallery = useCallback(() => {
    setPage(1);
    fetchGallery(1, false);
  }, [fetchGallery]);

  useEffect(() => {
    if (!accessToken) return;
    refreshGallery();
  }, [accessToken, currentUser]);

  const isInitialLoading = loading.includes("fetching_albums") && page === 1;

  return (
    <div className="pb-8">
      <Modal
        isOpen={isValidId || create}
        onClose={clearQuerryParam}
        title={`${isValidId ? "Delete" : "Upload"} Album`}
        loading={loading.includes("fetching_album")}
        size={isValidId ? "sm" : "full"}
      >
        <GalleryActions
          albumId={isValidId ? deleteParam : null}
          fetchAlbum={refreshGallery}
        />
      </Modal>

      <header className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 mb-6">
          <div>
            <h2 className={`text-2xl sm:text-3xl font-semibold`}>
              {currentUser ? `${currentUser}'s Media Album` : `My Media Album`}
            </h2>
            <p className={`opacity-70 mt-2`}>
              {currentUser
                ? `${currentUser}'s personal captures, creative experiments, and professional work-in-progress`
                : `Personal captures, creative experiments, and professional work-in-progress`}
            </p>
          </div>
          <Button
            icon={<Plus />}
            variant="ghost"
            className="self-end sm:self-auto"
            onClick={() => {
              extendRouteWithQuery({ create: "true" });
            }}
          />
        </div>
      </header>

      <div className="pb-8">
        {galleries.media?.length < 1 && !isInitialLoading ? (
          <EmptyState
            imageHeight={200}
            imageWidth={200}
            imageUrl="/vectors/undraw_profile-image_2hi8.svg"
            actionText="Create your first album"
            onAction={() => {
              extendRouteWithQuery({ create: "true" });
            }}
            description="No image album or gallery found"
            className="border-[var(--accent)] border"
          />
        ) : isInitialLoading ? (
          LoaderComponent ? (
            <div className="flex justify-center items-center py-4 w-full">
              <LoaderComponent color={accentColor.color} />
            </div>
          ) : (
            "Loading..."
          )
        ) : (
          <MasonryGrid
            gap={3}
            totalItems={galleries.total}
            loadedItems={galleries.media.length}
            page={page}
            customMessage={`Showing All album`}
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
            {/* Render actual gallery items */}
            {galleries.media.map((gallery, i) => {
              const getUserType = (): ActionType => {
                if (!currentUser) return "owner";
                return "others";
              };

              const userType = getUserType();
              const actions = createAlbumUniversalActions(
                gallery.id,
                gallery.name || "",
                gallery.cover_media_url || "",
                {
                  extendRoute: extendRoute,
                  extendRouteWithQuery: extendRouteWithQuery,
                  allowEdit: false,
                },
                "Album"
              );
              return (
                <ImageCard
                  key={`${gallery.id}-${i}`}
                  titleWeight={gallery.media?.titleWeight}
                  titleSize={gallery.media?.titleSize}
                  overlayOpacity={gallery.media?.overlayOpacity}
                  contentPadding={gallery.media?.contentPadding}
                  disableHover={gallery.media?.disableHover}
                  showGradientOverlay={gallery.media?.showGradientOverlay}
                  borderColor={gallery.media?.borderColor}
                  borderStyle={gallery.media?.borderStyle}
                  borderWidth={gallery.media?.borderWidth}
                  fullText={gallery.media?.fullText}
                  width={gallery.media?.width}
                  height={gallery.media?.height}
                  aspectRatio={gallery.media?.aspectRatio}
                  borderRadius={gallery.media?.borderRadius}
                  shadow={gallery.media?.shadow}
                  hoverShadow={gallery.media?.hoverShadow}
                  showContent={gallery.media?.showContent}
                  contentPosition={gallery.media?.contentPosition}
                  hoverScale={gallery.media?.hoverScale}
                  transition={gallery.media?.transition}
                  titleLines={gallery.media?.titleLines}
                  hoverEffect={gallery.media?.hoverEffect}
                  descriptionLines={gallery.media?.descriptionLines}
                  priority={gallery.media?.priority}
                  quality={gallery.media?.quality}
                  image_url={gallery.cover_media_url}
                  fill={gallery.media?.fill}
                  imageHeight={gallery.media?.imageHeight}
                  descriptionSize={gallery.media?.descriptionSize}
                  descriptionWeight={gallery.media?.descriptionWeight}
                  backgroundVariant={gallery.media?.backgroundVariant}
                  textVariant={gallery.media?.textVariant}
                  animation={gallery.media?.animation}
                  disabled={gallery.media?.disabled}
                  hideAction={gallery.media?.hideAction}
                  actionPosition={gallery.media?.actionPosition}
                  id={gallery.id}
                  title={gallery.name}
                  onClick={() => {
                    if (gallery.id) {
                      extendRoute(gallery.id);
                    }
                  }}
                  description={gallery.description}
                  actions={() => (
                    <GalleryCardActions
                      albumId={gallery.id}
                      albumTitle={gallery.name || ""}
                      actions={actions}
                      userType={userType}
                      popoverPosition={gallery.media?.actionPosition}
                    />
                  )}
                />
              );
            })}

            {/* Render loading placeholders when loading more */}
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
  );
};

export default GalleryView;
