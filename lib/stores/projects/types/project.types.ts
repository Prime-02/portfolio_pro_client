// ============================================================
// BASE / SHARED TYPES
// ============================================================

export type SortField = "name" | "date";
export type SortDirection = "asc" | "desc";
export type ProjectStatus = "active" | "archived" | "draft";
export type ProjectRole = "creator" | "owner" | "collaborator";

export interface MediaSlotData {
  url: string;
  public_id: string;
}

export type MediaSlots = {
  hero_media?: MediaSlotData;
  media_1?: MediaSlotData;
  media_2?: MediaSlotData;
  media_3?: MediaSlotData;
};

// ============================================================
// USER (minimal shape returned inside project responses)
// ============================================================

export interface ProjectUser {
  id: string;
  username: string;
  email: string;
  profile_picture?: string | null;
}

// ============================================================
// USER PROJECT ASSOCIATION
// ============================================================

export interface UserAssociationResponse {
  user_id: string;
  role: ProjectRole;
  contribution?: string | null;
  contribution_description?: string | null;
  can_edit: boolean;
  created_at: string;
  user: ProjectUser & {
    role: ProjectRole;
    contribution?: string | null;
    contribution_description?: string | null;
  };
}

// ============================================================
// PROJECT LIKE
// ============================================================

export interface ProjectLike {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
  user: ProjectUser;
}

export interface ProjectLikeCreate {
  project_id: string;
  user_id: string;
}

// ============================================================
// PROJECT COMMENT
// ============================================================

export interface ProjectComment {
  comment_id: string;
  project_id: string;
  user_id: string;
  content: string;
  username?: string | null;
  profile_picture?: string | null;
  parent_comment_id?: string | null;
  created_at: string;
  user: ProjectUser;
  replies?: ProjectComment[];
  replies_count?: number;
}

/**
 * Recursive tree returned by GET /projects/comments/{comment_id}/thread.
 * The backend returns Dict[str, Any] with nested replies at arbitrary depth,
 * so this is intentionally separate from the flat ProjectComment shape.
 */
export interface CommentThread {
  comment_id: string;
  project_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string | null;
  created_at: string;
  user: ProjectUser;
  replies: CommentThread[];
  replies_count: number;
}

export interface ProjectCommentCreate {
  content: string;
  parent_comment_id?: string | null;
}

export interface ProjectCommentUpdate {
  content: string;
}

// ============================================================
// PROJECT AUDIT
// ============================================================

export interface ProjectAudit {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface ProjectAuditCreate {
  project_id: string;
  user_id: string;
  action: string;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

// ============================================================
// COLLABORATOR
// ============================================================

export interface CollaboratorResponse {
  user_id: string;
  username?: string | null;
  profile_picture?: string | null;
  role: string;
  can_edit: boolean;
  created_at?: string | null;
  contribution_description?: string | null;
  contribution?: string | null;
}

export interface CollaboratorCreate {
  username: string;
  role: string;
  can_edit?: boolean;
  contribution_description?: string | null;
  contribution?: string | null;
}

export interface CollaboratorUpdate {
  role?: string | null;
  can_edit?: boolean | null;
  contribution_description?: string | null;
  contribution?: string | null;
}

export interface CollaboratorResponseUpdate {
  user_id?: string | null;
  username?: string | null;
  role?: string | null;
  can_edit?: boolean | null;
  created_at?: string | null;
  contribution_description?: string | null;
  contribution?: string | null;
  message?: string | null;
}

// ============================================================
// PORTFOLIO PROJECT
// ============================================================

export interface PortfolioProjectBase {
  id: string;
  platform_project_id?: string | null;
  project_name: string;
  project_summary?: string | null;
  project_description?: string | null;
  project_platform: string;
  project_category?: string | null;
  project_url?: string | null;
  project_image_url?: string | null;
  is_public: boolean;
  is_completed?: boolean;
  is_concept?: boolean;
  imported_projects_metadata?: Record<string, unknown>;
  stack?: string[];
  other_project_image_url?: MediaSlots;
  other_project_url?: Record<string, string>;
  tags?: string[];
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  client_name?: string | null;
  status?: ProjectStatus;
  featured_in?: string[];
  last_updated?: string | null;
  created_at: string;
}

export interface PublicProjectsByUsernameFilters {
  page?: number;
  size?: number;
  is_completed?: boolean;
  is_concept?: boolean;
  project_category?: string;
  project_platform?: string;
  project_status?: string;
  ids?: string[];
  merge_filters?: boolean;
}

export interface PortfolioProjectResponse extends PortfolioProjectBase {
  other_project_image_url?: MediaSlots;
  user_associations: UserAssociationResponse[];
  likes: ProjectLike[];
  comments: ProjectComment[];
  audit_logs: ProjectAudit[];
  likes_count: number;
  comments_count: number;
}

export interface PortfolioProjectCreate {
  project_name: string;
  project_summary?: string | null;
  project_description?: string | null;
  project_platform?: string;
  project_category?: string | null;
  contribution_description?: string | null;
  contribution?: string | null;
  project_url?: string | null;
  is_concept?: boolean;
  is_completed?: boolean;
  is_public?: boolean;
  project_media?: File[];
  stack?: string[];
  other_project_url?: Record<string, MediaSlotData>;
  tags?: string[];
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  client_name?: string | null;
  status?: string | null;
  featured_in?: string[];
}

export interface PortfolioProjectUpdate {
  project_name?: string | null;
  project_summary?: string | null;
  project_description?: string | null;
  project_category?: string | null;
  project_url?: string | null;
  project_image_url?: string | null;
  is_public?: boolean | null;
  is_completed?: boolean | null;
  is_concept?: boolean | null;
  stack?: string[];
  other_project_url?: Record<string, string>;
  tags?: string[];
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  client_name?: string | null;
  status?: string;
  featured_in?: string[];
  last_updated?: string | null;
  // Media is handled as FormData separately
  hero_media?: File | null;
  media_1?: File | null;
  media_2?: File | null;
  media_3?: File | null;
}

// ============================================================
// PAGINATED RESPONSE WRAPPERS
// ============================================================

export interface PaginatedProjects {
  projects: PortfolioProjectResponse[];
  total: number;
}

export interface PaginatedProjectBase {
  projects: PortfolioProjectBase[];
  total: number;
}

export interface PaginatedLikes {
  likes: Array<{
    like_id: string;
    user_id: string;
    username: string;
    profile_picture?: string | null;
    liked_at: string;
  }>;
  total: number;
  user_liked?: boolean;
}

export interface PaginatedUserLikes {
  likes: Array<{
    like_id: string;
    project_id: string;
    project_name: string;
    project_image_url?: string | null;
    liked_at: string;
  }>;
  total: number;
}

export interface PaginatedComments {
  comments: ProjectComment[];
  total: number;
}

export interface PaginatedUserComments {
  comments: Array<{
    comment_id: string;
    project_id: string;
    project_name: string;
    content: string;
    parent_comment_id?: string | null;
    created_at: string;
  }>;
  total: number;
}

export interface PaginatedCollaborators {
  collaborators: CollaboratorResponse[];
  total: number;
}

// ============================================================
// ENGAGEMENT STATS
// ============================================================

export interface ProjectEngagementStats {
  project_id: string;
  likes_count: number;
  comments_count: number;
  top_level_comments_count: number;
  total_engagement: number;
}

export interface FullProjectEngagement {
  statistics: ProjectEngagementStats;
  recent_likes: PaginatedLikes["likes"];
  recent_comments: ProjectComment[];
  user_has_liked: boolean;
  user_has_liked_count: number;
  total_comments: number;
}

export interface UserEngagementStats {
  user_id: string;
  likes_given: number;
  likes_received: number;
  comments_made: number;
  projects_created: number;
  total_interactions: number;
}

// ============================================================
// AUDIT STATS
// ============================================================

export interface AuditActionSummary {
  project_id: string;
  action_summary: Record<string, number>;
  total_actions: number;
}

export interface AuditCount {
  project_id: string;
  total_audit_logs: number;
  action_filter?: string | null;
}

export interface UserAuditStats {
  user_id: string;
  total_audit_logs: number;
  unique_projects_with_activity: number;
  action_breakdown: Record<string, number>;
  most_active_project?: { project_id: string; audit_count: number } | null;
  most_common_action?: { action: string; count: number } | null;
}

// ============================================================
// PROJECT STATS
// ============================================================

export interface ProjectStats {
  total_projects: number;
  public_projects: number;
  completed_projects: number;
  concept_projects: number;
  [key: string]: unknown;
}

// ============================================================
// STORE LOADING / ERROR STATE HELPERS
// ============================================================

export type LoadingKey =
  // project
  | "fetchProjects"
  | "fetchProjectById"
  | "fetchProjectsByUser"
  | "fetchRecentProjects"
  | "fetchProjectsByStatus"
  | "fetchProjectStats"
  | "createProject"
  | "updateProject"
  | "deleteProjects"
  // collaborator
  | "fetchCollaborators"
  | "addCollaborator"
  | "updateCollaborator"
  | "removeCollaborator"
  // engagement
  | "fetchLikes"
  | "fetchUserLikes"
  | "toggleLike"
  | "checkLiked"
  | "fetchComments"
  | "fetchCommentReplies"
  | "fetchCommentThread"
  | "fetchUserComments"
  | "addComment"
  | "updateComment"
  | "deleteComment"
  | "fetchEngagementStats"
  | "fetchFullEngagement"
  | "fetchUserEngagement"
  // audit
  | "fetchAuditLog"
  | "fetchProjectAuditLogs"
  | "fetchUserAuditLogs"
  | "fetchRecentActivity"
  | "fetchAuditCount"
  | "fetchAuditSummary"
  | "fetchUserAuditStats"
  | "createAuditLog"
  | "bulkCreateAuditLogs"
  | "deleteAuditLog";

export type LoadingState = Partial<Record<LoadingKey, boolean>>;
export type ErrorState = Partial<Record<LoadingKey, string | null>>;
