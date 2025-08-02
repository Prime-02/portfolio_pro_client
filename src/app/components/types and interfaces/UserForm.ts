// Enums for Step 2: Professional Information
enum JobSeekingStatus {
  NotSeeking = "not_seeking",
  OpenToOpportunities = "open_to_opportunities",
  ActivelySeeking = "actively_seeking"
}

enum PreferredWorkType {
  FullTime = "full_time",
  PartTime = "part_time",
  Contract = "contract",
  Freelance = "freelance"
}

// Enums for Step 3: Contact and Location
enum PreferredContactMethod {
  Email = "email",
  Phone = "phone",
  Website = "website"
}

// Enums for Step 4: Privacy and Notifications
enum ProfileVisibility {
  Public = "public",
  Private = "private",
  NetworkOnly = "network_only"
}

// Enums for Step 5: Appearance and Finalization
enum Language {
  En = "en",
  Es = "es",
  Fr = "fr"
}

enum Theme {
  Light = "light",
  Dark = "dark",
  Custom = "custom"
}

enum LayoutStyle {
  Modern = "modern",
  Creative = "creative",
  Minimalist = "minimalist"
}

// Step 1: Account Basics
export interface AccountBasics {
  username: string;
  firstname: string;
  lastname: string;
  phone_number: string | null;
  data_processing_consent: boolean;
  terms_accepted_at: string; // ISO 8601 timestamp
}

// Step 2: Professional Information
export interface ProfessionalInfo {
  profession: string | null;
  job_title: string | null;
  years_of_experience: number | null;
  bio: string | null;
  job_seeking_status: JobSeekingStatus;
  preferred_work_type: PreferredWorkType | null;
  open_to_work: boolean | null;
  availability: string | null;
}

// Step 3: Contact and Location
export interface ContactLocation {
  website_url: string | null;
  github_username: string | null;
  location: string | null;
  preferred_contact_method: PreferredContactMethod;
  available_for_contact: boolean;
}

// Step 4: Privacy and Notifications
export interface PrivacyNotifications {
  show_email: boolean;
  show_phone: boolean;
  allow_indexing: boolean;
  show_last_active: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
  profile_visibility: ProfileVisibility;
}

// Step 5: Appearance and Finalization
export interface Appearance {
  language: Language;
  theme: Theme;
  layout_style: LayoutStyle;
}