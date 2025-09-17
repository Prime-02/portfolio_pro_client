import { create } from "zustand";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { generateQueryParams } from "@/app/components/utilities/syncFunctions/syncs";
import { toast } from "@/app/components/toastify/Toastify";
import { AllProjectsDisplayCardProps } from "@/app/components/types and interfaces/ProjectsAndPortfolios";

interface AllProjectsDisplayProps {
  projects: AllProjectsDisplayCardProps[];
  total: number;
}

interface ProjectsStore {
  // Existing state
  projectsNames: string[];

  // New state for projects data
  projects: AllProjectsDisplayProps;
  page: number;
  isLoadingMore: boolean;

  // Existing methods
  toggleProjectName: (name: string) => void;
  addProjectName: (name: string) => void;
  removeProjectName: (name: string) => void;
  clearProjectsNames: () => void;

  // New methods
  setProjects: (projects: AllProjectsDisplayProps) => void;
  setPage: (page: number) => void;
  setIsLoadingMore: (loading: boolean) => void;
  getAllProjects: (params: {
    accessToken: string;
    setLoading: (loading: string) => void;
    filter?: string;
    query?: string;
    sort?: string;
    sortDirection?: string;
    pageNum?: number;
    append?: boolean;
  }) => Promise<void>;
  handleLoadMore: (params: {
    accessToken: string;
    setLoading: (loading: string) => void;
    filter?: string;
    query?: string;
    sort?: string;
    sortDirection?: string;
  }) => Promise<void>;
}

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  // Existing state
  projectsNames: [],

  // New state
  projects: {
    projects: [],
    total: 0,
  },
  page: 1,
  isLoadingMore: false,

  // Existing methods
  toggleProjectName: (name: string) => {
    set((state) => {
      const exists = state.projectsNames.includes(name);
      if (exists) {
        return {
          projectsNames: state.projectsNames.filter(
            (project) => project !== name
          ),
        };
      } else {
        return { projectsNames: [...state.projectsNames, name] };
      }
    });
  },

  addProjectName: (name: string) => {
    set((state) => {
      if (!state.projectsNames.includes(name)) {
        return { projectsNames: [...state.projectsNames, name] };
      }
      return state; // No change if already exists
    });
  },

  removeProjectName: (name: string) => {
    set((state) => ({
      projectsNames: state.projectsNames.filter((project) => project !== name),
    }));
  },

  clearProjectsNames: () => {
    set({ projectsNames: [] });
  },

  // New methods
  setProjects: (projects: AllProjectsDisplayProps) => {
    set({ projects });
  },

  setPage: (page: number) => {
    set({ page });
  },

  setIsLoadingMore: (isLoadingMore: boolean) => {
    set({ isLoadingMore });
  },

  getAllProjects: async ({
    accessToken,
    setLoading,
    filter,
    query,
    sort,
    sortDirection,
    pageNum = 1,
    append = false,
  }) => {
    const state = get();

    try {
      if (append) {
        set({ isLoadingMore: true });
      } else {
        setLoading("fetching_projects");
      }

      const projectRes: AllProjectsDisplayProps = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/me${generateQueryParams({
          filter_platform: filter,
          query: query,
          sort: sort,
          sort_direction: sortDirection,
          page: pageNum,
          size: 25,
        })}`,
      });

      if (projectRes) {
        set({
          projects: {
            ...projectRes, // Use the new response data for metadata
            projects: append
              ? [...state.projects.projects, ...projectRes.projects]
              : projectRes.projects,
          },
        });

        // Update page state when appending
        if (append) {
          set({ page: pageNum });
        }
      } else {
        toast.error(
          "We couldn't fetch your github projects please try again.",
          {
            title: "Error fetching projects preview",
          }
        );
      }
    } catch (error) {
      console.log(
        "Something went wrong while fetching this user's projects: ",
        error
      );
      toast.error("We couldn't fetch your projects please try again.", {
        title: "Error fetching projects",
      });
    } finally {
      if (append) {
        set({ isLoadingMore: false });
      } else {
        setLoading("fetching_projects");
      }
    }
  },

  handleLoadMore: async ({
    accessToken,
    setLoading,
    filter,
    query,
    sort,
    sortDirection,
  }) => {
    const state = get();
    const nextPage = state.page + 1;
    await state.getAllProjects({
      accessToken,
      setLoading,
      filter,
      query,
      sort,
      sortDirection,
      pageNum: nextPage,
      append: true,
    });
  },
}));
