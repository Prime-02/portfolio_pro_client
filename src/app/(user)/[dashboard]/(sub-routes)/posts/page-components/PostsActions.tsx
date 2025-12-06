import Button from "@/app/components/buttons/Buttons";
import { toast } from "@/app/components/toastify/Toastify";
import {
  ContentCreate,
  ContentStatus,
  ContentType,
  MediaUrl,
} from "@/app/components/types and interfaces/Posts";
import { base64ToFile } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import PostForm from "./PostForm";
import ArticleForm from "./ArticleForm";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import PostsBodyManager from "./PostsBodyManager";

const PostsActions = () => {
  const {
    checkParams,
    setLoading,
    extendRouteWithQuery,
    accessToken,
    isLoading,
  } = useGlobalState();
  const {
    createContent,
    currentContent,
    updateContent: updateContentHandler,
  } = useContentStore();
  const [pendingCoverFile, setPendingCoverFile] = useState("");
  const contentType = checkParams("type") || ContentType.POST;
  const updateId = checkParams("edit") || checkParams(ContentStatus.DRAFT);
  const [content, setContent] = useState<ContentCreate>({
    title: currentContent?.title || "",
    status: currentContent?.status || ContentStatus.DRAFT,
    content_type:
      currentContent?.content_type || contentType === ContentType.POST
        ? ContentType.POST
        : ContentType.ARTICLE,
    body: currentContent?.body || [],
    is_featured: currentContent?.is_featured || false,
    is_pinned: currentContent?.is_pinned || false,
    is_public: currentContent?.is_public || true,
    allow_comments: currentContent?.allow_comments || true,
    allow_likes: currentContent?.allow_likes || true,
    allow_reshare: currentContent?.allow_reshare || true,
  });
  const [isBodySynced, setIsBodySynced] = useState(false);

  // CRITICAL: Sync media URLs to body FIRST when currentContent changes
  useEffect(() => {
    if (!currentContent) {
      setIsBodySynced(false);
      return;
    }

    console.log("CurrentContent changed, syncing media URLs to body...");

    // Start with the current content's body
    let syncedBody = [...(currentContent.body || [])];

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
            (item) => Object.keys(item)[0] === bodyKey
          );

          if (existingIndex !== -1) {
            // Update existing media entry
            syncedBody[existingIndex] = { [bodyKey]: mediaValue };
          } else {
            // Add new media entry
            syncedBody.push({ [bodyKey]: mediaValue });
          }
        }
      });
    }

    console.log("Synced body with media URLs:", syncedBody);

    // Update content state with synced body
    setContent({
      ...currentContent,
      body: syncedBody,
    });

    // Mark as synced so PostsBodyManager can initialize
    setIsBodySynced(true);
  }, [currentContent]);

  const handleFieldChange = (
    key: keyof ContentCreate,
    value: File | string | boolean | null
  ) => {
    setContent((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveContent = async (data: {
    file: File | null;
    croppedImage: string | null;
  }) => {
    if (!data.croppedImage) {
      toast.error("Please crop an image first");
      return;
    }

    const convertedImg = await base64ToFile(
      data.croppedImage,
      content.title || "cover"
    );

    try {
      await createContent(
        accessToken,
        setLoading,
        content,
        convertedImg,
        null,
        () => {
          toast.success(`${content.title} saved to draft.`);
        }
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
        content.title || "cover"
      );
    }

    try {
      await updateContentHandler(
        accessToken,
        updateId || currentContent?.id || "",
        setLoading,
        content,
        null,
        convertedImg ? [convertedImg] : null,
        (updatedContent) => {
          toast.success(`${content.title} updated.`);
          console.log("Updated content:", updatedContent);
          // The useEffect will handle syncing when currentContent updates
        }
      );
    } catch (error) {
      console.log("Error updating content", error);
    }
  };

  useEffect(() => {
    if (currentContent) {
      extendRouteWithQuery({
        [ContentStatus.DRAFT]: currentContent?.id || "",
      });
    }
  }, [currentContent]);

  return (
    <main className="relative">
      {contentType === ContentType.ARTICLE &&
        updateId &&
        content.title &&
        content.cover_image_url &&
        isBodySynced && ( // Only render PostsBodyManager AFTER sync is complete
          <PostsBodyManager
            body={content.body}
            setBody={(body) => setContent((prev) => ({ ...prev, body }))}
            save={updateContent}
          />
        )}
      <span className="abackdrop-blur-3xl p-1 rounded-full text-sm font-medium">
        {isBodySynced ? "Body synced" : "Syncing body..."}
      </span>
      <div className="flex w-full gap-x-2 max-w-sm items-center justify-start">
        <Button
          size="sm"
          variant={contentType === ContentType.POST ? "outline" : "primary"}
          text="Article"
          onClick={() => {
            extendRouteWithQuery({ type: ContentType.ARTICLE });
          }}
        />
        <Button
          size="sm"
          variant={contentType === ContentType.ARTICLE ? "outline" : "primary"}
          text="Post"
          onClick={() => {
            extendRouteWithQuery({ type: ContentType.POST });
          }}
        />
      </div>
      <div>
        {contentType === ContentType.POST ? (
          <PostForm />
        ) : (
          <ArticleForm
            content={content}
            handleFieldChange={handleFieldChange}
            draft={saveContent}
            setPendingCoverFile={setPendingCoverFile}
          />
        )}
      </div>
    </main>
  );
};

export default PostsActions;
