"use client";

// UploadZone.tsx — drag-and-drop / click-to-browse upload area

import { RefObject } from "react";

interface UploadZoneProps {
    isLoading: boolean;
    dragging: boolean;
    maxFiles: number;
    currentPath: string;
    fileInputRef: RefObject<HTMLInputElement>;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onFiles: (files: FileList) => void;
}

export function UploadZone({
    isLoading,
    dragging,
    maxFiles,
    currentPath,
    fileInputRef,
    onDrop,
    onDragOver,
    onDragLeave,
    onFiles,
}: UploadZoneProps) {
    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className="rounded-sm p-9 text-center transition-all duration-200 select-none"
            style={{
                border: `1px dashed ${dragging ? "var(--foreground)" : "rgba(var(--foreground-rgb, 255,255,255), 0.2)"}`,
                cursor: isLoading ? "not-allowed" : "pointer",
                backgroundColor: dragging
                    ? "rgba(var(--foreground-rgb, 255,255,255), 0.04)"
                    : "transparent",
                transform: dragging ? "scale(1.01)" : "scale(1)",
            }}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => e.target.files && onFiles(e.target.files)}
            />

            {isLoading ? (
                <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.4 }}>
                    <span
                        className="inline-block mr-2"
                        style={{ animation: "spin 1s linear infinite" }}
                    >
                        ◌
                    </span>
                    Uploading…
                </div>
            ) : (
                <>
                    <div
                        className="text-[28px] mb-2.5 transition-transform duration-200"
                        style={{ opacity: dragging ? 0.7 : 0.3, transform: dragging ? "scale(1.2)" : "scale(1)" }}
                    >
                        ⊕
                    </div>
                    <p className="m-0 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                        {dragging ? "Release to upload" : "Drop images here or click to browse"}
                    </p>
                    <p className="m-1 text-[10px]" style={{ color: "var(--foreground)", opacity: 0.3 }}>
                        PNG · JPG · WEBP · GIF — up to {maxFiles} files
                    </p>
                    <p className="m-0 text-[9px] font-mono" style={{ color: "var(--foreground)", opacity: 0.25 }}>
                        Target: /{currentPath}
                    </p>
                </>
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}