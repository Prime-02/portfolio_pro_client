import { User } from "./UserAndProfile";

export interface PortfolioItem {
  name: string;
  slug: string;
  description: string;
  is_public: boolean;
  is_default: boolean;
  cover_image_url: string;
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  projects: ProjectItem[]; // Replace 'any' with proper project interface if available
  project_count: number;
  owner: User;
  cover_image_thumbnail: string | null;
}

export type PortfoliosResponseData = PortfolioItem[];

export interface ProjectItem {
  project_name: string;
  project_description: string;
  project_category: string;
  id: string;
  project_url: string | null;
  project_image_url: string | null;
  is_public: boolean;
  is_completed: boolean;
  is_concept: boolean;
  users: User[];
}

export type ProjectsResponseData = ProjectItem[];

export type SupportedPlatforms =
  | "portfolio-pro"
  | "vercel"
  | "github"
  | "figma"
  | "canva";

export type ProjectStatusProps = "active" | "inactive" | "cancelled";

export interface ProjectCreateFormData {
  project_name: string;
  project_description: string;
  project_platform: SupportedPlatforms;
  project_category: string;
  contribution_description: string;
  contribution: string;
  project_url: string;
  is_concept: boolean;
  is_completed: boolean;
  is_public: boolean;
  stack: string[];
  // other_project_url: {};
  other_project_image_url: OtherProjectsImageUrlsProps;
  tags: string[];
  start_date: string;
  end_date: string;
  budget: number;
  client_name: string;
  status: ProjectStatusProps;
  featured_in: string[];
  project_media: File[] | string[] | null;
  [key: string]: unknown;
}

export interface ImageUrlsProps {
  url: string;
  public_id: string;
}

export interface OtherProjectsImageUrlsProps {
  hero_media?: ImageUrlsProps;
  media_1?: ImageUrlsProps;
  media_2?: ImageUrlsProps;
  media_3?: ImageUrlsProps;
}

export interface BasicUserProps {
  id: string;
  username: string;
  email: string;
  profile_picture: string;
}

export interface UserAssocProps {
  user_id: string;
  role: string;
  contribution: string;
  contribution_description: string;
  can_edit: boolean;
  created_at: string;
  user: BasicUserProps;
}

export interface AllProjectsDisplayCardProps {
  id: string;
  project_name: string;
  project_description: string;
  project_platform: string;
  project_category: string;
  project_url: string;
  project_image_url: string;
  is_public: boolean;
  is_completed: boolean;
  is_concept: boolean;
  stack: string[];
  other_project_image_url: OtherProjectsImageUrlsProps;
  other_project_url: Record<string, unknown>;
  tags: string[];
  start_date: string;
  end_date: string;
  budget: number | null;
  client_name: string | null;
  status: ProjectStatusProps;
  featured_in: string[];
  last_updated: string;
  created_at: string;
  user_associations: UserAssocProps[];
  [key: string]: unknown;
}
