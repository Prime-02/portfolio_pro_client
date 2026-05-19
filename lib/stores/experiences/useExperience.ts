// lib/stores/experiences.store.ts
import { create } from "zustand";
import { api } from "@/lib/client/api";

// Enums
export enum EmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  FREELANCE = "FREELANCE",
  INTERNSHIP = "INTERNSHIP",
  SELF_EMPLOYED = "SELF_EMPLOYED",
}

export enum LocationType {
  ON_SITE = "ON_SITE",
  REMOTE = "REMOTE",
  HYBRID = "HYBRID",
}

export enum CompanySize {
  STARTUP = "STARTUP",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  ENTERPRISE = "ENTERPRISE",
}

// Types
export interface Experience {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  employment_type?: EmploymentType;
  location?: string;
  location_type?: LocationType;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string[];
  responsibilities?: string[];
  skills_used?: string[];
  company_logo_url?: string;
  company_logo_url_id?: string;
  company_website?: string;
  company_size?: CompanySize;
  industry?: string;
  is_public: boolean;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExperienceCreate {
  company_name: string;
  job_title: string;
  employment_type?: EmploymentType;
  location?: string;
  location_type?: LocationType;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  achievements?: string[];
  responsibilities?: string[];
  skills_used?: string[];
  company_logo_url?: string;
  company_logo_url_id?: string;
  company_website?: string;
  company_size?: CompanySize;
  industry?: string;
  is_public?: boolean;
  display_order?: number;
  is_featured?: boolean;
}

export interface ExperienceUpdate extends Partial<ExperienceCreate> {
  supertype?: string;
}

export interface ExperiencesResponse {
  items: Experience[];
  total?: number;
  next?: string | null;
}

// Store State
interface ExperiencesState {
  // Public experiences
  publicExperiences: Experience[];
  publicExperiencesTotal: number;
  publicExperiencesLoading: boolean;
  publicExperiencesError: string | null;

  // User public experiences (by username)
  userPublicExperiences: Record<string, Experience[]>;
  userPublicExperiencesLoading: boolean;
  userPublicExperiencesError: string | null;

  // User public experiences (by user ID)
  userPublicExperiencesById: Record<string, Experience[]>;
  userPublicExperiencesByIdLoading: boolean;
  userPublicExperiencesByIdError: string | null;

  // Current user experiences
  myExperiences: Experience[];
  myExperiencesLoading: boolean;
  myExperiencesError: string | null;

  // Single experience
  currentExperience: Experience | null;
  currentExperienceLoading: boolean;
  currentExperienceError: string | null;

  // Create/Update/Delete states
  creating: boolean;
  createError: string | null;
  updating: boolean;
  updateError: string | null;
  deleting: boolean;
  deleteError: string | null;

  // Admin states
  adminExperiences: Experience[];
  adminExperiencesTotal: number;
  adminExperiencesLoading: boolean;
  adminExperiencesError: string | null;
  adminUserExperiences: Experience[];
  adminUserExperiencesLoading: boolean;
  adminUserExperiencesError: string | null;
  adminCurrentExperience: Experience | null;
  adminCurrentExperienceLoading: boolean;
  adminCurrentExperienceError: string | null;
  adminUpdating: boolean;
  adminUpdateError: string | null;
  adminDeleting: boolean;
  adminDeleteError: string | null;
  adminDeletingUserExperiences: boolean;
  adminDeleteUserExperiencesError: string | null;

  // Public actions
  fetchPublicExperiences: (params?: {
    skip?: number;
    limit?: number;
    employment_type?: EmploymentType;
    company_size?: CompanySize;
    industry?: string;
  }) => Promise<void>;
  fetchUserExperiencesByUsername: (username: string) => Promise<void>;
  fetchUserExperiencesById: (userId: string) => Promise<void>;

  // Authenticated user actions
  fetchMyExperiences: () => Promise<void>;
  fetchExperience: (experienceId: string) => Promise<void>;
  createExperience: (
    experienceData: ExperienceCreate,
    companyLogo?: File,
  ) => Promise<void>;
  updateExperience: (
    experienceId: string,
    experienceData: ExperienceUpdate,
    companyLogo?: File,
  ) => Promise<void>;
  deleteExperience: (experienceId: string) => Promise<void>;

  // Admin actions
  fetchAdminExperiences: (params?: {
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  fetchAdminUserExperiences: (userId: string) => Promise<void>;
  fetchAdminExperience: (experienceId: string) => Promise<void>;
  updateAdminExperience: (
    experienceId: string,
    experienceData: ExperienceUpdate,
    companyLogo?: File,
  ) => Promise<void>;
  deleteAdminExperience: (experienceId: string) => Promise<void>;
  deleteAdminUserExperiences: (userId: string) => Promise<void>;

  // Utility
  reset: () => void;
}

const initialState = {
  publicExperiences: [],
  publicExperiencesTotal: 0,
  publicExperiencesLoading: false,
  publicExperiencesError: null,
  userPublicExperiences: {},
  userPublicExperiencesLoading: false,
  userPublicExperiencesError: null,
  userPublicExperiencesById: {},
  userPublicExperiencesByIdLoading: false,
  userPublicExperiencesByIdError: null,
  myExperiences: [],
  myExperiencesLoading: false,
  myExperiencesError: null,
  currentExperience: null,
  currentExperienceLoading: false,
  currentExperienceError: null,
  creating: false,
  createError: null,
  updating: false,
  updateError: null,
  deleting: false,
  deleteError: null,
  adminExperiences: [],
  adminExperiencesTotal: 0,
  adminExperiencesLoading: false,
  adminExperiencesError: null,
  adminUserExperiences: [],
  adminUserExperiencesLoading: false,
  adminUserExperiencesError: null,
  adminCurrentExperience: null,
  adminCurrentExperienceLoading: false,
  adminCurrentExperienceError: null,
  adminUpdating: false,
  adminUpdateError: null,
  adminDeleting: false,
  adminDeleteError: null,
  adminDeletingUserExperiences: false,
  adminDeleteUserExperiencesError: null,
};

export const useExperiencesStore = create<ExperiencesState>((set) => ({
  ...initialState,

  // ==================== PUBLIC ACTIONS ====================

  fetchPublicExperiences: async (params = {}) => {
    set({ publicExperiencesLoading: true, publicExperiencesError: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());
      if (params.employment_type)
        queryParams.append("employment_type", params.employment_type);
      if (params.company_size)
        queryParams.append("company_size", params.company_size);
      if (params.industry) queryParams.append("industry", params.industry);

      const response = await api.get<ExperiencesResponse>(
        `/experiences/public/?${queryParams.toString()}`,
      );
      set({
        publicExperiences: response.data.items,
        publicExperiencesTotal: response.data.total || 0,
        publicExperiencesLoading: false,
      });
    } catch (error: any) {
      set({
        publicExperiencesError:
          error.response?.data?.detail || "Failed to fetch public experiences",
        publicExperiencesLoading: false,
      });
    }
  },

  fetchUserExperiencesByUsername: async (username: string) => {
    set({
      userPublicExperiencesLoading: true,
      userPublicExperiencesError: null,
    });
    try {
      const response = await api.get<Experience[]>(
        `/experiences/public/user/${username}`,
      );
      set((state) => ({
        userPublicExperiences: {
          ...state.userPublicExperiences,
          [username]: response.data,
        },
        userPublicExperiencesLoading: false,
      }));
    } catch (error: any) {
      set({
        userPublicExperiencesError:
          error.response?.data?.detail || "Failed to fetch user experiences",
        userPublicExperiencesLoading: false,
      });
    }
  },

  fetchUserExperiencesById: async (userId: string) => {
    set({
      userPublicExperiencesByIdLoading: true,
      userPublicExperiencesByIdError: null,
    });
    try {
      const response = await api.get<Experience[]>(
        `/experiences/public/user/id/${userId}`,
      );
      set((state) => ({
        userPublicExperiencesById: {
          ...state.userPublicExperiencesById,
          [userId]: response.data,
        },
        userPublicExperiencesByIdLoading: false,
      }));
    } catch (error: any) {
      set({
        userPublicExperiencesByIdError:
          error.response?.data?.detail ||
          "Failed to fetch user experiences by ID",
        userPublicExperiencesByIdLoading: false,
      });
    }
  },

  // ==================== AUTHENTICATED USER ACTIONS ====================

  fetchMyExperiences: async () => {
    set({ myExperiencesLoading: true, myExperiencesError: null });
    try {
      const response = await api.get<Experience[]>("/experiences/");
      set({
        myExperiences: response.data,
        myExperiencesLoading: false,
      });
    } catch (error: any) {
      set({
        myExperiencesError:
          error.response?.data?.detail || "Failed to fetch experiences",
        myExperiencesLoading: false,
      });
    }
  },

  fetchExperience: async (experienceId: string) => {
    set({ currentExperienceLoading: true, currentExperienceError: null });
    try {
      const response = await api.get<Experience>(
        `/experiences/${experienceId}`,
      );
      set({
        currentExperience: response.data,
        currentExperienceLoading: false,
      });
    } catch (error: any) {
      set({
        currentExperienceError:
          error.response?.data?.detail || "Failed to fetch experience",
        currentExperienceLoading: false,
      });
    }
  },

  createExperience: async (
    experienceData: ExperienceCreate,
    companyLogo?: File,
  ) => {
    set({ creating: true, createError: null });
    try {
      const formData = new FormData();
      formData.append("experience_data", JSON.stringify(experienceData));
      if (companyLogo) {
        formData.append("company_logo", companyLogo);
      }

      const response = await api.post<Experience>(
        "/experiences/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      set((state) => ({
        myExperiences: [...state.myExperiences, response.data],
        creating: false,
      }));
    } catch (error: any) {
      set({
        createError:
          error.response?.data?.detail || "Failed to create experience",
        creating: false,
      });
    }
  },

  updateExperience: async (
    experienceId: string,
    experienceData: ExperienceUpdate,
    companyLogo?: File,
  ) => {
    set({ updating: true, updateError: null });
    try {
      const formData = new FormData();
      formData.append("experience_data", JSON.stringify(experienceData));
      if (companyLogo) {
        formData.append("company_logo", companyLogo);
      }

      const response = await api.put<Experience>(
        `/experiences/${experienceId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      set((state) => ({
        myExperiences: state.myExperiences.map((exp) =>
          exp.id === experienceId ? response.data : exp,
        ),
        currentExperience:
          state.currentExperience?.id === experienceId
            ? response.data
            : state.currentExperience,
        updating: false,
      }));
    } catch (error: any) {
      set({
        updateError:
          error.response?.data?.detail || "Failed to update experience",
        updating: false,
      });
    }
  },

  deleteExperience: async (experienceId: string) => {
    set({ deleting: true, deleteError: null });
    try {
      await api.delete(`/experiences/${experienceId}`);
      set((state) => ({
        myExperiences: state.myExperiences.filter(
          (exp) => exp.id !== experienceId,
        ),
        currentExperience:
          state.currentExperience?.id === experienceId
            ? null
            : state.currentExperience,
        deleting: false,
      }));
    } catch (error: any) {
      set({
        deleteError:
          error.response?.data?.detail || "Failed to delete experience",
        deleting: false,
      });
    }
  },

  // ==================== ADMIN ACTIONS ====================

  fetchAdminExperiences: async (params = {}) => {
    set({ adminExperiencesLoading: true, adminExperiencesError: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());

      const response = await api.get<ExperiencesResponse>(
        `/admin/experiences/?${queryParams.toString()}`,
      );
      set({
        adminExperiences: response.data.items,
        adminExperiencesTotal: response.data.total || 0,
        adminExperiencesLoading: false,
      });
    } catch (error: any) {
      set({
        adminExperiencesError:
          error.response?.data?.detail || "Failed to fetch admin experiences",
        adminExperiencesLoading: false,
      });
    }
  },

  fetchAdminUserExperiences: async (userId: string) => {
    set({ adminUserExperiencesLoading: true, adminUserExperiencesError: null });
    try {
      const response = await api.get<Experience[]>(
        `/admin/experiences/user/${userId}`,
      );
      set({
        adminUserExperiences: response.data,
        adminUserExperiencesLoading: false,
      });
    } catch (error: any) {
      set({
        adminUserExperiencesError:
          error.response?.data?.detail || "Failed to fetch user experiences",
        adminUserExperiencesLoading: false,
      });
    }
  },

  fetchAdminExperience: async (experienceId: string) => {
    set({
      adminCurrentExperienceLoading: true,
      adminCurrentExperienceError: null,
    });
    try {
      const response = await api.get<Experience>(
        `/admin/experiences/${experienceId}`,
      );
      set({
        adminCurrentExperience: response.data,
        adminCurrentExperienceLoading: false,
      });
    } catch (error: any) {
      set({
        adminCurrentExperienceError:
          error.response?.data?.detail || "Failed to fetch experience",
        adminCurrentExperienceLoading: false,
      });
    }
  },

  updateAdminExperience: async (
    experienceId: string,
    experienceData: ExperienceUpdate,
    companyLogo?: File,
  ) => {
    set({ adminUpdating: true, adminUpdateError: null });
    try {
      const formData = new FormData();
      formData.append("experience_data", JSON.stringify(experienceData));
      if (companyLogo) {
        formData.append("company_logo", companyLogo);
      }

      const response = await api.put<Experience>(
        `/admin/experiences/${experienceId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      set((state) => ({
        adminExperiences: state.adminExperiences.map((exp) =>
          exp.id === experienceId ? response.data : exp,
        ),
        adminUserExperiences: state.adminUserExperiences.map((exp) =>
          exp.id === experienceId ? response.data : exp,
        ),
        adminCurrentExperience:
          state.adminCurrentExperience?.id === experienceId
            ? response.data
            : state.adminCurrentExperience,
        adminUpdating: false,
      }));
    } catch (error: any) {
      set({
        adminUpdateError:
          error.response?.data?.detail || "Failed to update experience",
        adminUpdating: false,
      });
    }
  },

  deleteAdminExperience: async (experienceId: string) => {
    set({ adminDeleting: true, adminDeleteError: null });
    try {
      await api.delete(`/admin/experiences/${experienceId}`);
      set((state) => ({
        adminExperiences: state.adminExperiences.filter(
          (exp) => exp.id !== experienceId,
        ),
        adminUserExperiences: state.adminUserExperiences.filter(
          (exp) => exp.id !== experienceId,
        ),
        adminCurrentExperience:
          state.adminCurrentExperience?.id === experienceId
            ? null
            : state.adminCurrentExperience,
        adminDeleting: false,
      }));
    } catch (error: any) {
      set({
        adminDeleteError:
          error.response?.data?.detail || "Failed to delete experience",
        adminDeleting: false,
      });
    }
  },

  deleteAdminUserExperiences: async (userId: string) => {
    set({
      adminDeletingUserExperiences: true,
      adminDeleteUserExperiencesError: null,
    });
    try {
      await api.delete(`/admin/experiences/user/${userId}`);
      set((state) => ({
        adminExperiences: state.adminExperiences.filter(
          (exp) => exp.user_id !== userId,
        ),
        adminUserExperiences: [],
        adminDeletingUserExperiences: false,
      }));
    } catch (error: any) {
      set({
        adminDeleteUserExperiencesError:
          error.response?.data?.detail || "Failed to delete user experiences",
        adminDeletingUserExperiences: false,
      });
    }
  },

  // ==================== UTILITY ====================

  reset: () => {
    set(initialState);
  },
}));
