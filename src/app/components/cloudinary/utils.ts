// utils.ts — shared utility functions for the CloudinaryFileManager module

import type { UploadResponse } from "@/lib/stores/cloudinary/types";
import type { FileNode } from "./types";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function uploadResponseToFileNode(res: UploadResponse): FileNode {
  return {
    public_id: res.public_id,
    secure_url: res.secure_url,
    name: res.public_id.split("/").pop() || res.public_id,
    width: res.width,
    height: res.height,
    bytes: res.bytes,
    format: res.format,
    created_at: res.created_at,
  };
}

/** Extract immediate subfolder name from a public_id relative to parent path */
export function getImmediateSubfolder(
  publicId: string,
  parentPath: string,
): string | null {
  if (!publicId.startsWith(parentPath + "/")) return null;
  const remainder = publicId.slice(parentPath.length + 1);
  const parts = remainder.split("/");
  if (parts.length > 1) {
    return parts[0]; // immediate subfolder name
  }
  return null;
}
