import { useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Music,
  Play,
  Scissors,
  Trash,
} from "lucide-react";
import { MediaPreviewProps } from "../types and interfaces/MediaInputElements";

// Media Preview Component
const MediaPreview: React.FC<MediaPreviewProps> = ({
  files,
  onRemove,
  onTrimVideo,
  selectedIndex,
  onSelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (): void => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = (): void => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="relative  ">
      {/* Navigation Arrows */}
      {files.length > 3 && (
        <>
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 text-black bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white text-black bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Scrollable Media Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {files.map((file, index) => (
          <div
            key={file.id}
            className={`relative flex-shrink-0 w-24 h-44 rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedIndex === index ? "border-[var(--accent)] border" : ""
            }`}
            onClick={() => onSelect(index)}
          >
            {/* Media Content */}
            {file.media_type === "image" && (
              <img
                src={file.preview_url}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}

            {file.media_type === "video" && (
              <div className="relative w-full h-full bg-black">
                <video
                  src={file.preview_url}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <Play className="w-3 h-3 text-white" />
                </div>
                {file.trimmed_duration && (
                  <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {Math.round(file.trimmed_duration)}s
                  </div>
                )}
              </div>
            )}

            {file.media_type === "audio" && (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
            )}

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(file.id);
              }}
              className="absolute bottom-1 left-1 p-1 cursor-pointer shadow-md transition-colors"
            >
              <Trash className="w-3 h-3" />
            </button>

            {/* Trim Button for Videos */}
            {file.media_type === "video" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTrimVideo(file);
                }}
                className="absolute bottom-1 right-1 p-1 cursor-pointer shadow-md transition-colors"
                title="Trim video"
              >
                <Scissors className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaPreview;
