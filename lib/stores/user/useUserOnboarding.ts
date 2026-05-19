// stores/useUserOnboarding.ts
import { api } from "@/lib/client/api";
import { create } from "zustand";

// Types matching your schemas
export interface AccountBasics {
  username: string | null;
  firstname: string | null;
  lastname: string | null;
  phone_number: string | null;
  onboarding_step: number | null;
  data_processing_consent: boolean;
  terms_accepted_at: string;
}

export interface ProfessionalInfo {
  profession: string | null;
  job_title: string | null;
  years_of_experience: number | null;
  bio: string | null;
  job_seeking_status: string;
  preferred_work_type: string | null;
  open_to_work: boolean;
  availability: string | null;
}

export interface ContactLocation {
  website_url: string | null;
  github_username: string | null;
  location: string | null;
  preferred_contact_method: string;
  available_for_contact: boolean;
}

export interface PrivacyNotifications {
  show_email: boolean;
  show_phone: boolean;
  allow_indexing: boolean;
  show_last_active: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
  profile_visibility: string;
}

export interface Appearance {
  language: string | null;
  theme: string | null;
  layout_style: Record<string, any> | null;
}

export interface CompleteProfile {
  account_basics: AccountBasics;
  professional_info: ProfessionalInfo;
  contact_location: ContactLocation;
  privacy_notifications: PrivacyNotifications;
  appearance: Appearance;
}

// Default values
const defaultStep1: AccountBasics = {
  username: null,
  firstname: null,
  lastname: null,
  phone_number: null,
  onboarding_step: null,
  data_processing_consent: false,
  terms_accepted_at: "",
};

const defaultStep2: ProfessionalInfo = {
  profession: null,
  job_title: null,
  years_of_experience: null,
  bio: null,
  job_seeking_status: "not_looking",
  preferred_work_type: null,
  open_to_work: false,
  availability: null,
};

const defaultStep3: ContactLocation = {
  website_url: null,
  github_username: null,
  location: null,
  preferred_contact_method: "email",
  available_for_contact: false,
};

const defaultStep4: PrivacyNotifications = {
  show_email: false,
  show_phone: false,
  allow_indexing: false,
  show_last_active: false,
  email_notifications: false,
  push_notifications: false,
  marketing_emails: false,
  weekly_digest: false,
  profile_visibility: "public",
};

const defaultStep5: Appearance = {
  language: null,
  theme: null,
  layout_style: null,
};

interface UsernameCheckResult {
  username: string;
  available: boolean;
  can_use: boolean;
  requested_by: string | null;
}

interface UserOnboardingStore {
  // Step data
  step1: AccountBasics;
  step2: ProfessionalInfo;
  step3: ContactLocation;
  step4: PrivacyNotifications;
  step5: Appearance;
  completeProfile: CompleteProfile | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Error states
  error: string | null;

  // Username check
  usernameCheckResult: UsernameCheckResult | null;
  isCheckingUsername: boolean;

  // Actions - Fetch
  fetchStep1: () => Promise<void>;
  fetchStep2: () => Promise<void>;
  fetchStep3: () => Promise<void>;
  fetchStep4: () => Promise<void>;
  fetchStep5: () => Promise<void>;
  fetchCompleteProfile: () => Promise<void>;

  // Actions - Update
  updateStep1: (data: AccountBasics) => Promise<void>;
  updateStep2: (data: ProfessionalInfo) => Promise<void>;
  updateStep3: (data: ContactLocation) => Promise<void>;
  updateStep4: (data: PrivacyNotifications) => Promise<void>;
  updateStep5: (data: Appearance) => Promise<void>;

  // Actions - Username check
  checkUsername: (username: string) => Promise<void>;
  clearUsernameCheck: () => void;

  // Actions - Reset
  resetStep1: () => void;
  resetStep2: () => void;
  resetStep3: () => void;
  resetStep4: () => void;
  resetStep5: () => void;
  resetAll: () => void;
  clearError: () => void;
}

export const useUserOnboarding = create<UserOnboardingStore>((set, get) => ({
  // Initial state
  step1: defaultStep1,
  step2: defaultStep2,
  step3: defaultStep3,
  step4: defaultStep4,
  step5: defaultStep5,
  completeProfile: null,

  isLoading: false,
  isSaving: false,
  error: null,

  usernameCheckResult: null,
  isCheckingUsername: false,

  // Fetch Step 1
  fetchStep1: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<AccountBasics>(
        "/user-multistep-form/step1",
      );
      if (response.data) {
        set({ step1: response.data });
      }
    } catch (error: any) {
      set({ error: error?.response?.data?.detail || "Failed to fetch step 1" });
      console.error("Error fetching step 1:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch Step 2
  fetchStep2: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ProfessionalInfo>(
        "/user-multistep-form/step2",
      );
      if (response.data) {
        set({ step2: response.data });
      }
    } catch (error: any) {
      set({ error: error?.response?.data?.detail || "Failed to fetch step 2" });
      console.error("Error fetching step 2:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch Step 3
  fetchStep3: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ContactLocation>(
        "/user-multistep-form/step3",
      );
      if (response.data) {
        set({ step3: response.data });
      }
    } catch (error: any) {
      set({ error: error?.response?.data?.detail || "Failed to fetch step 3" });
      console.error("Error fetching step 3:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch Step 4
  fetchStep4: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PrivacyNotifications>(
        "/user-multistep-form/step4",
      );
      if (response.data) {
        set({ step4: response.data });
      }
    } catch (error: any) {
      set({ error: error?.response?.data?.detail || "Failed to fetch step 4" });
      console.error("Error fetching step 4:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch Step 5
  fetchStep5: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Appearance>("/user-multistep-form/step5");
      if (response.data) {
        set({ step5: response.data });
      }
    } catch (error: any) {
      set({ error: error?.response?.data?.detail || "Failed to fetch step 5" });
      console.error("Error fetching step 5:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch Complete Profile
  fetchCompleteProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<CompleteProfile>(
        "/user-multistep-form/profile",
      );
      if (response.data) {
        set({
          completeProfile: response.data,
          step1: response.data.account_basics || defaultStep1,
          step2: response.data.professional_info || defaultStep2,
          step3: response.data.contact_location || defaultStep3,
          step4: response.data.privacy_notifications || defaultStep4,
          step5: response.data.appearance || defaultStep5,
        });
      }
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.detail || "Failed to fetch complete profile",
      });
      console.error("Error fetching complete profile:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Update Step 1
  updateStep1: async (data: AccountBasics) => {
    set({ isSaving: true, error: null });
    try {
      const response = await api.put<AccountBasics>(
        "/user-multistep-form/step1",
        data,
      );
      if (response.data) {
        set({ step1: response.data });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.detail || "Failed to update step 1",
      });
      console.error("Error updating step 1:", error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  // Update Step 2
  updateStep2: async (data: ProfessionalInfo) => {
    set({ isSaving: true, error: null });
    try {
      const response = await api.put<ProfessionalInfo>(
        "/user-multistep-form/step2",
        data,
      );
      if (response.data) {
        set({ step2: response.data });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.detail || "Failed to update step 2",
      });
      console.error("Error updating step 2:", error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  // Update Step 3
  updateStep3: async (data: ContactLocation) => {
    set({ isSaving: true, error: null });
    try {
      const response = await api.put<ContactLocation>(
        "/user-multistep-form/step3",
        data,
      );
      if (response.data) {
        set({ step3: response.data });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.detail || "Failed to update step 3",
      });
      console.error("Error updating step 3:", error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  // Update Step 4
  updateStep4: async (data: PrivacyNotifications) => {
    set({ isSaving: true, error: null });
    try {
      const response = await api.put<PrivacyNotifications>(
        "/user-multistep-form/step4",
        data,
      );
      if (response.data) {
        set({ step4: response.data });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.detail || "Failed to update step 4",
      });
      console.error("Error updating step 4:", error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  // Update Step 5
  updateStep5: async (data: Appearance) => {
    set({ isSaving: true, error: null });
    try {
      const response = await api.put<Appearance>(
        "/user-multistep-form/step5",
        data,
      );
      if (response.data) {
        set({ step5: response.data });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.detail || "Failed to update step 5",
      });
      console.error("Error updating step 5:", error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  // Check username availability
  checkUsername: async (username: string) => {
    set({ isCheckingUsername: true, error: null });
    try {
      const response = await api.get<UsernameCheckResult>(
        `/user-multistep-form/check-username?username=${encodeURIComponent(username)}`,
      );
      if (response.data) {
        set({ usernameCheckResult: response.data });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.detail || "Failed to check username",
      });
      console.error("Error checking username:", error);
    } finally {
      set({ isCheckingUsername: false });
    }
  },

  // Clear username check result
  clearUsernameCheck: () => {
    set({ usernameCheckResult: null });
  },

  // Reset individual steps
  resetStep1: () => set({ step1: defaultStep1 }),
  resetStep2: () => set({ step2: defaultStep2 }),
  resetStep3: () => set({ step3: defaultStep3 }),
  resetStep4: () => set({ step4: defaultStep4 }),
  resetStep5: () => set({ step5: defaultStep5 }),

  // Reset all
  resetAll: () =>
    set({
      step1: defaultStep1,
      step2: defaultStep2,
      step3: defaultStep3,
      step4: defaultStep4,
      step5: defaultStep5,
      completeProfile: null,
      isLoading: false,
      isSaving: false,
      error: null,
      usernameCheckResult: null,
      isCheckingUsername: false,
    }),

  // Clear error
  clearError: () => set({ error: null }),
}));
