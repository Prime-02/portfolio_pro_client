import MediaPicker, { MediaFile } from "@/app/components/inputs/MediaPicker";
import { toast } from "@/app/components/toastify/Toastify";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useState } from "react";
import { MediaCollectionProps } from "./MediaCollection";

const MediaActions = (
  props: MediaCollectionProps & { fetchAllAlbumMedia: () => void }
) => {
  const [mediaState, setMediaState] = useState<MediaFile[]>([]);
  const { setLoading, loading, accessToken } = useGlobalState();

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
        `${V1_BASE_URL}/media-gallery/collections/${props.albumData?.id}/media/batch-create`,
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
      props.fetchAllAlbumMedia();
      toast.success(`Successfully uploaded ${validFiles.length} files!`);
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

  return (
    <div>
      <MediaPicker
        onMediaChange={setMediaState}
        onClick={uploadMedia}
        loading={loading.includes("uploading_media")}
      />
    </div>
  );
};

export default MediaActions;
