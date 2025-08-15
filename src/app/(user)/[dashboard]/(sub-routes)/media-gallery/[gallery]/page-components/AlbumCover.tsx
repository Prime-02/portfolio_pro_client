import React, { useRef, useState } from "react";
import ImageCard, {
  BorderRadiusVariant,
  HoverShadowVariant,
  ShadowVariant,
} from "@/app/components/containers/cards/ImageCard";
import { AlbumData } from "./MediaView";
import { useGlobalState } from "@/app/globalStateProvider";
import { ArrowDown, Edit, Heart, Share2, Trash2 } from "lucide-react";
import { BsHeartFill } from "react-icons/bs";
import {
  copyToClipboard,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";
import Modal from "@/app/components/containers/modals/Modal";
import GalleryActions from "../../page-components/GalleryActions";
import { toast } from "@/app/components/toastify/Toastify";

interface AlbumCoverProps {
  albumData: AlbumData;
  fetchAlbumData: () => void;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  showContent?: boolean;
  contentPosition?: "bottom" | "overlay" | "none";
  hoverScale?: number;
  priority?: boolean;
  quality?: number;
  borderRadius?: BorderRadiusVariant;
  shadow?: ShadowVariant;
  hoverShadow?: HoverShadowVariant;
  preserveAspectRatio?: boolean;
}

const AlbumCover: React.FC<AlbumCoverProps> = ({
  albumData,
  fetchAlbumData,
  width = 350,
  height = 400,
  className,
  aspectRatio = "auto",
  showContent = true,
  contentPosition = "overlay",
  hoverScale = 1.053,
  priority = false,
  quality = 75,
  borderRadius = "3xl",
  shadow = "xl",
  hoverShadow = "xl",
  preserveAspectRatio = false,
}) => {
  const {
    loading,
    currentUser,
    searchParams,
    clearQuerryParam,
    extendRouteWithQuery,
  } = useGlobalState();

  const componentRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState(false);

  // Get the current action from search params
  const updateAction = searchParams.get("update");
  const deleteAction = searchParams.get("delete");
  const currentAction = updateAction || deleteAction;
  const isEditMode = updateAction === "true";

  const scrollOutOfView = () => {
    if (componentRef.current) {
      // Calculate position to scroll to (bottom of component plus some padding)
      const scrollPosition =
        componentRef.current.offsetTop +
        componentRef.current.offsetHeight +
        window.innerHeight * 0.1; // 10% viewport padding

      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  const handleShare = async () => {
    try {
      await copyToClipboard(getCurrentUrl("full"));
      toast.success("Album link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // Here you could add API call to update likes on server
    toast.success(liked ? "Removed from favorites" : "Added to favorites");
  };

  const handleEdit = () => {
    extendRouteWithQuery({ update: "true" });
  };

  const handleDelete = () => {
    extendRouteWithQuery({ delete: "true" });
  };

  const isOwner = !currentUser;

  
  return (
    // <div
    //   ref={componentRef}
    //   className={`${className} overflow-auto hide-scrollbar relative flex flex-col items-center md:items-start mx-auto border rounded-2xl p-2 bg-background`}
    // >
    //   {/* Modal for album actions */}
    //   <Modal isOpen={!!currentAction} onClose={clearQuerryParam}>
    //     <GalleryActions
    //       edit={isEditMode}
    //       albumId={albumData.id}
    //       fetchAlbum={fetchAlbumData}
    //     />
    //   </Modal>

    //   {/* Action buttons - different layout for owner vs viewer */}
    //   <div className="flex items-center sticky w-full justify-start bottom-0 py-4 z-10">
    //     <div className="flex gap-3 pl-4">
    //       {/* Like button - always visible */}
    //       <span
    //         className="gap-x-1 flex items-center cursor-pointer hover:scale-110 transition-transform"
    //         onClick={handleLike}
    //         title={liked ? "Remove from favorites" : "Add to favorites"}
    //       >
    //         {liked ? (
    //           <BsHeartFill className="text-red-500 size-5" />
    //         ) : (
    //           <Heart className="text-red-500 size-5" />
    //         )}
    //         <p className="text-xs">{albumData.likes || 0}</p>
    //       </span>

    //       {/* Share button - always visible */}
    //       <Share2
    //         onClick={handleShare}
    //         className="size-5 cursor-pointer hover:scale-110 transition-transform"
    //         title="Share album"
    //       />

    //       {/* Owner-only actions */}
    //       {isOwner && (
    //         <>
    //           <Edit
    //             onClick={handleEdit}
    //             className="cursor-pointer size-5 hover:scale-110 transition-transform text-blue-500"
    //             title="Edit album"
    //           />
    //           <Trash2
    //             onClick={handleDelete}
    //             className="cursor-pointer size-5 text-red-500 hover:scale-110 transition-transform"
    //             title="Delete album"
    //           />
    //         </>
    //       )}

    //       {/* Scroll button - mobile only */}
    //       <ArrowDown
    //         onClick={scrollOutOfView}
    //         className="size-5 md:hidden cursor-pointer hover:scale-110 transition-transform"
    //         title="Scroll down"
    //       />
    //     </div>
    //   </div>

    //   {/* Album cover image */}
    //   <div className="relative" style={{ width: `${width}px` }}>
        <ImageCard
          id={albumData.id}
          image_url={albumData?.cover_media_url}
          title={albumData?.name}
          description={albumData?.description}
          isLoading={
            loading.includes("fetching_cover_data") ||
            loading.includes("fetching_album")
          }
          fullText
          width={width}
          height={height}
          aspectRatio={preserveAspectRatio ? undefined : aspectRatio}
          borderRadius={borderRadius}
          shadow={shadow}
          imageHeight={500}
          hoverShadow={hoverShadow}
          showContent={showContent}
          contentPosition={contentPosition}
          hoverScale={hoverScale}
          transition="fast" 
          titleLines={2}
          hoverEffect="lift"
          descriptionLines={3}
          priority={priority}
          quality={quality}
          placeholder="empty"
          fallbackImage="/placeholder.jpg"
          loadingHeight={`${height}px`}
          alt={albumData ? `Cover for ${albumData.name}` : "Album cover"}
          actions={() => <></>}
        />
      
      // {showContent && albumData && (
      //   <div className="w-full px-4 py-2 text-center md:text-left">
      //     <p className="text-xs opacity-65">
      //       {albumData.is_public ? "Public Album" : "Private Album"}
      //       {albumData.created_at && (
      //         <span>
      //           {" "}
      //           • Created {new Date(albumData.created_at).toLocaleDateString()}
      //         </span>
      //       )}
      //     </p>
      //   </div>
      // )}
    // </div>
  );
};

export default AlbumCover;
