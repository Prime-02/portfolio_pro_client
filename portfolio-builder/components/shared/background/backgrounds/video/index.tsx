// portfolio-builder/components/shared/background/backgrounds/video/index.ts

import { registerBackground } from "../../editor/BackgroundRegistry";


function VideoRenderer({ background }: { background: any }) {
  if (!background.videoUrl) return null;
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
      style={{ objectPosition: background.backgroundPosition ?? "center" }}
      src={background.videoUrl}
    />
  );
}

registerBackground({
  type: "video",
  label: "Video",
  fields: [
    { kind: "text", label: "Video URL", key: "videoUrl", defaultValue: "", placeholder: "https://example.com/video.mp4" },
  ],
  defaults: {
    type: "video",
    videoUrl: "",
    overlayColor: "#0a0a0a",
    overlayOpacity: 0,
  },
  renderer: VideoRenderer,
  supportsOverlay: true,
});
