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
