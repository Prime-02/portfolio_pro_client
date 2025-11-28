import MediaPicker from "@/app/components/inputs/MediaPicker";
import { toast } from "@/app/components/toastify/Toastify";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import {  Textinput } from "@/app/components/inputs/Textinput";
import { TextArea } from "@/app/components/inputs/TextArea";
import CheckBox from "@/app/components/inputs/CheckBox";
import Button from "@/app/components/buttons/Buttons";
import {
  DeleteData,
  GetAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { AlbumData } from "./AlbumView";
import { MediaFile } from "@/app/components/types and interfaces/MediaInputElements";
import { createMediaConfig } from "@/app/components/utilities/indices/settings-JSONs/mediaCard";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";

export interface Media {
  allow_download: boolean;
  is_featured: boolean;
}

// Extracted and exported functions
export const getMediaData = async ({
  accessToken,
  id,
  currentAction,
  setLoading,
  setMediaData,
  currentUser,
}: {
  accessToken: string;
  id: string;
  currentAction: string;
  setLoading: (state: string) => void;
  setMediaData: React.Dispatch<React.SetStateAction<AlbumData>>;
  currentUser?: string | null;
}) => {
  setLoading("getting_medium_data");
  const url = currentUser
    ? `${V1_BASE_URL}/media-gallery/users/${currentUser}/collections/${id}/media/${currentAction}`
    : `${V1_BASE_URL}/media-gallery/collections/${id}/media/${currentAction}`;
  try {
    const mediumRes: AlbumData = await GetAllData({
      access: accessToken,
      url: url,
      type: "Medium Data",
    });
    if (mediumRes) {
      setMediaData((prev) => ({
        ...prev,
        id: mediumRes.id,
        title: mediumRes.title || "",
        description: mediumRes.description || "",
        is_public: mediumRes.is_public || true,
        media_type: mediumRes.media_type || "image",
        image_url: mediumRes.media_url || "/vectors/undraw_monitor_ypga.svg",
        image_card_layout: createMediaConfig(mediumRes),
      }));
    }
  } catch (error) {
    console.log("Error fetching medium data: ", error);
  } finally {
    setLoading("getting_medium_data");
  }
};

export const updateMediaData = async ({
  accessToken,
  id,
  currentAction,
  mediaData,
  setLoading,
  fetchAllAlbumMedia,
  clearQuerryParam,
}: {
  accessToken: string;
  id: string;
  currentAction: string;
  mediaData: AlbumData;
  setLoading: (state: string) => void;
  fetchAllAlbumMedia: () => void;
  clearQuerryParam: () => void;
}) => {
  setLoading("updating_media");
  try {
    const updateRes = await UpdateAllData({
      access: accessToken,
      url: `${V1_BASE_URL}/media-gallery/collections/${id}/media/${currentAction}`,
      field: mediaData as AlbumData,
      method: "patch",
    });
    if (updateRes) {
      fetchAllAlbumMedia();
      clearQuerryParam();
    }
  } catch (error) {
    console.log("Error updating media: ", error);
  } finally {
    setLoading("updating_media");
  }
};

export const deleteMediaData = async ({
  accessToken,
  id,
  currentAction,
  setLoading,
  fetchAllAlbumMedia,
  router,
  backUrl,
}: {
  accessToken: string;
  id: string;
  currentAction: string;
  setLoading: (state: string) => void;
  fetchAllAlbumMedia: () => void;
  router?: AppRouterInstance;
  backUrl?: string;
}) => {
  setLoading("deleting_media_data");
  try {
    await DeleteData({
      access: accessToken,
      url: `${V1_BASE_URL}/media-gallery/collections/${id}/media/${currentAction}`,
    });
    fetchAllAlbumMedia();
    router?.push(`${backUrl}`);
  } catch (error) {
    console.log("Error deleting media data: ", error);
  } finally {
    setLoading("deleting_media_data");
  }
};

interface MediaActionsProps {
  id: string;
  fetchAllAlbumMedia: () => void;
}

const MediaActions = ({ id, fetchAllAlbumMedia }: MediaActionsProps) => {
  const [mediaState, setMediaState] = useState<MediaFile[]>([]);
  const [mediaData, setMediaData] = useState<AlbumData>({
    title: "",
    description: "",
    is_public: false,
    media_type: "image",
    image_url: "",
    id: "",
  });
  const {
    setLoading,
    loading,
    accessToken,
    clearQuerryParam,
    checkParams,
    currentUser,
    currentPath,
    router,
  } = useGlobalState();
  const updateAction = checkParams("update");
  const deleteAction = checkParams("delete");
  const currentAction =
    updateAction || deleteAction ? checkParams("media") || "" : "";

  const uploadMedia = async () => {
    if (!mediaState || mediaState.length === 0) {
      console.warn("No media files to upload");
      return;
    }

    setLoading("uploading_media");

    try {
      const validFiles = mediaState.filter(
        (mediaFile) =>
          mediaFile.media_file instanceof File && mediaFile.media_file.size > 0
      );

      if (validFiles.length === 0) {
        toast.error("No valid files to upload");
        return;
      }

      const totalSize = validFiles.reduce(
        (sum, file) => sum + file.file_size,
        0
      );
      // const fileTypes = validFiles.reduce(
      //   (acc, file) => {
      //     acc[file.media_type] = (acc[file.media_type] || 0) + 1;
      //     return acc;
      //   },
      //   {} as Record<string, number>
      // );

      console.log(
        `Starting upload: ${validFiles.length} files (${(totalSize / 1024 / 1024).toFixed(2)} MB total)`
      );

      const uploadData = new FormData();
      validFiles.forEach((mediaFile) => {
        uploadData.append("files", mediaFile.media_file);
      });

      const metadataArray = validFiles.map((mediaFile) => ({
        media_type: mediaFile.media_type,
        description: "",
        is_featured: false,
        file_size: mediaFile.file_size,
      }));

      uploadData.append("metadata", JSON.stringify(metadataArray));
      uploadData.append("order_start", "0");

      const uploadStartTime = Date.now();

      console.log(uploadData);

      const response = await fetch(
        `${V1_BASE_URL}/media-gallery/collections/${id}/media/batch-create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: uploadData,
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Upload failed" }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const uploadRes = await response.json();
      const uploadDuration = Date.now() - uploadStartTime;
      const avgSpeedMBps = totalSize / 1024 / 1024 / (uploadDuration / 1000);

      console.log(
        `Upload completed successfully in ${(uploadDuration / 1000).toFixed(1)}s (avg ${avgSpeedMBps.toFixed(1)} MB/s)`
      );

      setMediaState([]);
      fetchAllAlbumMedia();
      toast.success(`Successfully uploaded ${validFiles.length} files!`);
      clearQuerryParam();
      return uploadRes;
    } catch (error) {
      console.error("Error uploading media: ", error);
      toast.error(
        "Failed to upload files. Please check your connection and try again."
      );
      throw error;
    } finally {
      setLoading("uploading_media");
    }
  };

  // Wrapper functions that call the extracted functions with component state
  const handleGetMediaData = () => {
    getMediaData({
      accessToken,
      id,
      currentAction,
      setLoading,
      setMediaData,
      currentUser,
    });
  };

  const handleUpdateMediaData = () => {
    updateMediaData({
      accessToken,
      id,
      currentAction,
      mediaData,
      setLoading,
      fetchAllAlbumMedia,
      clearQuerryParam,
    });
  };

  const handleDeleteMediaData = async () => {
    await deleteMediaData({
      accessToken,
      id,
      currentAction,
      setLoading,
      fetchAllAlbumMedia,
      router: router,
      backUrl: PathUtil.removeLastSegment(currentPath),
    });
  };

  useEffect(() => {
    if (!accessToken && !currentAction) return;
    handleGetMediaData();
  }, [accessToken, currentAction]);

  return (
    <div>
      {updateAction ? (
        <div className="flex flex-col gap-y-3">
          <span>
            <Textinput
              label="Title"
              value={mediaData.title}
              onChange={(e) => {
                setMediaData((prev) => ({
                  ...prev,
                  title: e,
                }));
              }}
            />
          </span>
          <span>
            <TextArea
              label="Description"
              value={mediaData.description}
              onChange={(e) => {
                setMediaData((prev) => ({
                  ...prev,
                  description: e,
                }));
              }}
            />
          </span>
          <div className="flex flex-wrap justify-between gap-2 items-center">
            <span className="flex items-center gap-2">
              <CheckBox
                id="is_public"
                isChecked={mediaData.is_public || false}
                setIsChecked={(e) => {
                  setMediaData((prev) => ({
                    ...prev,
                    is_public: e,
                  }));
                }}
              />
              <p className="text-xs text-[var(--accent)] ">
                Make this medium public
              </p>
            </span>
          </div>
          <Button
            text="Save"
            size="sm"
            loading={loading.includes("updating_media")}
            onClick={handleUpdateMediaData}
          />
        </div>
      ) : deleteAction ? (
        <div className="flex flex-col items-center gap-y-4">
          <h1 className="text-lg font-semibold text-center">
            Are you sure you want to delete this {mediaData.media_type}?
          </h1>
          <p className="text-sm opacity-65 text-center">
            This action cannot be undone. Click cancel to return to album
          </p>
          <div className="flex gap-3">
            <Button
              text="Cancel"
              variant="outline"
              size="md"
              onClick={() => clearQuerryParam()}
            />
            <Button
              text={`Delete ${mediaData?.media_type}`}
              customColor="red"
              size="md"
              onClick={handleDeleteMediaData}
              loading={loading.includes("deleting_media_data")}
              disabled={loading.includes("deleting_media_data")}
            />
          </div>
        </div>
      ) : (
        <MediaPicker
          onMediaChange={setMediaState}
          onClick={uploadMedia}
          loading={loading.includes("uploading_media")}
          maxVideoDuration={30}
          maxFiles={5}
          devMode
          maxFileSize={5 * 1024 * 1024}
        />
      )}
    </div>
  );
};

export default MediaActions;
