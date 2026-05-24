// portfolio-builder/components/sections/hero/renderer-components/MediaDisplay.tsx

import type { HeroData, HeroMediaShape, HeroMediaSize } from "@/portfolio-builder/types/hero";

interface MediaDisplayProps {
    media?: HeroData["media"];
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
    const size = media?.size ?? sizeFallback;
    const shape = media?.shape ?? (size === "lg" ? "rounded" : "circle");

    const shapeClass = getShapeClass(shape);
    const sizeClass = getSizeClasses(size);

    if (!media || media.type === "none") {
        return (
            <div
                className={`${sizeClass} ${shapeClass} border border-dashed border-[var(--pb-border)] flex items-center justify-center text-[var(--pb-text-muted)] text-sm ${className ?? ""}`}
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
                className={`${sizeClass} ${shapeClass} object-cover border-2 border-[var(--pb-border)] mx-auto shadow-lg ${className ?? ""}`}
            />
        );
    }

    if (media.type === "lottie" && media.lottieUrl) {
        return (
            <div
                className={`${sizeClass} ${shapeClass} mx-auto text-[var(--pb-text-muted)] text-sm flex items-center justify-center border border-dashed border-[var(--pb-border)] ${className ?? ""}`}
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
                className={`${sizeClass} ${shapeClass} object-cover mx-auto border-2 border-[var(--pb-border)] shadow-lg ${className ?? ""}`}
            />
        );
    }

    return null;
}