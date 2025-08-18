import React, { useState, useRef, JSX, useCallback } from "react";
import {
  Upload,
  X,
  Play,
  Image,
  Music,
  Video,
  File,
  AlertCircle,
} from "lucide-react";
import Button from "../buttons/Buttons";
import { MediaType } from "../types and interfaces/ImageCardTypes";

// Type definitions
export interface MediaFile {
  media_type: "image" | "video" | "audio" | "unknown";
  file_size: number;
  media_file: File;
  id: string;
  name: string;
}

interface AcceptedTypes {
  [key: string]: string[];
}

interface MediaPickerProps {
  maxFiles?: number;
  onMediaChange?: (files: MediaFile[]) => void;
  acceptedTypes?: AcceptedTypes;
  devMode?: boolean;
  maxFileSize?: number; // in bytes
  uploadCooldown?: number; // in milliseconds
  loading?: boolean;
  onClick?: () => {};
}


interface ErrorState {
  message: string;
  type: "size" | "type" | "cooldown" | "duplicate" | "general";
}

const MediaPicker: React.FC<MediaPickerProps> = ({
  maxFiles = 20,
  onMediaChange = () => {},
  acceptedTypes = {
    "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    "video/*": [".mp4", ".webm", ".ogg", ".avi", ".mov"],
    "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac"],
  },
  devMode = true,
  loading = false,
  onClick = () => {},
  maxFileSize = 200 * 1024 * 1024, // 2MB default
  uploadCooldown = 1000, // 1 second default
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [lastUploadTime, setLastUploadTime] = useState<number>(0);
  const [uploadAttempts, setUploadAttempts] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rate limiting: max 10 uploads per minute
  const MAX_UPLOADS_PER_MINUTE = 10;
  const UPLOAD_WINDOW = 60 * 1000; // 1 minute in milliseconds
  const uploadTimestamps = useRef<number[]>([]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const showError = useCallback(
    (message: string, type: ErrorState["type"] = "general") => {
      setError({ message, type });
      // Auto-clear error after 5 seconds
      setTimeout(clearError, 5000);
    },
    [clearError]
  );

  const isRateLimited = useCallback((): boolean => {
    const now = Date.now();

    // Check cooldown
    if (now - lastUploadTime < uploadCooldown) {
      showError(
        `Please wait ${Math.ceil((uploadCooldown - (now - lastUploadTime)) / 1000)} seconds before uploading again.`,
        "cooldown"
      );
      return true;
    }

    // Clean old timestamps
    uploadTimestamps.current = uploadTimestamps.current.filter(
      (timestamp) => now - timestamp < UPLOAD_WINDOW
    );

    // Check rate limit
    if (uploadTimestamps.current.length >= MAX_UPLOADS_PER_MINUTE) {
      showError(
        "Too many upload attempts. Please wait a minute before trying again.",
        "cooldown"
      );
      return true;
    }

    return false;
  }, [lastUploadTime, uploadCooldown, showError]);

  const getMediaType = (file: File): MediaType => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "image";
  };

  const getFileIcon = (mediaType: MediaType): JSX.Element => {
    switch (mediaType) {
      case "image":
        return <Image className="w-8 h-8 text-blue-500" />;
      case "video":
        return <Video className="w-8 h-8 text-red-500" />;
      case "audio":
        return <Music className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 opacity-75 " />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"] as const;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isValidFileType = (file: File): boolean => {
    return Object.keys(acceptedTypes).some((type) => {
      if (type.endsWith("/*")) {
        const baseType = type.split("/")[0];
        return file.type.startsWith(baseType + "/");
      }
      return file.type === type;
    });
  };

  const isDuplicateFile = (file: File): boolean => {
    return mediaFiles.some(
      (mediaFile) =>
        mediaFile.name === file.name &&
        mediaFile.file_size === file.size &&
        mediaFile.media_file.lastModified === file.lastModified
    );
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File "${file.name}" exceeds the maximum size of ${formatFileSize(maxFileSize)}.`;
    }

    // Check file type
    if (!isValidFileType(file)) {
      return `File "${file.name}" is not a supported file type.`;
    }

    // Check for duplicates
    if (isDuplicateFile(file)) {
      return `File "${file.name}" has already been uploaded.`;
    }

    return null;
  };

  const processFiles = async (files: FileList | File[]): Promise<void> => {
    if (isRateLimited()) return;
    if (isProcessing) return;

    setIsProcessing(true);
    clearError();

    try {
      const fileArray = files instanceof FileList ? Array.from(files) : files;

      // Prevent uploading too many files at once (spam prevention)
      if (fileArray.length > maxFiles) {
        showError(
          `Too many files selected at once. Please select up to ${maxFiles} files.`,
          "general"
        );
        return;
      }

      // Check if we can add more files
      const availableSlots = maxFiles - mediaFiles.length;
      if (availableSlots <= 0) {
        showError(
          "Maximum number of files reached. Please remove some files first.",
          "general"
        );
        return;
      }

      const filesToProcess = fileArray.slice(0, availableSlots);
      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validate each file
      for (const file of filesToProcess) {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
        } else {
          validFiles.push(file);
        }
      }

      // Show validation errors if any
      if (errors.length > 0) {
        showError(
          errors[0],
          errors.length === 1 && errors[0].includes("exceeds") ? "size" : "type"
        );
        if (validFiles.length === 0) return;
      }

      if (validFiles.length === 0) return;

      // Create media file objects
      const newMediaFiles: MediaFile[] = validFiles.map((file) => ({
        media_type: getMediaType(file),
        file_size: file.size,
        media_file: file,
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
      }));

      // Update state
      const updatedFiles = [...mediaFiles, ...newMediaFiles];
      setMediaFiles(updatedFiles);
      onMediaChange(updatedFiles);

      // Update rate limiting tracking
      const now = Date.now();
      setLastUploadTime(now);
      uploadTimestamps.current.push(now);
      setUploadAttempts((prev) => prev + 1);
    } catch (err) {
      showError(
        "An unexpected error occurred while processing files.",
        "general"
      );
      console.error("File processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (id: string): void => {
    const updatedFiles = mediaFiles.filter((file) => file.id !== id);
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);
    clearError();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isProcessing) return;

    const files = e.dataTransfer.files;
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && !isProcessing) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const openFileDialog = (): void => {
    if (!isProcessing && mediaFiles.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  const acceptString: string = Object.entries(acceptedTypes)
    .flatMap(([type, extensions]) => [type, ...extensions])
    .join(",");

  const isDisabled = mediaFiles.length >= maxFiles || isProcessing;

  return (
    <div className="w-full max-w-2xl mx-auto ">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
          <Button
            onClick={clearError}
            customColor="red"
            size={"sm"}
            type="button"
            icon={<X />}
          />
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDisabled
            ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
            : isDragging
              ? " border-[var(--accent)] cursor-pointer"
              : "border-gray-300 hover:border-[var(--accent)] cursor-pointer"
        } ${isProcessing ? "animate-pulse" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!isDisabled ? openFileDialog : undefined}
        role="button"
        tabIndex={!isDisabled ? 0 : -1}
        aria-label="Drop files here or click to select"
      >
        <label htmlFor="file_upload" className="hidden">
          media upload
        </label>
        <input
          ref={fileInputRef}
          id="file_upload"
          type="file"
          multiple
          accept={acceptString}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isDisabled}
        />

        <div className="flex flex-col items-center space-y-4">
          <Upload
            className={`w-12 h-12 transition-colors ${
              isProcessing
                ? " animate-bounce"
                : isDragging
                  ? "text-[var(--accent)]"
                  : "group-hover:text-[var(--accent)]"
            }`}
          />

          {isProcessing ? (
            <div>
              <p className="text-lg font-medium opacity-85">
                Processing files...
              </p>
              <p className="text-sm opacity-75 ">Please wait</p>
            </div>
          ) : mediaFiles.length >= maxFiles ? (
            <div>
              <p className="text-lg font-medium opacity-85">
                Maximum files reached
              </p>
              <p className="text-sm opacity-75 ">Remove files to add more</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium ">
                {isDragging
                  ? "Drop your media files here"
                  : "Drag & drop media files here"}
              </p>
              <p className="text-sm opacity-75  mt-2">
                or click to browse ({maxFiles - mediaFiles.length} remaining)
              </p>
              <p className="text-xs opacity-65 mt-1">
                Supports images, videos, and audio files (max{" "}
                {formatFileSize(maxFileSize)} each)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {mediaFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap w-full justify-between items-center gap-3">
            <h3 className="text-xs ">
              {`Ready to Upload (${mediaFiles.length}/${maxFiles}) File(s)`}
            </h3>
            <Button
              text="Upload"
              size="sm"
              loading={loading}
              disabled={loading}
              onClick={onClick}
              icon2={<Upload size={16} />}
            />
          </div>

          {mediaFiles.map((file: MediaFile) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-[var(--background)] border border-[var(--accent)] rounded-lg shadow-sm w-full overflow-hidden"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="min-w-0 overflow-hidden">
                  <p className="font-medium truncate">{file.name}</p>
                  <div className="flex items-center text-xs space-x-2 opacity-75  truncate">
                    <span className="capitalize">{file.media_type}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.file_size)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeFile(file.id)}
                className="flex-shrink-0 p-2 text-[var(--accent)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove file"
                type="button"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Debug Info - Remove in production */}
      {devMode && (
        <div className="mt-6 p-4 bg-[var(--background)] mx-auto rounded-lg">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <div className="text-xs space-y-1 mb-2">
            <p>Upload attempts: {uploadAttempts}</p>
            <p>
              Recent uploads: {uploadTimestamps.current.length}/
              {MAX_UPLOADS_PER_MINUTE}
            </p>
            <p>Processing: {isProcessing ? "Yes" : "No"}</p>
            <p>Max file size: {formatFileSize(maxFileSize)}</p>
          </div>
          <h5 className="font-medium text-xs mb-1">Current Files:</h5>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(
              mediaFiles.map(({ media_file, ...rest }) => ({
                ...rest,
                media_file: `File: ${media_file.name}`,
              })),
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MediaPicker;
