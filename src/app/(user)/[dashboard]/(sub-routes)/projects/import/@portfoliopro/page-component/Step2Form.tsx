import React from "react";
import Button from "@/app/components/buttons/Buttons";
import CheckBox from "@/app/components/inputs/CheckBox";
import DataList from "@/app/components/inputs/DataList";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import { ProjectCreateFormData } from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { Upload, X, ArrowLeft } from "lucide-react";
import { useGlobalState } from "@/app/globalStateProvider";

interface Step2FormProps {
  projectData: ProjectCreateFormData;
  skills: string;
  onFieldChange: (key: string, value: string | boolean) => void;
  onSkillsChange: (skills: string) => void;
  onStackAdd: (skill: string) => void;
  onStackRemove: (index: number) => void;
  onPrevious: () => void;
  onSubmit?: () => void;
  onReset?: () => void;
}

const Step2Form: React.FC<Step2FormProps> = ({
  projectData,
  onFieldChange,
  onSkillsChange,
  onStackAdd,
  onStackRemove,
  onPrevious,
  onSubmit,
  onReset,
}) => {
  const {loading} = useGlobalState()
  const stateSetters = {
    skill_name: (value: string) => onStackAdd(value),
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="flex flex-col w-full h-full flex-1 gap-4">
      <div className="flex flex-col items-start">
        <h1 className="md:text-3xl text-2xl font-semibold">
          Project Scope & Tech Stack
        </h1>
        <h3 className="md:text-base text-sm opacity-65 font-thin max-w-2xl">
          These fields are optional but help provide more details about your
          project
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <span>
          <Textinput
            value={projectData.contribution}
            onChange={(e) => onFieldChange("contribution", e)}
            labelBgHexIntensity={1}
            label="Contribution to Project"
            className="w-full"
          />
        </span>

        <span>
          <Textinput
            value={projectData.client_name}
            onChange={(e) => onFieldChange("client_name", e)}
            labelBgHexIntensity={1}
            label="Client Or Organisation"
            className="w-full"
          />
        </span>
      </div>

      <span>
        <TextArea
          value={projectData.contribution_description}
          onChange={(e) => onFieldChange("contribution_description", e)}
          labelBgHexIntensity={1}
          label="Contribution Description"
          className="w-full"
        />
      </span>

      <span>
        <Textinput
          value={projectData.project_url}
          onChange={(e) => onFieldChange("project_url", e)}
          labelBgHexIntensity={1}
          label="Relevant Project Link"
          className="w-full"
        />
      </span>

      <span>
        <DataList
          url={`${V1_BASE_URL}/skills-suggestion/skills/absolute-search`}
          onSetValue={onSkillsChange}
          dataPath="items"
          displayKeys={["skill_name"]}
          valueKeys={["skill_name"]}
          separator=" - "
          placeholder="Search for technologies used..."
          minQueryLength={2}
          debounceDelay={300}
          maxResults={10}
          noResultsText="No skills found"
          searchingText="Searching skills..."
          stateSetters={stateSetters}
          multiStateMode={true}
          stateKeyMapping={{
            skill_name: "skill_name",
            category: "category",
            description: "description",
          }}
          requestMethod="GET"
          queryParam="q"
          labelBgHexIntensity={1}
        />
        <ul className="flex flex-wrap gap-2 mt-1">
          {projectData.stack.map((stack, i) => (
            <li
              className="text-xs flex items-center gap-x-1 bg-[var(--accent)]/10 px-2 py-1 rounded cursor-pointer hover:bg-[var(--accent)]/20"
              key={i}
            >
              <span
                onClick={() => onStackRemove(i)}
                className="hover:text-red-500 cursor-pointer"
              >
                <X size={14} />
              </span>
              <span>{stack}</span>
            </li>
          ))}
        </ul>
      </span>

      <div className="flex w-full gap-x-2 items-center">
        <span className="w-1/2">
          <Textinput
            value={projectData.start_date}
            onChange={(e) => onFieldChange("start_date", e)}
            labelBgHexIntensity={1}
            label="Start Date"
            type="date"
            className="w-full"
          />
        </span>
        <span className="w-1/2">
          <Textinput
            value={projectData.end_date}
            onChange={(e) => onFieldChange("end_date", e)}
            labelBgHexIntensity={1}
            label="End Date"
            type="date"
            className="w-full"
          />
        </span>
      </div>

      {/* Project Status Checkbox */}
      <div className="flex items-center gap-4 mt-2">
        <CheckBox
          label="Project Completed"
          isChecked={projectData.is_completed}
          setIsChecked={(e) => onFieldChange("is_completed", e)}
          description="Mark this project as completed"
          direction="right"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-2 mt-6">
        <Button
          text="Previous"
          variant="secondary"
          icon={<ArrowLeft size={18} />}
          onClick={onPrevious}
        />
        <div className="flex gap-2">
          <Button
            text="Reset"
            variant="ghost"
            customColor="red"
            onClick={handleReset}
          />
          {onSubmit && (
            <Button
              text="Create Project"
              icon2={<Upload size={18} />}
              onClick={onSubmit}
              loading={loading.includes("uploading_projects")}
              disabled={loading.includes("uploading_projects")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Form;
