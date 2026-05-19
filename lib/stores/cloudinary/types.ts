// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type ResourceType = "image" | "video" | "raw" | "auto";

// ---------------------------------------------------------------------------
// Transformation
// ---------------------------------------------------------------------------

export interface TransformationOptions {
  width?: number | string;
  height?: number | string;
  crop?: string;
  gravity?: string;
  quality?: string | number;
  format?: string;
  effect?: string;
  angle?: number;
  zoom?: number;
  x?: number;
  y?: number;
  radius?: number | string;
  opacity?: number;
  background?: string;
  overlay?: string;
  underlay?: string;
  default_image?: string;
  delay?: number;
  color?: string;
  color_space?: string;
  dpr?: number | string;
  page?: number;
  border?: string;
  flags?: string | string[];
  start_offset?: string;
  end_offset?: string;
  duration?: string;
  fps?: number | string;
  audio_codec?: string;
  video_codec?: string;
  bit_rate?: string;
  streaming_profile?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Core upload / asset responses
// ---------------------------------------------------------------------------

export interface UploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: ResourceType;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename?: string;
  [key: string]: unknown;
}

export interface AssetInfo {
  public_id: string;
  format: string;
  version: number;
  resource_type: ResourceType;
  type: string;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
  url: string;
  secure_url: string;
  tags?: string[];
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Bulk / batch
// ---------------------------------------------------------------------------

export interface BulkOperationResult {
  successful_count: number;
  failed_count: number;
  results: Array<Record<string, unknown>>;
  errors: Array<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Management
// ---------------------------------------------------------------------------

export interface UsageReport {
  plan: string;
  last_updated: string;
  objects: Record<string, unknown>;
  bandwidth: Record<string, unknown>;
  storage: Record<string, unknown>;
  requests: number;
  resources: number;
  derived_resources: number;
  transformations: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ArchiveOptions {
  public_ids?: string[];
  tags?: string[];
  prefixes?: string[];
  transformations?: TransformationOptions[];
  mode?: "create" | "download";
  target_format?: "zip" | "tgz";
  target_public_id?: string;
  flatten_folders?: boolean;
  expires_at?: number;
  [key: string]: unknown;
}

export interface BackupOptions {
  source_folder?: string;
  backup_folder?: string;
  resource_type?: ResourceType;
  tags?: string[];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

export interface ResponsiveUrls {
  public_id: string;
  urls: Array<{ breakpoint: number; url: string; secure_url: string }>;
}

// ---------------------------------------------------------------------------
// Request payloads — Core
// ---------------------------------------------------------------------------

export interface UrlUploadRequest {
  url: string;
  public_id?: string;
  folder?: string;
  tags?: string[];
  transformation?: TransformationOptions;
  resource_type?: ResourceType;
}

export interface UrlGenerationRequest {
  public_id: string;
  transformation?: TransformationOptions;
  resource_type?: ResourceType;
  version?: number;
  secure?: boolean;
}

export interface AssetUpdateRequest {
  public_id: string;
  tags?: string[];
  context?: Record<string, string>;
  metadata?: Record<string, string>;
  resource_type?: ResourceType;
}

// ---------------------------------------------------------------------------
// Request payloads — Upload
// ---------------------------------------------------------------------------

export interface Base64UploadRequest {
  base64_string: string;
  public_id?: string;
  folder?: string;
  tags?: string[];
  transformation?: TransformationOptions;
  resource_type?: ResourceType;
}

export interface UploadMultipleFilesParams {
  files: File[];
  folder?: string;
  tags?: string;
  resource_type?: ResourceType;
  max_concurrent?: number;
}

export interface UploadMultipleUrlsRequest {
  urls: string[];
  folder?: string;
  tags?: string[];
  resource_type?: ResourceType;
}

export interface UploadEagerTransformationsParams {
  file_url: string;
  eager_transformations: TransformationOptions[];
  public_id?: string;
  folder?: string;
  tags?: string[];
  resource_type?: ResourceType;
}

export interface UploadAutoTaggingParams {
  file_url: string;
  auto_tagging?: number;
  public_id?: string;
  folder?: string;
  additional_tags?: string[];
  resource_type?: ResourceType;
}

export interface UploadLargeFileParams {
  file: File;
  chunk_size?: number;
  public_id?: string;
  folder?: string;
  tags?: string;
  resource_type?: ResourceType;
}

export interface UploadPreprocessingParams {
  file_url: string;
  preprocessing_steps: string[];
  public_id?: string;
  folder?: string;
  tags?: string[];
  resource_type?: ResourceType;
}

// ---------------------------------------------------------------------------
// Request payloads — Transform
// ---------------------------------------------------------------------------

export interface ResponsiveUrlRequest {
  public_id: string;
  breakpoints?: number[];
  transformation?: TransformationOptions;
  resource_type?: ResourceType;
}

export interface ArtisticEffectRequest {
  public_id: string;
  effect_name: string;
  intensity?: number;
  additional_params?: Record<string, unknown>;
  resource_type?: ResourceType;
}

export interface WatermarkRequest {
  public_id: string;
  watermark_text: string;
  position?: string;
  opacity?: number;
  font_size?: number;
  font_color?: string;
  resource_type?: ResourceType;
}

// ---------------------------------------------------------------------------
// Request payloads — Management
// ---------------------------------------------------------------------------

export interface BulkTagUpdateRequest {
  public_ids: string[];
  tags_to_add?: string[];
  tags_to_remove?: string[];
  resource_type?: ResourceType;
}

export interface MigrationRequest {
  source_folder: string;
  target_folder: string;
  resource_type?: ResourceType;
  preserve_structure?: boolean;
  dry_run?: boolean;
}

// ---------------------------------------------------------------------------
// Request payloads — Search
// ---------------------------------------------------------------------------

export interface SearchRequest {
  expression: string;
  max_results?: number;
  next_cursor?: string;
  sort_by?: string;
  aggregate?: string[];
  with_field?: string[];
}

// ---------------------------------------------------------------------------
// Request payloads — Video
// ---------------------------------------------------------------------------

export interface VideoTransformRequest {
  public_id: string;
  start_offset?: string;
  end_offset?: string;
  duration?: string;
  fps?: number;
  quality?: string;
  format?: string;
}

// ---------------------------------------------------------------------------
// Request payloads — AI
// ---------------------------------------------------------------------------

export interface AITaggingRequest {
  public_id: string;
  resource_type?: ResourceType;
  confidence_threshold?: number;
}

export interface ContentModerationRequest {
  public_id: string;
  resource_type?: ResourceType;
  moderation_kind?: string;
}

// ---------------------------------------------------------------------------
// Request payloads — Batch
// ---------------------------------------------------------------------------

export interface BatchTransformRequest {
  public_ids: string[];
  transformation: TransformationOptions;
  resource_type?: ResourceType;
  output_folder?: string;
  notification_url?: string;
}

export interface BatchDeleteRequest {
  public_ids: string[];
  resource_type?: ResourceType;
  keep_original?: boolean;
}

// ---------------------------------------------------------------------------
// Store slice shape — reused across all stores
// ---------------------------------------------------------------------------

export interface CloudinarySliceState {
  isLoading: boolean;
  error: string | null;
}
