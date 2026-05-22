"use client";

// CloudinaryFileManager.tsx — root composition component for folder-aware file management

import { useFileManager } from "./useFileManager";
import { FolderTreePanel } from "./FolderTree";
import { Breadcrumb } from "./Breadcrumb";
import { FileGrid } from "./FileGrid";
import { FilePreview } from "./FilePreview";
import { UploadZone } from "./UploadZone";
import { Toast } from "./Toast";
import type { CloudinaryFileManagerProps } from "./types";

export function CloudinaryFileManager({
    rootFolder,
    onSelect,
    onChange,
    maxFiles = 100,
}: CloudinaryFileManagerProps) {
    const mgr = useFileManager({ rootFolder, onSelect, onChange, maxFiles });

    return (
        <div
            className="font-mono min-h-screen min-w-lg overflow-auto p-6 md:p-8"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
        >
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div
                className="mb-6 pb-4 border-b flex flex-col gap-3"
                style={{ borderColor: "rgba(var(--foreground-rgb, 255,255,255), 0.1)" }}
            >
                <div className="flex items-center gap-3">
                    <h1
                        className="m-0 text-[20px] font-semibold tracking-[-0.02em]"
                        style={{ color: "var(--foreground)" }}
                    >
                        Your Files
                    </h1>
                    <span
                        className="ml-auto text-[11px] font-mono"
                        style={{ color: "var(--foreground)", opacity: 0.3 }}
                    >
                        {mgr.files.length}/{maxFiles} files
                    </span>
                </div>

                {/* Breadcrumb */}
                <Breadcrumb segments={mgr.breadcrumbs} onNavigate={mgr.navigateTo} />
            </div>

            {/* ── Error banner ───────────────────────────────────────────────────── */}
            {mgr.error && (
                <div
                    className="rounded-sm p-2.5 mb-4 flex justify-between items-center text-xs"
                    style={{
                        backgroundColor: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        color: "#ef4444",
                    }}
                >
                    <span>⚠ {mgr.error}</span>
                    <button
                        onClick={mgr.clearError}
                        className="bg-transparent border-none text-[#ef4444] cursor-pointer text-sm ml-4"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ── Three-column layout ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_320px] gap-6">
                {/* LEFT — Folder Tree */}
                <div
                    className="rounded-sm p-3"
                    style={{
                        border: "1px solid rgba(var(--foreground-rgb, 255,255,255), 0.08)",
                        backgroundColor: "rgba(var(--foreground-rgb, 255,255,255), 0.02)",
                    }}
                >
                    <FolderTreePanel
                        folderTree={mgr.folderTree}
                        currentPath={mgr.currentPath}
                        onNavigate={mgr.navigateTo}
                        isLoading={mgr.isFolderLoading}
                    />
                </div>

                {/* CENTER — Upload + File Grid */}
                <div className="flex flex-col gap-6">
                    <UploadZone
                        isLoading={mgr.isLoading}
                        dragging={mgr.dragging}
                        maxFiles={maxFiles}
                        currentPath={mgr.currentPath}
                        fileInputRef={mgr.fileInputRef}
                        onDrop={mgr.onDrop}
                        onDragOver={mgr.onDragOver}
                        onDragLeave={mgr.onDragLeave}
                        onFiles={mgr.handleFiles}
                    />

                    <FileGrid
                        files={mgr.files}
                        subfolders={mgr.subfolders}
                        deletingIds={mgr.deletingIds}
                        selectedIds={mgr.selectedIds}
                        selectedFile={mgr.selectedFile}
                        onSelect={mgr.selectFile}
                        onDelete={mgr.handleDelete}
                        onDeleteSelected={mgr.handleDeleteSelected}
                        onCopyUrl={mgr.handleCopyUrl}
                        onToggleSelect={mgr.toggleSelect}
                        onClearSelection={mgr.clearSelection}
                        onNavigate={mgr.navigateTo}
                    />
                </div>

                {/* RIGHT — File Preview */}
                <div
                    className="rounded-sm p-4"
                    style={{
                        border: "1px solid rgba(var(--foreground-rgb, 255,255,255), 0.08)",
                        backgroundColor: "rgba(var(--foreground-rgb, 255,255,255), 0.02)",
                    }}
                >
                    <FilePreview
                        file={mgr.selectedFile}
                        onCopyUrl={(url) => {
                            navigator.clipboard.writeText(url).catch(() => { });
                            mgr.showToast("URL copied");
                        }}
                    />
                </div>
            </div>

            {/* ── Toast ──────────────────────────────────────────────────────────── */}
            <Toast message={mgr.toast} />
        </div>
    );
}

export default CloudinaryFileManager;