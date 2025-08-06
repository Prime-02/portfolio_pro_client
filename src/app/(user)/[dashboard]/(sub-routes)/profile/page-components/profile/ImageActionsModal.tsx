// components/profile/ImageActionsModal.tsx
import React from "react";
import Modal from "@/app/components/containers/modals/Modal";
import { ChevronLeft, ChevronRight, Camera, Upload, Trash2 } from "lucide-react";
import { ImageAction } from "@/app/components/types and interfaces/loaderTypes";
import PhotoCapture from "@/app/components/inputs/PhotoCapture";
import ImageCropper from "@/app/components/inputs/ImageUploader";
import Button from "@/app/components/buttons/Buttons";
import { ModalType } from "@/app/components/types and interfaces/userprofile";

interface ImageActionsModalProps {
  profileImages: ModalType;
  activeTab: string;
  loading: string[];
  onClose: () => void;
  onTabChange: (tab: string) => void;
  onGoBack: () => void;
  onPhotoCapture: (photo: string | null) => void;
  onImageFinish: (data: { file: File | null; croppedImage: string | null }) => void;
  onDeleteImage: () => void;
}

const ImageActionsModal: React.FC<ImageActionsModalProps> = ({
  profileImages,
  activeTab,
  loading,
  onClose,
  onTabChange,
  onGoBack,
  onPhotoCapture,
  onImageFinish,
  onDeleteImage,
}) => {
  const imageActions: ImageAction[] = [
    {
      name: "Take Photo",
      action: () => onTabChange("take-photo"),
      icon: Camera,
      tab: "take-photo",
    },
    {
      name: "Upload Photo",
      action: () => onTabChange("upload-photo"),
      icon: Upload,
      tab: "upload-photo",
    },
    {
      name: "Delete Image",
      tab: "delete-photo",
      icon: Trash2,
    },
  ];

  return (
    <Modal
      closeOnBackdropClick={false}
      isOpen={profileImages.type === "profile" || profileImages.type === "cover"}
      title={`Update ${profileImages.type} image`}
      onClose={onClose}
    >
      <div className="relative h-full">
        {/* Main actions view */}
        <div
          className={`transition-all duration-300 ${
            activeTab ? "-translate-x-full opacity-0 absolute" : "translate-x-0 opacity-100"
          }`}
        >
          <div className="flex flex-col space-y-4">
            {imageActions.map(({ name, icon: Icon, tab }) => (
              <span
                onClick={() => onTabChange(tab)}
                key={name}
                className="flex flex-row items-center hover:bg-[var(--background)] rounded-lg justify-between cursor-pointer"
              >
                <span className="flex items-center gap-x-4 justify-start">
                  <span className="w-12 h-12 flex items-center justify-center transition duration-100 cursor-pointer rounded-full bg-[var(--background)]">
                    <Icon />
                  </span>
                  <h3 className="font-semibold">{name}</h3>
                </span>
                <ChevronRight />
              </span>
            ))}
          </div>
        </div>

        {/* Tab content view */}
        <div
          className={`transition-all duration-300 ${
            activeTab ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute"
          }`}
        >
          {activeTab && (
            <div className="relative">
              {activeTab !== "delete-photo" && (
                <span
                  onClick={onGoBack}
                  className="w-8 h-8 z-20 absolute top-1 left-2 flex items-center justify-center transition duration-100 cursor-pointer rounded-full bg-[var(--background)]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </span>
              )}

              <div className="mt-8">
                {activeTab === "upload-photo" && (
                  <ImageCropper
                    onFinish={onImageFinish}
                    loading={loading.includes("uploading_image")}
                  />
                )}
                {activeTab === "take-photo" && (
                  <PhotoCapture
                    onPhotoTaken={onPhotoCapture}
                    loading={loading.includes("updating_profile_from_cam")}
                  />
                )}
                {activeTab === "delete-photo" && (
                  <div className="">
                    <h1 className="text-xl font-semibold">Delete Image</h1>
                    <h3 className="text-sm mb-4">
                      Are you sure you want to delete this image?
                    </h3>
                    <div className="flex gap-4">
                      <Button
                        onClick={onDeleteImage}
                        variant="danger"
                        text="Delete"
                        loading={loading.includes(`deleting_${profileImages.type}_image`)}
                        disabled={loading.includes(`deleting_${profileImages.type}_image`)}
                      />
                      <Button onClick={onGoBack} variant="outline" text="Cancel" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImageActionsModal;
