import React from "react";
import { MoreVertical, Trash2, Share2 } from "lucide-react";
import Popover from "@/app/components/containers/divs/PopOver";
import { toast } from "@/app/components/toastify/Toastify";
import { getCurrentUrl } from "@/app/components/utilities/syncFunctions/syncs";

export interface GalleryCardActionsProps {
  albumId: string;
  albumTitle: string;
  isOwnGallery: boolean; // true when viewing own gallery, false when viewing another user's
  onDelete?: (albumId: string) => void;
  onShare?: (albumId: string) => void;
}

const GalleryCardActions = ({
  albumId,
  albumTitle,
  isOwnGallery,
  onDelete,
  onShare,
}: GalleryCardActionsProps) => {
  const handleShare = () => {
    const shareUrl = getCurrentUrl("full");
    navigator.clipboard.writeText(shareUrl);
    toast.success("Album link copied to clipboard");
    onShare?.(albumId);
  };

  const handleDelete = () => {
    toast.warning(`Delete confirmation for: ${albumTitle}`);
    onDelete?.(albumId);
  };

  return (
    <Popover
      position="bottom-left"
      clicker={
        <span className="bg-[var(--background)] cursor-pointer p-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
          <MoreVertical size={16} />
        </span>
      }
    >
      <div className="min-w-48 py-2">
        {isOwnGallery ? (
          // Options when viewing own gallery
          <>
            <button
              onClick={handleShare}
              className="w-full px-4 py-2 text-left hover:underline cursor-pointer transition-colors flex items-center gap-3"
            >
              <Share2 size={16} />
              <span>Share Album</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors flex items-center gap-3"
            >
              <Trash2 size={16} />
              <span>Delete Album</span>
            </button>
          </>
        ) : (
          // Options when viewing another user's gallery
          <>
            <button
              onClick={handleShare}
              className="w-full px-4 py-2 text-left hover:underline cursor-pointer transition-colors flex items-center gap-3"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </>
        )}
      </div>
    </Popover>
  );
};

export default GalleryCardActions;
