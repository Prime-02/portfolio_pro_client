"use client";

// FileGrid.tsx — grid of files and subfolders with selection, hover actions

import { useState } from "react";
import { getImageUrl } from "@/lib/stores/cloudinary/helpers";
import { formatBytes } from "./utils";
import type { FileNode, FolderNode } from "./types";

interface FileCardProps {
    file: FileNode;
    isDeleting: boolean;
    isSelected: boolean;
    onSelect: (file: FileNode) => void;
    onDelete: (publicId: string) => void;
    onCopyUrl: (publicId: string) => void;
    onToggleSelect: (publicId: string) => void;
}

function FileCard({
    file,
    isDeleting,
    isSelected,
    onSelect,
    onDelete,
    onCopyUrl,
    onToggleSelect,
}: FileCardProps) {
    const [copied, setCopied] = useState(false);
    const [hovered, setHovered] = useState(false);

    const thumbUrl = getImageUrl(file.public_id, {
        width: 300,
        height: 300,
        crop: "fill",
        format: "auto",
        quality: "auto",
    });

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCopyUrl(file.public_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const showOverlay = hovered || isSelected;

    return (
        <div
            className="relative rounded-sm overflow-hidden border transition-all duration-200 cursor-pointer"
            style={{
                backgroundColor: "var(--background)",
                borderColor: isSelected
                    ? "var(--foreground)"
                    : hovered
                        ? "rgba(var(--foreground-rgb, 255,255,255), 0.4)"
                        : "rgba(var(--foreground-rgb, 255,255,255), 0.15)",
                boxShadow: isSelected ? "0 0 0 1px var(--foreground)" : "none",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onSelect(file)}
        >
            {/* Thumbnail */}
            <div className="relative pb-[100%]" style={{ backgroundColor: "#111" }}>
                <img
                    src={thumbUrl}
                    alt={file.name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: showOverlay ? 0.45 : 1 }}
                />

                {/* Selection checkbox — top-left */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(file.public_id);
                    }}
                    title={isSelected ? "Deselect" : "Select"}
                    className="absolute top-1.5 left-1.5 w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold transition-all duration-150 z-10"
                    style={{
                        backgroundColor: isSelected ? "var(--foreground)" : "rgba(0,0,0,0.55)",
                        color: isSelected ? "var(--background)" : "rgba(255,255,255,0.7)",
                        border: `1px solid ${isSelected ? "var(--foreground)" : "rgba(255,255,255,0.25)"}`,
                        opacity: showOverlay ? 1 : 0,
                    }}
                >
                    {isSelected ? "✓" : ""}
                </button>

                {/* Action buttons — center overlay */}
                <div
                    className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200"
                    style={{ opacity: showOverlay ? 1 : 0 }}
                >
                    <button
                        onClick={handleCopy}
                        title="Copy URL"
                        className="rounded-sm w-8 h-8 flex items-center justify-center text-sm font-semibold transition-colors duration-200"
                        style={{
                            backgroundColor: copied ? "#22c55e" : "var(--foreground)",
                            color: copied ? "#fff" : "var(--background)",
                        }}
                    >
                        {copied ? "✓" : "⎘"}
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(file.public_id);
                        }}
                        disabled={isDeleting}
                        title="Delete file"
                        className="rounded-sm w-8 h-8 flex items-center justify-center text-xs transition-colors duration-200"
                        style={{
                            backgroundColor: isDeleting ? "#333" : "#ef4444",
                            color: "#fff",
                            cursor: isDeleting ? "not-allowed" : "pointer",
                        }}
                    >
                        {isDeleting ? "…" : "✕"}
                    </button>
                </div>
            </div>

            {/* Meta bar */}
            <div
                className="p-2 border-t"
                style={{ borderColor: "rgba(var(--foreground-rgb, 255,255,255), 0.1)" }}
            >
                <p
                    className="m-0 text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ color: "var(--foreground)", opacity: 0.55 }}
                    title={file.name}
                >
                    {file.name}
                </p>
                <div className="flex gap-2 mt-0.5">
                    <span
                        className="text-[9px] font-mono uppercase"
                        style={{ color: "var(--foreground)", opacity: 0.35 }}
                    >
                        {file.format}
                    </span>
                    {file.width && (
                        <span
                            className="text-[9px] font-mono"
                            style={{ color: "var(--foreground)", opacity: 0.35 }}
                        >
                            {file.width}×{file.height}
                        </span>
                    )}
                    <span
                        className="text-[9px] font-mono ml-auto"
                        style={{ color: "var(--foreground)", opacity: 0.35 }}
                    >
                        {formatBytes(file.bytes)}
                    </span>
                </div>
            </div>
        </div>
    );
}

interface SubfolderCardProps {
    folder: FolderNode;
    onNavigate: (path: string) => void;
}

function SubfolderCard({ folder, onNavigate }: SubfolderCardProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="relative rounded-sm overflow-hidden border transition-all duration-200 cursor-pointer"
            style={{
                backgroundColor: "var(--background)",
                borderColor: hovered
                    ? "rgba(var(--foreground-rgb, 255,255,255), 0.4)"
                    : "rgba(var(--foreground-rgb, 255,255,255), 0.15)",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onNavigate(folder.path)}
        >
            <div
                className="flex flex-col items-center justify-center gap-2 py-8"
                style={{ minHeight: "140px" }}
            >
                <span className="text-3xl" style={{ opacity: hovered ? 0.8 : 0.5 }}>
                    📁
                </span>
                <span
                    className="text-[10px] font-mono text-center px-2"
                    style={{ color: "var(--foreground)", opacity: 0.6 }}
                >
                    {folder.name}
                </span>
            </div>
        </div>
    );
}

interface FileGridProps {
    files: FileNode[];
    subfolders: FolderNode[];
    deletingIds: Set<string>;
    selectedIds: Set<string>;
    selectedFile: FileNode | null;
    onSelect: (file: FileNode) => void;
    onDelete: (publicId: string) => void;
    onDeleteSelected: () => void;
    onCopyUrl: (publicId: string) => void;
    onToggleSelect: (publicId: string) => void;
    onClearSelection: () => void;
    onNavigate: (path: string) => void;
}

export function FileGrid({
    files,
    subfolders,
    deletingIds,
    selectedIds,
    selectedFile,
    onSelect,
    onDelete,
    onDeleteSelected,
    onCopyUrl,
    onToggleSelect,
    onClearSelection,
    onNavigate,
}: FileGridProps) {
    const hasSelection = selectedIds.size > 0;
    const totalItems = files.length + subfolders.length;

    if (totalItems === 0) {
        return (
            <div
                className="rounded-sm p-8 text-center font-mono text-xs"
                style={{
                    border: "1px dashed rgba(var(--foreground-rgb, 255,255,255), 0.15)",
                    color: "var(--foreground)",
                    opacity: 0.4,
                }}
            >
                This folder is empty
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Section label + bulk toolbar */}
            <div className="flex items-center gap-2">
                <span
                    className="text-[10px] tracking-[0.15em] font-mono"
                    style={{ color: "var(--foreground)", opacity: 0.4 }}
                >
                    CONTENTS ({totalItems})
                </span>
                <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: "var(--foreground)", opacity: 0.1 }}
                />

                {hasSelection && (
                    <div className="flex items-center gap-2">
                        <span
                            className="text-[10px] font-mono"
                            style={{ color: "var(--foreground)", opacity: 0.45 }}
                        >
                            {selectedIds.size} selected
                        </span>
                        <button
                            onClick={onClearSelection}
                            className="text-[10px] font-mono px-2 py-1 rounded-sm transition-colors duration-150"
                            style={{
                                backgroundColor: "rgba(var(--foreground-rgb, 255,255,255), 0.08)",
                                color: "var(--foreground)",
                                opacity: 0.6,
                            }}
                        >
                            Clear
                        </button>
                        <button
                            onClick={onDeleteSelected}
                            className="text-[10px] font-mono px-2 py-1 rounded-sm transition-colors duration-150"
                            style={{
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                                color: "#ef4444",
                                border: "1px solid rgba(239,68,68,0.3)",
                            }}
                        >
                            Delete {selectedIds.size}
                        </button>
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
                {/* Subfolders first */}
                {subfolders.map((folder) => (
                    <SubfolderCard
                        key={folder.path}
                        folder={folder}
                        onNavigate={onNavigate}
                    />
                ))}

                {/* Files */}
                {files.map((file) => (
                    <FileCard
                        key={file.public_id}
                        file={file}
                        isDeleting={deletingIds.has(file.public_id)}
                        isSelected={selectedIds.has(file.public_id)}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        onCopyUrl={onCopyUrl}
                        onToggleSelect={onToggleSelect}
                    />
                ))}
            </div>
        </div>
    );
}