import { toast } from "@/app/components/toastify/Toastify";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface PlatformProjectStats {
  [key: string]: number;
}

export interface ProjectStatisticsState {
  // Project statistics - using exact response field names
  total_projects: number;
  public_projects: number;
  private_projects: number;
  completed_projects: number;
  active_projects: number;
  concept_projects: number;
  linked_platforms: string[];
  platform_projects: PlatformProjectStats;

  // Single action to update all values
  updateAllStats: (newStats: Partial<ProjectStatisticsState>) => void;
}

export const useProjectStatisticsStore = create<ProjectStatisticsState>()(
  devtools(
    (set) => ({
      // Initial project statistics
      total_projects: 0,
      public_projects: 0,
      private_projects: 0,
      completed_projects: 0,
      active_projects: 0,
      concept_projects: 0,
      linked_platforms: [],
      platform_projects: {},

      // Single function to update all statistics
      updateAllStats: (newStats) => set((state) => ({ ...state, ...newStats })),
    }),
    { name: "ProjectStatisticsStore" }
  )
);

// Export the hook separately
export const useLoadProjectStats = () => {
  const { setLoading, accessToken } = useGlobalState();
  const updateAllStats = useProjectStatisticsStore(
    (state) => state.updateAllStats
  );

  return async () => {
    setLoading("loading_project_stats");
    try {
      const statsRes: ProjectStatisticsState = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/stats`,
      });

      if (statsRes) {
        console.log(statsRes);
        updateAllStats(statsRes);
      } else {
        toast.error(
          "Your Projects statistics could not be loaded, please try again"
        );
      }
    } catch (error) {
      toast.error(
        "An error occurred while loading your projects statistics. If this error occurs, please contact our support team."
      );
      console.log("Failed to load stats: ", error);
    } finally {
      setLoading("loading_project_stats");
    }
  };
};
