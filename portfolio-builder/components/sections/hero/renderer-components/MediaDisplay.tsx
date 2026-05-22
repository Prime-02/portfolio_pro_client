// portfolio-builder/components/sections/hero/renderer-components/MediaDisplay.tsx

import type { HeroData, HeroMediaShape, HeroMediaSize } from "@/portfolio-builder/types/hero";

interface MediaDisplayProps {
    media?: HeroData["media"];
    /** Fallback size — used only when media.size is not set */
    size?: HeroMediaSize;
    className?: string;
}

function getShapeClass(shape: HeroMediaShape): string {
    switch (shape) {
        case "circle": return "rounded-full";
        case "rounded": return "rounded-2xl";
        case "square": return "rounded-none";
    }
}

function getSizeClasses(size: HeroMediaSize): string {
    switch (size) {
        case "sm": return "w-20 h-20";
        case "md": return "w-24 h-24 md:w-32 md:h-32";
        case "lg": return "w-64 h-64 md:w-80 md:h-80";
    }
}

export function MediaDisplay({
    media,
    size: sizeFallback = "md",
    className,
}: MediaDisplayProps) {
    // Prefer the value stored on the media object; fall back to the prop
    const size = media?.size ?? sizeFallback;
    const shape = media?.shape ?? (size === "lg" ? "rounded" : "circle");

    console.log(media)

    const shapeClass = getShapeClass(shape);
    const sizeClass = getSizeClasses(size);

    if (!media || media.type === "none") {
        return (
            <div
                className={`${sizeClass} ${shapeClass} border border-dashed border-neutral-800 flex items-center justify-center text-neutral-600 text-sm ${className ?? ""}`}
            >
                No media
            </div>
        );
    }

    if (media.type === "image" && media.imageUrl) {
        return (
            <img
                src={media.imageUrl}
                alt={media.imageAlt || ""}
                className={`${sizeClass} ${shapeClass} object-cover border-2 border-neutral-700 mx-auto shadow-lg ${className ?? ""}`}
            />
        );
    }

    if (media.type === "lottie" && media.lottieUrl) {
        return (
            <div
                className={`${sizeClass} ${shapeClass} mx-auto text-neutral-400 text-sm flex items-center justify-center border border-dashed border-neutral-700 ${className ?? ""}`}
            >
                {size === "lg" ? "Lottie Animation" : "Lottie"}
            </div>
        );
    }

    if (media.type === "video" && media.videoUrl) {
        return (
            <video
                src={media.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className={`${sizeClass} ${shapeClass} object-cover mx-auto border-2 border-neutral-700 shadow-lg ${className ?? ""}`}
            />
        );
    }

    return null;
}