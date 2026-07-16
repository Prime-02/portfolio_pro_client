// portfolio-builder/components/sections/hero/renderer-components/MediaDisplay.tsx

import Image from "next/image";
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
        case "portrait": return "rounded-2xl";
        case "landscape": return "rounded-2xl";
    }
}

function getAspectRatioClass(shape: HeroMediaShape): string {
    switch (shape) {
        case "portrait": return "aspect-[3/4]";
        case "landscape": return "aspect-[16/9]";
        default: return "";
    }
}

function getSizeClasses(size: HeroMediaSize, shape?: HeroMediaShape): string {
    // For portrait/landscape, width is controlled and height comes from aspect ratio
    if (shape === "portrait" || shape === "landscape") {
        switch (size) {
            case "sm": return "w-48";
            case "md": return "w-72";
            case "lg": return "w-96";
            default: return "w-72";
        }
    }

    // Larger sizes for circle/rounded/square
    switch (size) {
        case "sm": return "w-32 h-32";
        case "md": return "w-48 h-48 md:w-56 md:h-56";
        case "lg": return "w-80 h-80 md:w-96 md:h-96";
    }
}

function getImageDimensions(size: HeroMediaSize, shape?: HeroMediaShape): { width: number; height: number } {
    // For portrait/landscape, calculate height based on aspect ratio
    if (shape === "portrait") {
        switch (size) {
            case "sm": return { width: 192, height: 256 }; // 3:4 ratio
            case "md": return { width: 288, height: 384 };
            case "lg": return { width: 384, height: 512 };
            default: return { width: 288, height: 384 };
        }
    }

    if (shape === "landscape") {
        switch (size) {
            case "sm": return { width: 192, height: 108 }; // 16:9 ratio
            case "md": return { width: 288, height: 162 };
            case "lg": return { width: 384, height: 216 };
            default: return { width: 288, height: 162 };
        }
    }

    // Square sizes for circle/rounded/square
    switch (size) {
        case "sm": return { width: 128, height: 128 }; // w-32 = 8rem = 128px
        case "md": return { width: 224, height: 224 }; // md:w-56 = 14rem = 224px
        case "lg": return { width: 384, height: 384 }; // md:w-96 = 24rem = 384px
        default: return { width: 224, height: 224 };
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
    const aspectRatioClass = getAspectRatioClass(shape);
    const sizeClass = getSizeClasses(size, shape);
    const dimensions = getImageDimensions(size, shape);

    if (!media || media.type === "none") {
        return (
            <div
                className={`${sizeClass} ${aspectRatioClass} ${shapeClass} border border-dashed border-[var(--pb-border)] flex items-center justify-center text-[var(--pb-text-muted)] text-sm ${className ?? ""}`}
            >
                No media
            </div>
        );
    }

    if (media.type === "image" && media.imageUrl) {
        // For portrait/landscape shapes that use aspect ratio, use fill
        if (shape === "portrait" || shape === "landscape") {
            return (
                <div className={`${sizeClass} ${aspectRatioClass} ${shapeClass} relative overflow-hidden border-2 border-[var(--pb-border)] mx-auto shadow-lg ${className ?? ""}`}>
                    <Image
                        src={media.imageUrl}
                        alt={media.imageAlt || "Hero media"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            );
        }

        // For fixed square/circle shapes
        return (
            <Image
                src={media.imageUrl}
                alt={media.imageAlt || "Hero media"}
                width={dimensions.width}
                height={dimensions.height}
                className={`${sizeClass} ${shapeClass} object-cover border-2 border-[var(--pb-border)] mx-auto shadow-lg ${className ?? ""}`}
            />
        );
    }

    if (media.type === "lottie" && media.lottieUrl) {
        return (
            <div
                className={`${sizeClass} ${aspectRatioClass} ${shapeClass} mx-auto text-[var(--pb-text-muted)] text-sm flex items-center justify-center border border-dashed border-[var(--pb-border)] ${className ?? ""}`}
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
                className={`${sizeClass} ${aspectRatioClass} ${shapeClass} object-cover mx-auto border-2 border-[var(--pb-border)] shadow-lg ${className ?? ""}`}
            />
        );
    }

    return null;
}