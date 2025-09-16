import React from "react";
import Button from "@/app/components/buttons/Buttons";
import CheckBox from "@/app/components/inputs/CheckBox";
import Dropdown from "@/app/components/inputs/DynamicDropdown";
import MediaPicker from "@/app/components/inputs/MediaPicker";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import { MediaFile } from "@/app/components/types and interfaces/MediaInputElements";
import { ProjectCreateFormData } from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import { projectCategory } from "@/app/components/utilities/indices/projects-JSONs/projectCreate";
import { Upload, ArrowRight } from "lucide-react";
import { useGlobalState } from "@/app/globalStateProvider";

interface Step1FormProps {
  projectData: ProjectCreateFormData;
  mediaState: MediaFile[];
  onFieldChange: (key: string, value: string | boolean) => void;
  onMediaChange: (media: MediaFile[]) => void;
  onNext: () => void;
  onSave?: () => void;
  isValid: boolean;
}

const Step1Form: React.FC<Step1FormProps> = ({
  projectData,
  onFieldChange,
  onMediaChange,
  onNext,
  onSave,
  isValid,
}) => {
  const { loading } = useGlobalState();
  return (
    <div className="flex flex-col md:flex-row w-full h-full flex-1 gap-4 md:gap-6">
      {/* Media Picker Section */}
      <div className="w-full md:w-1/2 flex flex-col">
        <MediaPicker
          onMediaChange={onMediaChange}
          maxVideoDuration={30}
          maxFiles={4}
          devMode={false}
          maxFileSize={5 * 1024 * 1024}
        />
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
              loading={loading.includes("uploading_projects")}
              disabled={loading.includes("uploading_projects") || !isValid}
            />
          )}
          <Button
            text="Next Step"
            icon2={<ArrowRight size={18} />}
            onClick={onNext}
            disabled={!isValid}
          />
        </div>
      </div>
    </div>
  );
};

export default Step1Form;
