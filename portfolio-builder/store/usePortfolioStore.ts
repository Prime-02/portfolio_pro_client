// src/stores/usePortfolioStore.ts

import { create } from "zustand";
import { api, sendKeepaliveRequest } from "@/lib/client/api";
import { PortfolioThemeData } from "@/portfolio-builder/hooks/usePortfolioTheme";
import { useCloudinaryCore } from "@/lib/stores/cloudinary";
import { UserResponse } from "@/lib/stores/user/useUserAccountStore";
import { LayoutData } from "@/portfolio-builder/types/layout";

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
   * that should be held locally until the next autosave flush.
   */
  updateThemeLocally: (
    portfolioSlug: string,
    theme: Partial<PortfolioThemeData>,
  ) => void;

  /**
   * Synchronously replaces layout.sections inside currentPortfolio (and the
   * matching entry in portfolios[]) without touching the API. Use this for
   * add/remove-section edits in the layout editor that should be held
   * locally until the next autosave flush (or the explicit "Save Layout"
   * action for navbar/footer structure).
   */
  updateSectionsLocally: (
    portfolioSlug: string,
    sections: Record<string, unknown>[],
  ) => void;

  /**
   * Synchronously merges `data` into a single section of
   * currentPortfolio.layout.sections (and the matching entry in
   * portfolios[]) without touching the API. This is the write path for
   * every editor's onChange now that editors are pure controlled
   * components — PortfolioMain is the only thing that persists to the
   * server, via its own interval/manual/unmount-triggered flush.
   */
  updateSectionDataLocally: (
    portfolioSlug: string,
    sectionType: string,
    data: Record<string, unknown>,
  ) => void;

  /**
   * Synchronously merges `data` into layout.layout (navbar/footer/
   * pageBackground) of currentPortfolio (and the matching entry in
   * portfolios[]) without touching the API. This is the write path for
   * LayoutEditor now that it's a pure controlled component — it never
   * saves anything itself. PortfolioMain is the only thing that persists
   * to the server, via its own interval/manual/unmount-triggered flush,
   * same contract as updateSectionDataLocally.
   */
  updateLayoutDataLocally: (portfolioSlug: string, data: LayoutData) => void;

  /**
   * Fire-and-forget PUT for beforeunload/page-teardown. Bypasses the normal
   * `updatePortfolio` (axios) path — axios can't do keepalive requests, and
   * beforeunload handlers can't reliably await a promise anyway. Not part
   * of the optimistic-update contract: no local state mutation, no
   * isLoading flag, nothing to roll back. It's purely "try to get this out
   * the door before the tab dies."
   */
  savePortfolioOnUnload: (portfolioId: string, data: PortfolioUpdate) => void;

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
      // Reconcile with the authoritative server response (e.g. updated_at,
      // slug) — but NOT `layout`. `updated.layout` is just an echo of the
      // snapshot we sent at request-start time; the store's live layout is
      // always at least as fresh (the user may have kept editing while this
      // PUT was in flight via updateSectionDataLocally/updateLayoutDataLocally/
      // updateSectionsLocally). Blindly taking `updated` here would clobber
      // those in-flight edits with the stale snapshot. `layout` is a
      // one-way street: the store is the source of truth for it, the
      // server response never overwrites it.
      set((state) => ({
        portfolios: state.portfolios.map((p) =>
          p.id === portfolioId ? { ...updated, layout: p.layout } : p,
        ),
        currentPortfolio:
          state.currentPortfolio?.id === portfolioId
            ? { ...updated, layout: state.currentPortfolio.layout }
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
  // extra round-trip. The caller is responsible for persisting via the
  // autosave flush in PortfolioMain.
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
  // is responsible for persisting via the autosave flush in PortfolioMain,
  // same contract as updateThemeLocally.
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
  // updateSectionDataLocally — no API call, no loading flag.
  // Single-section-granularity counterpart to updateSectionsLocally.
  // Every editor's onChange now flows here directly: it's the live,
  // optimistic source of truth that PortfolioMain's renderers read from
  // and that its autosave flush eventually persists.
  // ------------------------------------------------------------------
  updateSectionDataLocally: (portfolioSlug, sectionType, data) => {
    const mergeSection = (portfolio: PortfolioResponse): PortfolioResponse => {
      const sections =
        (portfolio.layout?.sections as
          | { type: string; data: Record<string, unknown> }[]
          | undefined) ?? [];
      const idx = sections.findIndex((s) => s.type === sectionType);
      const nextSections =
        idx >= 0
          ? sections.map((s, i) =>
              i === idx ? { type: sectionType, data } : s,
            )
          : [...sections, { type: sectionType, data }];
      return {
        ...portfolio,
        layout: { ...portfolio.layout, sections: nextSections },
      };
    };

    set((state) => ({
      portfolios: state.portfolios.map((p) =>
        p.slug === portfolioSlug ? mergeSection(p) : p,
      ),
      currentPortfolio:
        state.currentPortfolio?.slug === portfolioSlug
          ? mergeSection(state.currentPortfolio)
          : state.currentPortfolio,
    }));
  },

  // ------------------------------------------------------------------
  // updateLayoutDataLocally — no API call, no loading flag.
  // Layout-data counterpart to updateSectionDataLocally. LayoutEditor's
  // onChange flows here directly now that it's fully controlled and has
  // no save/persistence responsibility of its own.
  // ------------------------------------------------------------------
  updateLayoutDataLocally: (portfolioSlug, data) => {
    const mergeLayout = (portfolio: PortfolioResponse): PortfolioResponse => ({
      ...portfolio,
      layout: {
        ...portfolio.layout,
        layout: data,
      },
    });

    set((state) => ({
      portfolios: state.portfolios.map((p) =>
        p.slug === portfolioSlug ? mergeLayout(p) : p,
      ),
      currentPortfolio:
        state.currentPortfolio?.slug === portfolioSlug
          ? mergeLayout(state.currentPortfolio)
          : state.currentPortfolio,
    }));
  },

  // ------------------------------------------------------------------
  // savePortfolioOnUnload — bypasses axios entirely. See interface doc
  // comment above for why this exists as a separate path from
  // updatePortfolio.
  // ------------------------------------------------------------------
  savePortfolioOnUnload: (portfolioId, data) => {
    sendKeepaliveRequest(`/portfolios/${portfolioId}`, "PUT", data);
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
