import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import { SkillsProp } from "./SkillCard";
import {
  GetAllData,
  PostAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { BASE_URL, V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import DataList from "@/app/components/inputs/DataList";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import CheckBox from "@/app/components/inputs/CheckBox";
import { proficiencyLevel } from "@/app/components/utilities/indices/DropDownItems";
import Dropdown from "@/app/components/inputs/DynamicDropdown";
import Button from "@/app/components/buttons/Buttons";

interface AddSkillProps extends SkillsProp {
  onRefresh: () => void;
}
const AddSkill = ({ onRefresh }: { onRefresh: () => void }) => {
  const {} = useTheme();
  const {
    loading,
    setLoading,
    accessToken,
    searchParams,
    unauthorizedWarning,
    clearQuerryParam,
  } = useGlobalState();
  const skillId = searchParams.get("update");

  const [manualEntry, setManualEntry] = useState<boolean>(false);
  const [skillData, setSkillData] = useState({
    skill_name: "",
    proficiency_level: "",
    category: "",
    subcategory: "",
    description: "",
    is_trending: false,
    difficulty_level: "",
    is_major: false,
  });

  const addSkill = async () => {
    setLoading("adding_skill");
    try {
      const skillRes = await PostAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/skills/`,
        data: skillData,
      });
      if (skillRes) {
        onRefresh();
        clearQuerryParam();
      }
    } catch (error) {
      console.log("Error uploading skill; ", error);
    } finally {
      setLoading("adding_skill");
    }
  };

  const updateSkillDetail = async () => {
    setLoading("updating_skill");
    try {
      const updateRes = await UpdateAllData({
        access: accessToken,
        field: skillData,
        url: `${V1_BASE_URL}/skills/${skillId}`,
      });
    } catch (error) {
      console.log("Error updating skill: ", error);
    } finally {
      setLoading("updating_skill");
    }
  };

  const handleFeildControl = (field: string, value: string | boolean) => {
    setSkillData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getSkillData = async () => {
    setLoading("fetching_skill_data");
    try {
      const skillRes: SkillsProp = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/skills/${skillId}`,
        type: "Skill Data",
      });
      if (skillRes) {
        setSkillData({
          skill_name: skillRes.skill_name || "",
          proficiency_level: skillRes.proficiency_level || "",
          category: skillRes.category || "",
          subcategory: skillRes.subcategory || "",
          description: skillRes.description || "",
          is_trending: skillRes.is_trending || false,
          difficulty_level: skillRes.difficulty_level || "",
          is_major: skillRes.is_major || false,
        });
      }
    } catch (error) {
      console.log("error fetching skill data: ", error);
    } finally {
      setLoading("fetching_skill_data");
    }
  };

  useEffect(() => {
    if (accessToken && skillId) {
      getSkillData();
    }
  }, [accessToken, skillId]);

  // State setters for multiStateMode
  const stateSetters = {
    skill_name: (value: string) =>
      setSkillData((prev) => ({ ...prev, skill_name: value })),
    category: (value: string) =>
      setSkillData((prev) => ({ ...prev, category: value })),
    subcategory: (value: string) =>
      setSkillData((prev) => ({ ...prev, subcategory: value })),
    description: (value: string) =>
      setSkillData((prev) => ({ ...prev, description: value })),
  };

  // Handler for when an item is selected
  const handleSelectItem = (item: any) => {
    // You can do additional processing here if needed
  };
  useEffect(() => {
    console.log("Selected item:", skillData);
  }, [skillData]);
  return (
    <div className="">
      {!manualEntry ? (
        <div>
          <span>
            <DataList
              url={`${V1_BASE_URL}/skills-suggestion/skills/absolute-search`}
              onSetValue={(value) =>
                setSkillData((prev) => ({ ...prev, skill_name: value }))
              }
              onSelectItem={handleSelectItem}
              dataPath="items" // Path to the array in the response
              displayKeys={["category", "subcategory", "skill_name"]} // Fields to display in the dropdown
              valueKeys={[
                "category",
                "subcategory",
                "skill_name",
                "description",
              ]} // Fields to display in the dropdown
              separator=" - " // Separator between skill_name and category
              placeholder="Search for what you do..."
              minQueryLength={2}
              debounceDelay={300}
              maxResults={10}
              noResultsText="No skills found"
              searchingText="Searching skills..."
              // Multi-state configuration
              stateSetters={stateSetters}
              multiStateMode={true}
              stateKeyMapping={{
                skill_name: "skill_name", // Maps displayKey to state key (redundant here but shown for example)
                category: "category",
                description: "description",
              }}
              // GET request configuration
              requestMethod="GET"
              queryParam="q" // The parameter name your API expects for search queries
              additionalParams={
                {
                  // Any additional fixed parameters your API might need
                }
              }
            />
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-y-3">
          <span>
            <Textinput
              value={skillData.skill_name}
              onChange={(e: string) => {
                setSkillData((prev) => ({
                  ...prev,
                  skill_name: e,
                }));
              }}
              label="Skill Name"
            />
          </span>
          <span>
            <Textinput
              value={skillData.category}
              onChange={(e: string) => {
                setSkillData((prev) => ({
                  ...prev,
                  category: e,
                }));
              }}
              label="Category"
            />
          </span>
          <span>
            <Textinput
              value={skillData.subcategory}
              onChange={(e: string) => {
                setSkillData((prev) => ({
                  ...prev,
                  subcategory: e,
                }));
              }}
              label="Subcategory"
            />
          </span>
          <span>
            <TextArea
              value={skillData.description}
              onChange={(e: string) => {
                setSkillData((prev) => ({
                  ...prev,
                  description: e,
                }));
              }}
              label="Description"
            />
          </span>
        </div>
      )}
      <div className="flex items-center justify-between my-5">
        <span
          onClick={() => {
            setManualEntry(!manualEntry);
          }}
          className="text-xs cursor-pointer opacity-80 text-center underline hover:text-[var(--accent)] "
        >
          {!manualEntry
            ? "Couldn't find what you do? Enter manully"
            : "Try searching again"}
        </span>
        <span className="flex items-center gap-x-3">
          <span className="text-xs text-[var(--accent)]">Primary Skill?</span>
          <span>
            <CheckBox
              isChecked={skillData.is_major}
              setIsChecked={(checked: boolean) => {
                setSkillData((prev) => ({
                  ...prev,
                  is_major: checked,
                }));
              }}
            />
          </span>
        </span>
      </div>
      <div>
        <Dropdown
          value={skillData.proficiency_level}
          onSelect={(e: string) => {
            setSkillData((prev) => ({
              ...prev,
              proficiency_level: e,
            }));
          }}
          options={proficiencyLevel}
          type="dropdown"
          placeholder="How proficient are you in his field"
        />
      </div>
      <div className="mt-3 w-full flex items-center">
        <Button
        className="w-full"
        text="Finish"
        />
      </div>
    </div>
  );
};

export default AddSkill;
