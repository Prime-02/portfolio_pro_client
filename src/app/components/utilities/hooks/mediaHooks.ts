import { useCallback, useRef, useState } from "react";
import { AcceptedTypes, ErrorState, MediaFile } from "../../types and interfaces/MediaInputElements";


export const useFileProcessor = (
  maxFileSize: number,
  maxFiles: number,
  uploadCooldown: number,
  maxVideoDuration: number = 30
) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [lastUploadTime, setLastUploadTime] = useState<number>(0);
  const [uploadAttempts, setUploadAttempts] = useState<number>(0);
  const uploadTimestamps = useRef<number[]>([]);

  const MAX_UPLOADS_PER_MINUTE = 10;
  const UPLOAD_WINDOW = 60 * 1000;

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const showError = useCallback(
    (message: string, type: ErrorState["type"] = "general"): void => {
      setError({ message, type });
      setTimeout(clearError, 5000);
    },
    [clearError]
  );

  const isRateLimited = useCallback((): boolean => {
    const now = Date.now();

    if (now - lastUploadTime < uploadCooldown) {
      showError(
        `Please wait ${Math.ceil((uploadCooldown - (now - lastUploadTime)) / 1000)} seconds before uploading again.`,
        "cooldown"
      );
      return true;
    }

    uploadTimestamps.current = uploadTimestamps.current.filter(
      (timestamp) => now - timestamp < UPLOAD_WINDOW
    );

    if (uploadTimestamps.current.length >= MAX_UPLOADS_PER_MINUTE) {
      showError(
        "Too many upload attempts. Please wait a minute before trying again.",
        "cooldown"
      );
      return true;
    }

    return false;
  }, [lastUploadTime, uploadCooldown, showError]);

  const getMediaType = (file: File): MediaFile["media_type"] => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "unknown";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const isValidFileType = (file: File, acceptedTypes: AcceptedTypes): boolean => {
    return Object.keys(acceptedTypes).some((type) => {
      if (type.endsWith("/*")) {
        const baseType = type.split("/")[0];
        return file.type.startsWith(baseType + "/");
      }
      return file.type === type;
    });
  };

  const isDuplicateFile = (file: File, existingFiles: MediaFile[]): boolean => {
    return existingFiles.some(
      (mediaFile) =>
        mediaFile.media_file.name === file.name &&
        mediaFile.file_size === file.size &&
        mediaFile.media_file.lastModified === file.lastModified
    );
  };

  const validateFile = (
    file: File,
    acceptedTypes: AcceptedTypes,
    existingFiles: MediaFile[]
  ): string | null => {
    if (file.size > maxFileSize) {
      return `File "${file.name}" exceeds the maximum size of ${formatFileSize(maxFileSize)}.`;
    }

    if (!isValidFileType(file, acceptedTypes)) {
      return `File "${file.name}" is not a supported file type.`;
    }

    if (isDuplicateFile(file, existingFiles)) {
      return `File "${file.name}" has already been uploaded.`;
    }

    return null;
  };

  const processFiles = async (
    files: FileList | File[],
    acceptedTypes: AcceptedTypes,
    existingFiles: MediaFile[],
    autoTrimVideos: boolean = false
  ): Promise<MediaFile[]> => {
    if (isRateLimited()) return [];
    if (isProcessing) return [];

    setIsProcessing(true);
    clearError();

    try {
      const fileArray = files instanceof FileList ? Array.from(files) : files;

      if (fileArray.length > maxFiles) {
        showError(
          `Too many files selected at once. Please select up to ${maxFiles} files.`,
          "general"
        );
        return [];
      }

      const availableSlots = maxFiles - existingFiles.length;
      if (availableSlots <= 0) {
        showError(
          "Maximum number of files reached. Please remove some files first.",
          "general"
        );
        return [];
      }

      const filesToProcess = fileArray.slice(0, availableSlots);
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of filesToProcess) {
        const validationError = validateFile(file, acceptedTypes, existingFiles);
        if (validationError) {
          errors.push(validationError);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        showError(
          errors[0],
          errors.length === 1 && errors[0].includes("exceeds") ? "size" : "type"
        );
        if (validFiles.length === 0) return [];
      }

      if (validFiles.length === 0) return [];

      const newMediaFiles = await Promise.all(
        validFiles.map(async (file): Promise<MediaFile> => {
          const mediaFile: MediaFile = {
            media_type: getMediaType(file),
            file_size: file.size,
            media_file: file,
            id: Math.random().toString(36).substr(2, 9),
            preview_url: createPreviewUrl(file),
          };

          if (mediaFile.media_type === "video") {
            const duration = await getVideoDuration(file);
            mediaFile.duration = duration;
            
            // Auto-trim videos that exceed max duration
            if (autoTrimVideos && duration > maxVideoDuration) {
              mediaFile.trimStart = 0;
              mediaFile.trimEnd = maxVideoDuration;
              mediaFile.trimmed_duration = maxVideoDuration;
            }
          }

          return mediaFile;
        })
      );

      const now = Date.now();
      setLastUploadTime(now);
      uploadTimestamps.current.push(now);
      setUploadAttempts((prev) => prev + 1);

      return newMediaFiles;
    } catch (err) {
      showError(
        "An unexpected error occurred while processing files.",
        "general"
      );
      console.error("File processing error:", err);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    clearError,
    showError,
    processFiles,
    formatFileSize,
    uploadAttempts,
    uploadTimestamps: uploadTimestamps.current,
  };
};