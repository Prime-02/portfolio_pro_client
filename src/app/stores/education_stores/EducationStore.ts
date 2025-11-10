import { create } from "zustand";
import { EducationProps } from "@/app/components/types and interfaces/EducationsInterface";
import {
  DeleteData,
  GetAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";

interface EducationStore {
  // State
  educations: EducationProps[];
  currentEducation: EducationProps | null;
  error: string | null;

  // Actions
  fetchEducations: (
    accessToken: string,
    setLoading: (key: string) => void
  ) => Promise<void>;
  fetchEducationById: (
    accessToken: string,
    id: string,
    setLoading: (key: string) => void
  ) => Promise<void>;
  setCurrentEducation: (education: EducationProps | null) => void;
  addEducation: (education: EducationProps) => void;
  updateEducation: (
    accessToken: string,
    id: string,
    setLoading: (key: string) => void,
    education: EducationProps,
    successActions: () => void
  ) => Promise<void>;
  deleteEducation: (
    accessToken: string,
    id: string,
    setLoading: (key: string) => void
  ) => void;
  clearError: () => void;
  reset: () => void;
}

export const useEducationStore = create<EducationStore>((set) => ({
  // Initial state
  educations: [],
  currentEducation: null,
  error: null,

  // Fetch all educations
  fetchEducations: async (
    accessToken: string,
    setLoading: (key: string) => void
  ) => {
    setLoading("fetching_educations");
    set({ error: null });
    try {
      const educationsRes: { educations: EducationProps[] } = await GetAllData({
        access: accessToken,
        url: "education",
      });
      if (educationsRes) {
        set({ educations: educationsRes.educations });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch educations",
      });
    } finally {
      setLoading("fetching_educations");
    }
  },

  // Fetch single education by ID
  fetchEducationById: async (
    accessToken: string,
    id: string,
    setLoading: (key: string) => void
  ) => {
    setLoading(`fetching_education_${id}`);
    set({ error: null });
    try {
      const educationRes: EducationProps = await GetAllData({
        access: accessToken,
        url: `education/${id}`,
      });
      set({ currentEducation: educationRes });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch education",
      });
    } finally {
      setLoading(`fetching_education_${id}`);
    }
  },

  // Set current education manually
  setCurrentEducation: (education) => set({ currentEducation: education }),

  // Add new education to the list
  addEducation: (education) =>
    set((state) => ({
      educations: [...state.educations, education],
    })),

  // Update existing education
  updateEducation: async (
    accessToken: string,
    id: string,
    setLoading: (key: string) => void,
    education: EducationProps,
    successActions: () => void
  ) => {
    setLoading(`updating_education_${id}`);
    try {
      const updateRes: EducationProps = await UpdateAllData({
        access: accessToken,
        url: `education/${id}`,
        field: education as Partial<EducationProps>,
      });
      if (updateRes) {
        set((state) => ({
          educations: state.educations.map((edu) =>
            edu.id === id ? education : edu
          ),
          currentEducation:
            state.currentEducation?.id === id
              ? education
              : state.currentEducation,
        }));
        successActions();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(`updating_education_${id}`);
    }
  },

  // Delete education
  deleteEducation: async (
    accessToken: string,
    id: string,
    setLoading: (key: string) => void
  ) => {
    setLoading(`deleting_education_${id}`);
    try {
      const deleteRes = await DeleteData({
        access: accessToken,
        url: `education/${id}`,
      });
      if (deleteRes) {
        set((state) => ({
          educations: state.educations.filter((edu) => edu.id !== id),
          currentEducation:
            state.currentEducation?.id === id ? null : state.currentEducation,
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(`deleting_education_${id}`);
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      educations: [],
      currentEducation: null,
      error: null,
    }),
}));
