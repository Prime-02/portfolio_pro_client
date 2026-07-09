import { create } from "zustand";
import { api } from "@/lib/client/api";

// ---- Types matching the FastAPI response/request shapes -----------------

export interface AIFeatureResult {
  content: string;
  tokensUsed: number;
  processingTime: number;
  metadata: Record<string, unknown> | null;
}

export interface AIUsageStats {
  dailyUsage: number;
  weeklyUsage: number | null;
  monthlyUsage: number | null;
  featuresUsed: string[];
  lastUsed: string | null;
  tierLimit: number;
}

export interface ProfileOptimizeInput {
  bio?: string;
  jobTitle?: string;
  skills?: string[];
  experienceLevel?: string;
  targetRole?: string;
}

export interface ProjectDescriptionInput {
  name: string;
  currentDescription?: string;
  technologies?: string[];
  role?: string;
  achievements?: string;
  duration?: string;
}

export interface SkillSuggestionsInput {
  currentSkills?: string[];
  jobTitle?: string;
  industry?: string;
  experienceLevel?: string;
  careerGoals?: string;
}

export interface CareerAdviceInput {
  currentRole?: string;
  experience?: string;
  skills?: string[];
  goals?: string;
  challenges?: string;
}

export interface SEOOptimizeInput {
  title?: string;
  description?: string;
  keywords?: string[];
  industry?: string;
}

export type AIActionKey =
  | "profileOptimize"
  | "projectDescription"
  | "projectSummary"
  | "skillSuggestions"
  | "careerAdvice"
  | "seoOptimize"
  | "customPrompt"
  | "usage";

// Endpoints are relative to whatever base URL `api` is already configured
// with elsewhere in the app.
const AI_PREFIX = "/ai";

// snake_case <-> camelCase helpers, since the backend returns/expects
// snake_case (Python) and the store exposes camelCase (TS convention).
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
    result[snakeKey] = value;
  }
  return result;
}

interface RawAIResponse {
  content: string;
  tokens_used: number;
  processing_time: number;
  metadata: Record<string, unknown> | null;
}

function normalizeResult(raw: RawAIResponse): AIFeatureResult {
  return {
    content: raw.content,
    tokensUsed: raw.tokens_used,
    processingTime: raw.processing_time,
    metadata: raw.metadata,
  };
}

class AIRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Assumes `api` behaves like a typical axios instance: `api.post/get(url, ...)`
// resolves with `{ data }` on success, and rejects with an error carrying
// `error.response.status` / `error.response.data.detail` on failure. Adjust
// this helper if your `api` client's error/response shape differs.
async function postAI<T>(endpoint: string, body: unknown): Promise<T> {
  try {
    const response = await api.post(`${AI_PREFIX}/${endpoint}`, body);
    return response.data as T;
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const message =
      err?.response?.data?.detail ?? err?.message ?? "Request failed";
    throw new AIRequestError(message, status);
  }
}

// ---- Store -----------------------------------------------------------

interface AIStoreState {
  loading: Partial<Record<AIActionKey, boolean>>;
  errors: Partial<Record<AIActionKey, string | null>>;
  results: Partial<Record<AIActionKey, AIFeatureResult | null>>;
  usageStats: AIUsageStats | null;
  rateLimited: Partial<Record<AIActionKey, boolean>>;

  optimizeProfile: (
    input: ProfileOptimizeInput,
  ) => Promise<AIFeatureResult | null>;
  enhanceProjectDescription: (
    input: ProjectDescriptionInput,
  ) => Promise<AIFeatureResult | null>;
  summarizeProject: (
    input: ProjectDescriptionInput,
  ) => Promise<AIFeatureResult | null>;
  suggestSkills: (
    input: SkillSuggestionsInput,
  ) => Promise<AIFeatureResult | null>;
  getCareerAdvice: (
    input: CareerAdviceInput,
  ) => Promise<AIFeatureResult | null>;
  optimizeForSEO: (input: SEOOptimizeInput) => Promise<AIFeatureResult | null>;
  generateFromPrompt: (
    prompt: string,
    options?: { allowMarkdown?: boolean },
  ) => Promise<AIFeatureResult | null>;
  fetchUsageStats: () => Promise<AIUsageStats | null>;

  clearError: (key: AIActionKey) => void;
  reset: (key: AIActionKey) => void;
}

function runAIAction<TInput>(
  set: (fn: (state: AIStoreState) => Partial<AIStoreState>) => void,
  key: AIActionKey,
  endpoint: string,
  input: TInput,
): Promise<AIFeatureResult | null> {
  return (async () => {
    set((state) => ({
      loading: { ...state.loading, [key]: true },
      errors: { ...state.errors, [key]: null },
      rateLimited: { ...state.rateLimited, [key]: false },
    }));

    try {
      const raw = await postAI<RawAIResponse>(
        endpoint,
        toSnakeCase(input as Record<string, unknown>),
      );
      const result = normalizeResult(raw);

      set((state) => ({
        loading: { ...state.loading, [key]: false },
        results: { ...state.results, [key]: result },
      }));

      return result;
    } catch (err) {
      const isRateLimited = err instanceof AIRequestError && err.status === 429;
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      set((state) => ({
        loading: { ...state.loading, [key]: false },
        errors: { ...state.errors, [key]: message },
        rateLimited: { ...state.rateLimited, [key]: isRateLimited },
      }));

      return null;
    }
  })();
}

export const useAIStore = create<AIStoreState>((set) => ({
  loading: {},
  errors: {},
  results: {},
  usageStats: null,
  rateLimited: {},

  optimizeProfile: (input) =>
    runAIAction(set, "profileOptimize", "profile-optimize", input),

  enhanceProjectDescription: (input) =>
    runAIAction(set, "projectDescription", "project-description", input),

  summarizeProject: (input) =>
    runAIAction(set, "projectSummary", "project-summary", input),

  suggestSkills: (input) =>
    runAIAction(set, "skillSuggestions", "skill-suggestions", input),

  getCareerAdvice: (input) =>
    runAIAction(set, "careerAdvice", "career-advice", input),

  optimizeForSEO: (input) =>
    runAIAction(set, "seoOptimize", "seo-optimize", input),

  generateFromPrompt: (prompt, options) =>
    runAIAction(set, "customPrompt", "custom-prompt", {
      prompt,
      allowMarkdown: options?.allowMarkdown ?? false,
    }),

  fetchUsageStats: async () => {
    set((state) => ({
      loading: { ...state.loading, usage: true },
      errors: { ...state.errors, usage: null },
    }));

    try {
      const response = await api.get(`${AI_PREFIX}/usage`);
      const raw = response.data;
      const stats: AIUsageStats = {
        dailyUsage: raw.daily_usage,
        weeklyUsage: raw.weekly_usage,
        monthlyUsage: raw.monthly_usage,
        featuresUsed: raw.features_used,
        lastUsed: raw.last_used,
        tierLimit: raw.tier_limit,
      };

      set((state) => ({
        loading: { ...state.loading, usage: false },
        usageStats: stats,
      }));

      return stats;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ?? err?.message ?? "Something went wrong";
      set((state) => ({
        loading: { ...state.loading, usage: false },
        errors: { ...state.errors, usage: message },
      }));
      return null;
    }
  },

  clearError: (key) =>
    set((state) => ({ errors: { ...state.errors, [key]: null } })),

  reset: (key) =>
    set((state) => ({
      loading: { ...state.loading, [key]: false },
      errors: { ...state.errors, [key]: null },
      results: { ...state.results, [key]: null },
      rateLimited: { ...state.rateLimited, [key]: false },
    })),
}));

// ---- Granular selectors ------------------------------------------------
// Use these in components instead of destructuring the whole store, so a
// re-render is only triggered by the slice that actually changed.

export const useAILoading = (key: AIActionKey) =>
  useAIStore((state) => state.loading[key] ?? false);

export const useAIError = (key: AIActionKey) =>
  useAIStore((state) => state.errors[key] ?? null);

export const useAIResult = (key: AIActionKey) =>
  useAIStore((state) => state.results[key] ?? null);

export const useAIRateLimited = (key: AIActionKey) =>
  useAIStore((state) => state.rateLimited[key] ?? false);

export const useAIUsageStats = () => useAIStore((state) => state.usageStats);
