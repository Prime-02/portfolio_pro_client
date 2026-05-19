// stores/useSocialLinks.ts
import { create } from "zustand";
import { api } from "@/lib/client/api";

// ---------------------------------------------------------------------------
// Types — matching the backend schemas
// ---------------------------------------------------------------------------

export interface SocialLink {
  id: string;
  platform_name: string;
  profile_url: string;
  profile_headline?: string | null;
  url_type?: string | null;
  user_id?: string;
  created_at?: string;
}

export interface AdminSocialLink {
  id: string;
  user_id: string;
  platform_name: string;
  profile_url: string;
  profile_headline?: string | null;
  url_type?: string | null;
  created_at: string;
}

export interface CreateSocialLinkPayload {
  platform_name: string;
  profile_url: string;
  profile_headline?: string | null;
  url_type?: string | null;
}

export interface UpdateSocialLinkPayload {
  platform_name?: string | null;
  profile_url?: string | null;
  profile_headline?: string | null;
  url_type?: string | null;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface AdminDeleteUserSocialsResponse {
  success: boolean;
  message: string;
  deleted_count: number;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface SocialLinksState {
  // ==================== USER STATE ====================
  socialLinks: SocialLink[];
  selectedSocialLink: SocialLink | null;
  publicSocialLinks: SocialLink[];
  publicUsername: string | null;

  // User loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingPublic: boolean;

  // ==================== ADMIN STATE ====================
  adminSocialLinks: AdminSocialLink[];
  adminSelectedSocialLink: AdminSocialLink | null;
  adminUserSocialLinks: AdminSocialLink[];
  adminCurrentUserId: string | null;

  // Admin loading states
  adminIsLoading: boolean;
  adminIsUpdating: boolean;
  adminIsDeleting: boolean;
  adminIsLoadingUserSocials: boolean;

  // Error
  error: string | null;
  adminError: string | null;

  // ==================== USER ACTIONS ====================

  // Authenticated user actions
  fetchAllSocialLinks: () => Promise<SocialLink[]>;
  fetchSocialLinkById: (socialId: string) => Promise<SocialLink>;
  createSocialLink: (payload: CreateSocialLinkPayload) => Promise<SocialLink>;
  updateSocialLink: (
    socialId: string,
    payload: UpdateSocialLinkPayload,
  ) => Promise<SocialLink>;
  deleteSocialLink: (socialId: string) => Promise<DeleteResponse>;

  // Public actions
  fetchPublicSocialLinks: (username: string) => Promise<SocialLink[]>;

  // ==================== ADMIN ACTIONS ====================

  // Admin actions
  adminFetchAllSocialLinks: () => Promise<AdminSocialLink[]>;
  adminFetchSocialLinkById: (socialId: string) => Promise<AdminSocialLink>;
  adminFetchUserSocialLinks: (userId: string) => Promise<AdminSocialLink[]>;
  adminUpdateSocialLink: (
    socialId: string,
    payload: UpdateSocialLinkPayload,
  ) => Promise<SocialLink>;
  adminDeleteSocialLink: (socialId: string) => Promise<DeleteResponse>;
  adminDeleteUserSocialLinks: (
    userId: string,
  ) => Promise<AdminDeleteUserSocialsResponse>;

  // ==================== UTILITY ACTIONS ====================

  setSelectedSocialLink: (link: SocialLink | null) => void;
  setAdminSelectedSocialLink: (link: AdminSocialLink | null) => void;
  clearPublicSocialLinks: () => void;
  clearAdminUserSocialLinks: () => void;
  clearError: () => void;
  clearAdminError: () => void;
  reset: () => void;
  resetAdmin: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSocialLinks = create<SocialLinksState>()((set, get) => ({
  // ==================== USER DEFAULTS ====================
  socialLinks: [],
  selectedSocialLink: null,
  publicSocialLinks: [],
  publicUsername: null,

  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isLoadingPublic: false,

  // ==================== ADMIN DEFAULTS ====================
  adminSocialLinks: [],
  adminSelectedSocialLink: null,
  adminUserSocialLinks: [],
  adminCurrentUserId: null,

  adminIsLoading: false,
  adminIsUpdating: false,
  adminIsDeleting: false,
  adminIsLoadingUserSocials: false,

  // Errors
  error: null,
  adminError: null,

  // ==================== USER ACTIONS ====================

  // ------------------------------------------------------------------
  // GET /socials/ — Fetch all social links for authenticated user
  // ------------------------------------------------------------------
  fetchAllSocialLinks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<SocialLink[]>("/socials/");
      const links = response.data;
      set({ socialLinks: links, isLoading: false });
      return links;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch social links";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /socials/{social_id} — Fetch a specific social link
  // ------------------------------------------------------------------
  fetchSocialLinkById: async (socialId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<SocialLink>(`/socials/${socialId}`);
      const link = response.data;
      set({ selectedSocialLink: link, isLoading: false });
      return link;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch social link";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // POST /socials/ — Create a new social link
  // ------------------------------------------------------------------
  createSocialLink: async (payload: CreateSocialLinkPayload) => {
    set({ isCreating: true, error: null });
    try {
      const response = await api.post<SocialLink>("/socials/", payload);
      const newLink = response.data;

      set((state) => ({
        socialLinks: [...state.socialLinks, newLink],
        isCreating: false,
      }));

      return newLink;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create social link";
      set({ isCreating: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // PUT /socials/{social_id} — Update a social link
  // ------------------------------------------------------------------
  updateSocialLink: async (
    socialId: string,
    payload: UpdateSocialLinkPayload,
  ) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await api.put<SocialLink>(
        `/socials/${socialId}`,
        payload,
      );
      const updatedLink = response.data;

      set((state) => ({
        socialLinks: state.socialLinks.map((link) =>
          link.id === socialId ? updatedLink : link,
        ),
        selectedSocialLink:
          state.selectedSocialLink?.id === socialId
            ? updatedLink
            : state.selectedSocialLink,
        isUpdating: false,
      }));

      return updatedLink;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update social link";
      set({ isUpdating: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /socials/{social_id} — Delete a social link
  // ------------------------------------------------------------------
  deleteSocialLink: async (socialId: string) => {
    set({ isDeleting: true, error: null });
    try {
      const response = await api.delete<DeleteResponse>(`/socials/${socialId}`);

      set((state) => ({
        socialLinks: state.socialLinks.filter((link) => link.id !== socialId),
        selectedSocialLink:
          state.selectedSocialLink?.id === socialId
            ? null
            : state.selectedSocialLink,
        isDeleting: false,
      }));

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete social link";
      set({ isDeleting: false, error: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /socials/public/{username} — Fetch public social links
  // ------------------------------------------------------------------
  fetchPublicSocialLinks: async (username: string) => {
    set({ isLoadingPublic: true, error: null });
    try {
      const response = await api.get<SocialLink[]>(
        `/socials/public/${username}`,
      );
      const links = response.data;
      set({
        publicSocialLinks: links,
        publicUsername: username,
        isLoadingPublic: false,
      });
      return links;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch public social links";
      set({ isLoadingPublic: false, error: message });
      throw err;
    }
  },

  // ==================== ADMIN ACTIONS ====================

  // ------------------------------------------------------------------
  // GET /admin/socials/ — Admin: Get all social links
  // ------------------------------------------------------------------
  adminFetchAllSocialLinks: async () => {
    set({ adminIsLoading: true, adminError: null });
    try {
      const response = await api.get<AdminSocialLink[]>("/admin/socials/");
      const links = response.data;
      set({ adminSocialLinks: links, adminIsLoading: false });
      return links;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch all social links (admin)";
      set({ adminIsLoading: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /admin/socials/{social_id} — Admin: Get a specific social link
  // ------------------------------------------------------------------
  adminFetchSocialLinkById: async (socialId: string) => {
    set({ adminIsLoading: true, adminError: null });
    try {
      const response = await api.get<AdminSocialLink>(
        `/admin/socials/${socialId}`,
      );
      const link = response.data;
      set({ adminSelectedSocialLink: link, adminIsLoading: false });
      return link;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch social link (admin)";
      set({ adminIsLoading: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // GET /admin/socials/user/{user_id} — Admin: Get user's social links
  // ------------------------------------------------------------------
  adminFetchUserSocialLinks: async (userId: string) => {
    set({ adminIsLoadingUserSocials: true, adminError: null });
    try {
      const response = await api.get<AdminSocialLink[]>(
        `/admin/socials/user/${userId}`,
      );
      const links = response.data;
      set({
        adminUserSocialLinks: links,
        adminCurrentUserId: userId,
        adminIsLoadingUserSocials: false,
      });
      return links;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch user social links (admin)";
      set({ adminIsLoadingUserSocials: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // PUT /admin/socials/{social_id} — Admin: Update a social link
  // ------------------------------------------------------------------
  adminUpdateSocialLink: async (
    socialId: string,
    payload: UpdateSocialLinkPayload,
  ) => {
    set({ adminIsUpdating: true, adminError: null });
    try {
      const response = await api.put<SocialLink>(
        `/admin/socials/${socialId}`,
        payload,
      );
      const updatedLink = response.data;

      set((state) => ({
        adminSocialLinks: state.adminSocialLinks.map((link) =>
          link.id === socialId ? { ...link, ...updatedLink } : link,
        ),
        adminSelectedSocialLink:
          state.adminSelectedSocialLink?.id === socialId
            ? { ...state.adminSelectedSocialLink, ...updatedLink }
            : state.adminSelectedSocialLink,
        adminUserSocialLinks: state.adminUserSocialLinks.map((link) =>
          link.id === socialId ? { ...link, ...updatedLink } : link,
        ),
        adminIsUpdating: false,
      }));

      return updatedLink;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update social link (admin)";
      set({ adminIsUpdating: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /admin/socials/{social_id} — Admin: Delete a social link
  // ------------------------------------------------------------------
  adminDeleteSocialLink: async (socialId: string) => {
    set({ adminIsDeleting: true, adminError: null });
    try {
      const response = await api.delete<DeleteResponse>(
        `/admin/socials/${socialId}`,
      );

      set((state) => ({
        adminSocialLinks: state.adminSocialLinks.filter(
          (link) => link.id !== socialId,
        ),
        adminSelectedSocialLink:
          state.adminSelectedSocialLink?.id === socialId
            ? null
            : state.adminSelectedSocialLink,
        adminUserSocialLinks: state.adminUserSocialLinks.filter(
          (link) => link.id !== socialId,
        ),
        adminIsDeleting: false,
      }));

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete social link (admin)";
      set({ adminIsDeleting: false, adminError: message });
      throw err;
    }
  },

  // ------------------------------------------------------------------
  // DELETE /admin/socials/user/{user_id} — Admin: Delete all user's socials
  // ------------------------------------------------------------------
  adminDeleteUserSocialLinks: async (userId: string) => {
    set({ adminIsDeleting: true, adminError: null });
    try {
      const response = await api.delete<AdminDeleteUserSocialsResponse>(
        `/admin/socials/user/${userId}`,
      );

      set((state) => ({
        adminSocialLinks: state.adminSocialLinks.filter(
          (link) => link.user_id !== userId,
        ),
        adminUserSocialLinks:
          state.adminCurrentUserId === userId ? [] : state.adminUserSocialLinks,
        adminSelectedSocialLink: null,
        adminCurrentUserId:
          state.adminCurrentUserId === userId ? null : state.adminCurrentUserId,
        adminIsDeleting: false,
      }));

      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete user social links (admin)";
      set({ adminIsDeleting: false, adminError: message });
      throw err;
    }
  },

  // ==================== UTILITY ACTIONS ====================

  setSelectedSocialLink: (link: SocialLink | null) => {
    set({ selectedSocialLink: link });
  },

  setAdminSelectedSocialLink: (link: AdminSocialLink | null) => {
    set({ adminSelectedSocialLink: link });
  },

  clearPublicSocialLinks: () => {
    set({ publicSocialLinks: [], publicUsername: null });
  },

  clearAdminUserSocialLinks: () => {
    set({ adminUserSocialLinks: [], adminCurrentUserId: null });
  },

  clearError: () => set({ error: null }),

  clearAdminError: () => set({ adminError: null }),

  reset: () =>
    set({
      socialLinks: [],
      selectedSocialLink: null,
      publicSocialLinks: [],
      publicUsername: null,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isLoadingPublic: false,
      error: null,
    }),

  resetAdmin: () =>
    set({
      adminSocialLinks: [],
      adminSelectedSocialLink: null,
      adminUserSocialLinks: [],
      adminCurrentUserId: null,
      adminIsLoading: false,
      adminIsUpdating: false,
      adminIsDeleting: false,
      adminIsLoadingUserSocials: false,
      adminError: null,
    }),
}));
