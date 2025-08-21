import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import Button from "../buttons/Buttons";
import { VideoTrimmerProps } from "../types and interfaces/MediaInputElements";
import { Textinput } from "./Textinput";

// Video Trimmer Component
const VideoTrimmer: React.FC<VideoTrimmerProps> = ({ file, onTrim, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const MAX_DURATION = 30; // 30 seconds

  useEffect(() => {
    const url = URL.createObjectURL(file.media_file);
    setVideoUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleLoadedMetadata = (): void => {
    const video = videoRef.current;
    if (video) {
      const videoDuration = Math.min(video.duration, MAX_DURATION);
      setDuration(videoDuration);
      setTrimEnd(videoDuration);
      generateThumbnails(video, videoDuration);
    }
  };

  const generateThumbnails = async (video: HTMLVideoElement, videoDuration: number): Promise<void> => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const thumbnailCount = 10;
    const thumbnailsArray: string[] = [];

    canvas.width = 60;
    canvas.height = 40;

    for (let i = 0; i < thumbnailCount; i++) {
      const time = (videoDuration / thumbnailCount) * i;
      video.currentTime = time;

      await new Promise<void>((resolve) => {
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, 60, 40);
          thumbnailsArray.push(canvas.toDataURL());
          resolve();
        };
      });
    }

    setThumbnails(thumbnailsArray);
    video.currentTime = 0;
  };

  const togglePlayPause = (): void => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = (): void => {
    const video = videoRef.current;
    if (video) {
      const time = video.currentTime;
      setCurrentTime(time);

      // Auto-pause at trim end
      if (time >= trimEnd) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = trimStart;
      }
    }
  };

  const handleSeek = (time: number): void => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(trimStart, Math.min(trimEnd, time));
    }
  };

  const handleTrimChange = (type: "start" | "end", value: number): void => {
    if (type === "start") {
      const newStart = Math.max(0, Math.min(value, trimEnd - 1));
      setTrimStart(newStart);
      if (currentTime < newStart) {
        handleSeek(newStart);
      }
    } else {
      const newEnd = Math.min(duration, Math.max(value, trimStart + 1));
      setTrimEnd(newEnd);
      if (currentTime > newEnd) {
        handleSeek(newEnd);
      }
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleApplyTrim = (): void => {
    const trimmedDuration = trimEnd - trimStart;
    onTrim({
      trimStart,
      trimEnd,
      trimmed_duration: trimmedDuration,
    });
  };

  const trimmedDuration = trimEnd - trimStart;

  return (
    <div className="mb-3">
      <div className=" rounded-lg bg-[var(--background)] hide-scrollbar p-6 max-w-2xl w-full h-auto overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Trim Video</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative bg-black rounded-lg mb-4">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-64 object-contain rounded-lg"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            muted={isMuted}
          />

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="p-2  bg-opacity-20 hover:bg-opacity-30 rounded-full "
              >
                {isPlaying ? (
                  <Pause size={18} className="cursor-pointer" />
                ) : (
                  <Play size={18} className="cursor-pointer" />
                )}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 bg- bg-opacity-20 hover:bg-opacity-30 rounded-full text-"
              >
                {isMuted ? (
                  <VolumeX size={18} className="cursor-pointer" />
                ) : (
                  <Volume2 size={18} className="cursor-pointer" />
                )}
              </button>

              <div className="flex-1 text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Timeline */}
        <div className="mb-4">
          <div className="flex gap-1 mb-2 overflow-x-auto">
            {thumbnails.map((thumbnail, index) => (
              <img
                key={index}
                src={thumbnail}
                alt={`Thumbnail ${index}`}
                className="w-15 h-10 object-cover rounded cursor-pointer hover:opacity-75"
                onClick={() =>
                  handleSeek((duration / thumbnails.length) * index)
                }
              />
            ))}
          </div>

          {/* Timeline Slider */}
          <div className="relative h-6  rounded-lg">
            {/* Trim Range Background */}
            <div
              className="absolute top-0 text-center text-[var(--background)] text-[7px] flex items-center justify-center bottom-0 bg-[var(--foreground)] rounded-lg"
              style={{
                left: `${(trimStart / duration) * 100}%`,
                width: `${((trimEnd - trimStart) / duration) * 100}%`,
              }}
            >
              Drag to trim
            </div>

            {/* Current Time Indicator */}
            <div
              className="absolute top-0 w-1 bg-red-500 h-full"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />

            {/* Trim Start Handle */}
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={trimStart}
              onChange={(e) =>
                handleTrimChange("start", parseFloat(e.target.value))
              }
              className="absolute top-0 w-full h-full opacity-0 cursor-pointer"
            />

            {/* Trim End Handle */}
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={trimEnd}
              onChange={(e) =>
                handleTrimChange("end", parseFloat(e.target.value))
              }
              className="absolute top-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Time Labels */}
          <div className="flex justify-between text-xs opacity-65 mt-1">
            <span>{formatTime(trimStart)}</span>
            <span>Duration: {formatTime(trimmedDuration)}</span>
            <span>{formatTime(trimEnd)}</span>
          </div>
        </div>

        {/* Trim Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Textinput
              type="number"
              label="Start Time"
              min={0}
              labelBgHexIntensity={1}
              max={trimEnd - 1}
              step={0.1}
              value={trimStart.toFixed(1)}
              onChange={(e) =>
                handleTrimChange("start", parseFloat(e))
              }
            />
          </div>
          <div>
            <Textinput
              type="number"
              label="End Time"
              min={trimStart + 1}
              max={duration}
              step={0.1}
              labelBgHexIntensity={1}
              value={trimEnd.toFixed(1)}
              onChange={(e) =>
                handleTrimChange("end", parseFloat(e))
              }
            />
          </div>
        </div>

        {/* Duration Warning */}
        {trimmedDuration > MAX_DURATION && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-700">
              Video duration ({formatTime(trimmedDuration)}) exceeds the maximum
              allowed duration of {MAX_DURATION} seconds.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-start">
            <Button
            text={`Apply Trim (${formatTime(trimmedDuration)})`}
            onClick={handleApplyTrim}
            size="sm"
            disabled={trimmedDuration > MAX_DURATION}
            icon={<Check className="w-4 h-4" />}
            customColor="green"
          />
          <Button text="Cancel" onClick={onCancel} variant="ghost" size="sm" customColor="gray" />
          <Button
            text="Reset"
            onClick={() => {
              setTrimStart(0);
              setTrimEnd(duration);
              handleSeek(0);
            }}
            size="sm"
            variant="outline"
            icon={<RotateCcw className="w-4 h-4" />}
            customColor="gray"
          />
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};


export default VideoTrimmer