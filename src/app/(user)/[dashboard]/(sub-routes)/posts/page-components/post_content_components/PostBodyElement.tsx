import React, { useState, useEffect, useCallback } from "react";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import { TextArea } from "@/app/components/inputs/TextArea";
import ImageCropper from "@/app/components/inputs/ImageUploader";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import { useGlobalState } from "@/app/globalStateProvider";
import { toast } from "@/app/components/toastify/Toastify";
import { base64ToFile } from "@/app/components/utilities/syncFunctions/syncs";

const PostBodyElement = ({
  item,
  index,
  isActive,
  setActiveAction,
  onClose,
  onUpdate,
  action,
}: {
  item: Record<string, string>;
  action: string;
  index: number;
  isActive: boolean;
  setActiveAction: (index: number) => void;
  onClose: () => void;
  onUpdate?: (updatedValue: string) => void;
}) => {
  const key = Object.keys(item)[0];
  const value = item[key];
  const { replaceMediaInContent, currentContent } = useContentStore();
  const { isLoading, accessToken, setLoading } = useGlobalState();
  const [color, setColor] = useState<string>("#000000");
  const [localText, setLocalText] = useState<string>("");
  const [localMediaUrl, setLocalMediaUrl] = useState<string>("");
  const [localMediaValue, setLocalMediaValue] = useState<string>(""); // Store full media value
  const [showEditor, setShowEditor] = useState(false);

  // Get the current value directly from store - this is the source of truth
  const storeBodyValue = currentContent?.body?.[index]?.[action];

  // Parse initial value to extract text/color or media url
  // Constantly recover value from store
  useEffect(() => {
    // Always prioritize store value over prop
    const currentValue = storeBodyValue || value;

    console.log(`[PostBodyElement ${index}] Value update:`, {
      storeBodyValue,
      propValue: value,
      currentValue,
      updated_at: currentContent?.updated_at,
    });

    if (currentValue && key.startsWith("text")) {
      // Match exactly 6 hex characters at the end of the string
      const hexMatch = currentValue.match(/#[0-9a-fA-F]{6}$/);
      if (hexMatch) {
        const hexCode = hexMatch[0];
        const textWithoutColor = currentValue.slice(
          0,
          currentValue.lastIndexOf(hexCode),
        );
        setLocalText(textWithoutColor);
        setColor(hexCode);
      } else {
        setLocalText(currentValue);
      }
    } else if (currentValue && key.startsWith("media")) {
      // Store the FULL value string to preserve public_id
      setLocalMediaValue(currentValue);
      // Also extract just the URL for display
      const mediaUrl = currentValue.split(" | ")[0];
      setLocalMediaUrl(mediaUrl);
      console.log(`[PostBodyElement ${index}] Media URL updated to:`, mediaUrl);
    }
  }, [storeBodyValue, value, key, currentContent?.updated_at, index, action]); // Watch store value directly

  // Save media changes back to parent/store
  const saveMediaChanges = useCallback(() => {
    if (key.startsWith("media") && localMediaUrl && value) {
      // Reconstruct the full value maintaining the exact original format
      const parts = value.split(" | ");
      // Replace only the URL (position 0) and keep other parts intact
      parts[0] = localMediaUrl;
      const updatedValue = parts.join(" | ");
      // Notify parent of the updated media value
      if (onUpdate) {
        onUpdate(updatedValue);
      }
    }
  }, [key, localMediaUrl, value, onUpdate]);

  const handleTextChange = (newText: string) => {
    setLocalText(newText);
    if (key.startsWith("text") && onUpdate) {
      onUpdate(`${newText}${color}`);
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (key.startsWith("text") && onUpdate) {
      onUpdate(`${localText}${newColor}`);
    }
  };

  const handleMediaUpload = async (data: {
    file: File | null;
    croppedImage: string | null;
  }) => {
    if (!data.croppedImage || !accessToken) return;
    setLoading(`uploading_media_${index}`);

    try {
      // Priority order for getting media value:
      // 1. Original value prop (most reliable)
      // 2. Store value
      // 3. Local state (preserves value even after re-renders)
      let currentValue =
        value || currentContent?.body?.[index][action] || localMediaValue;

      // Split the pipe-separated string
      // Format: "URL | type | public_id | mime_type"
      const parts = currentValue.split(" | ");
      console.log("Split parts:", parts);

      const currentMediaUrl = parts[0]?.trim() || "";
      const mediaType = parts[1]?.trim() || "";
      const publicId = parts[2]?.trim() || "";
      const mimeType = parts[3]?.trim() || "";

      console.log("Extracted data:", {
        url: currentMediaUrl,
        type: mediaType,
        publicId: publicId,
        mimeType: mimeType,
      });

      if (!publicId) {
        toast.error("Media ID not found in the data. Cannot replace media.");
        console.log("ERROR: No public_id found in parts");
        console.log("Full value string:", currentValue);
        return;
      }

      if (!currentMediaUrl) {
        toast.error("Media URL not found. Cannot replace media.");
        console.log("ERROR: No media URL found");
        return;
      }

      console.log("Deleting media with public_id:", publicId);

      let convertedImg = null;
      if (data && data.croppedImage) {
        convertedImg = await base64ToFile(
          (data && data.croppedImage) || "",
          currentContent?.title || "cover",
        );
      }

      if (!convertedImg) {
        toast.error("Failed to process the cropped image. Please try again.");
        console.log("ERROR: Converted image is null");
        return;
      }

      // Delete the old media from Cloudinary
      await replaceMediaInContent(
        accessToken,
        currentContent?.id as string,
        publicId,
        convertedImg as File,
        setLoading,
        () => {
          // Close editor after successful replacement
          setShowEditor(false);
        },
      );
      console.log("Media replaced successfully");
      onClose();
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("Failed to upload media. Please try again.");
    } finally {
      setLoading(`uploading_media_${index}`);
    }
  };

  // Text Element
  if (key.startsWith("text")) {
    return (
      <div
        onClick={() => {
          setActiveAction(index);
          setShowEditor(true);
          onClose();
        }}
        className="w-full flex-shrink-0 h-full flex items-center justify-center cursor-pointer group transition-opacity hover:opacity-80 snap-center"
        style={{ backgroundColor: color }}
      >
        {!isActive || !showEditor ? (
          <div className="px-6 py-4 text-center max-w-2xl">
            <p className="md:text-5xl text-3xl font-bold text-white break-words">
              {localText || "Empty text block"}
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col relative">
            <TextArea
              value={localText}
              className={`modText md:text-5xl text-3xl h-full text-white font-bold text-center w-full`}
              placeholder="What's on your mind?"
              onChange={handleTextChange}
              maxLength={500}
              style={{ backgroundColor: color }}
            />
          </div>
        )}
      </div>
    );
  }

  // Media Element
  if (key.startsWith("media")) {
    // ALWAYS use store value first, then local state, then prop value
    // This ensures we display the latest value after replacement
    const storeMediaValue = currentContent?.body?.[index]?.[action];
    const displayMediaUrl =
      storeMediaValue?.split(" | ")[0] || // Store value (highest priority)
      localMediaUrl || // Local state
      value?.split(" | ")[0] || // Prop value (fallback)
      "";

    return (
      <div
        onClick={() => {
          setActiveAction(index);
          setShowEditor(true);
        }}
        className="w-full flex-shrink-0 h-auto flex items-center justify-center cursor-pointer group transition-opacity hover:opacity-80 bg-[var(--background)] snap-center relative"
      >
        {!isActive || !showEditor ? (
          displayMediaUrl ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <ImageCard
                image_url={displayMediaUrl}
                id={`${key}-${displayMediaUrl}`} // Add URL to key to force re-render
                alt="Post media"
                className="w-full h-full object-cover rounded-lg"
                title={displayMediaUrl}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-lg">No media added</p>
            </div>
          )
        ) : (
          <div className="w-full h-full relative">
            <ImageCropper
              onFinish={handleMediaUpload}
              loading={isLoading(`uploading_media_${index}`)}
              onFinishText="Upload new image"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default PostBodyElement;
