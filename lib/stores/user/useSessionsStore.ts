// src/stores/useSessionsStore.ts

import { create } from "zustand";
import { api } from "@/lib/client/api";

// ---------------------------------------------------------------------------
// Types — derived from sessions.py & schemas.py
// ---------------------------------------------------------------------------

export interface SessionResponse {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token: string;
  expires_at: string; // ISO datetime
  ip_address: string | null;
  user_agent: string;
  is_active: boolean;
  created_at: string;
  last_accessed_at: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface SessionListResponse {
  sessions: SessionResponse[];
  total: number;
}

export interface SessionUser {
  id: string;
  email: string;
  username: string;
}

export interface RevokeAllResponse {
  message: string;
  count: number;
}

export interface CleanupResponse {
  message: string;
  count: number;
}

export interface DebugTokenInfo {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface SessionsState {
  // Data
  activeSession: SessionResponse | null;
  sessionUser: SessionUser | null;
  sessionList: SessionResponse[];
  sessionTotal: number;
  debugInfo: DebugTokenInfo | null;

  // Loading / error
  isLoading: boolean;
  error: string | null;

  // Actions — mirroring sessions.py endpoints
  createSession: (
    userId: string,
    expiresHours?: number,
  ) => Promise<SessionResponse>;
  fetchActiveSession: () => Promise<SessionResponse>;
  fetchSessionUser: () => Promise<SessionUser>;
  revokeSession: () => Promise<{ message: string }>;
  revokeAllSessions: () => Promise<RevokeAllResponse>;
  revokeSpecificSession: (sessionId: string) => Promise<{ message: string }>;
  refreshSession: (refreshToken: string) => Promise<SessionResponse>;
  fetchSessionList: (activeOnly?: boolean) => Promise<SessionListResponse>;
  cleanupExpiredSessions: () => Promise<CleanupResponse>;
  fetchDebugTokenInfo: () => Promise<DebugTokenInfo>;

  // Helpers
  clearError: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSessionsStore = create<SessionsState>()((set, get) => ({
  // Defaults
  activeSession: null,
  sessionUser: null,
  sessionList: [],
  sessionTotal: 0,
  debugInfo: null,
  isLoading: false,
  error: null,

  // ------------------------------------------------------------------
  // POST /api/v1/sessions/create
  // ------------------------------------------------------------------
  createSession: async (userId: string, expiresHours: number = 168) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<SessionResponse>(
        "sessions/create",
        null,
        {
          params: { user_id: userId, expires_hours: expiresHours },
        },
      );
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create session";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /api/v1/sessions/active
  // ------------------------------------------------------------------
  fetchActiveSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<SessionResponse>("sessions/active");
      set({ activeSession: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch active session";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /api/v1/sessions/user
  // ------------------------------------------------------------------
  fetchSessionUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<SessionUser>("sessions/user");
      set({ sessionUser: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch session user";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // POST /api/v1/sessions/revoke
  // ------------------------------------------------------------------
  revokeSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ message: string }>(
        "sessions/revoke",
        null,
      );
      set({ activeSession: null, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to revoke session";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // POST /api/v1/sessions/revoke-all
  // ------------------------------------------------------------------
  revokeAllSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<RevokeAllResponse>(
        "sessions/revoke-all",
        null,
      );
      set({
        activeSession: null,
        sessionList: [],
        sessionTotal: 0,
        isLoading: false,
      });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to revoke all sessions";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /api/v1/sessions/revoke/{session_id}
  // ------------------------------------------------------------------
  revokeSpecificSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete<{ message: string }>(
        `sessions/revoke/${sessionId}`,
      );
      // Remove from local list if present
      const currentList = get().sessionList;
      set({
        sessionList: currentList.filter((s) => s.id !== sessionId),
        sessionTotal: currentList.length - 1,
        isLoading: false,
      });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to revoke session";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // POST /api/v1/sessions/refresh
  // ------------------------------------------------------------------
  refreshSession: async (refreshToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<SessionResponse>("sessions/refresh", {
        refresh_token: refreshToken,
      });
      set({ activeSession: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to refresh session";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /api/v1/sessions/list
  // ------------------------------------------------------------------
  fetchSessionList: async (activeOnly: boolean = true) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<SessionListResponse>("sessions/list", {
        params: { active_only: activeOnly },
      });
      set({
        sessionList: response.data.sessions,
        sessionTotal: response.data.total,
        isLoading: false,
      });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch session list";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // POST /api/v1/sessions/cleanup
  // ------------------------------------------------------------------
  cleanupExpiredSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<CleanupResponse>(
        "sessions/cleanup",
        null,
      );
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to cleanup sessions";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /api/v1/sessions/debug/token-info
  // ------------------------------------------------------------------
  fetchDebugTokenInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<DebugTokenInfo>(
        "sessions/debug/token-info",
      );
      set({ debugInfo: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch debug info";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  clearError: () => set({ error: null }),

  reset: () =>
    set({
      activeSession: null,
      sessionUser: null,
      sessionList: [],
      sessionTotal: 0,
      debugInfo: null,
      isLoading: false,
      error: null,
    }),
}));
