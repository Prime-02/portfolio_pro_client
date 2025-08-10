"use client";
import Button from "@/app/components/buttons/Buttons";
import EmptyState from "@/app/components/containers/cards/EmptyState";
import Modal from "@/app/components/containers/modals/Modal";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import { Plus } from "lucide-react";
import React, { useState, useCallback } from "react";
import GalleryActions from "./GalleryActions";
import MasonryGrid from "@/app/components/containers/divs/masonry/components/MasonryGrid";

export interface AlbumProps {
  name: string;
  description?: string;
  is_public: boolean;
  cover_media_url: string;
  created_at: string;
  updated_at: string | null;
  id?: string;
  user_id: string;
  cover_media_url_id: string;
}

const GalleryView = () => {
  const {
    accessToken,
    loading,
    currentUser,
    extendRouteWithQuery,
    searchParams,
    clearQuerryParam,
  } = useGlobalState();

  const { loader, accentColor } = useTheme();
  const LoaderComponent = getLoader(loader) || null;

  // State for triggering refresh
  const [refreshKey, setRefreshKey] = useState(0);

  const create = searchParams.get("create") === "true";
  const updateParam = searchParams.get("update");
  const isValidId =
    updateParam !== null &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      updateParam
    );

  // Data URL for the API
  const dataUrl = currentUser
    ? `${V1_BASE_URL}/media-gallery/user/${currentUser}/collections`
    : `${V1_BASE_URL}/media-gallery/collections`;

  // Data mapping configuration - matches your API response structure
  const dataMapping = {
    imageUrl: "cover_media_url",
    title: "name",
    description: "description",
    id: "id",
  };

  // Refresh function for after album creation/update
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Handle modal close and refresh if needed
  const handleModalClose = useCallback(() => {
    clearQuerryParam();
    // Small delay to allow modal to close smoothly before refresh
    if (create || isValidId) {
      setTimeout(() => {
        handleRefresh();
      }, 300);
    }
  }, [clearQuerryParam, create, isValidId, handleRefresh]);

  // Loading component
  const loadingComponent = LoaderComponent ? (
    <div className="flex justify-center items-center py-12 w-full">
      <div className="text-center">
        <LoaderComponent color={accentColor.color} />
        <p className="mt-4 text-sm  dark:">Loading your gallery...</p>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2  dark:"></div>
    </div>
  );

  // Empty state component
  const emptyStateComponent = (
    <div className="flex justify-center items-center py-16">
      <EmptyState
        imageHeight={300}
        imageWidth={300}
        imageUrl="/vectors/undraw_profile-image_2hi8.svg"
        actionText="Create your first album"
        onAction={() => {
          extendRouteWithQuery({ create: "true" });
        }}
        description="No image albums or galleries found. Start by creating your first collection."
        className="border-[var(--accent)] border rounded-lg p-8"
      />
    </div>
  );

  // Error component
  const errorComponent = (
    <div className="flex justify-center items-center py-16">
      <div className="text-center max-w-md">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Failed to load gallery</h3>
        <p className=" dark: mb-6">
          There was an error loading your gallery. Please check your connection
          and try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleRefresh} text="Try Again" />
          <Button
            variant="ghost"
            onClick={() => extendRouteWithQuery({ create: "true" })}
            text="Create New Album"
            icon={<Plus size={16} />}
          />
        </div>
      </div>
    </div>
  );

  // Handle card click to view/edit album
  const handleCardClick = useCallback(
    (albumId: string) => {
      extendRouteWithQuery({ update: albumId });
    },
    [extendRouteWithQuery]
  );

  return (
    <div className="pb-8 min-h-screen b">
      <Modal
        isOpen={isValidId || create}
        onClose={handleModalClose}
        title={`${isValidId ? "Update" : "Create"} Image Album`}
        loading={loading.includes("fetching_album")}
        size="full"
      >
        <GalleryActions fetchAlbum={handleRefresh} />
      </Modal>

      <header className=" ">
        <div className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold">
                {currentUser
                  ? `${currentUser}'s Image Gallery`
                  : `My Image Album`}
              </h2>
              <p className="  mt-2">
                {currentUser
                  ? `${currentUser}'s personal captures, creative experiments, and professional work-in-progress`
                  : `Personal captures, creative experiments, and professional work-in-progress`}
              </p>
            </div>
            <Button
              icon={<Plus />}
              text="New Album"
              onClick={() => {
                extendRouteWithQuery({ create: "true" });
              }}
            />
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        <MasonryGrid
          // Key prop to force refresh when needed
          key={`gallery-${refreshKey}`}
          // Data & API configuration
          dataUrl={dataUrl}
          accessToken={accessToken}
          // Based on your API response: { "data": [...], "total": 14 }
          // Remove dataPath since your API returns the array directly in "data"
          dataPath="" // Let the component auto-detect the array
          dataMapping={dataMapping}
          // Pagination
          enablePagination={true}
          infiniteScroll={true}
          paginationConfig={{
            page: 1,
            size: 20,
          }}
          // Scroll direction
          // Layout configuration
          columns={{
            base: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5,
            "2xl": 6,
          }}
          gap={10}
          padding={0}
          distributionStrategy="balanced"
          balanceHeights={true}
          // Animation
          animated={true}
          fadeIn={true}
          animationDuration={300}
          staggerDelay={50}
          // ImageCard props (passed to all cards)
          imageCardProps={{
            variant:"outlined",
            size: "md",
            aspectRatio: "auto",
            imageFit:"contain",
            hoverEffect: "lift",
            animated: true,
            clickable: true,
            borderRadius: "card",
            titleLines: 2,
            descriptionLines: 2,
            showActionsOnHover: false,
            textPlacement: "top",
            className:
              "hover:shadow-xl transition-all duration-300 cursor-pointer",
            titleClassName: "font-semibold",
            descriptionClassName: " dark:",
            imageClassName:
              "group-hover:scale-105 transition-transform duration-300",
          }}

          // Handle item clicks
          onItemClick={(
            album: AlbumProps,
            index: number,
            e: React.MouseEvent
          ) => {
            e.preventDefault();
            if (album.id) {
              handleCardClick(album.id);
            }
          }}
          // State components
          loadingComponent={loadingComponent}
          errorComponent={errorComponent}
          emptyStateComponent={emptyStateComponent}
          // Transform data to add click handler data
          transformData={(rawData: AlbumProps[]) => {
            return rawData.map((album) => ({
              ...album,
              // Add any transformations needed
              formattedDate: new Date(album.created_at).toLocaleDateString(),
              isPublic: album.is_public,
            }));
          }}
          // Callbacks
          onDataLoad={(data: AlbumProps[]) => {
            console.log("Gallery data loaded:", data.length, "albums");
          }}
          onError={(error: any) => {
            console.error("Gallery error:", error);
          }}
          onColumnCountChange={(count: number) => {
            console.log("Column count changed to:", count);
          }}
          // Custom styling
          className="w-full"
          containerStyle={{
            minHeight: "400px",
          }}
        />
      </div>
    </div>
  );
};

export default GalleryView;
