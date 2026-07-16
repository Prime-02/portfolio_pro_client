"use client";

import { useState, useEffect, useRef, DragEvent, useCallback } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import imageCompression from "browser-image-compression";

interface AvatarUploadProps {
    currentImage?: string | null;
    onFileSelect: (file: File) => void;
    size?: "sm" | "md" | "lg";
    /** Max output image size in MB after compression (default: 1) */
    maxSizeMb?: number;
    /** Max output image dimension px after compression (default: 1920) */
    maxWidthOrHeight?: number;
}

// ─── Crop helpers ─────────────────────────────────────────────────────────────

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

// ─── Crop Modal ───────────────────────────────────────────────────────────────

interface CropModalProps {
    imageSrc: string;
    mimeType: string;
    onConfirm: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

function CropModal({ imageSrc, mimeType, onConfirm, onCancel }: CropModalProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const handleCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!croppedAreaPixels) return;
        const blob = await cropImageFile(imageSrc, croppedAreaPixels, mimeType);
        onConfirm(blob);
    }, [croppedAreaPixels, imageSrc, mimeType, onConfirm]);

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
            <div
                style={{
                    position: "relative",
                    width: "min(500px, 92vw)",
                    height: "min(500px, 60vh)",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}
            >
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // Always 1:1 for avatars
                    cropShape="round" // Round crop shape for avatars
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                    style={{
                        containerStyle: { borderRadius: "8px" },
                    }}
                />
            </div>

            {/* Controls */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                    width: "min(500px, 92vw)",
                }}
            >
                {/* Zoom slider */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", minWidth: "36px" }}>
                        Zoom
                    </span>
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
                        Crop & Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const AvatarUpload = ({
    currentImage,
    onFileSelect,
    size = "lg",
    maxSizeMb = 1,
    maxWidthOrHeight = 1920,
}: AvatarUploadProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [cropState, setCropState] = useState<{
        src: string;
        mimeType: string;
    } | null>(null);
    const [compressing, setCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: "w-20 h-20",
        md: "w-32 h-32",
        lg: "w-40 h-40",
    };

    const sizeDimensions = {
        sm: 80,
        md: 128,
        lg: 160,
    };

    // Determine if the preview is a blob/data URL (not optimizable by Next.js)
    const isLocalPreview = preview
        ? preview.startsWith("blob:") || preview.startsWith("data:")
        : false;

    useEffect(() => {
        if (currentImage) {
            setPreview(currentImage);
        }
    }, [currentImage]);

    // Revoke crop preview URL when modal closes
    useEffect(() => {
        return () => {
            if (cropState?.src) URL.revokeObjectURL(cropState.src);
        };
    }, [cropState]);

    const processAndUpload = useCallback(
        async (croppedBlob: Blob, mimeType: string) => {
            setCompressing(true);
            try {
                const compressedFile = await imageCompression(
                    new File([croppedBlob], "avatar.jpg", { type: mimeType }),
                    {
                        maxSizeMB: maxSizeMb,
                        maxWidthOrHeight: maxWidthOrHeight,
                        useWebWorker: true,
                    }
                );
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(compressedFile);
                onFileSelect(compressedFile);
            } catch {
                // Fallback to uncompressed if compression fails
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(croppedBlob);
                onFileSelect(new File([croppedBlob], "avatar.jpg", { type: mimeType }));
            } finally {
                setCompressing(false);
            }
        },
        [maxSizeMb, maxWidthOrHeight, onFileSelect]
    );

    const handleCropConfirm = useCallback(
        (croppedBlob: Blob) => {
            if (!cropState) return;
            processAndUpload(croppedBlob, cropState.mimeType);
            setCropState(null);
        },
        [cropState, processAndUpload]
    );

    const processFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;

        // Open crop modal instead of directly uploading
        const src = URL.createObjectURL(file);
        setCropState({ src, mimeType: file.type || "image/jpeg" });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const dimension = sizeDimensions[size];

    return (
        <>
            {/* Crop modal */}
            {cropState && (
                <CropModal
                    imageSrc={cropState.src}
                    mimeType={cropState.mimeType}
                    onConfirm={handleCropConfirm}
                    onCancel={() => {
                        URL.revokeObjectURL(cropState.src);
                        setCropState(null);
                    }}
                />
            )}

            <div className="flex flex-col items-center gap-4">
                <div
                    onClick={handleClick}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 cursor-pointer group transition-all ${isDragging
                        ? "border-(--accent) scale-110 shadow-2xl ring-4 ring-(--accent)/30"
                        : "border-(--accent) hover:border-(--accent)/80"
                        } ${compressing ? "opacity-70 pointer-events-none" : ""}`}
                >
                    {preview ? (
                        isLocalPreview ? (
                            <img
                                src={preview}
                                alt="Profile picture"
                                width={dimension}
                                height={dimension}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="Profile picture"
                                className="object-cover"
                            />
                        )
                    ) : (
                        <div className="w-full h-full bg-(--foreground)/10 flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-(--foreground)/30"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                    )}

                    {/* Compressing overlay */}
                    {compressing && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <svg
                                className="w-8 h-8 text-white animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        </div>
                    )}

                    {/* Drop indicator overlay */}
                    {isDragging && (
                        <div className="absolute inset-0 bg-(--accent)/80 flex items-center justify-center z-10">
                            <svg
                                className="w-12 h-12 text-white animate-bounce"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    )}

                    {/* Hover overlay (hidden during drag/compress) */}
                    {!isDragging && !compressing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </div>
                    )}
                </div>

                <label htmlFor="avatar-upload" className="hidden">
                    Image Upload
                </label>
                <input
                    id="avatar-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    onClick={handleClick}
                    disabled={compressing}
                    className="text-sm font-league-500 text-(--accent) hover:text-(--accent)/80 transition-colors disabled:opacity-50"
                >
                    {compressing ? "Processing..." : "Change Photo"}
                </button>
            </div>
        </>
    );
};