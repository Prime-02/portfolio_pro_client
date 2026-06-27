// src/stores/usePortfolioStore.ts

import { create } from "zustand";
import { api } from "@/lib/client/api";
import { UserResponse } from "@/lib/stores/user/useUserSettings";

// ---------------------------------------------------------------------------
// Types — derived from schemas.py
// ---------------------------------------------------------------------------

export interface PortfolioCreate {
  name: string;
  description?: string;
  is_public?: boolean;
  is_default?: boolean;
  cover_image_url?: string;
  layout?: Record<string, unknown>;
}

export interface PortfolioUpdate {
  name?: string;
  description?: string;
  is_public?: boolean;
  is_default?: boolean;
  cover_image_url?: string;
  layout?: Record<string, unknown>;
}

export interface PortfolioResponse {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  is_default: boolean;
  cover_image_url: string | null;
  layout: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  projects: unknown[]; // PortfolioProjectResponse[]
  project_count: number;
  creator: UserResponse | null; // UserResponse | null
  cover_image_thumbnail: string | null;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface PortfolioState {
  // Data
  portfolios: PortfolioResponse[];
  currentPortfolio: PortfolioResponse | null;
  publicPortfolios: PortfolioResponse[];

  // Loading / error
  isLoading: boolean;
  error: string | null;

  // Actions — mirroring portfolio routes
  createPortfolio: (data: PortfolioCreate) => Promise<PortfolioResponse>;
  fetchMyPortfolios: (
    skip?: number,
    limit?: number,
  ) => Promise<PortfolioResponse[]>;
  fetchPublicPortfolios: (
    skip?: number,
    limit?: number,
  ) => Promise<PortfolioResponse[]>;
  fetchPublicPortfolioBySlug: (slug: string) => Promise<PortfolioResponse>;
  fetchPortfolioById: (portfolioId: string) => Promise<PortfolioResponse>;
  updatePortfolio: (
    portfolioId: string,
    data: PortfolioUpdate,
  ) => Promise<PortfolioResponse>;
  deletePortfolio: (portfolioId: string) => Promise<void>;

  // Helpers
  clearError: () => void;
  clearCurrentPortfolio: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePortfolioStore = create<PortfolioState>()((set, get) => ({
  // Defaults
  portfolios: [],
  currentPortfolio: null,
  publicPortfolios: [],
  isLoading: false,
  error: null,

  // ------------------------------------------------------------------
  // POST /portfolios/
  // ------------------------------------------------------------------
  createPortfolio: async (data: PortfolioCreate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<PortfolioResponse>("/portfolios/", data);
      const newPortfolio = response.data;
      set((state) => ({
        portfolios: [...state.portfolios, newPortfolio],
        currentPortfolio: newPortfolio,
        isLoading: false,
      }));
      return newPortfolio;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create portfolio";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /portfolios/my/portfolios
  // ------------------------------------------------------------------
  fetchMyPortfolios: async (skip: number = 0, limit: number = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PortfolioResponse[]>(
        "/portfolios/my/portfolios",
        { params: { skip, limit } },
      );
      set({ portfolios: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch portfolios";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /portfolios/public
  // ------------------------------------------------------------------
  fetchPublicPortfolios: async (skip: number = 0, limit: number = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PortfolioResponse[]>(
        "/portfolios/public",
        { params: { skip, limit } },
      );
      set({ publicPortfolios: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch public portfolios";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /portfolios/public/{slug}
  // ------------------------------------------------------------------
  fetchPublicPortfolioBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PortfolioResponse>(
        `/portfolios/public/${slug}`,
      );
      set({ currentPortfolio: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch portfolio";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /portfolios/{portfolio_id}
  // ------------------------------------------------------------------
  fetchPortfolioById: async (portfolioId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PortfolioResponse>(
        `/portfolios/${portfolioId}`,
      );
      set({ currentPortfolio: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch portfolio";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // PUT /portfolios/{portfolio_id}
  // ------------------------------------------------------------------
  updatePortfolio: async (portfolioId: string, data: PortfolioUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<PortfolioResponse>(
        `/portfolios/${portfolioId}`,
        data,
      );
      const updated = response.data;
      set((state) => ({
        portfolios: state.portfolios.map((p) =>
          p.id === portfolioId ? updated : p,
        ),
        currentPortfolio:
          state.currentPortfolio?.id === portfolioId
            ? updated
            : state.currentPortfolio,
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update portfolio";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /portfolios/{portfolio_id}
  // ------------------------------------------------------------------
  deletePortfolio: async (portfolioId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/portfolios/${portfolioId}`);
      set((state) => ({
        portfolios: state.portfolios.filter((p) => p.id !== portfolioId),
        currentPortfolio:
          state.currentPortfolio?.id === portfolioId
            ? null
            : state.currentPortfolio,
        isLoading: false,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete portfolio";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  clearError: () => set({ error: null }),

  clearCurrentPortfolio: () => set({ currentPortfolio: null }),

  reset: () =>
    set({
      portfolios: [],
      currentPortfolio: null,
      publicPortfolios: [],
      isLoading: false,
      error: null,
    }),
}));
