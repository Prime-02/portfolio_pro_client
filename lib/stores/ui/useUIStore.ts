import { create } from "zustand";

type LoadingKey = string;

interface UIStore {
  loadingCounts: Record<LoadingKey, number>;
  viewportWidth: number;

  // Viewport breakpoint booleans
  isMobile: boolean; // < 640px
  isTablet: boolean; // >= 640px && < 1024px
  isDesktop: boolean; // >= 1024px
  isSmallMobile: boolean; // < 375px

  // Mobile menu state
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: (isOpen?: boolean) => void;

  // Navigation sidebar state (for desktop hover expand)
  isSidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;

  startLoading: (key: LoadingKey) => void;
  stopLoading: (key: LoadingKey) => void;
  setLoading: (key: LoadingKey, isLoading: boolean) => void;
  isLoading: (key: LoadingKey | LoadingKey[]) => boolean;
  isAnythingLoading: () => boolean;
  setViewportWidth: (value: number) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  loadingCounts: {},
  viewportWidth: 0,

  // Initialize breakpoints
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isSmallMobile: false,

  // Mobile menu state
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: (isOpen) =>
    set((state) => ({
      mobileMenuOpen: isOpen !== undefined ? isOpen : !state.mobileMenuOpen,
    })),

  // Sidebar expanded state
  isSidebarExpanded: false,
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),

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
      if (current <= 0) return state;

      const newCount = current - 1;
      if (newCount === 0) {
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

  setViewportWidth: (value) =>
    set({
      viewportWidth: value,
      isMobile: value < 640,
      isTablet: value >= 640 && value < 1024,
      isDesktop: value >= 1024,
      isSmallMobile: value < 375,
    }),
}));
