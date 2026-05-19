import { create } from "zustand";

type LoadingKey = string; // Or use template literals for stricter typing

interface UIStore {
  loadingCounts: Record<LoadingKey, number>;
  viewportWidth: number;

  startLoading: (key: LoadingKey) => void;
  stopLoading: (key: LoadingKey) => void;
  setLoading: (key: LoadingKey, isLoading: boolean) => void; // Convenience
  isLoading: (key: LoadingKey | LoadingKey[]) => boolean;
  isAnythingLoading: () => boolean;
  setViewportWidth: (value: number) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  loadingCounts: {},
  viewportWidth: 0,

  startLoading: (key) =>
    set((state) => ({
      loadingCounts: {
        ...state.loadingCounts,
        [key]: (state.loadingCounts[key] || 0) + 1,
      },
    })),

  stopLoading: (key) =>
    set((state) => {
      const current = state.loadingCounts[key] || 0;
      if (current <= 0) return state; // Prevent negative counts

      const newCount = current - 1;
      if (newCount === 0) {
        // Remove key entirely to keep state clean
        const { [key]: _, ...rest } = state.loadingCounts;
        return { loadingCounts: rest };
      }

      return {
        loadingCounts: {
          ...state.loadingCounts,
          [key]: newCount,
        },
      };
    }),

  // Convenience method for simple toggle cases
  setLoading: (key, isLoading) => {
    if (isLoading) {
      get().startLoading(key);
    } else {
      get().stopLoading(key);
    }
  },

  isLoading: (key) => {
    const { loadingCounts } = get();
    if (typeof key === "string") return (loadingCounts[key] || 0) > 0;
    return key.some((k) => (loadingCounts[k] || 0) > 0);
  },

  isAnythingLoading: () => {
    return Object.values(get().loadingCounts).some((count) => count > 0);
  },

  setViewportWidth: (value) => set({ viewportWidth: value }),
}));
