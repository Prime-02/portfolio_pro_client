import { toast } from "@/app/components/toastify/Toastify";
import {
  copyToClipboard,
  downloadMediaFile,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";
import {
  ArrowRight,
  Download,
  Edit,
  Eye,
  Flag,
  Heart,
  Share2,
  Trash2,
} from "lucide-react";
import { ActionItem } from "./page-components/GalleryCardActions";

type DisplayMode = "popover" | "circular-icons-vertical" | "circular-icons-horizontal" | "buttons";

interface AlbumActionsConfig {
  allowShare?: boolean;
  allowOpen?: boolean;
  allowDownload?: boolean;
  allowEdit?: boolean;
  allowLike?: boolean;
  allowAnalytics?: boolean;
  allowReport?: boolean;
  allowDelete?: boolean;
  extendRoute?: (segment: string) => void;
  extendRouteWithQuery?: (newParams: Record<string, string>) => void;
  isAlbum?: boolean;
  displayMode?: DisplayMode;
}

export const createAlbumUniversalActions = (
  id: string,
  title: string,
  coverUrl: string,
  config: AlbumActionsConfig = {},
  type: "Album" | "Photo" | "Video" | "Audio" | "Album Cover" | string = "Album"
): ActionItem[] => {
  const noop = () => {};

  const {
    extendRoute = noop,
    extendRouteWithQuery = noop,
    isAlbum = true,
    displayMode = "popover",
    ...actionConfig
  } = config;

  // Capitalize the type for display purposes
  const capitalizedType =
    type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  const actions: ActionItem[] = [];

  // Share action
  if (config.allowShare !== false) {
    actions.push({
      icon: Share2,
      actionName: `Share ${capitalizedType}`,
      onClick: () => {
        const shareUrl = getCurrentUrl("full");
        if (isAlbum) {
          copyToClipboard(`${shareUrl}/${id}`);
        } else {
          copyToClipboard(`${shareUrl}?${type}=${id}`);
        }
      },
      type: ["owner", "others"],
      displayMode,
    });
  }

  // Open action
  if (config.allowOpen !== false) {
    actions.push({
      icon: ArrowRight,
      actionName: `Open ${capitalizedType}`,
      onClick: () => {
        extendRoute(id);
      },
      type: ["owner", "others"],
      displayMode,
    });
  }

  // Download action
  if (config.allowDownload !== false) {
    actions.push({
      icon: Download,
      actionName: `Download ${type === "Album" ? "Cover" : capitalizedType}`,
      onClick: async () => {
        toast.info("Starting download...");
        await downloadMediaFile(
          coverUrl,
          `${title}-${type === "Album" ? "cover" : type.toLowerCase()}`
        );
      },
      type: ["owner", "others"],
      displayMode,
    });
  }

  // Edit action
  if (config.allowEdit !== false) {
    actions.push({
      icon: Edit,
      actionName: `Edit ${capitalizedType}`,
      onClick: () => {
        toast.info(`Editing ${type.toLowerCase()}: ${title}`);
        extendRouteWithQuery({
          update: "true",
          [isAlbum ? "albumCover" : "media"]: id,
        });
      },
      type: "owner",
      displayMode,
    });
  }

  // Like action
  if (config.allowLike !== false) {
    actions.push({
      icon: Heart,
      actionName: `Like ${capitalizedType}`,
      onClick: () => {
        toast.success(`${capitalizedType} liked!`);
      },
      type: "others",
      displayMode,
    });
  }

  // View Analytics action
  if (config.allowAnalytics) {
    actions.push({
      icon: Eye,
      actionName: `View ${capitalizedType} Analytics`,
      onClick: () => {
        toast.info(`Loading ${type.toLowerCase()} analytics...`);
      },
      type: "owner",
      displayMode,
    });
  }

  // Report action
  if (config.allowReport) {
    actions.push({
      icon: Flag,
      actionName: `Report ${capitalizedType}`,
      onClick: () => {
        toast.info("Report submitted");
      },
      type: "others",
      style:
        "hover:bg-yellow-100 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
      displayMode,
    });
  }

  // Delete action
  if (config.allowDelete !== false) {
    actions.push({
      icon: Trash2,
      actionName: `Delete ${capitalizedType}`,
      onClick: () => {
        extendRouteWithQuery({
          delete: "true",
          [isAlbum ? "albumCover" : "media"]: id,
        });
        toast.warning(`Delete confirmation for: ${title}`);
      },
      type: "owner",
      style:
        "hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400",
      displayMode,
    });
  }

  return actions;
};