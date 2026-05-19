"use client";

import { useState, useEffect, useRef, DragEvent } from "react";
import Image from "next/image";

interface AvatarUploadProps {
    currentImage?: string | null;
    onFileSelect: (file: File) => void;
    size?: "sm" | "md" | "lg";
}

export const AvatarUpload = ({
    currentImage,
    onFileSelect,
    size = "lg",
}: AvatarUploadProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isValidRemoteUrl, setIsValidRemoteUrl] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: "w-20 h-20",
        md: "w-32 h-32",
        lg: "w-40 h-40",
    };

    // Helper to check if a URL is valid for next/image
    const isValidImageUrl = (url: string): boolean => {
        if (!url) return false;
        // Data URLs start with "data:"
        if (url.startsWith("data:")) return false; // Not valid for next/image
        // Check if it's a valid absolute URL
        try {
            new URL(url);
            return true;
        } catch {
            // Could be a relative path starting with /
            return url.startsWith("/");
        }
    };

    useEffect(() => {
        if (currentImage) {
            setPreview(currentImage);
            setIsValidRemoteUrl(isValidImageUrl(currentImage));
        }
    }, [currentImage]);

    const processFile = (file: File) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            setIsValidRemoteUrl(false); // Data URLs can't use next/image
        };
        reader.readAsDataURL(file);
        onFileSelect(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    // Drag and drop handlers
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
            const file = files[0];
            processFile(file);
        }
    };

    return (
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
                    }`}
            >
                {preview ? (
                    // Use img tag for data URLs, next/image for valid remote URLs
                    isValidRemoteUrl ? (
                        <Image
                            src={preview}
                            alt="Profile picture"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={preview}
                            alt="Profile picture"
                            className="w-full h-full object-cover"
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

                {/* Hover overlay (hidden during drag) */}
                {!isDragging && (
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
                className="text-sm font-league-500 text-(--accent) hover:text-(--accent)/80 transition-colors"
            >
                Change Photo
            </button>
        </div>
    );
};