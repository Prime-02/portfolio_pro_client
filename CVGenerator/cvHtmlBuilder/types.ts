// components/CVGenerator/cvHtmlBuilder/types.ts
import type { SectionVisibilityConfig } from "./utils";

export interface BuildCVHtmlParams {
  profile: CVProfile;
  projects: CVProject[];
  testimonials: CVTestimonial[];
  certifications: CVCertification[];
  config: string;
  tone: string;
  sections: string[];
  portfolioLayout?: PortfolioLayoutData | null;
  // Per-section field visibility overrides from the Custom-mode UI. Only
  // applied when config === "custom"; merged on top of (and taking
  // priority over) any visibility flags derived from portfolioLayout.
  // Keyed by CV section id, then by SectionVisibilityConfig flag name.
  customVisibility?: Record<string, Record<string, boolean>>;
}

export interface PortfolioLayoutData {
  sections?: PortfolioSectionData[];
}

export interface PortfolioSectionData {
  type: string;
  data: Record<string, unknown>;
}

export interface ThemeColors {
  accent: string;
  accent2: string;
  headingFont: string;
  bodyFont: string;
}

export interface CVMode {
  id: string;
  label: string;
  projectStrategy: string;
  maxExperience: number | null;
  maxEducation: number | null;
  maxSkillsPerCategory: number | null;
  maxTestimonials: number;
  showBio: string;
}

// ── Normalized CV Data Types ────────────────────────────────────────────────

export interface CVProfile {
  name: string;
  headline?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  timezone?: string | null;
  bio?: string | null;
  availableForWork?: boolean;
  availabilityNote?: string | null;
  yearsExperience?: number | null;
  // Store data arrays
  experiences: CVExperience[];
  educations: CVEducation[];
  skills: CVSkill[];
  certifications: CVCertification[];
  socialLinks: CVSocialLink[];
}

export interface CVExperience {
  id: string | number;
  role: string;
  company: string;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
  description?: string | null;
  employment_type?: string;
  location_type?: string;
  industry?: string;
  is_featured?: boolean;
  featured?: boolean;
}

export interface CVEducation {
  id: string | number;
  degree: string;
  field?: string | null;
  institution: string;
  startYear?: string | number | null;
  endYear?: string | number | null;
  current?: boolean;
  description?: string | null;
}

export interface CVSkill {
  id: string | number;
  name: string;
  proficiency: string;
  category: string;
  is_major?: boolean;
}

export interface CVCertification {
  id?: string | number;
  certification_name: string;
  issuing_organization?: string | null;
  issue_date?: string | null;
  expiration_date?: string | null;
  certificate_external_url?: string | null;
}

export interface CVProject {
  id: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
  tags: string[];
  featured?: boolean;
  is_featured?: boolean;
  category?: string;
  project_category?: string;
  project_platform?: string;
  status?: string;
  is_completed?: boolean;
  is_concept?: boolean;
}

export interface CVTestimonial {
  id: string | number;
  name: string;
  role?: string | null;
  company?: string | null;
  content: string;
  rating?: number;
}

export interface CVSocialLink {
  platform: string;
  url: string;
}

export interface SectionBuilderContext {
  profile: CVProfile;
  sections: string[];
  visibility?: SectionVisibilityConfig;
}
