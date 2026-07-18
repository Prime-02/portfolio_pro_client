// portfolio-builder/components/sections/hero/renderer-components/MediaDisplay.tsx

import Image from "next/image";
import type { CSSProperties } from "react";
import type { HeroData, HeroMediaShape, HeroMediaSize } from "@/portfolio-builder/types/hero";

/**
 * Split + fullHeight only: which side of the media panel faces the text
 * column. That side's corners get rounded by `edgeRadius`; the other
 * (outer) edges stay flush with the section boundary. "none" keeps every
 * corner sharp.
 */
export type MediaInnerEdge = "left" | "right" | "top" | "bottom" | "none";

interface MediaDisplayProps {
    media?: HeroData["media"];
    size?: HeroMediaSize;
    className?: string;
    /**
     * Split layout only: stretches the media to fill the full height of its
     * container (e.g. a full-bleed image alongside the text column) instead
     * of using the fixed `size` box. On mobile the panel uses a capped
     * height instead (stacked layouts can't have two full-height siblings),
     * and only expands to true full height at the md breakpoint.
     */
    fullHeight?: boolean;
    /** Split + fullHeight only: which edge faces the text column. */
    innerEdge?: MediaInnerEdge;
    /** Split + fullHeight only: corner radius (px) for the inner edge. */
    edgeRadius?: number;
}

function getEdgeRadiusClass(innerEdge: MediaInnerEdge = "none"): string {
    switch (innerEdge) {
        case "left": return "rounded-none md:rounded-l-[var(--pb-media-edge-radius)]";
        case "right": return "rounded-none md:rounded-r-[var(--pb-media-edge-radius)]";
        case "top": return "rounded-none md:rounded-t-[var(--pb-media-edge-radius)]";
        case "bottom": return "rounded-none md:rounded-b-[var(--pb-media-edge-radius)]";
        default: return "rounded-none";
    }
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
    fullHeight = false,
    innerEdge = "none",
    edgeRadius = 0,
}: MediaDisplayProps) {
    const size = media?.size ?? sizeFallback;
    const shape = media?.shape ?? (size === "lg" ? "rounded" : "circle");

    // In fullHeight (full-bleed split) mode, shape (circle/portrait/etc.) is
    // ignored in favor of edge-only rounding — the panel is meant to run
    // flush with the section's edges, not sit as a floating shape.
    const shapeClass = fullHeight ? getEdgeRadiusClass(innerEdge) : getShapeClass(shape);
    const aspectRatioClass = fullHeight ? "" : getAspectRatioClass(shape);
    // Stacked (mobile) layouts can't give two siblings 100% height without
    // overflowing the section, so fullHeight media gets a capped height
    // until the md breakpoint, where it stretches to match its column.
    const sizeClass = fullHeight ? "w-full h-64 sm:h-80 md:h-full" : getSizeClasses(size, shape);
    const dimensions = getImageDimensions(size, shape);
    const edgeRadiusStyle: CSSProperties | undefined = fullHeight
        ? ({ ["--pb-media-edge-radius" as string]: `${edgeRadius}px` } as CSSProperties)
        : undefined;

    if (!media || media.type === "none") {
        return (
            <div
                className={`${sizeClass} ${aspectRatioClass} ${shapeClass} border border-dashed border-[var(--pb-border)] flex items-center justify-center text-[var(--pb-text-muted)] text-sm ${className ?? ""}`}
                style={edgeRadiusStyle}
            >
                No media
            </div>
        );
    }

    if (media.type === "image" && media.imageUrl) {
        // For portrait/landscape shapes (or full-bleed fullHeight media), use a
        // relative wrapper with an absolutely-filled image
        if (shape === "portrait" || shape === "landscape" || fullHeight) {
            return (
                <div
                    className={`${sizeClass} ${aspectRatioClass} ${shapeClass} relative overflow-hidden ${fullHeight ? "" : "border-2 border-[var(--pb-border)] mx-auto shadow-lg"} ${className ?? ""}`}
                    style={edgeRadiusStyle}
                >
                    <img
                        src={media.imageUrl}
                        alt={media.imageAlt || "Hero media"}
                        className="absolute inset-0 w-full h-full object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            );
        }

        // For fixed square/circle shapes
        return (
            <img
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
                style={edgeRadiusStyle}
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
                className={`${sizeClass} ${aspectRatioClass} ${shapeClass} object-cover mx-auto ${fullHeight ? "" : "border-2 border-[var(--pb-border)] shadow-lg"} ${className ?? ""}`}
                style={edgeRadiusStyle}
            />
        );
    }

    return null;
}