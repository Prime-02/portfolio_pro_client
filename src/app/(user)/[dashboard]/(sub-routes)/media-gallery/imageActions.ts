import {
  copyToClipboard,
  downloadMediaFile,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";
import {
  Maximize,
  Download,
  Edit,
  Eye,
  Flag,
  Heart,
  Share2,
  Trash2,
  Plus,
} from "lucide-react";
import { ActionItem } from "./page-components/GalleryCardActions";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "@/app/components/toastify/Toastify";

interface AlbumActionsConfig {
  allowCreate?: boolean;
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
  router?: AppRouterInstance;
  newUrl?: string;
  noop?: () => void | unknown;
  isAlbum?: boolean;
}

export const createAlbumUniversalActions = (
  id: string,
  title: string,
  coverUrl: string,
  config: AlbumActionsConfig = {},
  type: "Album" | "Photo" | "Video" | "Audio" | "Album Cover" | string = "Album"
): ActionItem[] => {
  const noop = config.noop || (() => {});
  const {
    extendRoute = noop,
    extendRouteWithQuery = noop,
    newUrl,
    isAlbum = true,
    router,
    // ...actionConfig
  } = config;

  const mediaCustomPathAction = ({
    action,
    value,
  }: {
    action: string;
    value: string;
  }) => {
    if (newUrl) {
      const customPath = PathUtil.buildUrlWithQuery(newUrl, {
        [action]: true,
        media: value,
      });
      return customPath;
    } else {
      return null;
    }
  };

  // Capitalize the type for display purposes
  const capitalizedType =
    type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  const actions: ActionItem[] = [];

  // Helper function to handle route navigation
  const handleRoute = (id: string) => {
    const customUrl = mediaCustomPathAction({ action: "open", value: id });
    if (customUrl) {
      if (router) {
        router.push(customUrl);
      }
    } else if (extendRoute !== noop) {
      extendRoute(id);
    } else if (extendRouteWithQuery !== noop) {
      extendRouteWithQuery({
        [isAlbum ? "albumCover" : "media"]: id,
      });
    } else {
      noop();
    }
  };

  // Create action
  if (config.allowCreate) {
    actions.push({
      icon: Plus,
      actionName: `Create ${capitalizedType}`,
      onClick: () => {
        try {
          const customUrl = mediaCustomPathAction({
            action: "upload",
            value: id,
          });
          if (customUrl) {
            if (router) {
              router.push(customUrl);
            }
          } else if (extendRouteWithQuery !== noop) {
            extendRouteWithQuery({
              upload: "true",
            });
          } else {
            noop();
          }
        } catch (error) {
          console.log(error);
          noop();
        }
      },
      type: ["owner"],
    });
  }
  // Share action
  if (config.allowShare !== false) {
    actions.push({
      icon: Share2,
      actionName: `Share ${capitalizedType}`,
      onClick: () => {
        try {
          const shareUrl = getCurrentUrl("full");
          if (isAlbum) {
            copyToClipboard(`${shareUrl}/${id}`);
          } else {
            copyToClipboard(`${shareUrl}?${type}=${id}`);
          }
        } catch (error) {
          console.log(error);
          noop();
        }
      },
      type: ["owner", "others"],
    });
  }

  // Open action
  if (config.allowOpen !== false) {
    actions.push({
      icon: Maximize,
      actionName: `Open ${capitalizedType}`,
      onClick: () => {
        try {
          handleRoute(id);
        } catch (error) {
          console.log(error);
          noop();
        }
      },
      type: ["owner", "others"],
    });
  }

  // Download action
  if (config.allowDownload !== false) {
    actions.push({
      icon: Download,
      actionName: `Download ${type === "Album" ? "Cover" : capitalizedType}`,
      onClick: async () => {
        try {
          // toast.info("Starting download...");
          await downloadMediaFile(
            coverUrl,
            `${title}-${type === "Album" ? "cover" : type.toLowerCase()}`
          );
        } catch (error) {
          console.log(error);
          noop();
        }
      },
      type: ["owner", "others"],
    });
  }

  // Edit action
  if (config.allowEdit !== false) {
    actions.push({
      icon: Edit,
      actionName: `Edit ${capitalizedType}`,
      onClick: () => {
        try {
          // toast.info(`Editing ${type.toLowerCase()}: ${title}`);
          const customUrl = mediaCustomPathAction({
            action: "update",
            value: id,
          });
          if (customUrl) {
            if (router) {
              router.push(customUrl);
            }
          } else if (extendRouteWithQuery !== noop) {
            extendRouteWithQuery({
              update: "true",
              [isAlbum ? "albumCover" : "media"]: id,
            });
          } else {
            noop();
          }
        } catch (error) {
          console.log(error);
          noop();
        }
      },
      type: "owner",
    });
  }

  // Like action
  if (config.allowLike !== false) {
    actions.push({
      icon: Heart,
      actionName: `Like ${capitalizedType}`,
      onClick: () => {
        try {
        } catch (error) {
          console.log(error);
          noop();
        }
      },
      type: "others",
    });
  }

  // View Analytics action
  if (config.allowAnalytics) {
    actions.push({
      icon: Eye,
      actionName: `View ${capitalizedType} Analytics`,
      onClick: () => {
        try {
          // toast.info(`Loading ${type.toLowerCase()} analytics...`);
          const customUrl = mediaCustomPathAction({
            action: "analytics",
            value: id,
          });
          if (customUrl) {
            if (router) {
              router.push(customUrl);
            }
          } else {
            // Fallback behavior for analytics
            console.log(`Analytics for ${type} ${id} not implemented`);
          }
        } catch (error) {
          console.log(error);
          noop();
        }
      },
      type: "owner",
    });
  }

  // Report action
  if (config.allowReport) {
    actions.push({
      icon: Flag,
      actionName: `Report ${capitalizedType}`,
      onClick: () => {
        try {
          // toast.info("Report submitted");
          const customUrl = mediaCustomPathAction({
            action: "report",
            value: id,
          });
          if (customUrl) {
            if (router) {
              router.push(customUrl);
            }
          }
        } catch (error) {
          console.log(error);
          noop();
        }
      },
      type: "others",
      style:
        "hover:bg-yellow-100 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
    });
  }

  // Delete action
  if (config.allowDelete !== false) {
    actions.push({
      icon: Trash2,
      actionName: `Delete ${capitalizedType}`,
      onClick: () => {
        try {
          const customUrl = mediaCustomPathAction({
            action: "delete",
            value: id,
          });
          if (customUrl) {
            if (router) {
              router.push(customUrl);
            }
          } else if (extendRouteWithQuery !== noop) {
            extendRouteWithQuery({
              delete: "true",
              [isAlbum ? "albumCover" : "media"]: id,
            });
          } else {
            noop();
          }
        } catch (error) {
          console.log(error);
          noop();
        }
      },
      type: "owner",
      style:
        "hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400",
    });
  }

  return actions;
};
