// stores/useCertifications.ts
import { create } from "zustand";
import { api } from "@/lib/client/api";

// ---------------------------------------------------------------------------
// Types — matching the backend schemas
// ---------------------------------------------------------------------------

export interface Certification {
  id?: string;
  created_at?: string;
  certification_name: string;
  issuing_organization: string;
  issue_date?: string | null;
  expiration_date?: string | null;
  certificate_external_url?: string | null;
  certificate_internal_url?: string | null;
  certificate_internal_url_id?: string | null;
  is_public?: boolean | null;
  user_id?: string;
}

export interface CreateCertificationPayload {
  certification_name: string;
  issuing_organization: string;
  issue_date?: string | null;
  expiration_date?: string | null;
  certificate_external_url?: string | null;
  certificate_internal_url?: File | null;
  certificate_internal_url_id?: string | null;
  is_public?: boolean | null;
}

export interface UpdateCertificationPayload {
  certification_name?: string | null;
  issuing_organization?: string | null;
  issue_date?: string | null;
  expiration_date?: string | null;
  certificate_external_url?: string | null;
  certificate_internal_url?: File | null; // Changed to File | null for uploads
  certificate_internal_url_id?: string | null;
  is_public?: boolean | null;
}

export interface PublicCertificationFilters {
  issuing_organization?: string;
  ids?: string[];
  merge_filters?: boolean;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface AdminDeleteUserCertsResponse {
  success: boolean;
  message: string;
  deleted_count: number;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface CertificationsState {
  // ==================== USER STATE ====================
  certifications: Certification[];
  selectedCertification: Certification | null;
  publicCertifications: Certification[];
  publicUsername: string | null;
  userCertificationsByUsername: Certification[];
  viewingUsername: string | null;

  // User loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingPublic: boolean;
  isLoadingUserByUsername: boolean;

  // ==================== ADMIN STATE ====================
  adminCertifications: Certification[];
  adminSelectedCertification: Certification | null;
  adminUserCertifications: Certification[];
  adminCurrentUserId: string | null;

  // Admin loading states
  adminIsLoading: boolean;
  adminIsUpdating: boolean;
  adminIsDeleting: boolean;
  adminIsLoadingUserCerts: boolean;

  // Errors
  error: string | null;
  adminError: string | null;

  // ==================== USER ACTIONS ====================

  // Authenticated user actions
  fetchAllCertifications: () => Promise<Certification[]>;
  fetchCertificationById: (certId: string) => Promise<Certification>;
  fetchCertificationsByUsername: (username: string) => Promise<Certification[]>;
  createCertification: (
    payload: CreateCertificationPayload,
  ) => Promise<Certification>;
  updateCertification: (
    certId: string,
    payload: UpdateCertificationPayload,
  ) => Promise<Certification>;
  deleteCertification: (certId: string) => Promise<DeleteResponse>;

  // Public actions
  fetchPublicCertifications: (
    username: string,
    filters?: PublicCertificationFilters,
  ) => Promise<Certification[]>;

  // ==================== ADMIN ACTIONS ====================

  adminFetchAllCertifications: () => Promise<Certification[]>;
  adminFetchCertificationById: (certId: string) => Promise<Certification>;
  adminFetchUserCertifications: (userId: string) => Promise<Certification[]>;
  adminUpdateCertification: (
    certId: string,
    payload: UpdateCertificationPayload,
  ) => Promise<Certification>;
  adminDeleteCertification: (certId: string) => Promise<DeleteResponse>;
  adminDeleteUserCertifications: (
    userId: string,
  ) => Promise<AdminDeleteUserCertsResponse>;

  // ==================== UTILITY ACTIONS ====================

  setSelectedCertification: (cert: Certification | null) => void;
  setAdminSelectedCertification: (cert: Certification | null) => void;
  clearPublicCertifications: () => void;
  clearUserCertificationsByUsername: () => void;
  clearAdminUserCertifications: () => void;
  clearError: () => void;
  clearAdminError: () => void;
  reset: () => void;
  resetAdmin: () => void;
}

// ---------------------------------------------------------------------------
// Helper function to build FormData for certification payloads
// ---------------------------------------------------------------------------

function buildCertificationFormData(
  payload: CreateCertificationPayload | UpdateCertificationPayload,
  isUpdate: boolean = false,
): FormData {
  const formData = new FormData();
  
  // Separate file from other fields
  const { certificate_internal_url, ...certData } = payload;
  
  // Remove undefined/null values from certData to match exclude_unset behavior
  const cleanedData = Object.fromEntries(
    Object.entries(certData).filter(([_, value]) => value !== undefined && value !== null)
  );
  
  // Append JSON data as a string
  formData.append("cert_data", JSON.stringify(cleanedData));
  
  // Append file if provided
  if (certificate_internal_url instanceof File) {
    formData.append("certificate_internal_url", certificate_internal_url);
  }
  
  return formData;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCertifications = create<CertificationsState>()((set) => ({
  // ==================== USER DEFAULTS ====================
  certifications: [],
  selectedCertification: null,
  publicCertifications: [],
  publicUsername: null,
  userCertificationsByUsername: [],
  viewingUsername: null,

  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isLoadingPublic: false,
  isLoadingUserByUsername: false,

  // ==================== ADMIN DEFAULTS ====================
  adminCertifications: [],
  adminSelectedCertification: null,
  adminUserCertifications: [],
  adminCurrentUserId: null,

  adminIsLoading: false,
  adminIsUpdating: false,
  adminIsDeleting: false,
  adminIsLoadingUserCerts: false,

  // Errors
  error: null,
  adminError: null,

  // ==================== USER ACTIONS ====================

  // ------------------------------------------------------------------
  // GET /certification/ — Fetch all certifications for current user
  // ------------------------------------------------------------------
  fetchAllCertifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Certification[]>("/certification/");
      const certs = response.data;
      set({ certifications: certs, isLoading: false });
      return certs;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch certifications";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /certification/{cert_id} — Fetch a specific certification
  // ------------------------------------------------------------------
  fetchCertificationById: async (certId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Certification>(`/certification/${certId}`);
      const cert = response.data;
      set({ selectedCertification: cert, isLoading: false });
      return cert;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch certification";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /certification/user/{username} — Fetch certifications by username
  // ------------------------------------------------------------------
  fetchCertificationsByUsername: async (username: string) => {
    set({ isLoadingUserByUsername: true, error: null });
    try {
      const response = await api.get<Certification[]>(
        `/certification/user/${username}`,
      );
      const certs = response.data;
      set({
        userCertificationsByUsername: certs,
        viewingUsername: username,
        isLoadingUserByUsername: false,
      });
      return certs;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch user certifications";
      set({ isLoadingUserByUsername: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // POST /certification/ — Create a new certification
  // ------------------------------------------------------------------
  createCertification: async (payload: CreateCertificationPayload) => {
    set({ isCreating: true, error: null });
    try {
      const formData = buildCertificationFormData(payload);
      
      const response = await api.post<Certification>("/certification/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newCert = response.data;

      set((state) => ({
        certifications: [...state.certifications, newCert],
        isCreating: false,
      }));

      return newCert;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create certification";
      set({ isCreating: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // PUT /certification/{cert_id} — Update a certification
  // ------------------------------------------------------------------
  updateCertification: async (
    certId: string,
    payload: UpdateCertificationPayload,
  ) => {
    set({ isUpdating: true, error: null });
    try {
      const formData = buildCertificationFormData(payload, true);
      
      const response = await api.put<Certification>(
        `/certification/${certId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      
      const updatedCert = response.data;

      set((state) => ({
        certifications: state.certifications.map((cert) =>
          cert.id === certId ? { ...cert, ...updatedCert } : cert,
        ),
        selectedCertification:
          state.selectedCertification?.id === certId
            ? { ...state.selectedCertification, ...updatedCert }
            : state.selectedCertification,
        userCertificationsByUsername: state.userCertificationsByUsername.map(
          (cert) => (cert.id === certId ? { ...cert, ...updatedCert } : cert),
        ),
        isUpdating: false,
      }));

      return updatedCert;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update certification";
      set({ isUpdating: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /certification/{cert_id} — Delete a certification
  // ------------------------------------------------------------------
  deleteCertification: async (certId: string) => {
    set({ isDeleting: true, error: null });
    try {
      const response = await api.delete<DeleteResponse>(
        `/certification/${certId}`,
      );

      set((state) => ({
        certifications: state.certifications.filter(
          (cert) => cert.id !== certId,
        ),
        selectedCertification:
          state.selectedCertification?.id === certId
            ? null
            : state.selectedCertification,
        userCertificationsByUsername: state.userCertificationsByUsername.filter(
          (cert) => cert.id !== certId,
        ),
        isDeleting: false,
      }));

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete certification";
      set({ isDeleting: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /certification/public/{username} — Fetch public certifications
  // ------------------------------------------------------------------
  fetchPublicCertifications: async (username, filters = {}) => {
    set({ isLoadingPublic: true, error: null });
    try {
      const response = await api.get<Certification[]>(
        `/certification/public/${username}`,
        { params: filters },
      );
      const certs = response.data;
      set({
        publicCertifications: certs,
        publicUsername: username,
        isLoadingPublic: false,
      });
      return certs;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch public certifications";
      set({ isLoadingPublic: false, error: message });
      throw err;
    }
  },

  // ==================== ADMIN ACTIONS ====================

  // ------------------------------------------------------------------
  // GET /admin/certification/ — Admin: Get all certifications
  // ------------------------------------------------------------------
  adminFetchAllCertifications: async () => {
    set({ adminIsLoading: true, adminError: null });
    try {
      const response = await api.get<Certification[]>("/admin/certification/");
      const certs = response.data;
      set({ adminCertifications: certs, adminIsLoading: false });
      return certs;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch all certifications (admin)";
      set({ adminIsLoading: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /admin/certification/{cert_id} — Admin: Get specific certification
  // ------------------------------------------------------------------
  adminFetchCertificationById: async (certId: string) => {
    set({ adminIsLoading: true, adminError: null });
    try {
      const response = await api.get<Certification>(
        `/admin/certification/${certId}`,
      );
      const cert = response.data;
      set({ adminSelectedCertification: cert, adminIsLoading: false });
      return cert;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch certification (admin)";
      set({ adminIsLoading: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /admin/certification/user/{user_id} — Admin: Get user's certifications
  // ------------------------------------------------------------------
  adminFetchUserCertifications: async (userId: string) => {
    set({ adminIsLoadingUserCerts: true, adminError: null });
    try {
      const response = await api.get<Certification[]>(
        `/admin/certification/user/${userId}`,
      );
      const certs = response.data;
      set({
        adminUserCertifications: certs,
        adminCurrentUserId: userId,
        adminIsLoadingUserCerts: false,
      });
      return certs;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch user certifications (admin)";
      set({ adminIsLoadingUserCerts: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // PUT /admin/certification/{cert_id} — Admin: Update certification
  // Note: The admin update endpoint currently accepts JSON, not FormData.
  // If you need file upload support for admin, update the backend accordingly.
  // ------------------------------------------------------------------
  adminUpdateCertification: async (
    certId: string,
    payload: UpdateCertificationPayload,
  ) => {
    set({ adminIsUpdating: true, adminError: null });
    try {
      // Admin update uses JSON (no file upload in current backend)
      // Remove file field before sending as JSON
      const { certificate_internal_url, ...jsonPayload } = payload;
      
      // Clean up undefined/null values
      const cleanedPayload = Object.fromEntries(
        Object.entries(jsonPayload).filter(
          ([_, value]) => value !== undefined && value !== null,
        ),
      );
      
      const response = await api.put<Certification>(
        `/admin/certification/${certId}`,
        cleanedPayload,
      );
      
      const updatedCert = response.data;

      set((state) => ({
        adminCertifications: state.adminCertifications.map((cert) =>
          cert.id === certId ? { ...cert, ...updatedCert } : cert,
        ),
        adminSelectedCertification:
          state.adminSelectedCertification?.id === certId
            ? { ...state.adminSelectedCertification, ...updatedCert }
            : state.adminSelectedCertification,
        adminUserCertifications: state.adminUserCertifications.map((cert) =>
          cert.id === certId ? { ...cert, ...updatedCert } : cert,
        ),
        adminIsUpdating: false,
      }));

      return updatedCert;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update certification (admin)";
      set({ adminIsUpdating: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /admin/certification/{cert_id} — Admin: Delete certification
  // ------------------------------------------------------------------
  adminDeleteCertification: async (certId: string) => {
    set({ adminIsDeleting: true, adminError: null });
    try {
      const response = await api.delete<DeleteResponse>(
        `/admin/certification/${certId}`,
      );

      set((state) => ({
        adminCertifications: state.adminCertifications.filter(
          (cert) => cert.id !== certId,
        ),
        adminSelectedCertification:
          state.adminSelectedCertification?.id === certId
            ? null
            : state.adminSelectedCertification,
        adminUserCertifications: state.adminUserCertifications.filter(
          (cert) => cert.id !== certId,
        ),
        adminIsDeleting: false,
      }));

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete certification (admin)";
      set({ adminIsDeleting: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /admin/certification/user/{user_id} — Admin: Delete all user's certs
  // ------------------------------------------------------------------
  adminDeleteUserCertifications: async (userId: string) => {
    set({ adminIsDeleting: true, adminError: null });
    try {
      const response = await api.delete<AdminDeleteUserCertsResponse>(
        `/admin/certification/user/${userId}`,
      );

      set((state) => ({
        adminCertifications: state.adminCertifications.filter(
          (cert) => cert.user_id !== userId,
        ),
        adminUserCertifications:
          state.adminCurrentUserId === userId
            ? []
            : state.adminUserCertifications,
        adminSelectedCertification: null,
        adminCurrentUserId:
          state.adminCurrentUserId === userId ? null : state.adminCurrentUserId,
        adminIsDeleting: false,
      }));

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete user certifications (admin)";
      set({ adminIsDeleting: false, adminError: message });
      throw err;
    }
  },

  // ==================== UTILITY ACTIONS ====================

  setSelectedCertification: (cert: Certification | null) => {
    set({ selectedCertification: cert });
  },

  setAdminSelectedCertification: (cert: Certification | null) => {
    set({ adminSelectedCertification: cert });
  },

  clearPublicCertifications: () => {
    set({ publicCertifications: [], publicUsername: null });
  },

  clearUserCertificationsByUsername: () => {
    set({ userCertificationsByUsername: [], viewingUsername: null });
  },

  clearAdminUserCertifications: () => {
    set({ adminUserCertifications: [], adminCurrentUserId: null });
  },

  clearError: () => set({ error: null }),

  clearAdminError: () => set({ adminError: null }),

  reset: () =>
    set({
      certifications: [],
      selectedCertification: null,
      publicCertifications: [],
      publicUsername: null,
      userCertificationsByUsername: [],
      viewingUsername: null,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isLoadingPublic: false,
      isLoadingUserByUsername: false,
      error: null,
    }),

  resetAdmin: () =>
    set({
      adminCertifications: [],
      adminSelectedCertification: null,
      adminUserCertifications: [],
      adminCurrentUserId: null,
      adminIsLoading: false,
      adminIsUpdating: false,
      adminIsDeleting: false,
      adminIsLoadingUserCerts: false,
      adminError: null,
    }),
}));