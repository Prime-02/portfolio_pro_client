// src/app/components/profile/edit-components/form/types.ts

export type FieldStatus =
  | "unchanged"
  | "modified"
  | "saving"
  | "saved"
  | "error";

export interface PersonalForm {
  firstname: string;
  middlename: string;
  lastname: string;
  username: string;
  email: string;
  phone_number: string;
}

export interface ProfileForm {
  profession: string;
  job_title: string;
  years_of_experience: string | number;
  location: string;
  bio: string;
  website_url: string;
  github_username: string;
  availability: string;
  open_to_work: boolean;
}
