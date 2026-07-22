// ImageField.tsx — media upload field (images, videos, lottie)
// Additions vs original:
//   • Image cropping via react-easy-crop (free, 1:1, 4:3, 9:16, full)
//   • Image compression via browser-image-compression before upload
//   • Video max-file-size enforcement with clear error messaging

"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "@/src/app/components/ui/Image";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { useCloudinaryCore } from "@/lib/stores/cloudinary/useCloudinaryCore";

// ─── Types ───────────────────────────────────────────────────────────────────

type MediaType = "image" | "video" | "lottie";
type CropAspect = "free" | "1:1" | "4:3" | "9:16" | "full";

const ASPECT_MAP: Record<CropAspect, number | undefined> = {
    free: undefined,
    "1:1": 1,
    "4:3": 4 / 3,
    "9:16": 9 / 16,
    full: undefined, // Will be calculated dynamically
};

interface ImageFieldProps {
    /** Current media URL (controlled) */
    url: string | null;
    /** Called with new URL after upload, or null after delete */
    onChange: (url: string | null) => void;
    /** Upload destination folder in Cloudinary */
    folder?: string;
    /** Maximum video duration in seconds (null = no limit) */
    maxVideoDuration?: number | null;
    /** Maximum video file size in MB (default: 50) */
    maxVideoSizeMb?: number;
    /** Allowed media types. Undefined or empty = allow all */
    accept?: MediaType | MediaType[];
    /** Max output image size in MB after compression (default: 1) */
    imageMaxSizeMb?: number;
    /** Max output image dimension px after compression (default: 1920) */
    imageMaxWidthOrHeight?: number;
}

// ─── Crop helpers ─────────────────────────────────────────────────────────────

/**
 * Given a loaded <Image> element and the pixel crop area returned by
 * react-easy-crop, draws the cropped region onto a canvas and returns it as
 * a Blob (image/jpeg).
 */
async function cropImageFile(
    imageSrc: string,
    pixelCrop: Area,
    mimeType: string = "image/jpeg"
): Promise<Blob> {
    const image = await createImageBitmap(
        await fetch(imageSrc).then((r) => r.blob())
    );

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
            mimeType,
            0.92
        );
    });
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

function detectResourceType(file: File): MediaType {
    if (file.type.startsWith("video/")) return "video";
    if (file.name.endsWith(".json") || file.type === "application/json") return "lottie";
    return "image";
}

function isLottie(url: string | null): boolean {
    return !!url && url.endsWith(".json");
}

function getAcceptTypes(accept?: MediaType | MediaType[]): string {
    if (!accept || (Array.isArray(accept) && accept.length === 0)) {
        return "image/*,video/*,.json";
    }
    const types = Array.isArray(accept) ? accept : [accept];
    const parts: string[] = [];
    if (types.includes("image")) parts.push("image/*");
    if (types.includes("video")) parts.push("video/*");
    if (types.includes("lottie")) parts.push(".json");
    return parts.join(",");
}

function isMediaTypeAllowed(file: File, accept?: MediaType | MediaType[]): boolean {
    if (!accept || (Array.isArray(accept) && accept.length === 0)) return true;
    const detectedType = detectResourceType(file);
    const allowedTypes = Array.isArray(accept) ? accept : [accept];
    return allowedTypes.includes(detectedType);
}

function getVideoDuration(file: File): Promise<number | null> {
    return new Promise((resolve) => {
        if (!file.type.startsWith("video/")) { resolve(null); return; }
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        const objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;
        video.onloadedmetadata = () => { URL.revokeObjectURL(objectUrl); resolve(video.duration); };
        video.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(null); };
    });
}

// ─── Crop modal ───────────────────────────────────────────────────────────────

interface CropModalProps {
    imageSrc: string;
    mimeType: string;
    originalAspect: number; // Original image aspect ratio
    onConfirm: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

function CropModal({ imageSrc, mimeType, originalAspect, onConfirm, onCancel }: CropModalProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState<CropAspect>("free");
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const handleCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!croppedAreaPixels) return;
        const blob = await cropImageFile(imageSrc, croppedAreaPixels, mimeType);
        onConfirm(blob);
    }, [croppedAreaPixels, imageSrc, mimeType, onConfirm]);

    // Calculate the current aspect ratio based on selection
    const currentAspect = aspect === "full" ? originalAspect : ASPECT_MAP[aspect];

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                backgroundColor: "rgba(0,0,0,0.85)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
            }}
        >
            {/* Cropper area */}
            <div style={{ position: "relative", width: "min(600px, 92vw)", height: "min(500px, 60vh)", borderRadius: "8px", overflow: "hidden" }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={currentAspect}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                    style={{
                        containerStyle: { borderRadius: "8px" },
                    }}
                />
            </div>

            {/* Controls */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "min(600px, 92vw)" }}>
                {/* Aspect ratio toggle */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                    {(["free", "1:1", "4:3", "9:16", "full"] as CropAspect[]).map((a) => (
                        <button
                            key={a}
                            onClick={() => setAspect(a)}
                            style={{
                                padding: "6px 14px",
                                borderRadius: "6px",
                                border: "1px solid",
                                borderColor: aspect === a ? "white" : "rgba(255,255,255,0.25)",
                                backgroundColor: aspect === a ? "rgba(255,255,255,0.15)" : "transparent",
                                color: "white",
                                fontSize: "13px",
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                        >
                            {a === "free" ? "Free" : a === "full" ? "Original" : a}
                        </button>
                    ))}
                </div>

                {/* Zoom slider */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", minWidth: "36px" }}>Zoom</span>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        style={{ flex: 1, accentColor: "white" }}
                    />
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: "8px 20px",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.25)",
                            backgroundColor: "transparent",
                            color: "white",
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        style={{
                            padding: "8px 20px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "white",
                            color: "black",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Crop & Upload
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ImageField({
    url,
    onChange,
    folder = "uploads",
    maxVideoDuration = 15,
    maxVideoSizeMb = 50,
    accept,
    imageMaxSizeMb = 1,
    imageMaxWidthOrHeight = 1920,
}: ImageFieldProps) {
    const { uploadFile, deleteAsset, isLoading, error: cloudinaryError } = useCloudinaryCore();
    const [dragging, setDragging] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [cropState, setCropState] = useState<{
        src: string;
        mimeType: string;
        originalName: string;
        originalAspect: number;
    } | null>(null);
    const [compressing, setCompressing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const error = localError || cloudinaryError;
    const isWorking = isLoading || compressing;

    // ── Core upload (runs after crop/compress) ──────────────────────────────
    const uploadBlob = useCallback(
        async (blob: Blob, resourceType: "image" | "video" | "raw", filename: string) => {
            const file = new File([blob], filename, { type: blob.type });
            const res = await uploadFile({ file, folder, resource_type: resourceType });
            onChange(res.secure_url);
        },
        [folder, uploadFile, onChange]
    );

    // ── Called once crop is confirmed ───────────────────────────────────────
    const handleCropConfirm = useCallback(
        async (croppedBlob: Blob) => {
            if (!cropState) return;
            setCropState(null);
            setLocalError(null);
            setCompressing(true);
            try {
                const compressed = await imageCompression(
                    new File([croppedBlob], cropState.originalName, { type: croppedBlob.type }),
                    {
                        maxSizeMB: imageMaxSizeMb,
                        maxWidthOrHeight: imageMaxWidthOrHeight,
                        useWebWorker: true,
                    }
                );
                await uploadBlob(compressed, "image", cropState.originalName);
            } catch (e) {
                setLocalError("Image processing failed. Please try again.");
            } finally {
                setCompressing(false);
            }
        },
        [cropState, uploadBlob, imageMaxSizeMb, imageMaxWidthOrHeight]
    );

    // ── Main file handler ────────────────────────────────────────────────────
    const handleUpload = useCallback(
        async (file: File) => {
            setLocalError(null);

            // Type gate
            if (!isMediaTypeAllowed(file, accept)) {
                const allowedTypes = Array.isArray(accept) ? accept : [accept];
                setLocalError(
                    `File type not allowed. Accepted: ${allowedTypes
                        .map((t) => (t === "lottie" ? "Lottie JSON" : t))
                        .join(", ")}`
                );
                return;
            }

            const resourceType = detectResourceType(file);

            // ── Image → get original aspect ratio then open crop modal ──────
            if (resourceType === "image") {
                const src = URL.createObjectURL(file);

                // Get original image dimensions to calculate aspect ratio
                const img = new window.Image();
                img.onload = () => {
                    const originalAspect = img.width / img.height;
                    setCropState({
                        src,
                        mimeType: file.type || "image/jpeg",
                        originalName: file.name,
                        originalAspect
                    });
                };
                img.src = src;
                return;
            }

            // ── Video → duration + size checks, then upload ──────────────────
            if (resourceType === "video") {
                if (maxVideoDuration != null) {
                    const duration = await getVideoDuration(file);
                    if (duration !== null && duration > maxVideoDuration) {
                        const mins = Math.floor(maxVideoDuration / 60);
                        const secs = Math.floor(maxVideoDuration % 60);
                        const limitStr = mins > 0
                            ? `${mins}:${secs.toString().padStart(2, "0")}`
                            : `${secs}s`;
                        setLocalError(`Video too long (${duration.toFixed(1)}s). Max: ${limitStr}.`);
                        return;
                    }
                }

                const sizeMb = file.size / (1024 * 1024);
                if (sizeMb > maxVideoSizeMb) {
                    setLocalError(
                        `Video is ${sizeMb.toFixed(1)} MB — exceeds the ${maxVideoSizeMb} MB limit. Please compress before uploading.`
                    );
                    return;
                }

                try {
                    await uploadBlob(file, "video", file.name);
                } catch {
                    // handled by useCloudinaryCore
                }
                return;
            }

            // ── Lottie → raw upload ──────────────────────────────────────────
            try {
                await uploadBlob(file, "raw", file.name);
            } catch {
                // handled by useCloudinaryCore
            }
        },
        [accept, maxVideoDuration, maxVideoSizeMb, uploadBlob]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
        },
        [handleUpload]
    );

    const handleDelete = useCallback(async () => {
        if (!url) return;
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split("/");
            const uploadIndex = pathParts.indexOf("upload");
            const publicIdWithExt = pathParts.slice(uploadIndex + 2).join("/");
            const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
            const isVideo = pathParts.includes("video");
            await deleteAsset(publicId, isVideo ? "video" : "image", true);
        } catch {
            // Still clear local state if Cloudinary delete fails
        } finally {
            setLocalError(null);
            onChange(null);
        }
    }, [url, deleteAsset, onChange]);

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
        },
        [handleUpload]
    );

    // Revoke crop preview URL when modal closes
    useEffect(() => {
        return () => {
            if (cropState?.src) URL.revokeObjectURL(cropState.src);
        };
    }, [cropState]);

    const acceptedTypesDescription = (() => {
        if (!accept || (Array.isArray(accept) && accept.length === 0)) return "Image, Video, or Lottie JSON";
        const types = Array.isArray(accept) ? accept : [accept];
        return types.map((t) => (t === "lottie" ? "Lottie JSON" : t.charAt(0).toUpperCase() + t.slice(1))).join(", ");
    })();

    // ── Crop modal (rendered at top level so it covers everything) ──────────
    const cropModal = cropState && (
        <CropModal
            imageSrc={cropState.src}
            mimeType={cropState.mimeType}
            originalAspect={cropState.originalAspect}
            onConfirm={handleCropConfirm}
            onCancel={() => { URL.revokeObjectURL(cropState.src); setCropState(null); }}
        />
    );

    // ── Empty state ─────────────────────────────────────────────────────────
    if (!url) {
        return (
            <>
                {cropModal}
                <div className="w-full">
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onClick={() => !isWorking && inputRef.current?.click()}
                        className="relative rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3"
                        style={{
                            borderColor: dragging ? "var(--foreground)" : "rgba(var(--foreground-rgb, 255,255,255), 0.2)",
                            backgroundColor: dragging ? "rgba(var(--foreground-rgb, 255,255,255), 0.03)" : "transparent",
                            minHeight: "200px",
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept={getAcceptTypes(accept)}
                            hidden
                            onChange={handleFileInput}
                        />

                        {isWorking ? (
                            <span className="text-sm opacity-50">
                                {compressing ? "Processing…" : "Uploading…"}
                            </span>
                        ) : (
                            <>
                                <span className="text-3xl opacity-30">⊕</span>
                                <div className="text-center">
                                    <p className="text-sm opacity-60 m-0">
                                        {dragging ? "Drop file here" : "Click or drag file here"}
                                    </p>
                                    <p className="text-xs opacity-30 m-0 mt-1">{acceptedTypesDescription}</p>
                                    {maxVideoDuration != null && accept?.includes?.("video") !== false && (
                                        <p className="text-xs opacity-30 m-0 mt-1">
                                            Max video: {maxVideoDuration}s / {maxVideoSizeMb} MB
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {error && <p className="text-xs text-red-400 mt-2 m-0">{error}</p>}
                </div>
            </>
        );
    }

    // ── Media displayed ─────────────────────────────────────────────────────
    return (
        <>
            {cropModal}
            <div className="relative group w-fit">
                <div className="rounded-lg overflow-hidden border border-white/10">
                    {isLottie(url) ? (
                        <LottiePlayer url={url} />
                    ) : url.match(/\.(mp4|webm|mov|mkv)($|\?)/) ? (
                        <video src={url} controls className="max-w-full h-auto max-h-[400px] block" />
                    ) : (
                        <div className="relative max-w-full max-h-[400px]">
                            <Image
                                src={url}
                                alt="Uploaded media"
                                width={800}
                                height={400}
                                className="max-w-full h-auto max-h-[400px] object-contain block"
                                style={{ width: 'auto', height: 'auto' }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-3">
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                    >
                        Replace
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 rounded-md bg-red-500/80 hover:bg-red-500 text-white text-sm transition-colors"
                    >
                        Remove
                    </button>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept={getAcceptTypes(accept)}
                    hidden
                    onChange={handleFileInput}
                />

                {error && <p className="text-xs text-red-400 mt-2 m-0">{error}</p>}
            </div>
        </>
    );
}

// ─── Lottie player ────────────────────────────────────────────────────────────

function LottiePlayer({ url }: { url: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let anim: any;
        const load = async () => {
            const lottie = await import("lottie-web");
            const res = await fetch(url);
            const data = await res.json();
            anim = lottie.default.loadAnimation({
                container: containerRef.current!,
                renderer: "svg",
                loop: true,
                autoplay: true,
                animationData: data,
            });
            setLoaded(true);
        };
        load();
        return () => anim?.destroy();
    }, [url]);

    return (
        <div
            ref={containerRef}
            style={{ width: "300px", height: "300px", opacity: loaded ? 1 : 0, transition: "opacity 0.2s" }}
        />
    );
}