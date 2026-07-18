// src/stores/usePortfolioStore.ts

import { create } from "zustand";
import { api } from "@/lib/client/api";
import { PortfolioThemeData } from "@/portfolio-builder/hooks/usePortfolioTheme";
import { useCloudinaryCore } from "@/lib/stores/cloudinary";
import { UserResponse } from "@/lib/stores/user/useUserAccountStore";

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
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the Cloudinary public_id from a secure_url.
 *
 * URL pattern:
 *   https://res.cloudinary.com/<cloud_name>/<resource_type>/upload[/v<version>]/<public_id>.<ext>
 *
 * Returns the public_id (including folder path) without the file extension.
 */
function extractCloudinaryPublicId(secureUrl: string | null): string | null {
  if (!secureUrl) return null;

  // Match everything after /upload/ or /upload/vNNNNNNNNNN/ up to the last dot before extension
  const match = secureUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match?.[1] ?? null;
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

  /**
   * Synchronously updates layout.theme inside currentPortfolio (and the
   * matching entry in portfolios[]) without touching the API. Use this for
   * live-preview changes (ThemeTab color picker, ThemeToggle variant switch)
   * that should be held locally until the user clicks "Save Layout".
   */
  updateThemeLocally: (
    portfolioSlug: string,
    theme: Partial<PortfolioThemeData>,
  ) => void;

  /**
   * Synchronously replaces layout.sections inside currentPortfolio (and the
   * matching entry in portfolios[]) without touching the API. Use this for
   * add/remove-section edits in the layout editor that should be held
   * locally until the user clicks "Save Layout" (updatePortfolio).
   */
  updateSectionsLocally: (
    portfolioSlug: string,
    sections: Record<string, unknown>[],
  ) => void;

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
    // Optimistic update — apply locally before the round-trip so the UI
    // reflects the change immediately without waiting for the API response.
    const previousState = get();
    set((state) => ({
      isLoading: true,
      error: null,
      portfolios: state.portfolios.map((p) =>
        p.id === portfolioId ? { ...p, ...data } : p,
      ),
      currentPortfolio:
        state.currentPortfolio?.id === portfolioId
          ? { ...state.currentPortfolio, ...data }
          : state.currentPortfolio,
    }));
    try {
      const response = await api.put<PortfolioResponse>(
        `/portfolios/${portfolioId}`,
        data,
      );
      const updated = response.data;
      // Reconcile with the authoritative server response (e.g. updated_at, slug)
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
      // Rollback to state before the optimistic update
      set({
        portfolios: previousState.portfolios,
        currentPortfolio: previousState.currentPortfolio,
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to update portfolio",
      });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /portfolios/{portfolio_id}
  // ------------------------------------------------------------------
  // Deletes the portfolio's cover image from Cloudinary before removing
  // the portfolio itself, preventing orphaned assets.
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
  // updateThemeLocally — no API call, no loading flag.
  // Deep-merges `theme` into layout.theme of the matching portfolio so
  // ThemeToggle and ThemeTab stay in sync through the store without an
  // extra round-trip. The caller is responsible for persisting via
  // updatePortfolio (triggered by "Save Layout").
  // ------------------------------------------------------------------
  updateThemeLocally: (portfolioSlug, theme) => {
    const mergeTheme = (portfolio: PortfolioResponse): PortfolioResponse => {
      const currentTheme =
        (portfolio.layout?.theme as PortfolioThemeData | undefined) ?? {};
      return {
        ...portfolio,
        layout: {
          ...portfolio.layout,
          theme: { ...currentTheme, ...theme },
        },
      };
    };

    set((state) => ({
      portfolios: state.portfolios.map((p) =>
        p.slug === portfolioSlug ? mergeTheme(p) : p,
      ),
      currentPortfolio:
        state.currentPortfolio?.slug === portfolioSlug
          ? mergeTheme(state.currentPortfolio)
          : state.currentPortfolio,
    }));
  },

  // ------------------------------------------------------------------
  // updateSectionsLocally — no API call, no loading flag.
  // Replaces layout.sections of the matching portfolio so add/remove
  // section edits in the layout editor reflect immediately. The caller
  // is responsible for persisting via updatePortfolio (triggered by
  // "Save Layout"), same contract as updateThemeLocally.
  // ------------------------------------------------------------------
  updateSectionsLocally: (portfolioSlug, sections) => {
    const mergeSections = (
      portfolio: PortfolioResponse,
    ): PortfolioResponse => ({
      ...portfolio,
      layout: {
        ...portfolio.layout,
        sections,
      },
    });

    if (get().currentPortfolio?.slug !== portfolioSlug) {
      console.warn(
        `updateSectionsLocally: no currentPortfolio matched slug "${portfolioSlug}" — sections were not applied.`,
      );
    }

    set((state) => ({
      portfolios: state.portfolios.map((p) =>
        p.slug === portfolioSlug ? mergeSections(p) : p,
      ),
      currentPortfolio:
        state.currentPortfolio?.slug === portfolioSlug
          ? mergeSections(state.currentPortfolio)
          : state.currentPortfolio,
    }));
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
