import React, { useState, useRef, useMemo } from "react";
import { AlertCircle, ImagePlus, Music, Upload, X } from "lucide-react";
import VideoTrimmer from "./VideoTrimmer";
import { useFileProcessor } from "../utilities/hooks/mediaHooks";
import MediaPreview from "./MediaPreview";
import Button from "../buttons/Buttons";
import {
  MediaFile,
  MediaPickerProps,
} from "../types and interfaces/MediaInputElements";

// MediaPicker Component (supports all media types)
const MediaPicker: React.FC<MediaPickerProps> = ({
  maxFiles = 20,
  onMediaChange = () => {},
  acceptedTypes = {
    "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    "video/*": [".mp4", ".webm", ".ogg", ".avi", ".mov"],
    "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac"],
  },
  devMode = false,
  loading = false,
  onClick,
  maxFileSize = 200 * 1024 * 1024,
  uploadCooldown = 1000,
  maxVideoDuration = 30,
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);
  const [trimmerFile, setTrimmerFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isProcessing,
    error,
    clearError,
    processFiles,
    formatFileSize,
    uploadAttempts,
    uploadTimestamps,
  } = useFileProcessor(maxFileSize, maxFiles, uploadCooldown, maxVideoDuration);

  // Generate user-friendly text based on accepted types
  const acceptedTypesInfo = useMemo(() => {
    const mimeTypes = Object.keys(acceptedTypes);
    const extensions = Object.values(acceptedTypes).flat();
    
    // Categorize MIME types
    const categories = {
      images: [] as string[],
      videos: [] as string[],
      audio: [] as string[],
      documents: [] as string[],
      other: [] as string[]
    };

    mimeTypes.forEach(mimeType => {
      if (mimeType.startsWith('image/')) {
        categories.images.push(...acceptedTypes[mimeType]);
      } else if (mimeType.startsWith('video/')) {
        categories.videos.push(...acceptedTypes[mimeType]);
      } else if (mimeType.startsWith('audio/')) {
        categories.audio.push(...acceptedTypes[mimeType]);
      } else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
        categories.documents.push(...acceptedTypes[mimeType]);
      } else {
        categories.other.push(...acceptedTypes[mimeType]);
      }
    });

    // Generate readable category names
    const categoryNames = [];
    if (categories.images.length > 0) categoryNames.push('images');
    if (categories.videos.length > 0) categoryNames.push('videos');
    if (categories.audio.length > 0) categoryNames.push('audio');
    if (categories.documents.length > 0) categoryNames.push('documents');
    if (categories.other.length > 0) categoryNames.push('files');

    // Format category names into readable text
    let supportText = '';
    if (categoryNames.length === 0) {
      supportText = 'files';
    } else if (categoryNames.length === 1) {
      supportText = categoryNames[0];
    } else if (categoryNames.length === 2) {
      supportText = `${categoryNames[0]} and ${categoryNames[1]}`;
    } else {
      supportText = `${categoryNames.slice(0, -1).join(', ')}, and ${categoryNames[categoryNames.length - 1]}`;
    }

    // Generate extensions text (limit to show most common ones)
    const displayExtensions = extensions.slice(0, 8); // Show first 8 extensions
    const extensionsText = displayExtensions.length < extensions.length 
      ? `${displayExtensions.join(', ')} and ${extensions.length - displayExtensions.length} more`
      : extensions.join(', ');

    return {
      supportText,
      extensionsText,
      totalExtensions: extensions.length,
      categories
    };
  }, [acceptedTypes]);

  const removeFile = (id: string): void => {
    const updatedFiles = mediaFiles.filter((file) => file.id !== id);
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);
    clearError();

    // Adjust selected preview index if needed
    if (
      selectedPreviewIndex >= updatedFiles.length &&
      updatedFiles.length > 0
    ) {
      setSelectedPreviewIndex(updatedFiles.length - 1);
    }
  };

  const handleTrimVideo = (file: MediaFile): void => {
    setTrimmerFile(file);
  };

  const handleTrimApply = (trimData: {
    trimStart: number;
    trimEnd: number;
    trimmed_duration: number;
  }): void => {
    const updatedFiles = mediaFiles.map((file) =>
      file.id === trimmerFile?.id ? { ...file, ...trimData } : file
    );
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);
    setTrimmerFile(null);
  };

  const handleTrimCancel = (): void => {
    setTrimmerFile(null);
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

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isProcessing) return;

    const files = e.dataTransfer.files;
    const newFiles = await processFiles(files, acceptedTypes, mediaFiles);
    if (newFiles.length > 0) {
      const updatedFiles = [...mediaFiles, ...newFiles];
      setMediaFiles(updatedFiles);
      onMediaChange(updatedFiles);
    }
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (files && !isProcessing) {
      const newFiles = await processFiles(files, acceptedTypes, mediaFiles);
      if (newFiles.length > 0) {
        const updatedFiles = [...mediaFiles, ...newFiles];
        setMediaFiles(updatedFiles);
        onMediaChange(updatedFiles);
      }
    }
    e.target.value = "";
  };

  const openFileDialog = (): void => {
    if (!isProcessing && mediaFiles.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  const acceptString = Object.entries(acceptedTypes)
    .flatMap(([type, extensions]) => [type, ...extensions])
    .join(",");

  const isDisabled = mediaFiles.length >= maxFiles || isProcessing;

  return (
    <div className="w-full max-w-4xl mx-auto">
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
            size="sm"
            type="button"
            icon={<X />}
          />
        </div>
      )}

      {/* Video Trimmer Modal */}
      {trimmerFile && (
        <VideoTrimmer
          file={trimmerFile}
          onTrim={handleTrimApply}
          onCancel={handleTrimCancel}
        />
      )}

      {/* Media Preview - Now acts as dropzone when files exist */}
      {mediaFiles.length > 0 && !trimmerFile && (
        <div className="mb-6 relative">
          <span className="absolute right-0 top-1">
            <Button
              size="sm"
              onClick={!isDisabled ? openFileDialog : undefined}
              icon={<ImagePlus size={18} />}
              variant="ghost"
              title={`Add more ${acceptedTypesInfo.supportText}`}
            />
          </span>
          <div
            className={`bg-[var(--background)]  border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
              isDisabled
                ? "border-gray-300 cursor-not-allowed opacity-100"
                : isDragging
                  ? "border-[var(--accent)] cursor-pointer"
                  : "border-gray-300 hover:border-[var(--accent)] cursor-pointer"
            } ${isProcessing ? "animate-pulse" : ""}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            role="button"
            tabIndex={!isDisabled ? 0 : -1}
            aria-label={`Drop ${acceptedTypesInfo.supportText} here or click to select`}
          >
            {/* Selected Media Display */}
            <div className="mb-4 ">
              {selectedPreviewIndex < mediaFiles.length && (
                <div className=" rounded-lg  aspect-video flex items-center justify-center">
                  {mediaFiles[selectedPreviewIndex].media_type === "image" && (
                    <img
                      src={mediaFiles[selectedPreviewIndex].preview_url}
                      alt="Selected preview"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  )}

                  {mediaFiles[selectedPreviewIndex].media_type === "video" && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <video
                        src={mediaFiles[selectedPreviewIndex].preview_url}
                        controls
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      {mediaFiles[selectedPreviewIndex].trimmed_duration && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                          Trimmed:{" "}
                          {Math.round(
                            mediaFiles[selectedPreviewIndex].trimmed_duration!
                          )}
                          s
                        </div>
                      )}
                    </div>
                  )}

                  {mediaFiles[selectedPreviewIndex].media_type === "audio" && (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <Music className="w-10 h-10 text-white" />
                      </div>
                      <audio
                        src={mediaFiles[selectedPreviewIndex].preview_url}
                        controls
                        className="w-full max-w-md"
                      />
                      <p className="text-sm text-gray-600">
                        {mediaFiles[selectedPreviewIndex].media_file.name}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Media Thumbnails */}
            <MediaPreview
              files={mediaFiles}
              onRemove={removeFile}
              onTrimVideo={handleTrimVideo}
              selectedIndex={selectedPreviewIndex}
              onSelect={setSelectedPreviewIndex}
            />

            {/* Upload Button */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm opacity-65 ">
                {mediaFiles.length} of {maxFiles} files selected
                {isDragging && ` - Drop ${acceptedTypesInfo.supportText} to add more`}
              </div>
              {onClick && (
                <Button
                  text="Upload"
                  size="md"
                  loading={loading}
                  disabled={loading || mediaFiles.length === 0}
                  onClick={onClick}
                  icon2={<Upload size={16} />}
                  customColor="green"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drop Zone - Only shown when no files are uploaded */}
      {mediaFiles.length === 0 && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDisabled
              ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
              : isDragging
                ? "border-[var(--accent)] cursor-pointer"
                : "border-gray-300 hover:border-[var(--accent)] cursor-pointer"
          } ${isProcessing ? "animate-pulse" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={!isDisabled ? openFileDialog : undefined}
          role="button"
          tabIndex={!isDisabled ? 0 : -1}
          aria-label={`Drop ${acceptedTypesInfo.supportText} here or click to select`}
        >
          <div className="flex flex-col items-center space-y-4">
            <Upload
              className={`w-12 h-12 transition-colors ${
                isProcessing
                  ? "text-[var(--accent)] animate-bounce"
                  : isDragging
                    ? "text-[var(--accent)]"
                    : "text-gray-400 hover:text-[var(--accent)]"
              }`}
            />

            {isProcessing ? (
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Processing files...
                </p>
                <p className="text-sm text-gray-500">Please wait</p>
              </div>
            ) : mediaFiles.length >= maxFiles ? (
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Maximum files reached
                </p>
                <p className="text-sm text-gray-500">
                  Remove files to add more
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium ">
                  {isDragging
                    ? `Drop your ${acceptedTypesInfo.supportText} here`
                    : `Drag & drop ${acceptedTypesInfo.supportText} here`}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  or click to browse ({maxFiles - mediaFiles.length} remaining)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports {acceptedTypesInfo.extensionsText} (max{" "}
                  {formatFileSize(maxFileSize)} each)
                  {acceptedTypesInfo.categories.videos.length > 0 && maxVideoDuration && (
                    <span>, videos limited to {maxVideoDuration}s</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
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

      {/* Debug Info */}
      {devMode && (
        <div className="mt-6 p-4  rounded-lg">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <div className="text-xs space-y-1 mb-2">
            <p>Upload attempts: {uploadAttempts}</p>
            <p>Recent uploads: {uploadTimestamps.length}/10</p>
            <p>Processing: {isProcessing ? "Yes" : "No"}</p>
            <p>Max file size: {formatFileSize(maxFileSize)}</p>
            <p>Max video duration: {maxVideoDuration}s</p>
            <p>Selected preview: {selectedPreviewIndex}</p>
            <p>Accepted types: {acceptedTypesInfo.supportText}</p>
            <p>Extensions: {acceptedTypesInfo.extensionsText}</p>
          </div>
          <h5 className="font-medium text-xs mb-1">Current Files:</h5>
          <pre className="text-xs overflow-auto max-h-40  p-2 ">
            {JSON.stringify(
              mediaFiles.map(
                ({ media_file, preview_url, file_size, ...rest }) => ({
                  ...rest,
                  file_size: `Size in MB ${file_size / 1024 / 1024} mb`,
                  media_file: `File: ${media_file.name}`,
                  preview_url: preview_url ? "blob:..." : null,
                })
              ),
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