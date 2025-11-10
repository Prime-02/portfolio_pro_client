import Button from "@/app/components/buttons/Buttons";
import CheckBox from "@/app/components/inputs/CheckBox";
import DataList from "@/app/components/inputs/DataList";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import { EducationProps } from "@/app/components/types and interfaces/EducationsInterface";
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { validateFields } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { useEducationStore } from "@/app/stores/education_stores/EducationStore";
import React, { useState } from "react";

const EducationActions = () => {
  const {
    checkValidId,
    setLoading,
    isLoading,
    accessToken,
    clearQuerryParam,
    checkParams,
  } = useGlobalState();
  const { addEducation, currentEducation, updateEducation } =
    useEducationStore();
  const updateId = checkParams("update") || "";
  const isUpdate = checkValidId(updateId);
  const [educationForm, setEducationForm] = useState({
    id: isUpdate ? currentEducation?.id || updateId : updateId,
    institution: isUpdate ? currentEducation?.institution || "" : "",
    degree: isUpdate ? currentEducation?.degree || "" : "",
    field_of_study: isUpdate ? currentEducation?.field_of_study || "" : "",
    start_year: isUpdate ? currentEducation?.start_year || "" : "",
    end_year: isUpdate ? currentEducation?.end_year || "" : "",
    is_current: isUpdate ? currentEducation?.is_current || false : false,
    description: isUpdate ? currentEducation?.description || "" : "",
  });
  const handleEducationForm = (key: string, value: string | boolean) => {
    setEducationForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const educationAction = checkParams("create") || updateId;

  const addNewEducation = async () => {
    validateFields(educationForm, ["end_year", "is_current", "description"]);
    setLoading("creating_new_aducation");
    try {
      const educationRes: EducationProps = await PostAllData({
        access: accessToken,
        url: "education",
        data: educationForm,
      });
      if (educationRes) {
        addEducation(educationRes);
        clearQuerryParam();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("creating_new_aducation");
    }
  };

  return (
    <div className="flex flex-col gap-y-3">
      <div>
        <DataList
          url={`${V1_BASE_URL}/world-data/institutions/autocomplete`}
          onSetValue={(e) => handleEducationForm("institution", e)}
          displayKeys={["name"]}
          valueKeys={["name"]}
          placeholder="Search institutions..."
          minQueryLength={4}
          debounceDelay={1000}
          maxResults={10}
          noResultsText="No institution found"
          searchingText="Searching institutions..."
          requestMethod="GET"
          queryParam="q"
          labelBgHexIntensity={10}
          includeQueryAsOption
          queryOptionSuffix="Add New"
        />
      </div>
      <div>
        <DataList
          url={`${V1_BASE_URL}/world-data/degrees/autocomplete`}
          onSetValue={(e) => handleEducationForm("degree", e)}
          displayKeys={["title"]}
          valueKeys={["title"]}
          placeholder="Search degrees..."
          minQueryLength={4}
          debounceDelay={1000}
          maxResults={10}
          noResultsText="No degree found"
          searchingText="Searching degrees..."
          requestMethod="GET"
          queryParam="q"
          labelBgHexIntensity={10}
          includeQueryAsOption
          queryOptionSuffix="Add New"
        />
      </div>
      <div>
        <Textinput
          value={educationForm.field_of_study}
          onChange={(e) => handleEducationForm("field_of_study", e)}
          label="Field of study"
        />
      </div>
      <div>
        <Textinput
          value={educationForm.start_year}
          onChange={(e) => handleEducationForm("start_year", e)}
          label="Start Year"
          type={"date"}
        />
      </div>
      <div className="flex items-center justify-between">
        <CheckBox
          isChecked={educationForm.is_current}
          setIsChecked={(e) => handleEducationForm("is_current", e)}
          label="Do you still attend this institutions?"
        />
      </div>
      {!educationForm.is_current && (
        <div>
          <Textinput
            value={educationForm.end_year}
            onChange={(e) => handleEducationForm("end_year", e)}
            label="End Year"
            type={"date"}
          />
        </div>
      )}
      <div>
        <TextArea
          value={educationForm.description}
          onChange={(e) => handleEducationForm("description", e)}
          label="What to know about your time here (optional)"
        />
      </div>
      <div className="flex w-full">
        <Button
          text={
            checkValidId(educationAction || "")
              ? "Edit this education"
              : "Add new education"
          }
          onClick={() => {
            if (checkValidId(educationAction || "")) {
              updateEducation(
                accessToken,
                updateId,
                setLoading,
                educationForm as EducationProps,
                () => {
                  clearQuerryParam();
                }
              );
            } else {
              addNewEducation();
            }
          }}
          className={"w-full"}
          loading={
            isLoading("creating_new_aducation") ||
            isLoading(`updating_education_${updateId}`)
          }
          disabled={
            isLoading("creating_new_aducation") ||
            isLoading(`updating_education_${updateId}`)
          }
        />
      </div>
    </div>
  );
};

export default EducationActions;
