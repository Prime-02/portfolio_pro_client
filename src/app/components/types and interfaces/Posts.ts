import { User } from "./UserAndProfile";

// ==================== Enums ====================
export enum ContentType {
  POST = "POST",
  REEL = "REEL",
  BLOG = "BLOG",
  VLOG = "VLOG",
  ARTICLE = "ARTICLE",
  POLL = "POLL",
  STORY = "STORY",
}

export enum ContentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  SCHEDULED = "SCHEDULED",
  DELETED = "DELETED",
}

export enum ReactionType {
  LIKE = "LIKE",
  LOVE = "LOVE",
  CELEBRATE = "CELEBRATE",
  INSIGHTFUL = "INSIGHTFUL",
}

// ==================== Interfaces ====================
export interface MediaUrl {
  url: string;
  type: string;
  public_id: string;
  content_type: string;
}

export interface ContentBase {
  content_type: ContentType;
  title: string;
  body?: Record<string, string>[];
  excerpt?: string;
  media_urls?: MediaUrl[];
  cover_image_url?: string;
  cover_image_id?: string;
  tags?: string[];
  category?: string;
  is_public?: boolean;
  is_featured?: boolean;
  is_pinned?: boolean;
  allow_comments?: boolean;
  allow_likes?: boolean;
  allow_reshare?: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  type_metadata?: Record<string, string>;
}

export interface ContentCreate extends ContentBase {
  status?: ContentStatus;
  scheduled_publish_at?: string;
  slug?: string;
}

export interface ContentUpdate {
  title?: string;
  body?: Record<string, string>[];
  excerpt?: string;
  media_urls?: MediaUrl[];
  cover_image_url?: string;
  cover_image_id?: string;
  tags?: string[];
  category?: string;
  status?: ContentStatus;
  is_public?: boolean;
  is_featured?: boolean;
  is_pinned?: boolean;
  allow_comments?: boolean;
  allow_likes?: boolean;
  allow_reshare?: boolean;
  scheduled_publish_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  type_metadata?: Record<string, string>;
}

export interface Content extends ContentBase {
  id: string;
  user_id: string;
  slug?: string;
  status: ContentStatus;
  scheduled_publish_at?: string;
  published_at?: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ContentWithAuthor extends Content {
  author?: User;
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

export interface ContentFilterParams {
  content_type?: ContentType;
  status?: ContentStatus;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  is_featured?: boolean;
  username?: string;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  date_from?: string;
  date_to?: string;
}

export interface BulkContentUpdate {
  content_ids: string[];
  status?: ContentStatus;
  is_public?: boolean;
  is_featured?: boolean;
  category?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface BulkOperationResponse {
  success: boolean;
  updated_count: number;
  failed_count: number;
  errors?: Array<{ content_id: string; error: string }>;
}

export interface DeleteContentResponse {
  success: boolean;
  message: string;
  content_id: string;
  hard_delete: boolean;
}
