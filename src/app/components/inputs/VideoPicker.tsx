import { useRef, useState } from "react";
import { useFileProcessor } from "../utilities/hooks/mediaHooks";
import { AlertCircle, Video, X } from "lucide-react";
import Button from "../buttons/Buttons";
import MediaPreview from "./MediaPreview";
import {
  AcceptedTypes,
  MediaFile,
  VideoPickerProps,
} from "../types and interfaces/MediaInputElements";
import VideoTrimmer from "./VideoTrimmer";

// VideoPicker Component (videos only, with auto-trim option)
const VideoPicker: React.FC<VideoPickerProps> = ({
  maxFiles = 10,
  onVideoChange = () => {},
  devMode = true,
  loading = false,
  onClick = () => {},
  maxFileSize = 200 * 1024 * 1024,
  uploadCooldown = 1000,
  maxVideoDuration = 30,
  autoTrimToLimit = true,
}) => {
  const [videoFiles, setVideoFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);
  const [trimmerFile, setTrimmerFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes: AcceptedTypes = {
    "video/*": [".mp4", ".webm", ".ogg", ".avi", ".mov"],
  };

  const {
    isProcessing,
    error,
    clearError,
    processFiles,
    formatFileSize,
    uploadAttempts,
    uploadTimestamps,
  } = useFileProcessor(maxFileSize, maxFiles, uploadCooldown, maxVideoDuration);

  const removeFile = (id: string): void => {
    const updatedFiles = videoFiles.filter((file) => file.id !== id);
    setVideoFiles(updatedFiles);
    onVideoChange(updatedFiles);
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
    const updatedFiles = videoFiles.map((file) =>
      file.id === trimmerFile?.id ? { ...file, ...trimData } : file
    );
    setVideoFiles(updatedFiles);
    onVideoChange(updatedFiles);
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
    const newFiles = await processFiles(
      files,
      acceptedTypes,
      videoFiles,
      autoTrimToLimit
    );
    if (newFiles.length > 0) {
      const updatedFiles = [...videoFiles, ...newFiles];
      setVideoFiles(updatedFiles);
      onVideoChange(updatedFiles);
    }
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (files && !isProcessing) {
      const newFiles = await processFiles(
        files,
        acceptedTypes,
        videoFiles,
        autoTrimToLimit
      );
      if (newFiles.length > 0) {
        const updatedFiles = [...videoFiles, ...newFiles];
        setVideoFiles(updatedFiles);
        onVideoChange(updatedFiles);
      }
    }
    e.target.value = "";
  };

  const openFileDialog = (): void => {
    if (!isProcessing && videoFiles.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  const acceptString = Object.entries(acceptedTypes)
    .flatMap(([type, extensions]) => [type, ...extensions])
    .join(",");

  const isDisabled = videoFiles.length >= maxFiles || isProcessing;

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

      {/* Auto-trim notification */}
      {autoTrimToLimit && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2">
          <Video className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Videos longer than {maxVideoDuration} seconds will be automatically
            trimmed to {maxVideoDuration}s. You can manually adjust the trim
            later.
          </p>
        </div>
      )}

      {/* Video Preview */}
      {videoFiles.length > 0 && (
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {/* Selected Video Display */}
            <div className="mb-4">
              {selectedPreviewIndex < videoFiles.length && (
                <div className="bg-black rounded-lg p-4 aspect-video flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      src={videoFiles[selectedPreviewIndex].preview_url}
                      controls
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                    {videoFiles[selectedPreviewIndex].trimmed_duration && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                        Trimmed:{" "}
                        {Math.round(
                          videoFiles[selectedPreviewIndex].trimmed_duration!
                        )}
                        s
                      </div>
                    )}
                    {videoFiles[selectedPreviewIndex].duration &&
                      videoFiles[selectedPreviewIndex].duration! >
                        maxVideoDuration &&
                      !videoFiles[selectedPreviewIndex].trimmed_duration && (
                        <div className="absolute top-2 left-2 bg-yellow-600 bg-opacity-90 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Exceeds {maxVideoDuration}s limit
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Video Thumbnails */}
            <MediaPreview
              files={videoFiles}
              onRemove={removeFile}
              onTrimVideo={handleTrimVideo}
              selectedIndex={selectedPreviewIndex}
              onSelect={setSelectedPreviewIndex}
            />

            {/* Upload Button */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {videoFiles.length} of {maxFiles} videos selected
              </div>
              <Button
                text="Send Videos"
                size="md"
                loading={loading}
                disabled={loading || videoFiles.length === 0}
                onClick={onClick}
                icon2={<Video size={16} />}
                customColor="green"
              />
            </div>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDisabled
            ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
            : isDragging
              ? "border-blue-500 bg-blue-50 cursor-pointer"
              : "border-gray-300 hover:border-blue-500 cursor-pointer"
        } ${isProcessing ? "animate-pulse" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!isDisabled ? openFileDialog : undefined}
        role="button"
        tabIndex={!isDisabled ? 0 : -1}
        aria-label="Drop video files here or click to select"
      >
        <label hidden htmlFor="video_upload"></label>
        <input
          ref={fileInputRef}
          id="video_upload"
          type="file"
          multiple
          accept={acceptString}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isDisabled}
        />

        <div className="flex flex-col items-center space-y-4">
          <Video
            className={`w-12 h-12 transition-colors ${
              isProcessing
                ? "text-blue-500 animate-bounce"
                : isDragging
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-blue-500"
            }`}
          />

          {isProcessing ? (
            <div>
              <p className="text-lg font-medium text-gray-700">
                Processing videos...
              </p>
              <p className="text-sm text-gray-500">Please wait</p>
            </div>
          ) : videoFiles.length >= maxFiles ? (
            <div>
              <p className="text-lg font-medium text-gray-700">
                Maximum videos reached
              </p>
              <p className="text-sm text-gray-500">Remove videos to add more</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragging
                  ? "Drop your video files here"
                  : "Drag & drop video files here"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                or click to browse ({maxFiles - videoFiles.length} remaining)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports MP4, WebM, OGG, AVI, MOV (max{" "}
                {formatFileSize(maxFileSize)} each, {maxVideoDuration}s
                duration)
                {autoTrimToLimit && (
                  <span className="block mt-1 text-blue-600">
                    ✂️ Auto-trim enabled for long videos
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Video Trimmer Modal */}
      {trimmerFile && (
        <VideoTrimmer
          file={trimmerFile}
          onTrim={handleTrimApply}
          onCancel={handleTrimCancel}
        />
      )}

      {/* Debug Info */}
      {devMode && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Video Picker Debug Info:</h4>
          <div className="text-xs space-y-1 mb-2">
            <p>Upload attempts: {uploadAttempts}</p>
            <p>Recent uploads: {uploadTimestamps.length}/10</p>
            <p>Processing: {isProcessing ? "Yes" : "No"}</p>
            <p>Max file size: {formatFileSize(maxFileSize)}</p>
            <p>Max video duration: {maxVideoDuration}s</p>
            <p>Auto-trim enabled: {autoTrimToLimit ? "Yes" : "No"}</p>
            <p>Selected preview: {selectedPreviewIndex}</p>
          </div>
          <h5 className="font-medium text-xs mb-1">Current Videos:</h5>
          <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
            {JSON.stringify(
              videoFiles.map(({ media_file, preview_url, ...rest }) => ({
                ...rest,
                media_file: `File: ${media_file.name}`,
                preview_url: preview_url ? "blob:..." : null,
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


export default VideoPicker