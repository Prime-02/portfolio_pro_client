// Stores
export { useCloudinaryCore } from "./useCloudinaryCore";
export { useCloudinaryUpload } from "./useCloudinaryUpload";
export { useCloudinaryTransform } from "./useCloudinaryTransform";
export { useCloudinaryManagement } from "./useCloudinaryManagement";
export { useCloudinarySearch } from "./useCloudinarySearch";
export { useCloudinaryVideo } from "./useCloudinaryVideo";
export { useCloudinaryAI } from "./useCloudinaryAI";
export { useCloudinaryBatch } from "./useCloudinaryBatch";
export { useCloudinaryAnalytics } from "./useCloudinaryAnalytics";

// Types
export type {
  // Enums
  ResourceType,
  // Shared
  TransformationOptions,
  UploadResponse,
  AssetInfo,
  BulkOperationResult,
  UsageReport,
  ArchiveOptions,
  BackupOptions,
  ResponsiveUrls,
  CloudinarySliceState,
  // Request payloads — Core
  UrlUploadRequest,
  UrlGenerationRequest,
  AssetUpdateRequest,
  // Request payloads — Upload
  Base64UploadRequest,
  UploadMultipleFilesParams,
  UploadMultipleUrlsRequest,
  UploadEagerTransformationsParams,
  UploadAutoTaggingParams,
  UploadLargeFileParams,
  UploadPreprocessingParams,
  // Request payloads — Transform
  ResponsiveUrlRequest,
  ArtisticEffectRequest,
  WatermarkRequest,
  // Request payloads — Management
  BulkTagUpdateRequest,
  MigrationRequest,
  // Request payloads — Search
  SearchRequest,
  // Request payloads — Video
  VideoTransformRequest,
  // Request payloads — AI
  AITaggingRequest,
  ContentModerationRequest,
  // Request payloads — Batch
  BatchTransformRequest,
  BatchDeleteRequest,
} from "./types";

// Store-local types
export type { UploadFileParams } from "./useCloudinaryCore";
export type {
  TransformationChainParams,
  SpriteParams,
  CollageParams,
  OptimizeWebParams,
  AnimatedGifParams,
  BatchTransformUrlsParams,
} from "./useCloudinaryTransform";
export type {
  RestoreParams,
  CleanupParams,
  OrganizeByDateParams,
  FindDuplicatesParams,
  FolderStructureParams,
} from "./useCloudinaryManagement";
export type {
  SearchResult,
  FolderListResult,
  TagListResult,
  SearchByTagParams,
  SearchByPrefixParams,
} from "./useCloudinarySearch";
export type { ThumbnailParams } from "./useCloudinaryVideo";
export type {
  AITaggingResult,
  ModerationResult,
  ObjectDetectionResult,
  BackgroundRemovalParams,
  ObjectDetectionParams,
} from "./useCloudinaryAI";
export type {
  TransformationUsageResult,
  BandwidthUsageResult,
  TransformationUsageParams,
  DateRangeParams,
} from "./useCloudinaryAnalytics";
