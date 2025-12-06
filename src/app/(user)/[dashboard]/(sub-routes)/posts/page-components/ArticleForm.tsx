import ImageCard from "@/app/components/containers/cards/ImageCard";
import ImageCropper from "@/app/components/inputs/ImageUploader";
import { Textinput } from "@/app/components/inputs/Textinput";
import { ContentCreate } from "@/app/components/types and interfaces/Posts";
import { useGlobalState } from "@/app/globalStateProvider";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import React from "react";
import PostsBodyRenderer from "./PostsBodyRenderer";

const ArticleForm = ({
  content,
  handleFieldChange,
  draft,
  setPendingCoverFile,
}: {
  content: ContentCreate;
  handleFieldChange: (field: keyof ContentCreate, value: any) => void;
  draft: (data: {
    file: File | null;
    croppedImage: string | null;
  }) => Promise<void>;
  setPendingCoverFile: (file: string) => void;
}) => {
  const { isLoading } = useGlobalState();
  const { currentContent } = useContentStore();

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
            <ImageCard
              id={currentContent.id}
              image_url={currentContent.cover_image_url}
              width={100000}
              height={100000}
              borderWidth={1}
            />
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
