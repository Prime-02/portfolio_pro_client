// stores/useSkills.ts
import { create } from "zustand";
import { api } from "@/lib/client/api";

// ---------------------------------------------------------------------------
// Types — matching the backend schemas
// ---------------------------------------------------------------------------

export interface ProfessionalSkill {
  id?: string;
  user_id?: string;
  skill_name: string;
  proficiency_level: string; // e.g., Beginner, Intermediate, Expert
  category?: string | null;
  skill_logo_url?: string | null;
  skill_logo_url_id?: string | null;
  subcategory?: string | null;
  description?: string | null;
  is_trending?: string | null;
  difficulty_level?: string | null;
  is_major?: boolean | null;
  created_at?: string;
}

export interface SkillListResponse {
  skills: ProfessionalSkill[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface CreateSkillPayload {
  skill_name: string;
  proficiency_level: string;
  category?: string | null;
  subcategory?: string | null;
  description?: string | null;
  is_trending?: string | null;
  difficulty_level?: string | null;
  is_major?: boolean | null;
  skill_logo?: File | null;
}

export interface UpdateSkillPayload {
  skill_name?: string | null;
  proficiency_level?: string | null;
  category?: string | null;
  skill_logo_url?: string | null;
  skill_logo_url_id?: string | null;
  subcategory?: string | null;
  description?: string | null;
  is_trending?: string | null;
  difficulty_level?: string | null;
  is_major?: boolean | null;
  skill_logo?: File | null;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface AdminDeleteUserSkillsResponse {
  success: boolean;
  message: string;
  deleted_count: number;
}

export interface SkillFilters {
  skip?: number;
  limit?: number;
  category?: string;
  proficiency_level?: string;
}

export interface PublicSkillsByUsernameFilters {
  is_major?: boolean;
  is_trending?: boolean;
  difficulty_level?: string;
  subcategory?: string;
  category?: string;
  ids?: string[];
  merge_filters?: boolean;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface SkillsState {
  // ==================== USER STATE ====================
  skills: ProfessionalSkill[];
  selectedSkill: ProfessionalSkill | null;
  totalUserSkills: number;

  // User loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // ==================== PUBLIC STATE ====================
  publicSkills: ProfessionalSkill[];
  publicSkillsTotal: number;
  publicUsername: string | null;
  publicUserId: string | null;
  publicFilters: SkillFilters;
  categories: string[];
  subcategories: string[];

  // Public loading states
  isLoadingPublic: boolean;
  isLoadingPublicByUsername: boolean;
  isLoadingPublicByUserId: boolean;

  // ==================== ADMIN STATE ====================
  adminSkills: ProfessionalSkill[];
  adminSelectedSkill: ProfessionalSkill | null;
  adminUserSkills: ProfessionalSkill[];
  adminCurrentUserId: string | null;
  adminTotalSkills: number;

  // Admin loading states
  adminIsLoading: boolean;
  adminIsUpdating: boolean;
  adminIsDeleting: boolean;
  adminIsLoadingUserSkills: boolean;

  // Errors
  error: string | null;
  adminError: string | null;

  // ==================== USER ACTIONS ====================

  fetchAllSkills: () => Promise<ProfessionalSkill[]>;
  fetchSkillById: (skillId: string) => Promise<ProfessionalSkill>;
  createSkill: (payload: CreateSkillPayload) => Promise<ProfessionalSkill>;
  updateSkill: (
    skillId: string,
    payload: UpdateSkillPayload,
  ) => Promise<ProfessionalSkill>;
  deleteSkill: (skillId: string) => Promise<DeleteResponse>;

  // ==================== PUBLIC ACTIONS ====================

  fetchPublicSkills: (filters?: SkillFilters) => Promise<SkillListResponse>;
  fetchPublicSkillsByUsername: (
    username: string,
    filters?: PublicSkillsByUsernameFilters,
  ) => Promise<ProfessionalSkill[]>;
  fetchPublicSkillsByUserId: (userId: string) => Promise<ProfessionalSkill[]>;

  // ==================== ADMIN ACTIONS ====================

  adminFetchAllSkills: (filters?: SkillFilters) => Promise<SkillListResponse>;
  adminFetchSkillById: (skillId: string) => Promise<ProfessionalSkill>;
  adminFetchUserSkills: (userId: string) => Promise<ProfessionalSkill[]>;
  adminUpdateSkill: (
    skillId: string,
    payload: UpdateSkillPayload,
  ) => Promise<ProfessionalSkill>;
  adminDeleteSkill: (skillId: string) => Promise<DeleteResponse>;
  adminDeleteUserSkills: (
    userId: string,
  ) => Promise<AdminDeleteUserSkillsResponse>;

  // ==================== UTILITY ACTIONS ====================

  setSelectedSkill: (skill: ProfessionalSkill | null) => void;
  setAdminSelectedSkill: (skill: ProfessionalSkill | null) => void;
  clearPublicSkills: () => void;
  clearAdminUserSkills: () => void;
  clearError: () => void;
  clearAdminError: () => void;
  reset: () => void;
  resetAdmin: () => void;
}

// ---------------------------------------------------------------------------
// Helper to build query params
// ---------------------------------------------------------------------------

const buildQueryParams = (filters?: SkillFilters): string => {
  if (!filters) return "";

  const params = new URLSearchParams();

  if (filters.skip !== undefined)
    params.append("skip", filters.skip.toString());
  if (filters.limit !== undefined)
    params.append("limit", filters.limit.toString());
  if (filters.category) params.append("category", filters.category);
  if (filters.proficiency_level)
    params.append("proficiency_level", filters.proficiency_level);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const buildUniqueCategoryLists = (skills: ProfessionalSkill[]) => {
  const categories = Array.from(
    new Set(
      skills
        .map((skill) => skill.category?.trim())
        .filter((category): category is string => Boolean(category)),
    ),
  );

  const subcategories = Array.from(
    new Set(
      skills
        .map((skill) => skill.subcategory?.trim())
        .filter((subcategory): subcategory is string => Boolean(subcategory)),
    ),
  );

  return { categories, subcategories };
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSkills = create<SkillsState>()((set, get) => ({
  // ==================== USER DEFAULTS ====================
  skills: [],
  selectedSkill: null,
  totalUserSkills: 0,

  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // ==================== PUBLIC DEFAULTS ====================
  publicSkills: [],
  publicSkillsTotal: 0,
  publicUsername: null,
  publicUserId: null,
  publicFilters: {},
  categories: [],
  subcategories: [],

  isLoadingPublic: false,
  isLoadingPublicByUsername: false,
  isLoadingPublicByUserId: false,

  // ==================== ADMIN DEFAULTS ====================
  adminSkills: [],
  adminSelectedSkill: null,
  adminUserSkills: [],
  adminCurrentUserId: null,
  adminTotalSkills: 0,

  adminIsLoading: false,
  adminIsUpdating: false,
  adminIsDeleting: false,
  adminIsLoadingUserSkills: false,

  // Errors
  error: null,
  adminError: null,

  // ==================== USER ACTIONS ====================

  // ------------------------------------------------------------------
  // GET /skills/ — Fetch all skills for current user
  // ------------------------------------------------------------------
  fetchAllSkills: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ProfessionalSkill[]>("/skills/");
      const skills = response.data;
      const { categories, subcategories } = buildUniqueCategoryLists(
        skills || [],
      );

      set({
        skills: skills || [],
        totalUserSkills: skills?.length || 0,
        categories,
        subcategories,
        isLoading: false,
      });
      return skills;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch skills";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /skills/{skill_id} — Fetch a specific skill
  // ------------------------------------------------------------------
  fetchSkillById: async (skillId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ProfessionalSkill>(`/skills/${skillId}`);
      const skill = response.data;
      set({ selectedSkill: skill, isLoading: false });
      return skill;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch skill";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // POST /skills/ — Create a new skill
  // ------------------------------------------------------------------
  createSkill: async (payload: CreateSkillPayload) => {
    set({ isCreating: true, error: null });
    try {
      const { skill_logo, ...skillData } = payload;

      // Always use FormData
      const formData = new FormData();

      // Send skill_data as a JSON string in a single field
      formData.append("skill_data", JSON.stringify(skillData));

      // Only append skill_logo if it exists and is a File
      if (skill_logo && skill_logo instanceof File) {
        formData.append("skill_logo", skill_logo);
      }

      const response = await api.post<ProfessionalSkill>("/skills/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newSkill = response.data;

      set((state) => {
        const updatedSkills = [...state.skills, newSkill];
        const { categories, subcategories } =
          buildUniqueCategoryLists(updatedSkills);

        return {
          skills: updatedSkills,
          totalUserSkills: state.totalUserSkills + 1,
          categories,
          subcategories,
          isCreating: false,
        };
      });

      return newSkill;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create skill";
      set({ isCreating: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // PUT /skills/{skill_id} — Update a skill
  // ------------------------------------------------------------------
  updateSkill: async (skillId: string, payload: UpdateSkillPayload) => {
    set({ isUpdating: true, error: null });
    try {
      const { skill_logo, ...skillData } = payload;

      // Always use FormData
      const formData = new FormData();

      // Send skill_data as a JSON string in a single field
      formData.append("skill_data", JSON.stringify(skillData));

      // Only append skill_logo if it exists and is a File
      if (skill_logo && skill_logo instanceof File) {
        formData.append("skill_logo", skill_logo);
      }

      const response = await api.put<ProfessionalSkill>(
        `/skills/${skillId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const updatedSkill = response.data;

      set((state) => {
        const updatedSkills = state.skills.map((skill) =>
          skill.id === skillId ? { ...skill, ...updatedSkill } : skill,
        );
        const { categories, subcategories } =
          buildUniqueCategoryLists(updatedSkills);

        return {
          skills: updatedSkills,
          selectedSkill:
            state.selectedSkill?.id === skillId
              ? { ...state.selectedSkill, ...updatedSkill }
              : state.selectedSkill,
          categories,
          subcategories,
          isUpdating: false,
        };
      });

      return updatedSkill;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update skill";
      set({ isUpdating: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /skills/{skill_id} — Delete a skill
  // ------------------------------------------------------------------
  deleteSkill: async (skillId: string) => {
    set({ isDeleting: true, error: null });
    try {
      const response = await api.delete<DeleteResponse>(`/skills/${skillId}`);

      set((state) => {
        const remainingSkills = state.skills.filter(
          (skill) => skill.id !== skillId,
        );
        const { categories, subcategories } =
          buildUniqueCategoryLists(remainingSkills);

        return {
          skills: remainingSkills,
          selectedSkill:
            state.selectedSkill?.id === skillId ? null : state.selectedSkill,
          totalUserSkills: state.totalUserSkills - 1,
          categories,
          subcategories,
          isDeleting: false,
        };
      });

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete skill";
      set({ isDeleting: false, error: message });
      throw err;
    }
  },

  // ==================== PUBLIC ACTIONS ====================

  // ------------------------------------------------------------------
  // GET /skills/public/ — Fetch all public skills with filtering
  // ------------------------------------------------------------------
  fetchPublicSkills: async (filters?: SkillFilters) => {
    set({ isLoadingPublic: true, error: null });
    try {
      const queryParams = buildQueryParams(filters);
      const response = await api.get<SkillListResponse>(
        `/skills/public/${queryParams}`,
      );
      const data = response.data;

      set({
        publicSkills: data.skills || [],
        publicSkillsTotal: data.total || 0,
        publicFilters: filters || {},
        isLoadingPublic: false,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch public skills";
      set({ isLoadingPublic: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /skills/public/user/{username} — Fetch user's skills by username
  // ------------------------------------------------------------------
  fetchPublicSkillsByUsername: async (username: string, filters = {}) => {
    set({ isLoadingPublicByUsername: true, error: null });
    try {
      const response = await api.get<ProfessionalSkill[]>(
        `/skills/public/user/${username}`,
        { params: filters },
      );
      const skills = response.data;

      set({
        publicSkills: skills || [],
        publicUsername: username,
        publicUserId: null,
        publicSkillsTotal: skills?.length || 0,
        isLoadingPublicByUsername: false,
      });
      return skills;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch user skills";
      set({ isLoadingPublicByUsername: false, error: message });
      throw err;
    }
  },
  // ------------------------------------------------------------------
  // GET /skills/public/user/id/{user_id} — Fetch user's skills by user ID
  // ------------------------------------------------------------------
  fetchPublicSkillsByUserId: async (userId: string) => {
    set({ isLoadingPublicByUserId: true, error: null });
    try {
      const response = await api.get<ProfessionalSkill[]>(
        `/skills/public/user/id/${userId}`,
      );
      const skills = response.data;

      set({
        publicSkills: skills || [],
        publicUserId: userId,
        publicUsername: null,
        publicSkillsTotal: skills?.length || 0,
        isLoadingPublicByUserId: false,
      });
      return skills;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch user skills by ID";
      set({ isLoadingPublicByUserId: false, error: message });
      throw err;
    }
  },

  // ==================== ADMIN ACTIONS ====================

  // ------------------------------------------------------------------
  // GET /admin/skills/ — Admin: Get all skills
  // ------------------------------------------------------------------
  adminFetchAllSkills: async (filters?: SkillFilters) => {
    set({ adminIsLoading: true, adminError: null });
    try {
      const queryParams = buildQueryParams(filters);
      const response = await api.get<SkillListResponse>(
        `/admin/skills/${queryParams}`,
      );
      const data = response.data;

      set({
        adminSkills: data.skills || [],
        adminTotalSkills: data.total || 0,
        adminIsLoading: false,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch all skills (admin)";
      set({ adminIsLoading: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /admin/skills/{skill_id} — Admin: Get specific skill
  // ------------------------------------------------------------------
  adminFetchSkillById: async (skillId: string) => {
    set({ adminIsLoading: true, adminError: null });
    try {
      const response = await api.get<ProfessionalSkill>(
        `/admin/skills/${skillId}`,
      );
      const skill = response.data;
      set({ adminSelectedSkill: skill, adminIsLoading: false });
      return skill;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch skill (admin)";
      set({ adminIsLoading: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /admin/skills/user/{user_id} — Admin: Get user's skills
  // ------------------------------------------------------------------
  adminFetchUserSkills: async (userId: string) => {
    set({ adminIsLoadingUserSkills: true, adminError: null });
    try {
      const response = await api.get<ProfessionalSkill[]>(
        `/admin/skills/user/${userId}`,
      );
      const skills = response.data;

      set({
        adminUserSkills: skills || [],
        adminCurrentUserId: userId,
        adminIsLoadingUserSkills: false,
      });
      return skills;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch user skills (admin)";
      set({ adminIsLoadingUserSkills: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // PUT /admin/skills/{skill_id} — Admin: Update skill
  // ------------------------------------------------------------------
  adminUpdateSkill: async (skillId: string, payload: UpdateSkillPayload) => {
    set({ adminIsUpdating: true, adminError: null });
    try {
      const { skill_logo, ...skillData } = payload;

      // Always use FormData
      const formData = new FormData();

      // Send skill_data as a JSON string in a single field
      formData.append("skill_data", JSON.stringify(skillData));

      // Only append skill_logo if it exists and is a File
      if (skill_logo && skill_logo instanceof File) {
        formData.append("skill_logo", skill_logo);
      }

      const response = await api.put<ProfessionalSkill>(
        `/admin/skills/${skillId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const updatedSkill = response.data;

      set((state) => ({
        adminSkills: state.adminSkills.map((skill) =>
          skill.id === skillId ? { ...skill, ...updatedSkill } : skill,
        ),
        adminSelectedSkill:
          state.adminSelectedSkill?.id === skillId
            ? { ...state.adminSelectedSkill, ...updatedSkill }
            : state.adminSelectedSkill,
        adminUserSkills: state.adminUserSkills.map((skill) =>
          skill.id === skillId ? { ...skill, ...updatedSkill } : skill,
        ),
        adminIsUpdating: false,
      }));

      return updatedSkill;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update skill (admin)";
      set({ adminIsUpdating: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /admin/skills/{skill_id} — Admin: Delete skill
  // ------------------------------------------------------------------
  adminDeleteSkill: async (skillId: string) => {
    set({ adminIsDeleting: true, adminError: null });
    try {
      const response = await api.delete<DeleteResponse>(
        `/admin/skills/${skillId}`,
      );

      set((state) => ({
        adminSkills: state.adminSkills.filter((skill) => skill.id !== skillId),
        adminSelectedSkill:
          state.adminSelectedSkill?.id === skillId
            ? null
            : state.adminSelectedSkill,
        adminUserSkills: state.adminUserSkills.filter(
          (skill) => skill.id !== skillId,
        ),
        adminTotalSkills: state.adminTotalSkills - 1,
        adminIsDeleting: false,
      }));

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete skill (admin)";
      set({ adminIsDeleting: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /admin/skills/user/{user_id} — Admin: Delete all user's skills
  // ------------------------------------------------------------------
  adminDeleteUserSkills: async (userId: string) => {
    set({ adminIsDeleting: true, adminError: null });
    try {
      const response = await api.delete<AdminDeleteUserSkillsResponse>(
        `/admin/skills/user/${userId}`,
      );

      const result = response.data;

      set((state) => ({
        adminSkills: state.adminSkills.filter(
          (skill) => skill.user_id !== userId,
        ),
        adminUserSkills:
          state.adminCurrentUserId === userId ? [] : state.adminUserSkills,
        adminSelectedSkill: null,
        adminCurrentUserId:
          state.adminCurrentUserId === userId ? null : state.adminCurrentUserId,
        adminTotalSkills: state.adminTotalSkills - result.deleted_count,
        adminIsDeleting: false,
      }));

      return result;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete user skills (admin)";
      set({ adminIsDeleting: false, adminError: message });
      throw err;
    }
  },

  // ==================== UTILITY ACTIONS ====================

  setSelectedSkill: (skill: ProfessionalSkill | null) => {
    set({ selectedSkill: skill });
  },

  setAdminSelectedSkill: (skill: ProfessionalSkill | null) => {
    set({ adminSelectedSkill: skill });
  },

  clearPublicSkills: () => {
    set({
      publicSkills: [],
      publicSkillsTotal: 0,
      publicUsername: null,
      publicUserId: null,
      publicFilters: {},
    });
  },

  clearAdminUserSkills: () => {
    set({ adminUserSkills: [], adminCurrentUserId: null });
  },

  clearError: () => set({ error: null }),

  clearAdminError: () => set({ adminError: null }),

  reset: () =>
    set({
      skills: [],
      selectedSkill: null,
      totalUserSkills: 0,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      publicSkills: [],
      publicSkillsTotal: 0,
      publicUsername: null,
      publicUserId: null,
      publicFilters: {},
      categories: [],
      subcategories: [],
      isLoadingPublic: false,
      isLoadingPublicByUsername: false,
      isLoadingPublicByUserId: false,
      error: null,
    }),

  resetAdmin: () =>
    set({
      adminSkills: [],
      adminSelectedSkill: null,
      adminUserSkills: [],
      adminCurrentUserId: null,
      adminTotalSkills: 0,
      adminIsLoading: false,
      adminIsUpdating: false,
      adminIsDeleting: false,
      adminIsLoadingUserSkills: false,
      adminError: null,
    }),
}));
