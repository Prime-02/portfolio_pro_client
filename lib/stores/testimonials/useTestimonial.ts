// lib/stores/testimonials.store.ts
import { create } from "zustand";
import { api } from "@/lib/client/api";

// Types
export interface AuthorInfo {
  user_id: string;
  username: string;
  profile_picture?: string;
}

export interface Testimonial {
  id: string;
  user_id: string;
  author_user_id?: string;
  author_name: string;
  author_title?: string;
  author_company?: string;
  author_relationship?: string;
  content: string;
  rating?: number;
  avatar_url?: string;
  avatar_url_id?: string;
  is_approved: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  author_info?: AuthorInfo;
}

export interface TestimonialCreate {
  username: string;
  author_name: string;
  author_title?: string;
  author_company?: string;
  author_relationship?: string;
  content: string;
  rating?: number;
}

export interface TestimonialUpdate {
  author_name?: string;
  author_title?: string;
  author_company?: string;
  author_relationship?: string;
  content?: string;
  rating?: number;
  is_approved?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export interface TestimonialStats {
  total_testimonials: number;
  average_rating?: number;
  testimonials_with_rating: number;
}

export interface TestimonialSummary {
  stats: TestimonialStats;
  recent_testimonials: Testimonial[];
  username: string;
  user_id: string;
}

export interface TestimonialsResponse {
  items: Testimonial[];
  total?: number;
  skip?: number;
  limit?: number;
}

export interface DeleteResponse {
  [key: string]: boolean | string | number;
}

// Store State
interface TestimonialsState {
  // Public testimonials (all platform)
  publicTestimonials: Testimonial[];
  publicTestimonialsTotal: number;
  publicTestimonialsLoading: boolean;
  publicTestimonialsError: string | null;

  // Search
  searchResults: Testimonial[];
  searchLoading: boolean;
  searchError: string | null;

  // User testimonials (by username)
  userTestimonials: Record<string, Testimonial[]>;
  userTestimonialsLoading: boolean;
  userTestimonialsError: string | null;

  // User testimonials (by user ID)
  userTestimonialsById: Record<string, Testimonial[]>;
  userTestimonialsByIdLoading: boolean;
  userTestimonialsByIdError: string | null;

  // User stats
  userStats: Record<string, TestimonialStats>;
  userStatsLoading: boolean;
  userStatsError: string | null;

  // User summary
  userSummary: Record<string, TestimonialSummary>;
  userSummaryLoading: boolean;
  userSummaryError: string | null;

  // Single testimonial
  currentTestimonial: Testimonial | null;
  currentTestimonialLoading: boolean;
  currentTestimonialError: string | null;

  // My authored testimonials
  myAuthoredTestimonials: Testimonial[];
  myAuthoredTestimonialsLoading: boolean;
  myAuthoredTestimonialsError: string | null;

  // My received testimonials (authenticated user - includes unapproved)
  myReceivedTestimonials: Testimonial[];
  myReceivedTestimonialsLoading: boolean;
  myReceivedTestimonialsError: string | null;

  // Create/Update/Delete states
  creating: boolean;
  createError: string | null;
  updating: boolean;
  updateError: string | null;
  deleting: boolean;
  deleteError: string | null;
  approving: boolean;
  approveError: string | null;

  // Admin states
  adminTestimonials: Testimonial[];
  adminTestimonialsTotal: number;
  adminTestimonialsLoading: boolean;
  adminTestimonialsError: string | null;
  adminUserTestimonials: Testimonial[];
  adminUserTestimonialsLoading: boolean;
  adminUserTestimonialsError: string | null;
  adminCurrentTestimonial: Testimonial | null;
  adminCurrentTestimonialLoading: boolean;
  adminCurrentTestimonialError: string | null;
  adminUpdating: boolean;
  adminUpdateError: string | null;
  adminApproving: boolean;
  adminApproveError: string | null;
  adminDeleting: boolean;
  adminDeleteError: string | null;
  adminDeletingUserTestimonials: boolean;
  adminDeleteUserTestimonialsError: string | null;

  // Public actions
  fetchPublicTestimonials: (params?: {
    skip?: number;
    limit?: number;
    min_rating?: number;
  }) => Promise<void>;
  searchTestimonials: (params: {
    q: string;
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  fetchUserTestimonials: (params: {
    username: string;
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  fetchUserTestimonialsById: (params: {
    userId: string;
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  fetchUserTestimonialStats: (username: string) => Promise<void>;
  fetchUserTestimonialSummary: (username: string) => Promise<void>;
  fetchTestimonial: (testimonialId: string) => Promise<void>;

  // Authenticated user actions
  fetchMyAuthoredTestimonials: (params?: {
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  fetchMyReceivedTestimonials: (params?: {
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  createTestimonial: (
    testimonialData: TestimonialCreate,
    authorAvatar?: File,
  ) => Promise<Testimonial | undefined>;
  updateTestimonial: (
    testimonialId: string,
    testimonialData: TestimonialUpdate,
    authorAvatar?: File,
  ) => Promise<void>;
  deleteTestimonial: (testimonialId: string) => Promise<void>;
  approveTestimonial: (testimonialId: string) => Promise<void>;

  // Admin actions
  fetchAdminTestimonials: (params?: {
    skip?: number;
    limit?: number;
    is_approved?: boolean;
  }) => Promise<void>;
  fetchAdminUserTestimonials: (userId: string) => Promise<void>;
  fetchAdminTestimonial: (testimonialId: string) => Promise<void>;
  updateAdminTestimonial: (
    testimonialId: string,
    testimonialData: TestimonialUpdate,
    authorAvatar?: File,
  ) => Promise<void>;
  approveAdminTestimonial: (testimonialId: string) => Promise<void>;
  deleteAdminTestimonial: (testimonialId: string) => Promise<void>;
  deleteAdminUserTestimonials: (userId: string) => Promise<void>;

  // Utility
  reset: () => void;
}

const initialState = {
  publicTestimonials: [],
  publicTestimonialsTotal: 0,
  publicTestimonialsLoading: false,
  publicTestimonialsError: null,
  searchResults: [],
  searchLoading: false,
  searchError: null,
  userTestimonials: {},
  userTestimonialsLoading: false,
  userTestimonialsError: null,
  userTestimonialsById: {},
  userTestimonialsByIdLoading: false,
  userTestimonialsByIdError: null,
  userStats: {},
  userStatsLoading: false,
  userStatsError: null,
  userSummary: {},
  userSummaryLoading: false,
  userSummaryError: null,
  currentTestimonial: null,
  currentTestimonialLoading: false,
  currentTestimonialError: null,
  myAuthoredTestimonials: [],
  myAuthoredTestimonialsLoading: false,
  myAuthoredTestimonialsError: null,
  myReceivedTestimonials: [],
  myReceivedTestimonialsLoading: false,
  myReceivedTestimonialsError: null,
  creating: false,
  createError: null,
  updating: false,
  updateError: null,
  deleting: false,
  deleteError: null,
  approving: false,
  approveError: null,
  adminTestimonials: [],
  adminTestimonialsTotal: 0,
  adminTestimonialsLoading: false,
  adminTestimonialsError: null,
  adminUserTestimonials: [],
  adminUserTestimonialsLoading: false,
  adminUserTestimonialsError: null,
  adminCurrentTestimonial: null,
  adminCurrentTestimonialLoading: false,
  adminCurrentTestimonialError: null,
  adminUpdating: false,
  adminUpdateError: null,
  adminApproving: false,
  adminApproveError: null,
  adminDeleting: false,
  adminDeleteError: null,
  adminDeletingUserTestimonials: false,
  adminDeleteUserTestimonialsError: null,
};

export const useTestimonialsStore = create<TestimonialsState>((set, get) => ({
  ...initialState,

  // ==================== PUBLIC ACTIONS ====================

  fetchPublicTestimonials: async (params = {}) => {
    set({ publicTestimonialsLoading: true, publicTestimonialsError: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());
      if (params.min_rating !== undefined)
        queryParams.append("min_rating", params.min_rating.toString());

      const response = await api.get<TestimonialsResponse>(
        `/testimonials/?${queryParams.toString()}`,
      );
      set({
        publicTestimonials: response.data.items || [],
        publicTestimonialsTotal: response.data.total || 0,
        publicTestimonialsLoading: false,
      });
    } catch (error: any) {
      set({
        publicTestimonialsError:
          error.response?.data?.detail || "Failed to fetch testimonials",
        publicTestimonialsLoading: false,
      });
    }
  },

  searchTestimonials: async (params) => {
    set({ searchLoading: true, searchError: null });
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("q", params.q);
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());

      const response = await api.get<Testimonial[]>(
        `/testimonials/search?${queryParams.toString()}`,
      );
      set({
        searchResults: response.data,
        searchLoading: false,
      });
    } catch (error: any) {
      set({
        searchError:
          error.response?.data?.detail || "Failed to search testimonials",
        searchLoading: false,
      });
    }
  },

  fetchUserTestimonials: async ({ username, skip = 0, limit = 100 }) => {
    set({ userTestimonialsLoading: true, userTestimonialsError: null });
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());

      const response = await api.get<Testimonial[]>(
        `/testimonials/user/${username}?${queryParams.toString()}`,
      );
      set((state) => ({
        userTestimonials: {
          ...state.userTestimonials,
          [username]: response.data,
        },
        userTestimonialsLoading: false,
      }));
    } catch (error: any) {
      set({
        userTestimonialsError:
          error.response?.data?.detail || "Failed to fetch user testimonials",
        userTestimonialsLoading: false,
      });
    }
  },

  fetchUserTestimonialsById: async ({ userId, skip = 0, limit = 100 }) => {
    set({ userTestimonialsByIdLoading: true, userTestimonialsByIdError: null });
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());

      const response = await api.get<Testimonial[]>(
        `/testimonials/user/id/${userId}?${queryParams.toString()}`,
      );
      set((state) => ({
        userTestimonialsById: {
          ...state.userTestimonialsById,
          [userId]: response.data,
        },
        userTestimonialsByIdLoading: false,
      }));
    } catch (error: any) {
      set({
        userTestimonialsByIdError:
          error.response?.data?.detail ||
          "Failed to fetch user testimonials by ID",
        userTestimonialsByIdLoading: false,
      });
    }
  },

  fetchUserTestimonialStats: async (username: string) => {
    set({ userStatsLoading: true, userStatsError: null });
    try {
      const response = await api.get<TestimonialStats>(
        `/testimonials/user/${username}/stats`,
      );
      set((state) => ({
        userStats: {
          ...state.userStats,
          [username]: response.data,
        },
        userStatsLoading: false,
      }));
    } catch (error: any) {
      set({
        userStatsError:
          error.response?.data?.detail || "Failed to fetch testimonial stats",
        userStatsLoading: false,
      });
    }
  },

  fetchUserTestimonialSummary: async (username: string) => {
    set({ userSummaryLoading: true, userSummaryError: null });
    try {
      const response = await api.get<TestimonialSummary>(
        `/testimonials/user/${username}/summary`,
      );
      set((state) => ({
        userSummary: {
          ...state.userSummary,
          [username]: response.data,
        },
        userSummaryLoading: false,
      }));
    } catch (error: any) {
      set({
        userSummaryError:
          error.response?.data?.detail || "Failed to fetch testimonial summary",
        userSummaryLoading: false,
      });
    }
  },

  fetchTestimonial: async (testimonialId: string) => {
    set({ currentTestimonialLoading: true, currentTestimonialError: null });
    try {
      const response = await api.get<Testimonial>(
        `/testimonials/${testimonialId}`,
      );
      set({
        currentTestimonial: response.data,
        currentTestimonialLoading: false,
      });
    } catch (error: any) {
      set({
        currentTestimonialError:
          error.response?.data?.detail || "Failed to fetch testimonial",
        currentTestimonialLoading: false,
      });
    }
  },

  // ==================== AUTHENTICATED USER ACTIONS ====================

  fetchMyAuthoredTestimonials: async (params = {}) => {
    set({
      myAuthoredTestimonialsLoading: true,
      myAuthoredTestimonialsError: null,
    });
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());

      const response = await api.get<Testimonial[]>(
        `/testimonials/my-authored?${queryParams.toString()}`,
      );
      set({
        myAuthoredTestimonials: response.data,
        myAuthoredTestimonialsLoading: false,
      });
    } catch (error: any) {
      set({
        myAuthoredTestimonialsError:
          error.response?.data?.detail ||
          "Failed to fetch authored testimonials",
        myAuthoredTestimonialsLoading: false,
      });
    }
  },

  fetchMyReceivedTestimonials: async (params = {}) => {
    set({
      myReceivedTestimonialsLoading: true,
      myReceivedTestimonialsError: null,
    });
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());

      const response = await api.get<Testimonial[]>(
        `/testimonials/my-received?${queryParams.toString()}`,
      );
      set({
        myReceivedTestimonials: response.data,
        myReceivedTestimonialsLoading: false,
      });
    } catch (error: any) {
      set({
        myReceivedTestimonialsError:
          error.response?.data?.detail ||
          "Failed to fetch received testimonials",
        myReceivedTestimonialsLoading: false,
      });
    }
  },

  createTestimonial: async (testimonialData, authorAvatar) => {
    set({ creating: true, createError: null });
    try {
      const formData = new FormData();
      formData.append("testimonial_data", JSON.stringify(testimonialData));
      if (authorAvatar) {
        formData.append("author_avatar", authorAvatar);
      }

      const response = await api.post<Testimonial>("/testimonials/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set((state) => ({
        myAuthoredTestimonials: [
          response.data,
          ...state.myAuthoredTestimonials,
        ],
        creating: false,
      }));

      return response.data;
    } catch (error: any) {
      set({
        createError:
          error.response?.data?.detail || "Failed to create testimonial",
        creating: false,
      });
      return undefined;
    }
  },

  updateTestimonial: async (testimonialId, testimonialData, authorAvatar) => {
    set({ updating: true, updateError: null });
    try {
      const formData = new FormData();
      formData.append("testimonial_data", JSON.stringify(testimonialData));
      if (authorAvatar) {
        formData.append("author_avatar", authorAvatar);
      }

      const response = await api.put<Testimonial>(
        `/testimonials/${testimonialId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      set((state) => ({
        myAuthoredTestimonials: state.myAuthoredTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        myReceivedTestimonials: state.myReceivedTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        currentTestimonial:
          state.currentTestimonial?.id === testimonialId
            ? response.data
            : state.currentTestimonial,
        updating: false,
      }));
    } catch (error: any) {
      set({
        updateError:
          error.response?.data?.detail || "Failed to update testimonial",
        updating: false,
      });
    }
  },

  deleteTestimonial: async (testimonialId: string) => {
    set({ deleting: true, deleteError: null });
    try {
      await api.delete<DeleteResponse>(`/testimonials/${testimonialId}`);

      set((state) => ({
        myAuthoredTestimonials: state.myAuthoredTestimonials.filter(
          (t) => t.id !== testimonialId,
        ),
        myReceivedTestimonials: state.myReceivedTestimonials.filter(
          (t) => t.id !== testimonialId,
        ),
        currentTestimonial:
          state.currentTestimonial?.id === testimonialId
            ? null
            : state.currentTestimonial,
        deleting: false,
      }));
    } catch (error: any) {
      set({
        deleteError:
          error.response?.data?.detail || "Failed to delete testimonial",
        deleting: false,
      });
    }
  },

  approveTestimonial: async (testimonialId: string) => {
    set({ approving: true, approveError: null });
    try {
      const response = await api.post<Testimonial>(
        `/testimonials/${testimonialId}/approve`,
      );

      set((state) => ({
        currentTestimonial:
          state.currentTestimonial?.id === testimonialId
            ? response.data
            : state.currentTestimonial,
        myReceivedTestimonials: state.myReceivedTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        // Update in userTestimonials if present
        userTestimonials: Object.fromEntries(
          Object.entries(state.userTestimonials).map(
            ([username, testimonials]) => [
              username,
              testimonials.map((t) =>
                t.id === testimonialId ? response.data : t,
              ),
            ],
          ),
        ),
        // Update in userTestimonialsById if present
        userTestimonialsById: Object.fromEntries(
          Object.entries(state.userTestimonialsById).map(
            ([userId, testimonials]) => [
              userId,
              testimonials.map((t) =>
                t.id === testimonialId ? response.data : t,
              ),
            ],
          ),
        ),
        approving: false,
      }));
    } catch (error: any) {
      set({
        approveError:
          error.response?.data?.detail || "Failed to approve testimonial",
        approving: false,
      });
    }
  },

  // ==================== ADMIN ACTIONS ====================

  fetchAdminTestimonials: async (params = {}) => {
    set({ adminTestimonialsLoading: true, adminTestimonialsError: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined)
        queryParams.append("skip", params.skip.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());
      if (params.is_approved !== undefined)
        queryParams.append("is_approved", params.is_approved.toString());

      const response = await api.get<TestimonialsResponse>(
        `/admin/testimonials/?${queryParams.toString()}`,
      );
      set({
        adminTestimonials: response.data.items || [],
        adminTestimonialsTotal: response.data.total || 0,
        adminTestimonialsLoading: false,
      });
    } catch (error: any) {
      set({
        adminTestimonialsError:
          error.response?.data?.detail || "Failed to fetch admin testimonials",
        adminTestimonialsLoading: false,
      });
    }
  },

  fetchAdminUserTestimonials: async (userId: string) => {
    set({
      adminUserTestimonialsLoading: true,
      adminUserTestimonialsError: null,
    });
    try {
      const response = await api.get<Testimonial[]>(
        `/admin/testimonials/user/${userId}`,
      );
      set({
        adminUserTestimonials: response.data,
        adminUserTestimonialsLoading: false,
      });
    } catch (error: any) {
      set({
        adminUserTestimonialsError:
          error.response?.data?.detail || "Failed to fetch user testimonials",
        adminUserTestimonialsLoading: false,
      });
    }
  },

  fetchAdminTestimonial: async (testimonialId: string) => {
    set({
      adminCurrentTestimonialLoading: true,
      adminCurrentTestimonialError: null,
    });
    try {
      const response = await api.get<Testimonial>(
        `/admin/testimonials/${testimonialId}`,
      );
      set({
        adminCurrentTestimonial: response.data,
        adminCurrentTestimonialLoading: false,
      });
    } catch (error: any) {
      set({
        adminCurrentTestimonialError:
          error.response?.data?.detail || "Failed to fetch testimonial",
        adminCurrentTestimonialLoading: false,
      });
    }
  },

  updateAdminTestimonial: async (
    testimonialId,
    testimonialData,
    authorAvatar,
  ) => {
    set({ adminUpdating: true, adminUpdateError: null });
    try {
      const formData = new FormData();
      formData.append("testimonial_data", JSON.stringify(testimonialData));
      if (authorAvatar) {
        formData.append("author_avatar", authorAvatar);
      }

      const response = await api.put<Testimonial>(
        `/admin/testimonials/${testimonialId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      set((state) => ({
        adminTestimonials: state.adminTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        adminUserTestimonials: state.adminUserTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        adminCurrentTestimonial:
          state.adminCurrentTestimonial?.id === testimonialId
            ? response.data
            : state.adminCurrentTestimonial,
        adminUpdating: false,
      }));
    } catch (error: any) {
      set({
        adminUpdateError:
          error.response?.data?.detail || "Failed to update testimonial",
        adminUpdating: false,
      });
    }
  },

  approveAdminTestimonial: async (testimonialId: string) => {
    set({ adminApproving: true, adminApproveError: null });
    try {
      const response = await api.post<Testimonial>(
        `/admin/testimonials/${testimonialId}/approve`,
      );

      set((state) => ({
        adminTestimonials: state.adminTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        adminUserTestimonials: state.adminUserTestimonials.map((t) =>
          t.id === testimonialId ? response.data : t,
        ),
        adminCurrentTestimonial:
          state.adminCurrentTestimonial?.id === testimonialId
            ? response.data
            : state.adminCurrentTestimonial,
        adminApproving: false,
      }));
    } catch (error: any) {
      set({
        adminApproveError:
          error.response?.data?.detail || "Failed to approve testimonial",
        adminApproving: false,
      });
    }
  },

  deleteAdminTestimonial: async (testimonialId: string) => {
    set({ adminDeleting: true, adminDeleteError: null });
    try {
      await api.delete<DeleteResponse>(`/admin/testimonials/${testimonialId}`);

      set((state) => ({
        adminTestimonials: state.adminTestimonials.filter(
          (t) => t.id !== testimonialId,
        ),
        adminUserTestimonials: state.adminUserTestimonials.filter(
          (t) => t.id !== testimonialId,
        ),
        adminCurrentTestimonial:
          state.adminCurrentTestimonial?.id === testimonialId
            ? null
            : state.adminCurrentTestimonial,
        adminDeleting: false,
      }));
    } catch (error: any) {
      set({
        adminDeleteError:
          error.response?.data?.detail || "Failed to delete testimonial",
        adminDeleting: false,
      });
    }
  },

  deleteAdminUserTestimonials: async (userId: string) => {
    set({
      adminDeletingUserTestimonials: true,
      adminDeleteUserTestimonialsError: null,
    });
    try {
      await api.delete<DeleteResponse>(`/admin/testimonials/user/${userId}`);

      set((state) => ({
        adminTestimonials: state.adminTestimonials.filter(
          (t) => t.user_id !== userId,
        ),
        adminUserTestimonials: [],
        adminDeletingUserTestimonials: false,
      }));
    } catch (error: any) {
      set({
        adminDeleteUserTestimonialsError:
          error.response?.data?.detail || "Failed to delete user testimonials",
        adminDeletingUserTestimonials: false,
      });
    }
  },

  // ==================== UTILITY ====================

  reset: () => {
    set(initialState);
  },
}));
