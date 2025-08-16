import MediaPicker, { MediaFile } from "@/app/components/inputs/MediaPicker";
import { toast } from "@/app/components/toastify/Toastify";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import { Media } from "./MediaCollection";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import CheckBox from "@/app/components/inputs/CheckBox";
import Button from "@/app/components/buttons/Buttons";
import {
  DeleteData,
  GetAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";

interface MediaActionsProps {
  id: string;
  fetchAllAlbumMedia: () => void;
}

const MediaActions = ({ id, fetchAllAlbumMedia }: MediaActionsProps) => {
  const [mediaState, setMediaState] = useState<MediaFile[]>([]);
  const [mediaData, setMediaData] = useState<Media>({
    title: "",
    description: "",
    is_featured: false,
    allow_download: false,
    is_public: false,
    media_type: "File",
  });
  const { setLoading, loading, accessToken, clearQuerryParam, checkParams } =
    useGlobalState();
  const updateAction = checkParams("update");
  const deleteAction = checkParams("delete");
  const currentAction =
    updateAction || deleteAction ? checkParams("media") : "";
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
      const fileTypes = validFiles.reduce(
        (acc, file) => {
          acc[file.media_type] = (acc[file.media_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      console.log(
        `Starting upload: ${validFiles.length} files (${(totalSize / 1024 / 1024).toFixed(2)} MB total)`
      );

      const uploadData = new FormData();
      validFiles.forEach((mediaFile) => {
        uploadData.append("files", mediaFile.media_file);
      });

      const metadataArray = validFiles.map((mediaFile, index) => ({
        media_type: mediaFile.media_type,
        title: mediaFile.name,
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

  const getMediaData = async () => {
    setLoading("getting_medium_data");
    try {
      const mediumRes: Media = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/media-gallery/collections/${id}/media/${currentAction}`,
        type: "Medium Data",
      });
      if (mediumRes) {
        setMediaData(() => ({
          title: mediumRes.title || "",
          description: mediumRes.description || "",
          is_public: mediumRes.is_public || true,
          allow_download: mediumRes.allow_download || true,
          is_featured: mediumRes.is_featured || false,
          media_type: mediumRes.media_type || "File",
        }));
      }
    } catch (error) {
      console.log("Error fetching medium data");
    } finally {
      setLoading("getting_medium_data");
    }
  };

  useEffect(() => {
    if (!accessToken && !currentAction) return;
    getMediaData();
  }, [accessToken, currentAction]);

  const updateMediaData = async () => {
    setLoading("updating_media");
    try {
      const updateRes = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/media-gallery/collections/${id}/media/${currentAction}`,
        field: mediaData,
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

  const deleteMediaData = async () => {
    setLoading("deleting_media_data");
    try {
      const deleteRes = await DeleteData({
        access: accessToken,
        url: `${V1_BASE_URL}/media-gallery/collections/${id}/media/${currentAction}`,
      });
      fetchAllAlbumMedia();
      clearQuerryParam();
    } catch (error) {
      console.log("Error deleting media data: ", error);
    } finally {
      setLoading("deleting_media_data");
    }
  };

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
                isChecked={mediaData.is_public}
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
            onClick={updateMediaData}
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
              text={`Delete ${mediaData.media_type}`}
              customColor="red"
              size="md"
              onClick={deleteMediaData}
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
        />
      )}
    </div>
  );
};

export default MediaActions;
