"use client";

// FilePreview.tsx — preview panel for the selected file

import { getImageUrl } from "@/lib/stores/cloudinary/helpers";
import type { FileNode } from "./types";

interface FilePreviewProps {
    file: FileNode | null;
    onCopyUrl: (url: string) => void;
}

export function FilePreview({ file, onCopyUrl }: FilePreviewProps) {
    if (!file) {
        return (
            <div
                className="rounded-sm p-6 text-center font-mono text-xs"
                style={{
                    border: "1px dashed rgba(var(--foreground-rgb, 255,255,255), 0.15)",
                    color: "var(--foreground)",
                    opacity: 0.35,
                }}
            >
                Click a file to view details
            </div>
        );
    }

    const previewUrl = getImageUrl(file.public_id, {
        width: 1200,
        height: 800,
        crop: "fit",
        format: "auto",
        quality: "auto",
    });

    return (
        <div className="flex flex-col gap-4">
            {/* Section label */}
            <div className="flex items-center gap-2">
                <span
                    className="text-[10px] tracking-[0.15em] font-mono"
                    style={{ color: "var(--foreground)", opacity: 0.4 }}
                >
                    FILE DETAILS
                </span>
                <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: "var(--foreground)", opacity: 0.1 }}
                />
            </div>

            {/* Preview image */}
            <div
                className="rounded-sm overflow-hidden relative"
                style={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid rgba(var(--foreground-rgb, 255,255,255), 0.08)",
                }}
            >
                <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full h-auto max-h-[300px] object-contain"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                    }}
                />
            </div>

            {/* File info */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <label
                        className="text-[9px] tracking-[0.1em] font-mono"
                        style={{ color: "var(--foreground)", opacity: 0.35 }}
                    >
                        NAME
                    </label>
                    <span
                        className="text-[11px] font-mono break-all"
                        style={{ color: "var(--foreground)", opacity: 0.75 }}
                    >
                        {file.name}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[9px] tracking-[0.1em] font-mono"
                            style={{ color: "var(--foreground)", opacity: 0.35 }}
                        >
                            FORMAT
                        </label>
                        <span
                            className="text-[11px] font-mono uppercase"
                            style={{ color: "var(--foreground)", opacity: 0.6 }}
                        >
                            {file.format}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[9px] tracking-[0.1em] font-mono"
                            style={{ color: "var(--foreground)", opacity: 0.35 }}
                        >
                            SIZE
                        </label>
                        <span
                            className="text-[11px] font-mono"
                            style={{ color: "var(--foreground)", opacity: 0.6 }}
                        >
                            {file.bytes.toLocaleString()} bytes
                        </span>
                    </div>
                </div>

                {file.width && (
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[9px] tracking-[0.1em] font-mono"
                            style={{ color: "var(--foreground)", opacity: 0.35 }}
                        >
                            DIMENSIONS
                        </label>
                        <span
                            className="text-[11px] font-mono"
                            style={{ color: "var(--foreground)", opacity: 0.6 }}
                        >
                            {file.width} × {file.height} px
                        </span>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <label
                        className="text-[9px] tracking-[0.1em] font-mono"
                        style={{ color: "var(--foreground)", opacity: 0.35 }}
                    >
                        PUBLIC ID
                    </label>
                    <span
                        className="text-[10px] font-mono break-all"
                        style={{ color: "var(--foreground)", opacity: 0.5 }}
                    >
                        {file.public_id}
                    </span>
                </div>
            </div>

            {/* URL display */}
            <div
                className="rounded-sm p-2.5 flex gap-2 items-start"
                style={{
                    backgroundColor: "var(--background)",
                    border: "1px solid rgba(var(--foreground-rgb, 255,255,255), 0.08)",
                }}
            >
                <span
                    className="flex-1 text-[10px] break-all leading-relaxed font-mono"
                    style={{ color: "var(--foreground)", opacity: 0.55 }}
                >
                    {file.secure_url}
                </span>
                <button
                    onClick={() => onCopyUrl(file.secure_url)}
                    className="rounded-sm px-2.5 py-1.5 text-[10px] font-mono whitespace-nowrap flex-shrink-0 transition-colors duration-150"
                    style={{
                        backgroundColor: "rgba(var(--foreground-rgb, 255,255,255), 0.1)",
                        color: "var(--foreground)",
                        opacity: 0.6,
                    }}
                >
                    COPY URL
                </button>
            </div>
        </div>
    );
}