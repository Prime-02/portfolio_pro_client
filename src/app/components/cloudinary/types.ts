// types.ts — shared types for the CloudinaryFileManager module

export interface FolderNode {
  name: string; // "content"
  path: string; // "d6a8b1f5-c312-4200-b240-76392779a576/content"
  assetCount?: number;
  subfolders: FolderNode[];
}

export interface FileNode {
  public_id: string;
  secure_url: string;
  name: string; // Extracted filename from public_id
  width?: number;
  height?: number;
  bytes: number;
  format: string;
  created_at: string;
  asset_folder?: string;
}

export interface CloudinaryFileManagerProps {
  /** Root folder to start from (e.g. "d6a8b1f5-c312-4200-b240-76392779a576") */
  rootFolder: string;
  /** Called when user clicks a file — receives the file's secure_url */
  onSelect?: (file: FileNode) => void;
  /** Called when asset list changes (upload/delete) */
  onChange?: (files: FileNode[]) => void;
  /** Max files per folder */
  maxFiles?: number;
}

export interface BreadcrumbSegment {
  label: string;
  path: string; // Full path up to this segment
}
