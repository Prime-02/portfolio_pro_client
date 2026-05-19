import { create } from "zustand";
import { api } from "@/lib/client/api";
import type {
  ContentReportCreate,
  ContentReportUpdate,
  ContentReportResponse,
  ContentReportWithDetails,
  ContentReportsListResponse,
  ReportStatistics,
  ReportStatus,
} from "@/lib/stores/contents/types/content.types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ContentReportState {
  // Admin list view
  reports: ContentReportWithDetails[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;

  // Reports by content (keyed by content_id)
  reportsByContent: Record<string, ContentReportWithDetails[]>;

  // Current user's submitted reports
  myReports: ContentReportWithDetails[];
  myReportsTotal: number;

  // Single report detail
  currentReport: ContentReportWithDetails | null;

  // Statistics
  statistics: ReportStatistics | null;

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

interface ContentReportActions {
  reportContent: (payload: ContentReportCreate) => Promise<ContentReportResponse>;
  fetchReportById: (reportId: string) => Promise<void>;
  fetchReports: (
    filters?: { status?: ReportStatus; content_id?: string; page?: number; page_size?: number }
  ) => Promise<void>;
  fetchMyReports: (page?: number, pageSize?: number) => Promise<void>;
  fetchContentReports: (contentId: string, page?: number, pageSize?: number) => Promise<void>;
  updateReportStatus: (
    reportId: string,
    payload: ContentReportUpdate
  ) => Promise<ContentReportResponse>;
  fetchStatistics: () => Promise<void>;
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useContentReportStore = create<ContentReportState & ContentReportActions>(
  (set) => ({
    reports: [],
    total: 0,
    page: 1,
    page_size: 20,
    has_next: false,
    reportsByContent: {},
    myReports: [],
    myReportsTotal: 0,
    currentReport: null,
    statistics: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    reportContent: async (payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.post<ContentReportResponse>("/content/reports/", payload);
        return response.data;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    fetchReportById: async (reportId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentReportWithDetails>(
          `/content/reports/${reportId}`
        );
        set({ currentReport: response.data });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchReports: async (filters = {}) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentReportsListResponse>("/content/reports/", {
          params: filters,
        });
        const { items, total, page, page_size, has_next } = response.data;
        set({ reports: items, total, page, page_size, has_next });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchMyReports: async (page = 1, pageSize = 20) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentReportsListResponse>(
          "/content/reports/user/my-reports",
          { params: { page, page_size: pageSize } }
        );
        set({
          myReports: response.data.items,
          myReportsTotal: response.data.total,
        });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchContentReports: async (contentId, page = 1, pageSize = 20) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ContentReportsListResponse>(
          `/content/reports/content/${contentId}`,
          { params: { page, page_size: pageSize } }
        );
        set((state) => ({
          reportsByContent: {
            ...state.reportsByContent,
            [contentId]: response.data.items,
          },
        }));
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    updateReportStatus: async (reportId, payload) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await api.put<ContentReportResponse>(
          `/content/reports/${reportId}`,
          payload
        );
        const updated = response.data;

        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, ...updated } : r
          ),
          currentReport:
            state.currentReport?.id === reportId
              ? { ...state.currentReport, ...updated }
              : state.currentReport,
        }));

        return updated;
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    fetchStatistics: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ReportStatistics>(
          "/content/reports/statistics/overview"
        );
        set({ statistics: response.data });
      } catch (err: unknown) {
        set({ error: extractMessage(err) });
      } finally {
        set({ isLoading: false });
      }
    },

    clearError: () => set({ error: null }),
  })
);

function extractMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { detail?: string; message?: string } } };
    return (
      axiosErr.response?.data?.detail ??
      axiosErr.response?.data?.message ??
      "An unexpected error occurred"
    );
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}
