import { toast } from "@/app/components/toastify/Toastify";
import {
  ContentCreate,
  ContentStatus,
  ContentType,
  ContentWithAuthor,
  MediaUrl,
} from "@/app/components/types and interfaces/Posts";
import { base64ToFile } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState, useRef } from "react";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import ContentBodyManager from "./ContentBodyManager";
import ArticleForm from "./ArticleForm";

const ContentsActions = () => {
  const {
    checkParams,
    setLoading,
    extendRouteWithQuery,
    accessToken,
    isLoading,
    userData,
  } = useGlobalState();
  const {
    createContent,
    currentContent,
    updateContent: updateContentHandler,
    setCurrentContent,
  } = useContentStore();
  const [pendingCoverFile, setPendingCoverFile] = useState("");
  const contentType = checkParams("type") || ContentType.POST;
  const updateId = checkParams("edit") || checkParams(ContentStatus.DRAFT);

  const [isBodySynced, setIsBodySynced] = useState(false);
  const hasSyncedRef = useRef(false);

  const titleHandler = () => {
    // For POST content type, set title from first text element or generate random ID
    if (contentType === ContentType.POST) {
      let postTitle = currentContent?.title || "";

      // Find first text element in body
      const firstTextElement = currentContent?.body?.find((item) => {
        const key = Object.keys(item)[0];
        return key.startsWith("text");
      });

      if (firstTextElement) {
        const textValue = Object.values(firstTextElement)[0];
        // Use text value if it's not empty and not just a hex color
        const isTextHex = /^#[0-9A-Fa-f]{6}$/.test(textValue);
        if (textValue && !isTextHex) {
          // Truncate to reasonable length for title (e.g., first 50 chars)
          postTitle = textValue.slice(0, 50).trim();
        }
      }

      // If still no title, generate random ID
      if (!postTitle) {
        postTitle = `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }

      // Update currentContent with the title
      setCurrentContent({
        ...currentContent,
        title: postTitle,
      } as ContentWithAuthor);
    }
  };

  // Reset sync flag when content ID changes
  useEffect(() => {
    hasSyncedRef.current = false;
    setIsBodySynced(false);
  }, [currentContent?.id]);

  // CRITICAL: Sync media URLs to body FIRST when currentContent changes
  useEffect(() => {
    if (!currentContent || hasSyncedRef.current) {
      return;
    }

    console.log("CurrentContent changed, syncing media URLs to body...");

    // Start with the current content's body
    let syncedBody = [...(currentContent.body || [])];
    let hasChanges = false;

    // If there are media_urls, sync them into the body
    if (currentContent.media_urls && currentContent.media_urls.length > 0) {
      currentContent.media_urls.forEach((mediaUrl: MediaUrl) => {
        // Extract the index from public_id (e.g., "media_0" -> 0)
        const match = mediaUrl.public_id.match(/media_(\d+)$/);

        if (match) {
          const mediaIndex = parseInt(match[1], 10);
          const bodyKey = `media${mediaIndex + 1}`; // media_0 becomes media1
          const mediaValue = `${mediaUrl.url} | ${mediaUrl.type} | ${mediaUrl.public_id} | ${mediaUrl.content_type}`;

          console.log(`Syncing ${bodyKey}:`, mediaValue);

          // Find if this media key already exists in body
          const existingIndex = syncedBody.findIndex(
            (item) => Object.keys(item)[0] === bodyKey,
          );

          if (existingIndex !== -1) {
            // Update existing media entry
            syncedBody[existingIndex] = { [bodyKey]: mediaValue };
          } else {
            // Add new media entry
            syncedBody.push({ [bodyKey]: mediaValue });
          }
          hasChanges = true;
        }
      });
    }

    console.log("Synced body with media URLs:", syncedBody);

    // Only update if there were actual changes
    if (hasChanges) {
      setCurrentContent({
        ...currentContent,
        body: syncedBody,
      });
    }

    // Mark as synced so ArticleBodyManager can initialize
    setIsBodySynced(true);
    hasSyncedRef.current = true;
  }, [currentContent?.id]); // Only re-run when content ID changes

  const handleFieldChange = (
    key: keyof ContentCreate,
    value: File | string | boolean | null,
  ) => {
    setCurrentContent({
      ...currentContent,
      [key]: value,
    } as ContentWithAuthor);
  };

  const saveContent = async (data?: {
    file: File | null;
    croppedImage: string | null;
  }) => {
    if (data && !data.croppedImage) {
      toast.error("Please crop an image first");
      return;
    }
    let convertedImg = null;
    if (data && data.croppedImage) {
      convertedImg = await base64ToFile(
        (data && data.croppedImage) || "",
        currentContent?.title || "cover",
      );
    }
    try {
      // For POST content, pass media as mediaFiles; for ARTICLE, as coverImage
      titleHandler(); // Ensure title is set before saving
      const isArticle = contentType === ContentType.ARTICLE;
      await createContent(
        accessToken,
        setLoading,
        currentContent as ContentCreate,
        isArticle ? convertedImg : null, // coverImage for articles only
        isArticle ? null : convertedImg ? [convertedImg] : null, // mediaFiles for posts
        (newContent) => {
          // Sync media URLs to body immediately if media was uploaded
          if (newContent.media_urls && newContent.media_urls.length > 0) {
            let syncedBody = [...(newContent.body || [])];

            newContent.media_urls.forEach((mediaUrl) => {
              // Extract the index from public_id (e.g., "media_0" -> 0)
              const match = mediaUrl.public_id.match(/media_(\d+)$/);

              if (match) {
                const mediaIndex = parseInt(match[1], 10);
                const bodyKey = `media${mediaIndex + 1}`; // media_0 becomes media1
                const mediaValue = `${mediaUrl.url} | ${mediaUrl.type} | ${mediaUrl.public_id} | ${mediaUrl.content_type}`;

                // Find if this media key already exists in body
                const existingIndex = syncedBody.findIndex(
                  (item) => Object.keys(item)[0] === bodyKey,
                );

                if (existingIndex !== -1) {
                  // Update existing media entry
                  syncedBody[existingIndex] = { [bodyKey]: mediaValue };
                } else {
                  // Add new media entry (shouldn't happen, but just in case)
                  syncedBody.push({ [bodyKey]: mediaValue });
                }
              }
            });

            // Update the content state with synced body
            setCurrentContent({
              ...newContent,
              body: syncedBody,
            } as ContentWithAuthor);
          } else {
            setCurrentContent(newContent as ContentWithAuthor);
          }

          toast.success(
            `${contentType === ContentType.POST ? "Post" : newContent.title} Uploaded. You can continue editing or close this tab if finished.`,
          );
        },
      );
    } catch (error) {
      console.log("Error saving content to draft", error);
    }
  };

  const updateContent = async (data?: {
    file: File | null;
    croppedImage: string | null;
  }) => {
    let convertedImg;
    if (data && data.croppedImage) {
      convertedImg = await base64ToFile(
        data.croppedImage,
        currentContent?.title || "cover",
      );
    }

    try {
      titleHandler(); // Ensure title is set before updating
      await updateContentHandler(
        accessToken,
        updateId || currentContent?.id || "",
        setLoading,
        currentContent as ContentCreate,
        null,
        convertedImg ? [convertedImg] : null,
        (updatedContent) => {
          // Sync media URLs to body immediately if media was uploaded
          if (
            updatedContent.media_urls &&
            updatedContent.media_urls.length > 0
          ) {
            let syncedBody = [...(updatedContent.body || [])];

            updatedContent.media_urls.forEach((mediaUrl) => {
              // Extract the index from public_id (e.g., "media_0" -> 0)
              const match = mediaUrl.public_id.match(/media_(\d+)$/);

              if (match) {
                const mediaIndex = parseInt(match[1], 10);
                const bodyKey = `media${mediaIndex + 1}`; // media_0 becomes media1
                const mediaValue = `${mediaUrl.url} | ${mediaUrl.type} | ${mediaUrl.public_id} | ${mediaUrl.content_type}`;

                // Find if this media key already exists in body
                const existingIndex = syncedBody.findIndex(
                  (item) => Object.keys(item)[0] === bodyKey,
                );

                if (existingIndex !== -1) {
                  // Update existing media entry
                  syncedBody[existingIndex] = { [bodyKey]: mediaValue };
                } else {
                  // Add new media entry (shouldn't happen, but just in case)
                  syncedBody.push({ [bodyKey]: mediaValue });
                }
              }
            });

            // Update the content state with synced body
            setCurrentContent({
              ...updatedContent,
              body: syncedBody,
            } as ContentWithAuthor);
          } else {
            setCurrentContent(updatedContent as ContentWithAuthor);
          }

          toast.success(
            `${contentType === ContentType.POST ? "Post" : currentContent?.title || "Content"} Updated. You can continue editing or close this tab if finished.`,
          );
          console.log("Updated content:", updatedContent);
        },
      );
    } catch (error) {
      console.log("Error updating content", error);
    }
  };

  const contentHandler = async (data?: {
    file: File | null;
    croppedImage: string | null;
  }) => {
    try {
      if (updateId || currentContent?.id) {
        updateContent(data);
      } else {
        saveContent(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentContent) {
      extendRouteWithQuery({
        [ContentStatus.DRAFT]: currentContent?.id || "",
      });
    }
  }, [currentContent?.id]); // Changed dependency to only currentContent?.id

  return (
    <main className="relative">
      {contentType === ContentType.ARTICLE &&
        updateId &&
        currentContent?.title &&
        currentContent?.cover_image_url &&
        isBodySynced && ( // Only render ContentBodyManager AFTER sync is complete
          <ContentBodyManager
            body={currentContent.body}
            setBody={(body) =>
              setCurrentContent({
                ...currentContent,
                body,
              } as ContentWithAuthor)
            }
            save={updateContent}
            contentType={ContentType.ARTICLE}
          />
        )}
      {contentType === ContentType.POST && ( // Only render ContentBodyManager AFTER sync is complete
        <ContentBodyManager
          body={currentContent?.body}
          setBody={(body) =>
            setCurrentContent({ ...currentContent, body } as ContentWithAuthor)
          }
          save={contentHandler}
          contentType={ContentType.POST}
        />
      )}
      <div>
        {contentType === ContentType.ARTICLE && (
          <ArticleForm
            content={currentContent as ContentCreate}
            contentId={updateId || currentContent?.id || ""}
            handleFieldChange={handleFieldChange}
            draft={saveContent}
            setPendingCoverFile={setPendingCoverFile}
          />
        )}
      </div>
    </main>
  );
};

export default ContentsActions;
