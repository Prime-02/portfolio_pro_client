import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import qs from "qs";
import {
  removeEmptyStringValues,
  handleAxiosError,
  isNumericString,
} from "@/lib/utilities/syncFunctions/syncs";
import { toast } from "@/src/context/Toastify";

// ---------------------------------------------------------------------------
// URLS
// ---------------------------------------------------------------------------
// All requests now go through the Next.js server-side proxy route
// (app/api/proxy/[...path]/route.ts). The proxy attaches the real API key
// using a non-NEXT_PUBLIC_ env var, so the key never reaches the browser.
// The proxy forwards to FastAPI's /api/v1/* internally.

const PROXY_BASE_URL = "/api/proxy";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Token storage helpers
// ---------------------------------------------------------------------------

const TOKEN_KEYS = {
  SESSION: "session_token",
  REFRESH: "refresh_token",
  EXPIRES_AT: "expires_at",
  SESSION_ID: "session_id",
} as const;

export const tokenStore = {
  save(
    session_token: string,
    refresh_token: string,
    expires_at: string,
    session_id?: string,
  ): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEYS.SESSION, session_token);
    localStorage.setItem(TOKEN_KEYS.REFRESH, refresh_token);
    localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, expires_at);
    if (session_id) {
      localStorage.setItem(TOKEN_KEYS.SESSION_ID, session_id);
    }
  },

  getSessionToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEYS.SESSION);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH);
  },

  getExpiresAt(): Date | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(TOKEN_KEYS.EXPIRES_AT);
    return raw ? new Date(raw) : null;
  },

  getSessionId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEYS.SESSION_ID);
  },

  isExpired(): boolean {
    const expiresAt = tokenStore.getExpiresAt();
    if (!expiresAt) return true;
    return new Date() >= new Date(expiresAt.getTime() - 30_000);
  },

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEYS.SESSION);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem(TOKEN_KEYS.EXPIRES_AT);
    localStorage.removeItem(TOKEN_KEYS.SESSION_ID);
  },
};

// ---------------------------------------------------------------------------
// Token extraction — per-endpoint response shape
// ---------------------------------------------------------------------------

function extractTokenFields(
  url: string,
  data: Record<string, unknown>,
): {
  session_token: string;
  refresh_token: string;
  expires_at: string;
  session_id?: string;
} | null {
  if (!data || typeof data !== "object") return null;

  const normalisedUrl = url.startsWith("/") ? url : `/${url}`;

  if (urlContains(normalisedUrl, "/auth/login")) {
    const session = data.session as Record<string, unknown> | undefined;
    if (
      session &&
      typeof session.session_token === "string" &&
      typeof session.refresh_token === "string" &&
      typeof session.expires_at === "string"
    ) {
      return {
        session_token: session.session_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        session_id:
          typeof session.session_id === "string"
            ? session.session_id
            : undefined,
      };
    }
    return null;
  }

  if (
    urlContains(normalisedUrl, REFRESH_URL) ||
    urlContains(normalisedUrl, "/callback")
  ) {
    if (
      typeof data.session_token === "string" &&
      typeof data.refresh_token === "string" &&
      typeof data.expires_at === "string"
    ) {
      return {
        session_token: data.session_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        session_id:
          typeof data.session_id === "string" ? data.session_id : undefined,
      };
    }
    return null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Authentication check
// ---------------------------------------------------------------------------

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const sessionToken = tokenStore.getSessionToken();
  if (!sessionToken) return false;
  return !tokenStore.isExpired();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const sessionToken = tokenStore.getSessionToken();
  if (tokenStore.isExpired()) return null;
  return sessionToken || null;
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

const REFRESH_URL = "/sessions/refresh";

// Builds a full proxy URL for the one-off axios.post call used during
// refresh (which runs outside the `api` instance, so it needs its own
// baseURL resolution). Everything now targets PROXY_BASE_URL instead of
// the FastAPI URL directly.
const normaliseUrl = (url: string): string => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  return `${PROXY_BASE_URL}/${cleanUrl}`;
};

const urlContains = (fullUrl: string, fragment: string): boolean =>
  fullUrl.includes(fragment);

// ---------------------------------------------------------------------------
// FormData builder
// ---------------------------------------------------------------------------

export interface BuildFormDataOptions {
  intToString?: boolean;
}

export function buildFormData<T extends Record<string, unknown>>(
  data: T,
  { intToString = true }: BuildFormDataOptions = {},
): FormData {
  const formData = new FormData();
  const cleaned = removeEmptyStringValues(data);

  Object.entries(cleaned).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      if (value.every((item) => item instanceof File)) {
        value.forEach((file) => formData.append(key, file));
      } else {
        formData.append(key, JSON.stringify(value));
      }
      return;
    }

    if (
      typeof value === "object" &&
      !(value instanceof File) &&
      !(value instanceof Blob)
    ) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value.toString());
    } else if (typeof value === "number") {
      formData.append(key, value.toString());
    } else if (typeof value === "string") {
      if (intToString && isNumericString(value)) {
        formData.append(key, parseInt(value, 10).toString());
      } else {
        formData.append(key, value);
      }
    } else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}

// ---------------------------------------------------------------------------
// Token refresh (singleton promise — prevents parallel refresh races)
// ---------------------------------------------------------------------------

let refreshPromise: Promise<string> | null = null;

async function refreshSession(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStore.getRefreshToken();
    const sessionId = tokenStore.getSessionId();

    if (!refreshToken) {
      tokenStore.clear();
      throw new Error("No refresh token available. Please log in again.");
    }

    try {
      // No API key header here — the proxy attaches it server-side.
      const headers: Record<string, string> = {
        "ngrok-skip-browser-warning": "true",
      };

      if (sessionId) {
        headers["X-Session-Id"] = sessionId;
      }

      const response = await axios.post(
        normaliseUrl(REFRESH_URL),
        { refresh_token: refreshToken },
        { headers },
      );

      const tokens = extractTokenFields(REFRESH_URL, response.data);
      if (tokens) {
        tokenStore.save(
          tokens.session_token,
          tokens.refresh_token,
          tokens.expires_at,
          tokens.session_id || sessionId || undefined,
        );
      }

      return response.data.session_token as string;
    } catch (err) {
      tokenStore.clear();
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
// baseURL now points at the same-origin proxy route rather than FastAPI
// directly. No API key header is set here — the proxy injects it server-side
// where it can't be read from devtools/network tab on the client.

const api: AxiosInstance = axios.create({
  baseURL: PROXY_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

// ---------------------------------------------------------------------------
// REQUEST interceptor — inject token, session ID, refresh if expired
// ---------------------------------------------------------------------------

api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const requestUrl = config.url ?? "";
    const isRefreshEndpoint = urlContains(requestUrl, REFRESH_URL);

    config.headers = config.headers ?? {};

    // Add session ID if available
    const sessionId = tokenStore.getSessionId();
    if (sessionId) {
      config.headers["X-Session-Id"] = sessionId;
    }

    if (!isRefreshEndpoint) {
      if (tokenStore.isExpired()) {
        const hasRefreshToken = !!tokenStore.getRefreshToken();
        if (hasRefreshToken) {
          try {
            await refreshSession();
          } catch {
            // Refresh failed — continue without token; server will 401
          }
        }
      }

      const sessionToken = tokenStore.getSessionToken();
      if (sessionToken) {
        config.headers.Authorization = `Bearer ${sessionToken}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// RESPONSE interceptor — auto-save tokens (with session_id), handle 401
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    const url = response.config.url ?? "";
    const tokens = extractTokenFields(url, response.data);
    if (tokens) {
      tokenStore.save(
        tokens.session_token,
        tokens.refresh_token,
        tokens.expires_at,
        tokens.session_id,
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !urlContains(originalRequest.url ?? "", REFRESH_URL)
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshSession();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // Ensure session ID is preserved on retry (API key is added by proxy)
        const sessionId = tokenStore.getSessionId();
        if (sessionId) {
          originalRequest.headers["X-Session-Id"] = sessionId;
        }
        return api(originalRequest);
      } catch {
        // Refresh failed; fall through to error handler
      }
    }

    const errorMessage = handleAxiosError(error);
    toast.error(errorMessage);
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Keepalive save — for beforeunload / page-teardown persistence
// ---------------------------------------------------------------------------
// Regular `api.put(...)` calls (axios) aren't guaranteed to complete once
// the page starts unloading — the browser can abort them mid-flight, and
// beforeunload handlers can't reliably await a promise anyway. `fetch` with
// `keepalive: true` is the browser-native way to let a request finish after
// the initiating page is gone (subject to a ~64KB body limit per spec,
// enforced somewhat differently across browsers).
//
// This intentionally skips token refresh even if the current session token
// is expired — there's no time for that round trip during unload. It uses
// whatever token is currently in storage; if that's stale, this save is a
// no-op from the server's point of view (401), same as if no unload save
// existed. It's a best-effort last line of defense, not a replacement for
// the normal save path.
//
// Not awaited by callers, by design — fire-and-forget is the only option
// inside a beforeunload handler.
export function sendKeepaliveRequest(
  path: string,
  method: "POST" | "PUT" | "PATCH",
  data: unknown,
): void {
  if (typeof window === "undefined") return;

  const sessionToken = tokenStore.getSessionToken();
  const sessionId = tokenStore.getSessionId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
  if (sessionId) headers["X-Session-Id"] = sessionId;

  try {
    fetch(normaliseUrl(path), {
      method,
      headers,
      body: JSON.stringify(data),
      keepalive: true,
    });
  } catch {
    // Nothing to recover from here — this is already the last-resort path.
  }
}

export { api };
