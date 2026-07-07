// ==================== Enums ====================

import { UserResponse } from "../../user/useUserSettings";

export type ContentType = "" | "POST" | "BLOG" | "ARTICLE" | "POLL";

export type ContentStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED"
  | "SCHEDULED"
  | "DELETED";

export type ReactionType = "LIKE" | "LOVE" | "CELEBRATE" | "INSIGHTFUL";

export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED";

export type SortOrder = "asc" | "desc";

// ==================== Content ====================

export interface ContentBase {
  content_type: ContentType;
  title: string;
  body?: string | null;
  excerpt?: string | null;
  cover_image_url?: string | null;
  cover_image_id?: string | null;
  tags?: string[];
  category?: string | null;
  is_public: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  allow_comments: boolean;
  allow_likes: boolean;
  allow_reshare: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  type_metadata?: Record<string, unknown>;
}

export interface ContentResponse extends ContentBase {
  id: string;
  user_id: string;
  slug?: string | null;
  status: ContentStatus;
  scheduled_publish_at?: string | null;
  published_at?: string | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface ContentWithAuthor extends ContentResponse {
  author?: UserSummary | null;
  is_liked?: boolean;
  is_shared?: boolean;
}

export interface ContentListResponse {
  items: ContentWithAuthor[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

// Create / Update payloads (sent as FormData)
export interface ContentCreatePayload {
  title: string;
  content_type: ContentType;
  body?: string;
  excerpt?: string;
  category?: string;
  tags?: string; // comma-separated
  status?: ContentStatus;
  is_public?: boolean;
  is_featured?: boolean;
  is_pinned?: boolean;
  allow_comments?: boolean;
  allow_likes?: boolean;
  allow_reshare?: boolean;
  meta_title?: string;
  meta_description?: string;
  cover_image?: File;
}

export interface ContentUpdatePayload {
  title?: string;
  body?: string;
  excerpt?: string;
  category?: string;
  tags?: string; // comma-separated
  status?: ContentStatus;
  is_public?: boolean;
  is_featured?: boolean;
  is_pinned?: boolean;
  allow_comments?: boolean;
  allow_likes?: boolean;
  allow_reshare?: boolean;
  meta_title?: string;
  meta_description?: string;
  cover_image?: File;
}

export interface ContentFilterParams {
  content_type?: ContentType;
  status?: ContentStatus;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  is_featured?: boolean;
  username?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: SortOrder;
  ids?: string[];
  merge_filters?: boolean;
}

export interface BulkContentUpdate {
  content_ids: string[];
  status?: ContentStatus;
  is_public?: boolean;
  is_featured?: boolean;
  category?: string;
  tags?: string[];
}

export interface BulkDeleteRequest {
  content_ids: string[];
  hard_delete?: boolean;
}

export interface BulkOperationResponse {
  success: boolean;
  updated_count: number;
  failed_count: number;
  errors?: Array<Record<string, unknown>> | null;
}

// ==================== Likes ====================

export interface ContentLikeCreate {
  content_id: string;
  reaction_type?: ReactionType;
}

export interface ContentLikeResponse {
  id: string;
  user_id: string;
  content_id: string;
  user?: UserSummary;
  reaction_type: ReactionType;
  created_at: string;
}

export interface UserLikedResponse {
  liked: boolean;
  reaction_type?: ReactionType | null;
}

export interface ReactionCountsResponse {
  [reaction: string]: number;
}

export interface ContentLikesListResponse {
  items: ContentLikeResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

// ==================== Comments ====================

export interface ContentCommentBase {
  body: string;
}

export interface ContentCommentCreate extends ContentCommentBase {
  content_id: string;
  parent_comment_id?: string | null;
}

export interface ContentCommentUpdate {
  body?: string;
  is_pinned?: boolean;
}

export interface ContentCommentResponse extends ContentCommentBase {
  id: string;
  content_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  thread_root_id?: string | null;
  depth_level: number;
  is_edited: boolean;
  is_pinned: boolean;
  is_deleted: boolean;
  deleted_at?: string | null;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at?: string | null;
}

export interface ContentCommentWithUser extends ContentCommentResponse {
  user?: UserSummary | null;
  replies?: ContentCommentWithUser[];
  is_liked?: boolean;
}

export interface ContentCommentListResponse {
  items: ContentCommentWithUser[];
  total: number;
  page: number;
  page_size: number;
}

export interface CommentFilterParams {
  content_id?: string;
  user_id?: string;
  parent_comment_id?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: SortOrder;
}

// ==================== Comment Likes ====================

export interface CommentLikeResponse {
  id: string;
  user_id: string;
  comment_id: string;
  created_at: string;
}

// ==================== Shares ====================

export interface ContentShareCreate {
  original_content_id: string;
  share_comment?: string | null;
  is_public?: boolean;
}

export interface ContentShareResponse {
  id: string;
  original_content_id: string;
  shared_by_user_id: string;
  share_comment?: string | null;
  is_public: boolean;
  created_at: string;
}

export interface ContentShareWithContent extends ContentShareResponse {
  original_content?: ContentResponse | null;
  shared_by?: UserSummary | null;
}

export interface ContentSharesListResponse {
  items: ContentShareWithContent[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface UserSharedResponse {
  shared: boolean;
  share_id?: string | null;
}

// ==================== Analytics ====================

export interface ContentViewCreate {
  content_id: string;
  session_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  time_spent_seconds?: number | null;
}

export interface ContentViewResponse {
  id: string;
  content_id: string;
  user_id?: string | null;
  session_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  time_spent_seconds?: number | null;
  viewed_at: string;
}

export interface ContentAnalytics {
  total_views: number;
  unique_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  average_time_spent?: number | null;
  views_by_date: Array<Record<string, unknown>>;
}

export interface EngagementMetrics {
  engagement_rate: number;
  like_rate: number;
  comment_rate: number;
  share_rate: number;
  reaction_breakdown: ReactionCountsResponse;
}

export interface AudienceInsights {
  unique_viewers: number;
  average_time_spent?: number | null;
  top_referrers: Array<Record<string, unknown>>;
}

export interface UserContentAnalytics {
  total_content: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  average_engagement_rate: number;
  top_performing_content: ContentResponse[];
}

// ==================== Bookmarks ====================

export interface ContentBookmarkCreate {
  content_id: string;
  collection_name?: string | null;
  notes?: string | null;
}

export interface ContentBookmarkUpdate {
  collection_name?: string | null;
  notes?: string | null;
}

export interface ContentBookmarkResponse {
  id: string;
  user_id: string;
  content_id: string;
  collection_name?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ContentBookmarkWithContent extends ContentBookmarkResponse {
  content?: ContentResponse | null;
}

export interface ContentBookmarkListResponse {
  items: ContentBookmarkWithContent[];
  total: number;
  collections: string[];
}

// ==================== Reports ====================

export interface ContentReportCreate {
  content_id: string;
  reason: string;
  description?: string | null;
}

export interface ContentReportUpdate {
  status: ReportStatus;
  resolution_notes?: string | null;
}

export interface ContentReportResponse {
  id: string;
  content_id: string;
  reported_by_user_id?: string | null;
  reason: string;
  description?: string | null;
  status: ReportStatus;
  reviewed_by_user_id?: string | null;
  reviewed_at?: string | null;
  resolution_notes?: string | null;
  created_at: string;
}

export interface ContentReportWithDetails extends ContentReportResponse {
  content?: ContentResponse | null;
  reported_by?: UserSummary | null;
  reviewed_by?: UserSummary | null;
}

export interface ContentReportsListResponse {
  items: ContentReportWithDetails[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface ReportStatistics {
  total_reports: number;
  by_status: Record<ReportStatus, number>;
  by_reason: Record<string, number>;
}

// ==================== Tags ====================

export interface ContentTagCreate {
  tag_name: string;
  description?: string | null;
}

export interface ContentTagUpdate {
  description?: string | null;
  is_trending?: boolean;
}

export interface ContentTagResponse {
  id: string;
  tag_name: string;
  normalized_name: string;
  description?: string | null;
  usage_count: number;
  is_trending: boolean;
  created_at: string;
}

export interface ContentTagListResponse {
  items: ContentTagResponse[];
  total: number;
}

export interface TrendingTagsResponse {
  trending_tags: ContentTagResponse[];
  period: string;
}

export type TrendingPeriod = "last_24_hours" | "last_7_days" | "last_30_days";

// ==================== Shared ====================

/**
 * UserSummary represents a lightweight user object used across content types.
 * It accepts both display_name (frontend convention) and firstname/lastname (backend UserResponse).
 * Use getDisplayName() helper to safely derive a display name from any shape.
 */
export interface UserSummary {
  id: string;
  username: string;
  display_name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  middlename?: string | null;
  profile_picture?: string | null;
}

/** Derive a display name from a UserSummary, handling both display_name and firstname/lastname */
export function getDisplayName(user?: UserSummary | null): string {
  if (!user) return "Anonymous";
  if (user.display_name) return user.display_name;
  const parts = [user.firstname, user.middlename, user.lastname].filter(
    Boolean,
  );
  if (parts.length > 0) return parts.join(" ");
  return user.username || "Anonymous";
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
}
