import { create } from "zustand";
import { api } from "@/lib/client/api";

// Types
interface UserTheme {
  id: string;
  name: string;
  loader?: string;
  theme?: string;
  primary_theme?: string;
  secondary_theme?: string;
  accent?: string;
  primary_theme_dark?: string;
  secondary_theme_dark?: string;
  layout_style?: string;
  user_id?: string;
}

interface CreateUserTheme {
  name: string;
  loader?: string;
  theme?: string;
  primary_theme?: string;
  secondary_theme?: string;
  accent?: string;
  primary_theme_dark?: string;
  secondary_theme_dark?: string;
  layout_style?: string;
}

interface UpdateUserTheme extends Partial<CreateUserTheme> {
  name: string;
}

interface UserThemeStore {
  // State
  themes: UserTheme[];
  currentTheme: UserTheme | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchThemes: () => Promise<void>;
  fetchTheme: (themeId: string) => Promise<void>;
  createTheme: (theme: CreateUserTheme) => Promise<UserTheme>;
  updateTheme: (themeId: string, theme: UpdateUserTheme) => Promise<UserTheme>;
  deleteTheme: (themeId: string) => Promise<void>;
  setCurrentTheme: (theme: UserTheme | null) => void;

  // Admin actions
  adminFetchUserThemes: (userId: string) => Promise<void>;
  adminDeleteTheme: (themeId: string) => Promise<void>;

  // Utility
  clearError: () => void;
  reset: () => void;
}

// Default theme values
const defaultTheme: CreateUserTheme = {
  name: "Default",
  primary_theme: "#171717",
  secondary_theme: "#ffffff",
  accent: "#737373",
  primary_theme_dark: "#ededed",
  secondary_theme_dark: "#000000",
};

export const useUserThemeStore = create<UserThemeStore>((set, get) => ({
  // Initial state
  themes: [],
  currentTheme: null,
  isLoading: false,
  error: null,

  // Fetch all themes for current user
  fetchThemes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/themes");
      set({ themes: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch themes",
        isLoading: false,
      });
    }
  },

  // Fetch a specific theme
  fetchTheme: async (themeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/themes/${themeId}`);
      set({ currentTheme: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch theme",
        isLoading: false,
      });
    }
  },

  // Create a new theme
  createTheme: async (theme: CreateUserTheme) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/themes", theme);
      const newTheme = response.data;
      set((state) => ({
        themes: [...state.themes, newTheme],
        isLoading: false,
      }));
      return newTheme;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to create theme",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update an existing theme
  updateTheme: async (themeId: string, theme: UpdateUserTheme) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/themes/${themeId}`, theme);
      const updatedTheme = response.data;
      set((state) => ({
        themes: state.themes.map((t) => (t.id === themeId ? updatedTheme : t)),
        currentTheme:
          state.currentTheme?.id === themeId
            ? updatedTheme
            : state.currentTheme,
        isLoading: false,
      }));
      return updatedTheme;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to update theme",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete a theme
  deleteTheme: async (themeId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/themes/${themeId}`);
      set((state) => ({
        themes: state.themes.filter((t) => t.id !== themeId),
        currentTheme:
          state.currentTheme?.id === themeId ? null : state.currentTheme,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to delete theme",
        isLoading: false,
      });
      throw error;
    }
  },

  // Set current theme
  setCurrentTheme: (theme: UserTheme | null) => {
    set({ currentTheme: theme });
  },

  // Admin: Fetch themes for a specific user
  adminFetchUserThemes: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/themes/admin/user/${userId}`);
      set({ themes: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch user themes",
        isLoading: false,
      });
    }
  },

  // Admin: Delete any user's theme
  adminDeleteTheme: async (themeId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/themes/admin/${themeId}`);
      set((state) => ({
        themes: state.themes.filter((t) => t.id !== themeId),
        currentTheme:
          state.currentTheme?.id === themeId ? null : state.currentTheme,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to delete theme",
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Reset entire store
  reset: () => {
    set({
      themes: [],
      currentTheme: null,
      isLoading: false,
      error: null,
    });
  },
}));

// Custom hook for applying theme to the DOM
export const useApplyTheme = () => {
  const { currentTheme } = useUserThemeStore();

  const applyTheme = (theme?: UserTheme) => {
    const themeToApply = theme || currentTheme;
    if (!themeToApply) return;

    const root = document.documentElement;

    // Apply CSS custom properties
    if (themeToApply.primary_theme) {
      root.style.setProperty("--primary-theme", themeToApply.primary_theme);
    }
    if (themeToApply.secondary_theme) {
      root.style.setProperty("--secondary-theme", themeToApply.secondary_theme);
    }
    if (themeToApply.accent) {
      root.style.setProperty("--accent", themeToApply.accent);
    }
    if (themeToApply.primary_theme_dark) {
      root.style.setProperty(
        "--primary-theme-dark",
        themeToApply.primary_theme_dark,
      );
    }
    if (themeToApply.secondary_theme_dark) {
      root.style.setProperty(
        "--secondary-theme-dark",
        themeToApply.secondary_theme_dark,
      );
    }

    // Apply theme mode
    if (themeToApply.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (themeToApply.theme === "light") {
      document.documentElement.classList.remove("dark");
    }
    // For "system", you might want to check system preference
  };

  return { applyTheme };
};
