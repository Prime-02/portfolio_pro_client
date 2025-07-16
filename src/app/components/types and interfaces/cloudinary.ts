// Base types
export interface CloudinaryAsset {
  public_id: string;
  url?: string;
  secure_url: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  version?: number;
  version_id?: string;
  signature?: string;
  width?: number;
  height?: number;
  format?: string;
  created_at?: string;
  tags?: string[];
  bytes?: number;
  type?: string;
  etag?: string;
  placeholder?: boolean;
  folder?: string;
  access_mode?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  original_filename?: string;
  api_key?: string;
}

export interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
  effect?: string;
  angle?: number;
  radius?: string;
  border?: string;
  gravity?: string;
  fetch_format?: string;
}

// Upload responses
export interface UploadResponse extends CloudinaryAsset {
  // Additional fields that might be present in upload response
  overwritten?: boolean;
  eager?: Array<{
    transformation: string;
    width: number;
    height: number;
    url: string;
    secure_url: string;
  }>;
  delete_token?: string;
  moderation?: Array<{
    status: string;
    kind: string;
    updated_at: string;
  }>;
}

// URL generation response
export interface UrlResponse {
  url: string;
  public_id: string;
  transformation_applied: boolean;
}

// Asset info response
export interface AssetInfoResponse extends CloudinaryAsset {
  colors?: Array<[string, number]>;
  predominant?: {
    cloudinary: Array<[string, number]>;
    google: Array<[string, number]>;
  };
  image_analysis?: {
    face_count: number;
    faces: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
    }>;
  };
  derived?: Array<{
    transformation: string;
    format: string;
    bytes: number;
    id: string;
    url: string;
    secure_url: string;
  }>;
}

// Success response wrapper
export interface SuccessResponse<T = any> {
  success?: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// Asset update response
export interface UpdateAssetResponse {
  public_id: string;
  version?: number;
  signature?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  created_at?: string;
  tags?: string[];
  bytes?: number;
  type?: string;
  etag?: string;
  url?: string;
  secure_url?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Delete response
export interface DeleteResponse {
  deleted?: Record<string, string>; // public_id -> status
  deleted_counts?: {
    [key: string]: {
      original: number;
      derived: number;
    };
  };
  partial?: boolean;
  rate_limit_allowed?: number;
  rate_limit_reset_at?: string;
  rate_limit_remaining?: number;
}

// Bulk delete response
export interface BulkDeleteItem {
  public_id: string;
  status: "deleted" | "not_found" | "error";
  error?: string;
}

export interface BulkDeleteResponse {
  deleted: BulkDeleteItem[];
  summary: {
    total: number;
    deleted: number;
    not_found: number;
    errors: number;
  };
}

// Asset listing response
export interface ListAssetsResponse {
  resources?: CloudinaryAsset[];
  next_cursor?: string;
  rate_limit_allowed?: number;
  rate_limit_reset_at?: string;
  rate_limit_remaining?: number;
  total_count?: number;
}

// Search response
export interface SearchAssetsResponse {
  resources?: CloudinaryAsset[];
  next_cursor?: string;
  total_count?: number;
  time?: number;
  rate_limit_allowed?: number;
  rate_limit_reset_at?: string;
  rate_limit_remaining?: number;
}

// Folder management responses
export interface FolderResponse {
  success?: boolean;
  path: string;
  name?: string;
  external_id?: string;
}

export interface CreateFolderResponse extends FolderResponse {
  created_at?: string;
}

export interface DeleteFolderResponse extends FolderResponse {
  deleted?: string[];
}

// Health check response
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp?: string;
  service?: string;
  version?: string;
  cloudinary_connection?: boolean;
  error?: string;
}

// Request types (for reference and type safety)
export interface UploadFromUrlRequest {
  url: string;
  public_id?: string;
  folder?: string;
  tags?: string[];
  transformation?: TransformationOptions;
  resource_type?: "image" | "video" | "raw" | "auto";
}

export interface UpdateAssetRequest {
  tags?: string[];
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface BulkDeleteRequest {
  public_ids: string[];
  resource_type?: "image" | "video" | "raw" | "auto";
}

export interface SearchRequest {
  expression: string;
  max_results?: number;
  next_cursor?: string;
  sort_by?: Array<{ field: string; direction: "asc" | "desc" }>;
}

export interface FolderRequest {
  folder_path: string;
}

// Error response type
export interface ErrorResponse {
  detail: string;
  status_code?: number;
}

// API response wrapper type for error handling
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };

// Utility types for transformations
export type CropMode =
  | "scale"
  | "fit"
  | "mfit"
  | "fill"
  | "lfill"
  | "fill_pad"
  | "crop"
  | "thumb"
  | "imagga_crop"
  | "imagga_scale";

export type GravityMode =
  | "center"
  | "north"
  | "south"
  | "east"
  | "west"
  | "north_east"
  | "north_west"
  | "south_east"
  | "south_west"
  | "face"
  | "faces"
  | "custom";

export type QualityMode =
  | "auto"
  | "auto:best"
  | "auto:good"
  | "auto:eco"
  | "auto:low"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "10"
  | "20"
  | "30"
  | "40"
  | "50"
  | "60"
  | "70"
  | "80"
  | "90"
  | "100";

export type ResourceType = "image" | "video" | "raw" | "auto";

// Specific endpoint response types
export interface UploadFileResponse extends UploadResponse {}
export interface UploadFromUrlResponse extends UploadResponse {}
export interface GetAssetInfoResponse extends AssetInfoResponse {}
export interface GetAssetUrlResponse extends UrlResponse {}
export interface UpdateAssetResponse
  extends SuccessResponse<UpdateAssetResponse> {}
export interface UpdateAssetFromUrlResponse extends UploadResponse {}
export interface DeleteAssetResponse extends SuccessResponse<DeleteResponse> {}
export interface DeleteMultipleAssetsResponse
  extends SuccessResponse<BulkDeleteResponse> {}
export interface ListAssetsResponse {}
export interface SearchAssetsResponse {}
export interface CreateFolderResponse
  extends SuccessResponse<CreateFolderResponse> {}
export interface DeleteFolderResponse
  extends SuccessResponse<DeleteFolderResponse> {}
export interface HealthCheckResponse {}
