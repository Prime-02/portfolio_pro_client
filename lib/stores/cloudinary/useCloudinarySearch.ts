import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  CloudinarySliceState,
  ResourceType,
  SearchRequest,
} from "./types";

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface SearchResult {
  resources: Array<Record<string, unknown>>;
  total_count?: number;
  next_cursor?: string;
  [key: string]: unknown;
}

export interface FolderListResult {
  folders: Array<{ name: string; path: string }>;
  [key: string]: unknown;
}

export interface TagListResult {
  tags: string[];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CloudinarySearchState extends CloudinarySliceState {
  searchResults: SearchResult | null;
  folders: FolderListResult | null;
  tags: TagListResult | null;

  // Actions — mirrors /cloudinary/search/*
  searchAssets: (request: SearchRequest) => Promise<SearchResult>;
  searchByTag: (params: SearchByTagParams) => Promise<SearchResult>;
  searchByPrefix: (params: SearchByPrefixParams) => Promise<SearchResult>;
  listFolders: (subFolder?: string | null) => Promise<FolderListResult>;
  listTags: (max_results?: number) => Promise<TagListResult>;

  clearError: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Param types
// ---------------------------------------------------------------------------

export interface SearchByTagParams {
  tag: string;
  resource_type?: ResourceType;
  max_results?: number;
}

export interface SearchByPrefixParams {
  prefix: string;
  resource_type?: ResourceType;
  max_results?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined) qs.set(key, String(val));
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCloudinarySearch = create<CloudinarySearchState>()((set) => ({
  isLoading: false,
  error: null,
  searchResults: null,
  folders: null,
  tags: null,

  // POST /cloudinary/search/assets
  searchAssets: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<SearchResult>(
        "cloudinary/search/assets",
        request,
      );
      set({ searchResults: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to search assets") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/search/by-tag/{tag}
  searchByTag: async ({ tag, resource_type = "image", max_results = 50 }) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ resource_type, max_results });
      const res = await api.get<SearchResult>(
        `cloudinary/search/by-tag/${encodeURIComponent(tag)}${qs}`,
      );
      set({ searchResults: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to search by tag") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/search/by-prefix/{prefix}
  searchByPrefix: async ({
    prefix,
    resource_type = "image",
    max_results = 50,
  }) => {
    set({ isLoading: true, error: null });
    try {
      const qs = buildQueryString({ resource_type, max_results });
      const res = await api.get<SearchResult>(
        `cloudinary/search/by-prefix/${encodeURIComponent(prefix)}${qs}`,
      );
      set({ searchResults: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to search by prefix") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/search/folders
  listFolders: async (subFolder?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<FolderListResult>(
        `cloudinary/search/folders${subFolder ? `/${encodeURIComponent(subFolder)}` : ""}`,
      );
      set({ folders: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to list folders") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET /cloudinary/search/tags
  listTags: async (max_results = 100) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<TagListResult>(
        `cloudinary/search/tags${buildQueryString({ max_results })}`,
      );
      set({ tags: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to list tags") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      isLoading: false,
      error: null,
      searchResults: null,
      folders: null,
      tags: null,
    }),
}));
