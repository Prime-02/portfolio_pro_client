import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  CloudinarySliceState,
  ResourceType,
  TransformationOptions,
  UploadResponse,
  ResponsiveUrls,
  ResponsiveUrlRequest,
  ArtisticEffectRequest,
  WatermarkRequest,
} from "./types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CloudinaryTransformState extends CloudinarySliceState {
  lastUrl: string | null;
  lastUrls: string[] | null;
  lastUpload: UploadResponse | null;
  lastResponsiveUrls: ResponsiveUrls | null;

  // Actions — mirrors /cloudinary/transform/*
  generateResponsiveUrls: (request: ResponsiveUrlRequest) => Promise<ResponsiveUrls>;
  createTransformationChain: (params: TransformationChainParams) => Promise<string>;
  createSprite: (params: SpriteParams) => Promise<UploadResponse>;
  applyArtisticEffect: (request: ArtisticEffectRequest) => Promise<string>;
  createCollage: (params: CollageParams) => Promise<UploadResponse>;
  optimizeForWeb: (params: OptimizeWebParams) => Promise<string>;
  createAnimatedGif: (params: AnimatedGifParams) => Promise<UploadResponse>;
  createWatermark: (request: WatermarkRequest) => Promise<string>;
  batchTransformUrls: (params: BatchTransformUrlsParams) => Promise<string[]>;

  clearError: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Param types
// ---------------------------------------------------------------------------

export interface TransformationChainParams {
  public_id: string;
  transformations: TransformationOptions[];
  resource_type?: ResourceType;
}

export interface SpriteParams {
  public_ids: string[];
  sprite_public_id: string;
  folder?: string;
  tags?: string[];
  transformation?: TransformationOptions;
}

export interface CollageParams {
  public_ids: string[];
  collage_public_id: string;
  width?: number;
  height?: number;
  layout?: string;
  folder?: string;
  tags?: string[];
}

export interface OptimizeWebParams {
  public_id: string;
  quality?: string;
  format?: string;
  progressive?: boolean;
  resource_type?: ResourceType;
}

export interface AnimatedGifParams {
  public_ids: string[];
  gif_public_id: string;
  delay?: number;
  loop?: boolean;
  folder?: string;
  tags?: string[];
}

export interface BatchTransformUrlsParams {
  public_ids: string[];
  transformation: TransformationOptions;
  resource_type?: ResourceType;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCloudinaryTransform = create<CloudinaryTransformState>()((set) => ({
  isLoading: false,
  error: null,
  lastUrl: null,
  lastUrls: null,
  lastUpload: null,
  lastResponsiveUrls: null,

  // POST /cloudinary/transform/responsive-urls
  generateResponsiveUrls: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<ResponsiveUrls>("cloudinary/transform/responsive-urls", request);
      set({ lastResponsiveUrls: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to generate responsive URLs") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/transform/transformation-chain
  createTransformationChain: async ({ public_id, transformations, resource_type = "image" }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ url: string }>("cloudinary/transform/transformation-chain", {
        public_id,
        transformations,
        resource_type,
      });
      set({ lastUrl: res.data.url });
      return res.data.url;
    } catch (err) {
      set({ error: errMsg(err, "Failed to create transformation chain") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/transform/sprite
  createSprite: async ({ public_ids, sprite_public_id, folder, tags, transformation }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<UploadResponse>("cloudinary/transform/sprite", {
        public_ids,
        sprite_public_id,
        folder,
        tags,
        transformation,
      });
      set({ lastUpload: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to create sprite") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/transform/artistic-effect
  applyArtisticEffect: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ url: string }>("cloudinary/transform/artistic-effect", request);
      set({ lastUrl: res.data.url });
      return res.data.url;
    } catch (err) {
      set({ error: errMsg(err, "Failed to apply artistic effect") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/transform/collage
  createCollage: async ({ public_ids, collage_public_id, width = 800, height = 600, layout = "auto", folder, tags }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<UploadResponse>("cloudinary/transform/collage", {
        public_ids,
        collage_public_id,
        width,
        height,
        layout,
        folder,
        tags,
      });
      set({ lastUpload: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to create collage") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/transform/optimize-web
  optimizeForWeb: async ({
    public_id,
    quality = "auto:best",
    format = "auto",
    progressive = true,
    resource_type = "image",
  }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ url: string }>("cloudinary/transform/optimize-web", {
        public_id,
        quality,
        format,
        progressive,
        resource_type,
      });
      set({ lastUrl: res.data.url });
      return res.data.url;
    } catch (err) {
      set({ error: errMsg(err, "Failed to optimize for web") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/transform/animated-gif
  createAnimatedGif: async ({ public_ids, gif_public_id, delay = 200, loop = true, folder, tags }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<UploadResponse>("cloudinary/transform/animated-gif", {
        public_ids,
        gif_public_id,
        delay,
        loop,
        folder,
        tags,
      });
      set({ lastUpload: res.data });
      return res.data;
    } catch (err) {
      set({ error: errMsg(err, "Failed to create animated GIF") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/transform/watermark
  createWatermark: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ url: string }>("cloudinary/transform/watermark", request);
      set({ lastUrl: res.data.url });
      return res.data.url;
    } catch (err) {
      set({ error: errMsg(err, "Failed to create watermark") });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // POST /cloudinary/transform/batch-transform
  batchTransformUrls: async ({ public_ids, transformation, resource_type = "image" }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ urls: string[] }>("cloudinary/transform/batch-transform", {
        public_ids,
        transformation,
        resource_type,
      });
      set({ lastUrls: res.data.urls });
      return res.data.urls;
    } catch (err) {
      set({ error: errMsg(err, "Failed to batch transform URLs") });
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
      lastUrl: null,
      lastUrls: null,
      lastUpload: null,
      lastResponsiveUrls: null,
    }),
}));
