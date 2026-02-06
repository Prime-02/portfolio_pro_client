import ImageCard from "@/app/components/containers/cards/ImageCard";
import ImageCropper from "@/app/components/inputs/ImageUploader";
import { Textinput } from "@/app/components/inputs/Textinput";
import { ContentCreate } from "@/app/components/types and interfaces/Posts";
import { useGlobalState } from "@/app/globalStateProvider";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import React, { useState } from "react";
import PostsBodyRenderer from "./PostsBodyRenderer";
import { Edit, X } from "lucide-react";
import axios from "axios";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { base64ToFile } from "@/app/components/utilities/syncFunctions/syncs";
import { toast } from "@/app/components/toastify/Toastify";

const ArticleForm = ({
  content,
  contentId,
  handleFieldChange,
  draft,
  setPendingCoverFile,
}: {
  content: ContentCreate;
  contentId: string;
  handleFieldChange: (field: keyof ContentCreate, value: any) => void;
  draft: (data: {
    file: File | null;
    croppedImage: string | null;
  }) => Promise<void>;
  setPendingCoverFile: (file: string) => void;
}) => {
  const { isLoading, setLoading, accessToken, userData } = useGlobalState();
  const { currentContent, updateContent } = useContentStore();
  const [editImage, setEditImage] = useState(false);
  const [croppedImageData, setCroppedImageData] = useState<string | null>(null);

  // Handle the finish callback properly
  const handleCropperFinish = async (data: {
    file: File | null;
    croppedImage: string | null;
  }) => {
    if (data.croppedImage) {
      setPendingCoverFile(data.croppedImage);
    }
    await draft(data);
  };

  const uploadNewImage = async (data: {
    file: File | null;
    croppedImage: string | null;
  }) => {
    if (!data.croppedImage) return;

    setLoading("uploading_new_cover_image");
    try {
      await updateContent(
        accessToken,
        currentContent?.id || "",
        setLoading,
        {},
        await base64ToFile(
          data.croppedImage,
          `cover_image_${userData?.id || "user"}_${Date.now()}.png`
        ),
        null,
        () => {
          toast.success("Cover image updated successfully");
        }
      );
      setEditImage(false);
    } catch (error) {
      console.log("Error uploading new cover image", error);
    } finally {
      setLoading("uploading_new_cover_image");
    }
  };

  return (
    <div className="">
      <div>
        <Textinput
          onChange={(value: string) => {
            handleFieldChange("title", value);
          }}
          value={content.title}
          label="Title"
          className="border-none text-5xl font-extrabold text-start "
        />
      </div>
      <div>
        {currentContent?.cover_image_url ? (
          <div className="">
            <div className="flex items-center justify-end">
              <span
                onClick={() => setEditImage(!editImage)}
                className="flex items-center justify-center w-8 h-8 cursor-pointer bg-[var(--background)] border border-[var(--accent)] rounded-full my-2 hover:text-[var(--accent)] transition-colors"
                title="Edit cover image"
              >
                {editImage ? <X size={16} /> : <Edit size={16} />}
              </span>
            </div>
            {editImage ? (
              <ImageCropper
                title="Update cover photo"
                description="All image formats supported up to 5mb"
                croppedImage={croppedImageData}
                onCroppedImageChange={setCroppedImageData}
                onResetImageChange={() => setCroppedImageData(null)}
                onFinish={uploadNewImage}
                onFinishText="Save"
                loading={
                  isLoading("uploading_new_cover_image") ||
                  isLoading(`updating_content_${currentContent?.id || ""}`)
                }
              />
            ) : (
              <ImageCard
                id={currentContent.id}
                image_url={currentContent.cover_image_url}
                width={100000}
                height={100000}
                borderWidth={1}
              />
            )}
          </div>
        ) : (
          <ImageCropper
            title="Upload new cover photo"
            description="All image formats supported up to 5mb"
            onFinish={handleCropperFinish}
            onResetImageChange={() => setPendingCoverFile("")}
            onFinishText="Save and continue"
            loading={
              isLoading("processing_cover_image") ||
              isLoading("creating_content")
            }
          />
        )}
      </div>
      <PostsBodyRenderer body={content.body} />
    </div>
  );
};

export default ArticleForm;
