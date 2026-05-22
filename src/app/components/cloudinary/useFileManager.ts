"use client";

// useFileManager.ts — all state and async logic for the CloudinaryFileManager

import { useState, useRef, useCallback, useEffect } from "react";
import { useCloudinaryCore } from "@/lib/stores/cloudinary/useCloudinaryCore";
import { useCloudinarySearch } from "@/lib/stores/cloudinary/useCloudinarySearch";
import { resolveImageUrl, getImageUrl } from "@/lib/stores/cloudinary/helpers";
import type { FolderNode, FileNode, BreadcrumbSegment } from "./types";

export interface UseFileManagerOptions {
  rootFolder: string;
  onSelect?: (file: FileNode) => void;
  onChange?: (files: FileNode[]) => void;
  maxFiles: number;
}

export function useFileManager({
  rootFolder,
  onSelect,
  onChange,
  maxFiles,
}: UseFileManagerOptions) {
  const {
    uploadFile,
    deleteAsset,
    isLoading: coreLoading,
    error: coreError,
    clearError,
  } = useCloudinaryCore();
  const { searchByPrefix, listFolders } = useCloudinarySearch();

  // ── Navigation state ──────────────────────────────────────────────────────
  const [currentPath, setCurrentPath] = useState(rootFolder);
  const [folderTree, setFolderTree] = useState<FolderNode | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbSegment[]>([]);

  // ── Contents ──────────────────────────────────────────────────────────────
  const [files, setFiles] = useState<FileNode[]>([]);
  const [subfolders, setSubfolders] = useState<FolderNode[]>([]);

  // ── Selection & UI ──────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isFolderLoading, setIsFolderLoading] = useState(false);
  const [isContentsLoading, setIsContentsLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Error handling ────────────────────────────────────────────────────────
  const handleError = useCallback((msg: string, err?: unknown) => {
    const detail = err instanceof Error ? err.message : String(err);
    setError(`${msg}${detail ? `: ${detail}` : ""}`);
    console.error(msg, err);
  }, []);

  const clearLocalError = useCallback(() => {
    setError(null);
    clearError();
  }, [clearError]);

  // ── Build breadcrumbs from currentPath ────────────────────────────────────
  const updateBreadcrumbs = useCallback((path: string) => {
    const parts = path.split("/").filter(Boolean);
    const crumbs: BreadcrumbSegment[] = [];
    let builtPath = "";
    for (const part of parts) {
      builtPath = builtPath ? `${builtPath}/${part}` : part;
      crumbs.push({ label: part, path: builtPath });
    }
    setBreadcrumbs(crumbs);
  }, []);

  // ── Load folder tree (recursive) ──────────────────────────────────────────
  const loadFolderTree = useCallback(async () => {
    setIsFolderLoading(true);
    try {
      const buildTree = async (path: string): Promise<FolderNode[]> => {
        try {
          const result = await listFolders(path || null);
          const folders = result.folders || [];
          const nodes: FolderNode[] = [];
          for (const f of folders) {
            const childFolders = await buildTree(f.path);
            nodes.push({
              name: f.name,
              path: f.path,
              subfolders: childFolders,
            });
          }
          return nodes;
        } catch {
          return [];
        }
      };

      const children = await buildTree(rootFolder);
      setFolderTree({
        name: rootFolder.split("/").pop() || rootFolder,
        path: rootFolder,
        subfolders: children,
      });
    } catch (err) {
      handleError("Failed to load folder tree", err);
    } finally {
      setIsFolderLoading(false);
    }
  }, [rootFolder, listFolders, handleError]);

  // ── Load contents of current folder ───────────────────────────────────────
  const loadContents = useCallback(async () => {
    setIsContentsLoading(true);
    clearLocalError();
    try {
      // Fetch all assets under this prefix (recursive)
      const result = await searchByPrefix({
        prefix: currentPath,
        resource_type: "image",
        max_results: 500,
      });

      const allResources = (result.resources || []) as Array<{
        public_id: string;
        secure_url: string;
        width?: number;
        height?: number;
        bytes: number;
        format: string;
        created_at: string;
        asset_folder?: string;
      }>;

      // Filter to only direct children (not nested deeper)
      const currentDepth = currentPath.split("/").length;
      const directFiles: FileNode[] = [];
      const directSubfolderPaths = new Set<string>();

      for (const r of allResources) {
        const parts = r.public_id.split("/");
        const resourceDepth = parts.length;

        if (resourceDepth === currentDepth + 1) {
          // Direct file in this folder
          directFiles.push({
            public_id: r.public_id,
            secure_url: r.secure_url,
            name: parts[parts.length - 1],
            width: r.width,
            height: r.height,
            bytes: r.bytes,
            format: r.format,
            created_at: r.created_at,
            asset_folder: r.asset_folder,
          });
        } else if (resourceDepth > currentDepth + 1) {
          // Nested — extract immediate subfolder
          const subPath = parts.slice(0, currentDepth + 1).join("/");
          directSubfolderPaths.add(subPath);
        }
      }

      // Build subfolder nodes from paths
      const subfolderNodes: FolderNode[] = Array.from(directSubfolderPaths).map(
        (path) => {
          const parts = path.split("/");
          return {
            name: parts[parts.length - 1],
            path,
            subfolders: [],
          };
        },
      );

      setFiles(directFiles);
      setSubfolders(subfolderNodes);
      onChange?.(directFiles);
    } catch (err) {
      handleError("Failed to load folder contents", err);
    } finally {
      setIsContentsLoading(false);
    }
  }, [currentPath, searchByPrefix, onChange, handleError, clearLocalError]);

  // ── Navigate to folder ──────────────────────────────────────────────────
  const navigateTo = useCallback(
    (path: string) => {
      setCurrentPath(path);
      updateBreadcrumbs(path);
      setSelectedFile(null);
      setSelectedIds(new Set());
    },
    [updateBreadcrumbs],
  );

  const navigateUp = useCallback(() => {
    const parts = currentPath.split("/");
    if (parts.length > 1) {
      parts.pop();
      navigateTo(parts.join("/"));
    }
  }, [currentPath, navigateTo]);

  // ── Select file ───────────────────────────────────────────────────────────
  const selectFile = useCallback(
    (file: FileNode) => {
      setSelectedFile(file);
      onSelect?.(file);
    },
    [onSelect],
  );

  // ── Upload files to current folder ────────────────────────────────────────
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!arr.length) return;
      if (files.length + arr.length > maxFiles) {
        showToast(`Max ${maxFiles} files allowed`);
        return;
      }
      clearLocalError();

      const uploaded: FileNode[] = [];
      for (const file of arr) {
        try {
          const res = await uploadFile({
            file,
            folder: currentPath,
            resource_type: "image",
          });
          uploaded.push({
            public_id: res.public_id,
            secure_url: res.secure_url,
            name: res.public_id.split("/").pop() || res.public_id,
            width: res.width,
            height: res.height,
            bytes: res.bytes,
            format: res.format,
            created_at: res.created_at,
          });
        } catch (err) {
          handleError(`Upload failed for ${file.name}`, err);
        }
      }

      if (uploaded.length > 0) {
        setFiles((prev) => [...prev, ...uploaded]);
        showToast(
          `Uploaded ${uploaded.length} file${uploaded.length > 1 ? "s" : ""}`,
        );
        // Auto-select the last uploaded file
        const last = uploaded[uploaded.length - 1];
        selectFile(last);
      }
    },
    [
      currentPath,
      maxFiles,
      uploadFile,
      showToast,
      handleError,
      clearLocalError,
      selectFile,
    ],
  );

  // ── Drag & drop ─────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  // ── Delete file ───────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (publicId: string) => {
      setDeletingIds((s) => new Set(s).add(publicId));
      try {
        await deleteAsset(publicId, "image", true);
        setFiles((prev) => prev.filter((f) => f.public_id !== publicId));
        setSelectedIds((s) => {
          const next = new Set(s);
          next.delete(publicId);
          return next;
        });
        if (selectedFile?.public_id === publicId) {
          setSelectedFile(null);
        }
        showToast("File deleted");
      } catch (err) {
        handleError("Delete failed", err);
      } finally {
        setDeletingIds((s) => {
          const next = new Set(s);
          next.delete(publicId);
          return next;
        });
      }
    },
    [deleteAsset, selectedFile, showToast, handleError],
  );

  const handleDeleteSelected = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    for (const id of ids) await handleDelete(id);
    setSelectedIds(new Set());
  }, [selectedIds, handleDelete]);

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleSelect = useCallback((publicId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(publicId) ? next.delete(publicId) : next.add(publicId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // ── Copy URL ──────────────────────────────────────────────────────────────
  const handleCopyUrl = useCallback(
    (publicId: string) => {
      const url = getImageUrl(publicId, { format: "auto", quality: "auto" });
      navigator.clipboard.writeText(url).catch(() => {});
      showToast("URL copied");
    },
    [showToast],
  );

  // ── Resolve URL (for the resolve panel) ───────────────────────────────────
  const [resolveInput, setResolveInput] = useState("");
  const [resolvedUrl, setResolvedUrl] = useState("");
  const [resolveWidth, setResolveWidth] = useState(800);
  const [resolveHeight, setResolveHeight] = useState(600);

  const handleResolve = useCallback(() => {
    if (!resolveInput.trim()) return;
    const url = resolveImageUrl(resolveInput.trim(), {
      width: resolveWidth || undefined,
      height: resolveHeight || undefined,
      crop: "fill",
      format: "auto",
      quality: "auto",
    });
    setResolvedUrl(url);
  }, [resolveInput, resolveWidth, resolveHeight]);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    loadFolderTree();
  }, [loadFolderTree]);

  useEffect(() => {
    loadContents();
  }, [currentPath, loadContents]);

  return {
    // Navigation
    currentPath,
    folderTree,
    breadcrumbs,
    navigateTo,
    navigateUp,

    // Contents
    files,
    subfolders,

    // Selection
    selectedFile,
    selectedIds,
    deletingIds,

    // Loading
    isFolderLoading,
    isContentsLoading,
    dragging,
    isLoading: coreLoading || isContentsLoading,

    // UI
    toast,
    error: error || coreError,
    fileInputRef,

    // Resolve
    resolveInput,
    resolvedUrl,
    resolveWidth,
    resolveHeight,

    // Actions
    clearError: clearLocalError,
    showToast,
    loadContents,
    handleFiles,
    onDrop,
    onDragOver,
    onDragLeave,
    handleDelete,
    handleDeleteSelected,
    toggleSelect,
    clearSelection,
    handleCopyUrl,
    selectFile,
    handleResolve,
    setResolveInput,
    setResolveWidth,
    setResolveHeight,
  };
}
