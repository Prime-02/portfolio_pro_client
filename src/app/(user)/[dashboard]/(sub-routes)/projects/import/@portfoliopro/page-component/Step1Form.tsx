import React, { JSX, useState } from "react";
import Button from "@/app/components/buttons/Buttons";
import CheckBox from "@/app/components/inputs/CheckBox";
import Dropdown from "@/app/components/inputs/DynamicDropdown";
import MediaPicker from "@/app/components/inputs/MediaPicker";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import { MediaFile } from "@/app/components/types and interfaces/MediaInputElements";
import {
  ImageUrlsProps,
  ProjectCreateFormData,
} from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import { projectCategory } from "@/app/components/utilities/indices/projects-JSONs/projectCreate";
import { Upload, ArrowRight, Plus } from "lucide-react";
import { useGlobalState } from "@/app/globalStateProvider";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { getLoader } from "@/app/components/loaders/Loader";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import Modal from "@/app/components/containers/modals/Modal";
import ImageCropper from "@/app/components/inputs/ImageUploader";
import { toast } from "@/app/components/toastify/Toastify";
import { base64ToFile } from "@/app/components/utilities/syncFunctions/syncs";
import { UpdateAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";

// Type definitions for better type safety
export type MediaSlot = "hero_media" | "media_1" | "media_2" | "media_3";

interface ProjectMediaState {
  media_slots: string;
  project_media: File | null;
}

interface ImageCropperData {
  file: File | null;
  croppedImage: string | null;
}

// Type for the update data payload
interface ProjectUpdateData
  extends Record<string, File | string | boolean | number | undefined> {
  project_name?: string;
  project_description?: string;
  project_category?: string;
  is_public?: boolean;
  is_completed?: boolean;
  is_concept?: boolean;
  [key: string]: File | string | boolean | number | undefined;
}

interface Step1FormProps {
  projectData: ProjectCreateFormData;
  mediaState: MediaFile[];
  onFieldChange: (key: string, value: string | boolean) => void;
  onMediaChange: (media: MediaFile[]) => void;
  onNext: () => void;
  onSave?: () => void;
  isValid: boolean;
  projectId?: string;
  onRefresh: () => void;
}

const Step1Form: React.FC<Step1FormProps> = ({
  projectData,
  onFieldChange,
  onMediaChange,
  onNext,
  onSave,
  isValid,
  projectId,
  onRefresh,
}) => {
  const { loading, checkValidId, setLoading, accessToken } = useGlobalState();
  const { accentColor, loader } = useTheme();
  const LoaderComponent = getLoader(loader) || null;
  const [projectMedia, setProjectMedia] = useState<ProjectMediaState>({
    project_media: null,
    media_slots: "",
  });

  // Check if we should ignore isValid (when projectId exists and is valid)
  const shouldIgnoreIsValid = projectId && checkValidId(projectId);
  const isFormValid = shouldIgnoreIsValid || isValid;

  // All possible media slots in order
  // const allMediaSlots: MediaSlot[] = [
  //   "hero_media",
  //   "media_1",
  //   "media_2",
  //   "media_3",
  // ];

  // Get slot data with fallback for empty slots
  const getSlotData = (slotName: string): ImageUrlsProps | null => {
    const slotData: ImageUrlsProps = projectData.other_project_image_url?.[
      slotName
    ] || { url: "", public_id: "" };
    return slotData || null;
  };

  // Get slot display name
  const getSlotDisplayName = (slotName: string): string => {
    switch (slotName) {
      case "hero_media":
        return "Hero Image";
      case "media_1":
        return "Media 1";
      case "media_2":
        return "Media 2";
      case "media_3":
        return "Media 3";
      default:
        return slotName.replace("_", " ").toUpperCase();
    }
  };

  const convertToPrjMedia = async (data: ImageCropperData): Promise<void> => {
    const { croppedImage } = data;

    // Validate input
    if (!croppedImage) {
      toast.warning("No image provided");
      return;
    }

    if (!projectMedia.media_slots) {
      toast.error("No media slot selected");
      return;
    }

    if (!projectId) {
      toast.error("Project ID is required for media updates");
      return;
    }

    // Validate media slot
    const validSlots: string[] = [
      "hero_media",
      "media_1",
      "media_2",
      "media_3",
    ];
    if (!validSlots.includes(projectMedia.media_slots)) {
      toast.error(`Invalid media slot: ${projectMedia.media_slots}`);
      return;
    }

    setLoading("processing_image");

    try {
      // Extract MIME type and create filename
      const mimeType = croppedImage.split(";")[0].split("/")[1];
      const extension = mimeType === "jpeg" ? "jpg" : mimeType;
      const filename = `${projectMedia.media_slots}.${extension}`.toLowerCase();

      // Convert base64 to File
      const convertedImg = await base64ToFile(croppedImage, filename);

      // Validate file size (10MB limit to match backend)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (convertedImg.size > MAX_FILE_SIZE) {
        toast.error(
          `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        );
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(convertedImg.type)) {
        toast.error(
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
        );
        return;
      }

      // Prepare update data - only include the media slot and essential fields
      const updateData: ProjectUpdateData = {
        [projectMedia.media_slots]: convertedImg,
      };

      // Optional: Add other project fields if they need to be preserved
      // Only add non-media, non-null fields that might be required
      const fieldsToPreserve: (keyof ProjectCreateFormData)[] = [
        "project_name",
        "project_description",
        "project_category",
        "is_public",
        "is_completed",
        "is_concept",
      ];

      fieldsToPreserve.forEach((field) => {
        const value: unknown = projectData[field];
        if (value !== null && value !== undefined && value !== "") {
          // Convert arrays to JSON strings for FormData
          if (Array.isArray(value)) {
            updateData[field] = JSON.stringify(value);
          } else if (typeof value === "object" && value !== null) {
            updateData[field] = JSON.stringify(value);
          } else {
            // Type assertion after we've verified the value is not an object or array
            updateData[field] = value as string | boolean | number;
          }
        }
      });

      console.log(`Updating media slot: ${projectMedia.media_slots}`, {
        filename: convertedImg.name,
        size: `${(convertedImg.size / 1024).toFixed(2)}KB`,
        type: convertedImg.type,
      });

      // Make the API call
      const mediaRes = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/${projectId}`,
        field: updateData,
        useFormData: true,
        method: "put", // or "patch" depending on your backend route
        message: "custom", // Prevent default success message
      });

      if (mediaRes) {
        const slotDisplayName = getSlotDisplayName(projectMedia.media_slots);
        toast.success(`${slotDisplayName} successfully updated`);

        // Close modal and reset state
        setProjectMedia((prev) => ({
          ...prev,
          media_slots: "",
          project_media: null,
        }));
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating project media:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("413")) {
          toast.error("File too large for upload");
        } else if (error.message.includes("415")) {
          toast.error("Unsupported file type");
        } else if (error.message.includes("403")) {
          toast.error("You don't have permission to edit this project");
        } else if (error.message.includes("404")) {
          toast.error("Project not found");
        } else {
          toast.error("Failed to update project media. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred while updating media");
      }
    } finally {
      setLoading("processing_image");
    }
  };

  // Render individual slot card
  const renderSlotCard = (slotName: string): JSX.Element => {
    const slotData = getSlotData(slotName);
    const displayName = getSlotDisplayName(slotName);
    const isHeroSlot = slotName === "hero_media";

    if (slotData?.url) {
      // Slot has an image
      return (
        <div
          key={slotName}
          className={`relative ${isHeroSlot ? "w-full max-w-md" : "aspect-square"}`}
        >
          <ImageCard
            onClick={() => {
              setProjectMedia((prev) => ({
                ...prev,
                media_slots: slotName,
              }));
            }}
            image_url={slotData.url}
            id={slotData.public_id || slotData.url || ""}
          />
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {displayName}
          </div>
        </div>
      );
    } else {
      // Empty slot - render placeholder
      return (
        <div
          key={slotName}
          className={`relative ${
            isHeroSlot ? "w-full max-w-md aspect-[4/3]" : "aspect-square"
          } border-2 border-dashed border-[var(--accent)]/30 rounded-lg 
          flex items-center justify-center cursor-pointer hover:border-[var(--accent)]/60 
          hover:bg-[var(--accent)]/5 transition-all duration-200 group`}
          onClick={() => {
            setProjectMedia((prev) => ({
              ...prev,
              media_slots: slotName,
            }));
          }}
        >
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-2 group-hover:bg-[var(--accent)]/20 transition-colors">
              <Plus
                size={24}
                className="text-[var(--accent)]/60 group-hover:text-[var(--accent)]/80"
              />
            </div>
            <span className="text-sm font-medium opacity-70 group-hover:opacity-90">
              Add {displayName}
            </span>
          </div>

          {/* Slot label */}
          <div className="absolute top-2 left-2 bg-[var(--accent)]/20 text-[var(--foreground)] text-xs px-2 py-1 rounded">
            {displayName}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full flex-1 gap-4 md:gap-6">
      {/* Media Picker Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center flex-col">
        {loading.includes("fetching_project_by_id") ? (
          LoaderComponent && <LoaderComponent color={accentColor.color} />
        ) : (
          <div className="w-full">
            {projectId ? (
              <div className="flex flex-col w-full gap-y-4">
                {/* Hero Image Slot */}
                <div className="w-full flex items-center justify-center">
                  {renderSlotCard("hero_media")}
                </div>

                {/* Other Media Slots */}
                <div className="w-full">
                  <h4 className="text-sm font-medium mb-2 opacity-70">
                    Additional Media
                  </h4>
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                    {(["media_1", "media_2", "media_3"] as const).map(
                      (slotName) => renderSlotCard(slotName)
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <MediaPicker
                onMediaChange={onMediaChange}
                maxVideoDuration={30}
                maxFiles={4}
                devMode={false}
                maxFileSize={5 * 1024 * 1024}
                acceptedTypes={{
                  "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Vertical Divider - Only visible on md+ screens */}
      <div className="hidden md:flex">
        <div className="w-[0.1px] h-full bg-[var(--accent)]/20" />
      </div>

      {/* Horizontal Divider - Only visible on small screens */}
      <div className="w-full h-[0.1px] bg-[var(--accent)]/20 md:hidden" />

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col gap-4 py-2">
        <div className="flex flex-col items-start">
          <h1 className="md:text-3xl text-2xl font-semibold">
            Basic Information
          </h1>
          <h3 className="md:text-base text-sm opacity-65 font-thin max-w-2xl">
            All fields here are required including at least one media file
          </h3>
        </div>

        <span>
          <Textinput
            loading={loading.includes("fetching_project_by_id")}
            value={projectData.project_name}
            onChange={(e) => onFieldChange("project_name", e)}
            labelBgHexIntensity={1}
            label="Project Name *"
            className="w-full"
          />
        </span>

        <span className="flex gap-x-2 items-start">
          <div className="flex-1">
            <Dropdown
              options={projectCategory}
              value={projectData.project_category}
              type="datalist"
              onSelect={(e) => onFieldChange("project_category", e)}
              placeholder="Project Category *"
              className="w-full"
              includeNoneOption={false}
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <CheckBox
              label="Public"
              isChecked={projectData.is_public}
              setIsChecked={(e) => onFieldChange("is_public", e)}
              description="This Project will be visible to all users on the platform"
              direction="left"
            />
            <CheckBox
              label="Concept"
              isChecked={projectData.is_concept}
              setIsChecked={(e) => onFieldChange("is_concept", e)}
              description="Mark this as a concept or prototype project"
              direction="left"
            />
          </div>
        </span>

        <span>
          <TextArea
            value={projectData.project_description}
            onChange={(e) => onFieldChange("project_description", e)}
            labelBgHexIntensity={1}
            label="Project Description *"
            className="w-full"
            maxLength={1500}
          />
        </span>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          {onSave && (
            <Button
              text="Save"
              variant="secondary"
              icon2={<Upload size={18} />}
              onClick={onSave}
              loading={
                loading.includes("uploading_projects") ||
                loading.includes("updating_project")
              }
              disabled={
                loading.includes("uploading_projects") ||
                loading.includes("updating_project") ||
                !isFormValid
              }
            />
          )}
          <Button
            text={`Next${!projectId ? " Step" : ""}`}
            icon2={<ArrowRight size={18} />}
            onClick={onNext}
            disabled={!isFormValid}
          />
        </div>
      </div>

      {/* Image Update Modal */}
      <Modal
        isOpen={projectMedia.media_slots !== ""}
        onClose={() => {
          setProjectMedia((prev) => ({
            ...prev,
            media_slots: "",
          }));
        }}
        title={`Update ${getSlotDisplayName(projectMedia.media_slots)}`}
      >
        <ImageCropper
          onFinish={convertToPrjMedia}
          loading={loading.includes("processing_image")}
        />
      </Modal>
    </div>
  );
};

export default Step1Form;
