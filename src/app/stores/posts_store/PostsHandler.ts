import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer"; // Add this import
import {
  GetAllData,
  DeleteData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import {
  BulkContentUpdate,
  BulkOperationResponse,
  ContentCreate,
  ContentFilterParams,
  ContentListResponse,
  ContentStatus,
  ContentType,
  ContentUpdate,
  ContentWithAuthor,
} from "@/app/components/types and interfaces/Posts";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { toast } from "@/app/components/toastify/Toastify";
// Enable Map/Set support for Immer
enableMapSet(); // Add this call before creating the store
// ==================== Store State ====================
interface ContentStoreState {
  // Content data
  contents: Map<string, ContentWithAuthor>;
  contentList: ContentWithAuthor[];
  currentContent: ContentWithAuthor | null;

  // Pagination & filters
  currentPage: number;
  pageSize: number;
  totalContent: number;
  hasNext: boolean;
  filters: ContentFilterParams;

  // Error handling
  error: string | null;

  // API base URL
  apiBaseUrl: string;
}

interface ContentStoreActions {
  // CRUD operations
  createContent: (
    accessToken: string,
    setLoading: (key: string) => void,
    contentData: ContentCreate,
    coverImage?: File | null,
    mediaFiles?: File[] | null,
    successActions?: (newContent: ContentWithAuthor) => void
  ) => Promise<void>;

  getContentById: (
    accessToken: string,
    contentId: string,
    setLoading: (key: string) => void
  ) => Promise<void>;

  getContentBySlug: (
    accessToken: string,
    slug: string,
    setLoading: (key: string) => void
  ) => Promise<void>;

  listContent: (
    accessToken: string,
    setLoading: (key: string) => void,
    filters?: ContentFilterParams
  ) => Promise<void>;

  updateContent: (
    accessToken: string,
    contentId: string,
    setLoading: (key: string) => void,
    contentData: ContentUpdate,
    coverImage?: File | null,
    mediaFiles?: File[] | null,
    successActions?: (updatedContent: ContentWithAuthor) => void
  ) => Promise<void>;

  deleteContent: (
    accessToken: string,
    contentId: string,
    setLoading: (key: string) => void,
    hardDelete?: boolean,
    successActions?: () => void
  ) => Promise<void>;

  publishContent: (
    accessToken: string,
    contentId: string,
    setLoading: (key: string) => void,
    successActions?: () => void
  ) => Promise<void>;

  bulkUpdateContent: (
    accessToken: string,
    setLoading: (key: string) => void,
    bulkData: BulkContentUpdate,
    successActions?: () => void
  ) => Promise<void>;

  getUserContent: (
    accessToken: string,
    username: string,
    setLoading: (key: string) => void,
    filters?: Partial<ContentFilterParams>
  ) => Promise<void>;

  // Local state management
  setCurrentContent: (content: ContentWithAuthor | null) => void;
  setFilters: (filters: Partial<ContentFilterParams>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  toggleLike: (contentId: string) => void;
  toggleShare: (contentId: string) => void;
  incrementViews: (contentId: string) => void;

  // Utility
  clearError: () => void;
  setApiBaseUrl: (url: string) => void;
  reset: () => void;
}

type ContentStore = ContentStoreState & ContentStoreActions;

// ==================== Initial State ====================
const initialState: ContentStoreState = {
  contents: new Map(),
  contentList: [],
  currentContent: null,
  currentPage: 1,
  pageSize: 20,
  totalContent: 0,
  hasNext: false,
  filters: {},
  error: null,
  apiBaseUrl: "content/core",
};

// ==================== Store ====================
export const useContentStore = create<ContentStore>()(
  immer((set, get) => ({
    ...initialState,

    // ==================== CREATE ====================
    createContent: async (
      accessToken,
      setLoading,
      contentData,
      coverImage,
      mediaFiles,
      successActions
    ) => {
      if (
        !contentData.title &&
        contentData.content_type !== ContentType.ARTICLE
      ) {
        toast.warning("Title is required");
        return;
      } else if (
        !contentData.title &&
        contentData.content_type !== ContentType.POST
      ) {
        toast.warning("Headline is required");
        return;
      }
      setLoading("creating_content");
      set({ error: null });

      try {
        const formData = new FormData();

        // Add all content fields
        formData.append("title", contentData.title);
        formData.append("content_type", contentData.content_type);

        if (contentData.body && contentData.body.length > 0) {
          formData.append("body", JSON.stringify(contentData.body));
        }
        if (contentData.excerpt) {
          formData.append("excerpt", contentData.excerpt);
        }
        if (contentData.category) {
          formData.append("category", contentData.category);
        }
        if (contentData.tags && contentData.tags.length > 0) {
          formData.append("tags", contentData.tags.join(","));
        }
        if (contentData.status) {
          formData.append("status", contentData.status);
        }
        if (contentData.slug) {
          formData.append("slug", contentData.slug);
        }
        if (contentData.scheduled_publish_at) {
          formData.append(
            "scheduled_publish_at",
            contentData.scheduled_publish_at
          );
        }

        formData.append("is_public", String(contentData.is_public));
        formData.append("is_featured", String(contentData.is_featured));
        formData.append("is_pinned", String(contentData.is_pinned));
        formData.append("allow_comments", String(contentData.allow_comments));
        formData.append("allow_likes", String(contentData.allow_likes));
        formData.append("allow_reshare", String(contentData.allow_reshare));

        if (contentData.meta_title) {
          formData.append("meta_title", contentData.meta_title);
        }
        if (contentData.meta_description) {
          formData.append("meta_description", contentData.meta_description);
        }

        // Add files
        if (coverImage) {
          formData.append("cover_image", coverImage);
        }
        if (mediaFiles && mediaFiles.length > 0) {
          mediaFiles.forEach((file) => {
            formData.append("media_files", file);
          });
        }

        // Before the fetch call
        console.log("FormData contents:");
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        // Make direct fetch request
        const response = await fetch(`${V1_BASE_URL}/${get().apiBaseUrl}/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          console.log("Response not ok:", response);
          return;
        }

        const newContent: ContentWithAuthor = await response.json();

        // In the createContent function
        if (newContent) {
          // Add to store
          set((state) => {
            state.contents.set(newContent.id, newContent);
            state.contentList = [newContent, ...state.contentList];
            state.totalContent += 1;
          });

          if (successActions) {
            successActions(newContent); // Pass new content
            get().setCurrentContent(newContent);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create content"
        );
      } finally {
        setLoading("creating_content");
      }
    },

    // ==================== READ ====================
    getContentById: async (accessToken, contentId, setLoading) => {
      setLoading(`fetching_content_${contentId}`);
      set({ error: null });

      try {
        const content: ContentWithAuthor = await GetAllData({
          access: accessToken,
          url: `${get().apiBaseUrl}/${contentId}`,
        });

        if (content) {
          // Update store
          console.log("Fetched content:", content);
          set((state) => {
            state.contents.set(content.id, content);
            state.currentContent = content;
          });
        }
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch content",
        });
        console.error(error);
      } finally {
        setLoading(`fetching_content_${contentId}`);
      }
    },

    getContentBySlug: async (accessToken, slug, setLoading) => {
      setLoading(`fetching_content_slug_${slug}`);
      set({ error: null });

      try {
        const content: ContentWithAuthor = await GetAllData({
          access: accessToken,
          url: `${get().apiBaseUrl}/slug/${slug}`,
        });

        if (content) {
          // Update store
          set((state) => {
            state.contents.set(content.id, content);
            state.currentContent = content;
          });
        }
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch content",
        });
        console.error(error);
      } finally {
        setLoading(`fetching_content_slug_${slug}`);
      }
    },

    listContent: async (accessToken, setLoading, filters) => {
      setLoading("fetching_content_list");
      set({ error: null });

      try {
        const params = new URLSearchParams();
        const finalFilters = { ...get().filters, ...filters };

        Object.entries(finalFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, String(v)));
            } else {
              params.append(key, String(value));
            }
          }
        });

        const queryString = params.toString();
        const url = queryString
          ? `${get().apiBaseUrl}/?${queryString}`
          : get().apiBaseUrl;

        const data: ContentListResponse = await GetAllData({
          access: accessToken,
          url: url,
        });

        if (data) {
          // Update store
          set((state) => {
            state.contentList = data.items;
            state.totalContent = data.total;
            state.currentPage = data.page;
            state.pageSize = data.page_size;
            state.hasNext = data.has_next;

            // Update contents map
            data.items.forEach((content) => {
              state.contents.set(content.id, content);
            });
          });
        }
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch content list",
        });
        console.error(error);
      } finally {
        setLoading("fetching_content_list");
      }
    },

    // ==================== UPDATE ====================
    updateContent: async (
      accessToken,
      contentId,
      setLoading,
      contentData,
      coverImage,
      mediaFiles,
      successActions
    ) => {
      setLoading(`updating_content_${contentId}`);
      set({ error: null });

      // Optimistic update
      const previousContent = get().contents.get(contentId);
      if (previousContent) {
        set((state) => {
          const updated = { ...previousContent, ...contentData };
          state.contents.set(contentId, updated as ContentWithAuthor);

          const index = state.contentList.findIndex((c) => c.id === contentId);
          if (index !== -1) {
            state.contentList[index] = updated as ContentWithAuthor;
          }

          if (state.currentContent?.id === contentId) {
            state.currentContent = updated as ContentWithAuthor;
          }
        });
      }

      try {
        const formData = new FormData();

        // Add fields
        Object.entries(contentData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "body") {
              formData.append(key, JSON.stringify(value));
            } else if (key === "tags" && Array.isArray(value)) {
              formData.append(key, value.join(","));
            } else {
              formData.append(key, String(value));
            }
          }
        });

        if (coverImage) {
          formData.append("cover_image", coverImage);
        }
        if (mediaFiles && mediaFiles.length > 0) {
          mediaFiles.forEach((file) => {
            formData.append("media_files", file);
          });
        }

        // Make direct fetch request
        const response = await fetch(
          `${V1_BASE_URL}/${get().apiBaseUrl}/${contentId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to update content");
        }

        const updatedContent: ContentWithAuthor = await response.json();

        // In the updateContent function
        if (updatedContent) {
          // Update with server response
          set((state) => {
            state.contents.set(contentId, updatedContent);
            const index = state.contentList.findIndex(
              (c) => c.id === contentId
            );
            if (index !== -1) {
              state.contentList[index] = updatedContent;
            }
            if (state.currentContent?.id === contentId) {
              state.currentContent = updatedContent;
            }
          });

          if (successActions) {
            successActions(updatedContent); // Pass updated content
          }
        }
      } catch (error) {
        // Revert optimistic update
        if (previousContent) {
          set((state) => {
            state.contents.set(contentId, previousContent);
            const index = state.contentList.findIndex(
              (c) => c.id === contentId
            );
            if (index !== -1) {
              state.contentList[index] = previousContent;
            }
            if (state.currentContent?.id === contentId) {
              state.currentContent = previousContent;
            }
          });
        }

        set({
          error:
            error instanceof Error ? error.message : "Failed to update content",
        });
        console.error(error);
      } finally {
        setLoading(`updating_content_${contentId}`);
      }
    },

    // ==================== DELETE ====================
    deleteContent: async (
      accessToken,
      contentId,
      setLoading,
      hardDelete = true,
      successActions
    ) => {
      setLoading(`deleting_content_${contentId}`);
      set({ error: null });

      // Store for potential rollback
      const previousContent = get().contents.get(contentId);

      // Optimistic delete
      set((state) => {
        state.contents.delete(contentId);
        state.contentList = state.contentList.filter((c) => c.id !== contentId);
        if (state.currentContent?.id === contentId) {
          state.currentContent = null;
        }
        state.totalContent = Math.max(0, state.totalContent - 1);
      });

      try {
        await DeleteData({
          access: accessToken,
          url: `${get().apiBaseUrl}/${contentId}?hard_delete=${hardDelete}`,
        });

        if (successActions) {
          successActions();
        }
      } catch (error) {
        // Revert optimistic delete
        if (previousContent) {
          set((state) => {
            state.contents.set(contentId, previousContent);
            state.contentList = [...state.contentList, previousContent];
            state.totalContent += 1;
          });
        }

        set({
          error:
            error instanceof Error ? error.message : "Failed to delete content",
        });
        console.error(error);
      } finally {
        setLoading(`deleting_content_${contentId}`);
      }
    },

    // ==================== PUBLISH ====================
    publishContent: async (
      accessToken,
      contentId,
      setLoading,
      successActions
    ) => {
      setLoading(`publishing_content_${contentId}`);
      set({ error: null });

      // Optimistic update
      const previousContent = get().contents.get(contentId);
      if (previousContent) {
        set((state) => {
          const updated = {
            ...previousContent,
            status: ContentStatus.PUBLISHED,
            published_at: new Date().toISOString(),
          };
          state.contents.set(contentId, updated);

          const index = state.contentList.findIndex((c) => c.id === contentId);
          if (index !== -1) {
            state.contentList[index] = updated;
          }
        });
      }

      try {
        // Make direct fetch request
        const response = await fetch(
          `${V1_BASE_URL}/${get().apiBaseUrl}/${contentId}/publish`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({}),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to publish content");
        }

        const publishedContent: ContentWithAuthor = await response.json();

        if (publishedContent) {
          set((state) => {
            state.contents.set(contentId, publishedContent);
            const index = state.contentList.findIndex(
              (c) => c.id === contentId
            );
            if (index !== -1) {
              state.contentList[index] = publishedContent;
            }
          });

          if (successActions) {
            successActions();
          }
        }
      } catch (error) {
        // Revert
        if (previousContent) {
          set((state) => {
            state.contents.set(contentId, previousContent);
            const index = state.contentList.findIndex(
              (c) => c.id === contentId
            );
            if (index !== -1) {
              state.contentList[index] = previousContent;
            }
          });
        }

        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to publish content",
        });
        console.error(error);
      } finally {
        setLoading(`publishing_content_${contentId}`);
      }
    },

    // ==================== BULK UPDATE ====================
    bulkUpdateContent: async (
      accessToken,
      setLoading,
      bulkData,
      successActions
    ) => {
      setLoading("bulk_updating_content");
      set({ error: null });

      try {
        // Make direct fetch request
        const response = await fetch(
          `${V1_BASE_URL}/${get().apiBaseUrl}/bulk-update`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(bulkData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to bulk update content");
        }

        const result: BulkOperationResponse = await response.json();

        // Update local state for successful updates
        if (result && result.success) {
          set((state) => {
            bulkData.content_ids.forEach((id) => {
              const content = state.contents.get(id);
              if (content) {
                const updated = { ...content, ...bulkData };
                state.contents.set(id, updated as ContentWithAuthor);

                const index = state.contentList.findIndex((c) => c.id === id);
                if (index !== -1) {
                  state.contentList[index] = updated as ContentWithAuthor;
                }
              }
            });
          });

          if (successActions) {
            successActions();
          }
        }
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to bulk update content",
        });
        console.error(error);
      } finally {
        setLoading("bulk_updating_content");
      }
    },

    // ==================== GET USER CONTENT ====================
    getUserContent: async (accessToken, username, setLoading, filters) => {
      setLoading(`fetching_user_content_${username}`);
      set({ error: null });

      try {
        const params = new URLSearchParams();
        const finalFilters = { ...filters };

        Object.entries(finalFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, String(v)));
            } else {
              params.append(key, String(value));
            }
          }
        });

        const queryString = params.toString();
        const url = queryString
          ? `${get().apiBaseUrl}/user/${username}?${queryString}`
          : `${get().apiBaseUrl}/user/${username}`;

        const data: ContentListResponse = await GetAllData({
          access: accessToken,
          url: url,
        });

        if (data) {
          set((state) => {
            state.contentList = data.items;
            state.totalContent = data.total;
            state.currentPage = data.page;
            state.pageSize = data.page_size;
            state.hasNext = data.has_next;

            data.items.forEach((content) => {
              state.contents.set(content.id, content);
            });
          });
        }
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch user content",
        });
        console.error(error);
      } finally {
        setLoading(`fetching_user_content_${username}`);
      }
    },

    // ==================== LOCAL STATE MANAGEMENT ====================
    setCurrentContent: (content) => {
      set({ currentContent: content });
    },

    setFilters: (filters) => {
      set((state) => {
        state.filters = { ...state.filters, ...filters };
      });
    },

    resetFilters: () => {
      set({ filters: {} });
    },

    setPage: (page) => {
      set({ currentPage: page });
    },

    toggleLike: (contentId) => {
      set((state) => {
        const content = state.contents.get(contentId);
        if (content) {
          const isLiked = !content.is_liked;
          const updated = {
            ...content,
            is_liked: isLiked,
            likes_count: isLiked
              ? content.likes_count + 1
              : Math.max(0, content.likes_count - 1),
          };
          state.contents.set(contentId, updated);

          const index = state.contentList.findIndex((c) => c.id === contentId);
          if (index !== -1) {
            state.contentList[index] = updated;
          }

          if (state.currentContent?.id === contentId) {
            state.currentContent = updated;
          }
        }
      });
    },

    toggleShare: (contentId) => {
      set((state) => {
        const content = state.contents.get(contentId);
        if (content) {
          const isShared = !content.is_shared;
          const updated = {
            ...content,
            is_shared: isShared,
            shares_count: isShared
              ? content.shares_count + 1
              : Math.max(0, content.shares_count - 1),
          };
          state.contents.set(contentId, updated);

          const index = state.contentList.findIndex((c) => c.id === contentId);
          if (index !== -1) {
            state.contentList[index] = updated;
          }

          if (state.currentContent?.id === contentId) {
            state.currentContent = updated;
          }
        }
      });
    },

    incrementViews: (contentId) => {
      set((state) => {
        const content = state.contents.get(contentId);
        if (content) {
          const updated = {
            ...content,
            views_count: content.views_count + 1,
          };
          state.contents.set(contentId, updated);

          const index = state.contentList.findIndex((c) => c.id === contentId);
          if (index !== -1) {
            state.contentList[index] = updated;
          }

          if (state.currentContent?.id === contentId) {
            state.currentContent = updated;
          }
        }
      });
    },

    // ==================== UTILITY ====================
    clearError: () => {
      set({ error: null });
    },

    setApiBaseUrl: (url) => {
      set({ apiBaseUrl: url });
    },

    reset: () => {
      set(initialState);
    },
  }))
);

// ==================== Selectors ====================
export const selectContentById = (id: string) => (state: ContentStore) =>
  state.contents.get(id);

export const selectContentsByType =
  (type: ContentType) => (state: ContentStore) =>
    state.contentList.filter((c) => c.content_type === type);

export const selectPublishedContent = (state: ContentStore) =>
  state.contentList.filter((c) => c.status === ContentStatus.PUBLISHED);

export const selectDraftContent = (state: ContentStore) =>
  state.contentList.filter((c) => c.status === ContentStatus.DRAFT);

export const selectFeaturedContent = (state: ContentStore) =>
  state.contentList.filter((c) => c.is_featured);
