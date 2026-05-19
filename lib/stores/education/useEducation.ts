// stores/useEducation.ts
import { create } from "zustand";
import { api } from "@/lib/client/api";

// ---------------------------------------------------------------------------
// Types — matching the backend schemas
// ---------------------------------------------------------------------------

export interface Education {
  id?: string;
  user_id?: string;
  institution: string;
  degree: string;
  institution_logo_url?: string | null;
  institution_logo_url_id?: string | null;
  field_of_study?: string | null;
  start_year?: string | null;
  end_year?: string | null;
  is_current: boolean;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EducationListResponse {
  educations: Education[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface CreateEducationPayload {
  institution: string;
  degree: string;
  field_of_study?: string | null;
  start_year?: string | null;
  end_year?: string | null;
  is_current?: boolean;
  description?: string | null;
  institution_logo?: File | null;
}

export interface UpdateEducationPayload {
  institution?: string | null;
  degree?: string | null;
  field_of_study?: string | null;
  start_year?: string | null;
  end_year?: string | null;
  is_current?: boolean | null;
  description?: string | null;
  institution_logo?: File | null;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface AdminDeleteUserEducationResponse {
  success: boolean;
  message: string;
  deleted_count: number;
}

export interface EducationFilters {
  skip?: number;
  limit?: number;
  institution?: string;
  degree?: string;
  field_of_study?: string;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface EducationState {
  // ==================== USER STATE ====================
  educations: Education[];
  selectedEducation: Education | null;
  userEducationsByUserId: Education[];
  viewingUserId: string | null;
  totalUserEducations: number;

  // User loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingUserById: boolean;

  // ==================== PUBLIC STATE ====================
  publicEducations: Education[];
  publicEducationsTotal: number;
  publicUsername: string | null;
  publicFilters: EducationFilters;

  // Public loading states
  isLoadingPublic: boolean;
  isLoadingPublicByUsername: boolean;

  // ==================== ADMIN STATE ====================
  adminEducations: Education[];
  adminSelectedEducation: Education | null;
  adminUserEducations: Education[];
  adminCurrentUserId: string | null;
  adminTotalEducations: number;

  // Admin loading states
  adminIsLoading: boolean;
  adminIsUpdating: boolean;
  adminIsDeleting: boolean;
  adminIsLoadingUserEducations: boolean;

  // Errors
  error: string | null;
  adminError: string | null;

  // ==================== USER ACTIONS ====================

  fetchAllEducations: (
    filters?: EducationFilters,
  ) => Promise<EducationListResponse>;
  fetchEducationById: (educationId: string) => Promise<Education>;
  fetchEducationsByUserId: (
    userId: string,
    filters?: EducationFilters,
  ) => Promise<EducationListResponse>;
  createEducation: (payload: CreateEducationPayload) => Promise<Education>;
  updateEducation: (
    educationId: string,
    payload: UpdateEducationPayload,
  ) => Promise<Education>;
  deleteEducation: (educationId: string) => Promise<DeleteResponse>;

  // ==================== PUBLIC ACTIONS ====================

  fetchPublicEducations: (
    filters?: EducationFilters,
  ) => Promise<EducationListResponse>;
  fetchPublicEducationById: (educationId: string) => Promise<Education>;
  fetchPublicUserEducations: (
    username: string,
    filters?: EducationFilters,
  ) => Promise<EducationListResponse>;

  // ==================== ADMIN ACTIONS ====================

  adminFetchAllEducations: (
    filters?: EducationFilters,
  ) => Promise<EducationListResponse>;
  adminFetchEducationById: (educationId: string) => Promise<Education>;
  adminFetchUserEducations: (
    userId: string,
    filters?: EducationFilters,
  ) => Promise<EducationListResponse>;
  adminUpdateEducation: (
    educationId: string,
    payload: UpdateEducationPayload,
  ) => Promise<Education>;
  adminDeleteEducation: (educationId: string) => Promise<DeleteResponse>;
  adminDeleteUserEducations: (
    userId: string,
  ) => Promise<AdminDeleteUserEducationResponse>;

  // ==================== UTILITY ACTIONS ====================

  setSelectedEducation: (education: Education | null) => void;
  setAdminSelectedEducation: (education: Education | null) => void;
  clearPublicEducations: () => void;
  clearUserEducationsByUserId: () => void;
  clearAdminUserEducations: () => void;
  clearError: () => void;
  clearAdminError: () => void;
  reset: () => void;
  resetAdmin: () => void;
}

// ---------------------------------------------------------------------------
// Helper to build query params
// ---------------------------------------------------------------------------

const buildQueryParams = (filters?: EducationFilters): string => {
  if (!filters) return "";

  const params = new URLSearchParams();

  if (filters.skip !== undefined)
    params.append("skip", filters.skip.toString());
  if (filters.limit !== undefined)
    params.append("limit", filters.limit.toString());
  if (filters.institution) params.append("institution", filters.institution);
  if (filters.degree) params.append("degree", filters.degree);
  if (filters.field_of_study)
    params.append("field_of_study", filters.field_of_study);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useEducation = create<EducationState>()((set) => ({
  // ==================== USER DEFAULTS ====================
  educations: [],
  selectedEducation: null,
  userEducationsByUserId: [],
  viewingUserId: null,
  totalUserEducations: 0,

  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isLoadingUserById: false,

  // ==================== PUBLIC DEFAULTS ====================
  publicEducations: [],
  publicEducationsTotal: 0,
  publicUsername: null,
  publicFilters: {},

  isLoadingPublic: false,
  isLoadingPublicByUsername: false,

  // ==================== ADMIN DEFAULTS ====================
  adminEducations: [],
  adminSelectedEducation: null,
  adminUserEducations: [],
  adminCurrentUserId: null,
  adminTotalEducations: 0,

  adminIsLoading: false,
  adminIsUpdating: false,
  adminIsDeleting: false,
  adminIsLoadingUserEducations: false,

  // Errors
  error: null,
  adminError: null,

  // ==================== USER ACTIONS ====================

  // ------------------------------------------------------------------
  // GET /education/ — Fetch all educations for current user
  // ------------------------------------------------------------------
  fetchAllEducations: async (filters?: EducationFilters) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = buildQueryParams(filters);
      const response = await api.get<EducationListResponse>(
        `/education/${queryParams}`,
      );
      const data = response.data;

      set({
        educations: data.educations || [],
        totalUserEducations: data.total || 0,
        isLoading: false,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch educations";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /education/{education_id} — Fetch a specific education
  // ------------------------------------------------------------------
  fetchEducationById: async (educationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Education>(`/education/${educationId}`);
      const education = response.data;
      set({ selectedEducation: education, isLoading: false });
      return education;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch education";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /education/user/{user_id} — Fetch educations by user ID
  // ------------------------------------------------------------------
  fetchEducationsByUserId: async (
    userId: string,
    filters?: EducationFilters,
  ) => {
    set({ isLoadingUserById: true, error: null });
    try {
      const queryParams = buildQueryParams(filters);
      const response = await api.get<EducationListResponse>(
        `/education/user/${userId}${queryParams}`,
      );
      const data = response.data;

      set({
        userEducationsByUserId: data.educations || [],
        viewingUserId: userId,
        isLoadingUserById: false,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch user educations";
      set({ isLoadingUserById: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // POST /education/ — Create a new education
  // ------------------------------------------------------------------
  createEducation: async (payload: CreateEducationPayload) => {
    set({ isCreating: true, error: null });
    try {
      const { institution_logo, ...educationData } = payload;

      let response;

      // If there's a file, send as FormData
      if (institution_logo) {
        const formData = new FormData();
        formData.append("education_data", JSON.stringify(educationData));
        formData.append("institution_logo", institution_logo);

        response = await api.post<Education>("/education/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // No file, send education_data as form field with JSON string
        const formData = new FormData();
        formData.append("education_data", JSON.stringify(educationData));

        response = await api.post<Education>("/education/", formData);
      }

      const newEducation = response.data;

      set((state) => ({
        educations: [...state.educations, newEducation],
        totalUserEducations: state.totalUserEducations + 1,
        isCreating: false,
      }));

      return newEducation;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create education";
      set({ isCreating: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // PUT /education/{education_id} — Update an education
  // ------------------------------------------------------------------
  updateEducation: async (
    educationId: string,
    payload: UpdateEducationPayload,
  ) => {
    set({ isUpdating: true, error: null });
    try {
      const { institution_logo, ...educationData } = payload;

      let response;

      // If there's a file, send as FormData
      if (institution_logo) {
        const formData = new FormData();
        formData.append("education_data", JSON.stringify(educationData));
        formData.append("institution_logo", institution_logo);

        response = await api.put<Education>(
          `/education/${educationId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        // No file, send education_data as form field with JSON string
        const formData = new FormData();
        formData.append("education_data", JSON.stringify(educationData));

        response = await api.put<Education>(
          `/education/${educationId}`,
          formData,
        );
      }

      const updatedEducation = response.data;

      set((state) => ({
        educations: state.educations.map((edu) =>
          edu.id === educationId ? { ...edu, ...updatedEducation } : edu,
        ),
        selectedEducation:
          state.selectedEducation?.id === educationId
            ? { ...state.selectedEducation, ...updatedEducation }
            : state.selectedEducation,
        userEducationsByUserId: state.userEducationsByUserId.map((edu) =>
          edu.id === educationId ? { ...edu, ...updatedEducation } : edu,
        ),
        isUpdating: false,
      }));

      return updatedEducation;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update education";
      set({ isUpdating: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /education/{education_id} — Delete an education
  // ------------------------------------------------------------------
  deleteEducation: async (educationId: string) => {
    set({ isDeleting: true, error: null });
    try {
      const response = await api.delete<DeleteResponse>(
        `/education/${educationId}`,
      );

      set((state) => ({
        educations: state.educations.filter((edu) => edu.id !== educationId),
        selectedEducation:
          state.selectedEducation?.id === educationId
            ? null
            : state.selectedEducation,
        userEducationsByUserId: state.userEducationsByUserId.filter(
          (edu) => edu.id !== educationId,
        ),
        totalUserEducations: state.totalUserEducations - 1,
        isDeleting: false,
      }));

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete education";
      set({ isDeleting: false, error: message });
      throw err;
    }
  },

  // ==================== PUBLIC ACTIONS ====================

  // ------------------------------------------------------------------
  // GET /education/public/ — Fetch all public educations
  // ------------------------------------------------------------------
  fetchPublicEducations: async (filters?: EducationFilters) => {
    set({ isLoadingPublic: true, error: null });
    try {
      const queryParams = buildQueryParams(filters);
      const response = await api.get<EducationListResponse>(
        `/education/public/${queryParams}`,
      );
      const data = response.data;

      set({
        publicEducations: data.educations || [],
        publicEducationsTotal: data.total || 0,
        publicFilters: filters || {},
        isLoadingPublic: false,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch public educations";
      set({ isLoadingPublic: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /education/public/{education_id} — Fetch public education by ID
  // ------------------------------------------------------------------
  fetchPublicEducationById: async (educationId: string) => {
    set({ isLoadingPublic: true, error: null });
    try {
      const response = await api.get<Education>(
        `/education/public/${educationId}`,
      );
      const education = response.data;
      set({ isLoadingPublic: false });
      return education;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch public education";
      set({ isLoadingPublic: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /education/public/user/{username} — Fetch user's public educations
  // ------------------------------------------------------------------
  fetchPublicUserEducations: async (
    username: string,
    filters?: EducationFilters,
  ) => {
    set({ isLoadingPublicByUsername: true, error: null });
    try {
      const queryParams = buildQueryParams(filters);
      const response = await api.get<EducationListResponse>(
        `/education/public/user/${username}${queryParams}`,
      );
      const data = response.data;

      set({
        publicEducations: data.educations || [],
        publicEducationsTotal: data.total || 0,
        publicUsername: username,
        isLoadingPublicByUsername: false,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch user's public educations";
      set({ isLoadingPublicByUsername: false, error: message });
      throw err;
    }
  },

  // ==================== ADMIN ACTIONS ====================

  // ------------------------------------------------------------------
  // GET /admin/education/ — Admin: Get all educations
  // ------------------------------------------------------------------
  adminFetchAllEducations: async (filters?: EducationFilters) => {
    set({ adminIsLoading: true, adminError: null });
    try {
      const queryParams = buildQueryParams(filters);
      const response = await api.get<EducationListResponse>(
        `/admin/education/${queryParams}`,
      );
      const data = response.data;

      set({
        adminEducations: data.educations || [],
        adminTotalEducations: data.total || 0,
        adminIsLoading: false,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch all educations (admin)";
      set({ adminIsLoading: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /admin/education/{education_id} — Admin: Get specific education
  // ------------------------------------------------------------------
  adminFetchEducationById: async (educationId: string) => {
    set({ adminIsLoading: true, adminError: null });
    try {
      const response = await api.get<Education>(
        `/admin/education/${educationId}`,
      );
      const education = response.data;
      set({ adminSelectedEducation: education, adminIsLoading: false });
      return education;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch education (admin)";
      set({ adminIsLoading: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /admin/education/user/{user_id} — Admin: Get user's educations
  // ------------------------------------------------------------------
  adminFetchUserEducations: async (
    userId: string,
    filters?: EducationFilters,
  ) => {
    set({ adminIsLoadingUserEducations: true, adminError: null });
    try {
      const queryParams = buildQueryParams(filters);
      const response = await api.get<EducationListResponse>(
        `/admin/education/user/${userId}${queryParams}`,
      );
      const data = response.data;

      set({
        adminUserEducations: data.educations || [],
        adminCurrentUserId: userId,
        adminIsLoadingUserEducations: false,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch user educations (admin)";
      set({ adminIsLoadingUserEducations: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // PUT /admin/education/{education_id} — Admin: Update education
  // ------------------------------------------------------------------
  adminUpdateEducation: async (
    educationId: string,
    payload: UpdateEducationPayload,
  ) => {
    set({ adminIsUpdating: true, adminError: null });
    try {
      const { institution_logo, ...educationData } = payload;

      let response;

      // If there's a file, send as FormData
      if (institution_logo) {
        const formData = new FormData();
        formData.append("education_data", JSON.stringify(educationData));
        formData.append("institution_logo", institution_logo);

        response = await api.put<Education>(
          `/admin/education/${educationId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        const formData = new FormData();
        formData.append("education_data", JSON.stringify(educationData));

        response = await api.put<Education>(
          `/admin/education/${educationId}`,
          formData,
        );
      }

      const updatedEducation = response.data;

      set((state) => ({
        adminEducations: state.adminEducations.map((edu) =>
          edu.id === educationId ? { ...edu, ...updatedEducation } : edu,
        ),
        adminSelectedEducation:
          state.adminSelectedEducation?.id === educationId
            ? { ...state.adminSelectedEducation, ...updatedEducation }
            : state.adminSelectedEducation,
        adminUserEducations: state.adminUserEducations.map((edu) =>
          edu.id === educationId ? { ...edu, ...updatedEducation } : edu,
        ),
        adminIsUpdating: false,
      }));

      return updatedEducation;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update education (admin)";
      set({ adminIsUpdating: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /admin/education/{education_id} — Admin: Delete education
  // ------------------------------------------------------------------
  adminDeleteEducation: async (educationId: string) => {
    set({ adminIsDeleting: true, adminError: null });
    try {
      const response = await api.delete<DeleteResponse>(
        `/admin/education/${educationId}`,
      );

      set((state) => ({
        adminEducations: state.adminEducations.filter(
          (edu) => edu.id !== educationId,
        ),
        adminSelectedEducation:
          state.adminSelectedEducation?.id === educationId
            ? null
            : state.adminSelectedEducation,
        adminUserEducations: state.adminUserEducations.filter(
          (edu) => edu.id !== educationId,
        ),
        adminTotalEducations: state.adminTotalEducations - 1,
        adminIsDeleting: false,
      }));

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete education (admin)";
      set({ adminIsDeleting: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /admin/education/user/{user_id} — Admin: Delete all user's educations
  // ------------------------------------------------------------------
  adminDeleteUserEducations: async (userId: string) => {
    set({ adminIsDeleting: true, adminError: null });
    try {
      const response = await api.delete<AdminDeleteUserEducationResponse>(
        `/admin/education/user/${userId}`,
      );

      const result = response.data;

      set((state) => ({
        adminEducations: state.adminEducations.filter(
          (edu) => edu.user_id !== userId,
        ),
        adminUserEducations:
          state.adminCurrentUserId === userId ? [] : state.adminUserEducations,
        adminSelectedEducation: null,
        adminCurrentUserId:
          state.adminCurrentUserId === userId ? null : state.adminCurrentUserId,
        adminTotalEducations: state.adminTotalEducations - result.deleted_count,
        adminIsDeleting: false,
      }));

      return result;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete user educations (admin)";
      set({ adminIsDeleting: false, adminError: message });
      throw err;
    }
  },

  // ==================== UTILITY ACTIONS ====================

  setSelectedEducation: (education: Education | null) => {
    set({ selectedEducation: education });
  },

  setAdminSelectedEducation: (education: Education | null) => {
    set({ adminSelectedEducation: education });
  },

  clearPublicEducations: () => {
    set({
      publicEducations: [],
      publicEducationsTotal: 0,
      publicUsername: null,
      publicFilters: {},
    });
  },

  clearUserEducationsByUserId: () => {
    set({ userEducationsByUserId: [], viewingUserId: null });
  },

  clearAdminUserEducations: () => {
    set({ adminUserEducations: [], adminCurrentUserId: null });
  },

  clearError: () => set({ error: null }),

  clearAdminError: () => set({ adminError: null }),

  reset: () =>
    set({
      educations: [],
      selectedEducation: null,
      userEducationsByUserId: [],
      viewingUserId: null,
      totalUserEducations: 0,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isLoadingUserById: false,
      publicEducations: [],
      publicEducationsTotal: 0,
      publicUsername: null,
      publicFilters: {},
      isLoadingPublic: false,
      isLoadingPublicByUsername: false,
      error: null,
    }),

  resetAdmin: () =>
    set({
      adminEducations: [],
      adminSelectedEducation: null,
      adminUserEducations: [],
      adminCurrentUserId: null,
      adminTotalEducations: 0,
      adminIsLoading: false,
      adminIsUpdating: false,
      adminIsDeleting: false,
      adminIsLoadingUserEducations: false,
      adminError: null,
    }),
}));
