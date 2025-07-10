import { ThemeVariant } from "./loaderTypes";

export interface Profile {
  user_id: string;
  github_username: string | null;
  bio: string;
  profession: string;
  job_title: string;
  years_of_experience: number;
  website_url: string;
  location: string;
  open_to_work: boolean;
  availability: string;
  profile_picture: string | null;
}

export interface User {
  email: string;
  username: string;
  id: string;
  is_superuser: boolean | null;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string | null;
  profile: Profile;
}

export type UserPreferences = {
  language: string | null;
  theme: ThemeVariant;
  primary_theme: string | null;
  secondary_theme: string | null;
  accent: string | null;
  primary_theme_dark: string | null;
  secondary_theme_dark: string | null;
  layout_style: string; // Could be more specific if there are known options
  loader: string | null;
  owner_id: string;
};

export type AuthTokenResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user_id: string;
  clerk_id: string;
};
