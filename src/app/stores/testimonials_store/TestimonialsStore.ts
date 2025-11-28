import { create } from "zustand";
import {
  TestimonialsProps,
  TestimonialCreate,
  TestimonialUpdate,
  TestimonialStats,
  TestimonialSummary,
} from "@/app/components/types and interfaces/Testimonials";
import {
  DeleteData,
  GetAllData,
  PostAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";

interface TestimonialsStore {
  // State
  testimonials: TestimonialsProps[];
  currentTestimonial: TestimonialsProps | null;
  testimonialStats: TestimonialStats | null;
  testimonialSummary: TestimonialSummary | null;
  myAuthoredTestimonials: TestimonialsProps[];
  error: string | null;

  // Actions
  fetchTestimonials: (
    accessToken: string,
    setLoading: (key: string) => void,
    currentUser: string
  ) => Promise<void>;
  fetchAllTestimonials: (
    accessToken: string,
    setLoading: (key: string) => void,
    skip?: number,
    limit?: number
  ) => Promise<void>;
  fetchMyAuthoredTestimonials: (
    accessToken: string,
    setLoading: (key: string) => void,
    skip?: number,
    limit?: number
  ) => Promise<void>;
  fetchTestimonialById: (
    accessToken: string,
    id: string,
    setLoading: (key: string) => void
  ) => Promise<void>;
  fetchTestimonialStats: (
    accessToken: string,
    username: string,
    setLoading: (key: string) => void
  ) => Promise<void>;
  fetchTestimonialSummary: (
    accessToken: string,
    username: string,
    setLoading: (key: string) => void
  ) => Promise<void>;
  searchTestimonials: (
    accessToken: string,
    query: string,
    setLoading: (key: string) => void,
    skip?: number,
    limit?: number
  ) => Promise<void>;
  setCurrentTestimonial: (testimonial: TestimonialsProps | null) => void;
  addTestimonial: (
    accessToken: string,
    setLoading: (key: string) => void,
    testimonial: TestimonialCreate,
    successActions: () => void
  ) => Promise<void>;
  updateTestimonial: (
    accessToken: string,
    id: string,
    setLoading: (key: string) => void,
    testimonial: TestimonialUpdate,
    successActions: () => void
  ) => Promise<void>;
  deleteTestimonial: (
    accessToken: string,
    id: string,
    username: string,
    setLoading: (key: string) => void,
    successActions?: () => void
  ) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useTestimonialsStore = create<TestimonialsStore>((set) => ({
  // Initial state
  testimonials: [],
  currentTestimonial: null,
  testimonialStats: null,
  testimonialSummary: null,
  myAuthoredTestimonials: [],
  error: null,

  // Fetch user testimonials (testimonials received by a user)
  fetchTestimonials: async (
    accessToken: string,
    setLoading: (key: string) => void,
    currentUser: string
  ) => {
    setLoading("fetching_testimonials");
    set({ error: null });
    const url = `testimonials/user/${currentUser}`;
    try {
      const testimonialsRes: TestimonialsProps[] = await GetAllData({
        access: accessToken,
        url: url,
      });
      if (testimonialsRes) {
        set({ testimonials: testimonialsRes });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch testimonials",
      });
    } finally {
      setLoading("fetching_testimonials");
    }
  },

  // Fetch all testimonials (public access)
  fetchAllTestimonials: async (
    accessToken: string,
    setLoading: (key: string) => void,
    skip: number = 0,
    limit: number = 100
  ) => {
    setLoading("fetching_all_testimonials");
    set({ error: null });
    try {
      const testimonialsRes: TestimonialsProps[] = await GetAllData({
        access: accessToken,
        url: `testimonials/?skip=${skip}&limit=${limit}`,
      });
      if (testimonialsRes) {
        set({ testimonials: testimonialsRes });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch all testimonials",
      });
    } finally {
      setLoading("fetching_all_testimonials");
    }
  },

  // Fetch testimonials authored by current user
  fetchMyAuthoredTestimonials: async (
    accessToken: string,
    setLoading: (key: string) => void,
    skip: number = 0,
    limit: number = 100
  ) => {
    setLoading("fetching_my_authored");
    set({ error: null });
    try {
      const testimonialsRes: TestimonialsProps[] = await GetAllData({
        access: accessToken,
        url: `testimonials/my-authored?skip=${skip}&limit=${limit}`,
      });
      if (testimonialsRes) {
        set({ myAuthoredTestimonials: testimonialsRes });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch authored testimonials",
      });
    } finally {
      setLoading("fetching_my_authored");
    }
  },

  // Fetch single testimonial by ID
  fetchTestimonialById: async (
    accessToken: string,
    id: string,
    setLoading: (key: string) => void
  ) => {
    setLoading(`fetching_testimonial_${id}`);
    set({ error: null });
    try {
      const testimonialRes: TestimonialsProps = await GetAllData({
        access: accessToken,
        url: `testimonials/${id}`,
      });
      set({ currentTestimonial: testimonialRes });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch testimonial",
      });
    } finally {
      setLoading(`fetching_testimonial_${id}`);
    }
  },

  // Fetch testimonial statistics for a user
  fetchTestimonialStats: async (
    accessToken: string,
    username: string,
    setLoading: (key: string) => void
  ) => {
    setLoading(`fetching_stats_${username}`);
    set({ error: null });
    try {
      const statsRes: TestimonialStats = await GetAllData({
        access: accessToken,
        url: `testimonials/user/${username}/stats`,
      });
      if (statsRes) {
        set({ testimonialStats: statsRes });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch testimonial stats",
      });
    } finally {
      setLoading(`fetching_stats_${username}`);
    }
  },

  // Fetch testimonial summary (stats + recent testimonials)
  fetchTestimonialSummary: async (
    accessToken: string,
    username: string,
    setLoading: (key: string) => void
  ) => {
    setLoading(`fetching_summary_${username}`);
    set({ error: null });
    try {
      const summaryRes: TestimonialSummary = await GetAllData({
        access: accessToken,
        url: `testimonials/user/${username}/summary`,
      });
      if (summaryRes) {
        set({ testimonialSummary: summaryRes });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch testimonial summary",
      });
    } finally {
      setLoading(`fetching_summary_${username}`);
    }
  },

  // Search testimonials
  searchTestimonials: async (
    accessToken: string,
    query: string,
    setLoading: (key: string) => void,
    skip: number = 0,
    limit: number = 100
  ) => {
    setLoading("searching_testimonials");
    set({ error: null });
    try {
      const testimonialsRes: TestimonialsProps[] = await GetAllData({
        access: accessToken,
        url: `testimonials/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`,
      });
      if (testimonialsRes) {
        set({ testimonials: testimonialsRes });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to search testimonials",
      });
    } finally {
      setLoading("searching_testimonials");
    }
  },

  // Set current testimonial manually
  setCurrentTestimonial: (testimonial) =>
    set({ currentTestimonial: testimonial }),

  // Add new testimonial
  addTestimonial: async (
    accessToken: string,
    setLoading: (key: string) => void,
    testimonial: TestimonialCreate,
    successActions: () => void
  ) => {
    setLoading(`uploading_testimonial`);
    set({ error: null });
    try {
      const uploadRes: TestimonialsProps = await PostAllData({
        access: accessToken,
        url: "testimonials",
        data: testimonial,
      });
      if (uploadRes) {
        set((state) => ({
          testimonials: [uploadRes, ...state.testimonials], // Add to beginning
          myAuthoredTestimonials: [uploadRes, ...state.myAuthoredTestimonials],
        }));
        successActions();
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add testimonial",
      });
      console.log(error);
    } finally {
      setLoading(`uploading_testimonial`);
    }
  },

  // Update existing testimonial
  updateTestimonial: async (
    accessToken: string,
    id: string,
    setLoading: (key: string) => void,
    testimonial: TestimonialUpdate,
    successActions: () => void
  ) => {
    setLoading(`updating_testimonial_${id}`);
    set({ error: null });
    try {
      const updateRes: TestimonialsProps = await UpdateAllData({
        access: accessToken,
        url: `testimonials/${id}`,
        field: testimonial as Partial<TestimonialsProps>,
      });
      if (updateRes) {
        set((state) => ({
          testimonials: state.testimonials.map((test) =>
            test.id === id ? updateRes : test
          ),
          myAuthoredTestimonials: state.myAuthoredTestimonials.map((test) =>
            test.id === id ? updateRes : test
          ),
          currentTestimonial:
            state.currentTestimonial?.id === id
              ? updateRes
              : state.currentTestimonial,
        }));
        successActions();
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update testimonial",
      });
      console.log(error);
    } finally {
      setLoading(`updating_testimonial_${id}`);
    }
  },

  // Delete testimonial
  deleteTestimonial: async (
    accessToken: string,
    id: string,
    username: string,
    setLoading: (key: string) => void,
    successActions?: () => void
  ) => {
    setLoading(`deleting_testimonial_${id}`);
    set({ error: null });
    try {
      const deleteRes = await DeleteData({
        access: accessToken,
        url: `testimonials/${id}?username=${username}`,
      });
      if (deleteRes) {
        set((state) => ({
          testimonials: state.testimonials.filter((test) => test.id !== id),
          myAuthoredTestimonials: state.myAuthoredTestimonials.filter(
            (test) => test.id !== id
          ),
          currentTestimonial:
            state.currentTestimonial?.id === id
              ? null
              : state.currentTestimonial,
        }));
        if (successActions) {
          successActions();
        }
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete testimonial",
      });
      console.log(error);
    } finally {
      setLoading(`deleting_testimonial_${id}`);
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      testimonials: [],
      currentTestimonial: null,
      testimonialStats: null,
      testimonialSummary: null,
      myAuthoredTestimonials: [],
      error: null,
    }),
}));
