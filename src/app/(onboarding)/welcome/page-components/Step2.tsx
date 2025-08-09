import Button from "@/app/components/buttons/Buttons";
import CheckBox from "@/app/components/inputs/CheckBox";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import { toast } from "@/app/components/toastify/Toastify";
import { professionalInformation } from "@/app/components/utilities/indices/MultiStepWriteUp";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { FormEvent, useEffect, useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure"; // Import the new component
import {
  GetAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { removeEmptyStringValues } from "@/app/components/utilities/syncFunctions/syncs";
import Image from "next/image";
interface ProfessionalInformation {
  open_to_work: boolean;
  job_title: string | null;
  profession: string | null;
  years_of_experience: number | null;
  preferred_work_type: string | null;
  availability: string | null;
  job_seeking_status: string | null;
  bio: string | null;
}

const Step2 = () => {
  const {
    router,
    userData,
    loading,
    setLoading,
    accessToken,
    extendRouteWithQuery,
  } = useGlobalState();
  const [formData, setFormData] = useState({
    open_to_work: true,
    job_title: "",
    profession: "",
    years_of_experience: 0,
    preferred_work_type: "",
    availability: "",
    job_seeking_status: "",
    bio: "",
  });
  const [currentArrangement, setCurrentArrangement] =
    useState<ComponentArrangement>("D-A-C-B");

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    if (userData.username) {
      router.push(`/${userData.username}`);
    } else {
      toast.warning("A username is required to proceed", {
        title: "Warning",
        action: {
          label: "Sign Up",
          onClick: () => router.push("/user-auth?auth_mode=signup"),
        },
      });
    }
  };

  const handleFieldChange = (key: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.job_seeking_status) {
      toast.warning("At least your job seeking status is required");
      return;
    }
    setLoading("submitting_pro_info");
    try {
      const updateRes: ProfessionalInformation = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/step2`,
        field: removeEmptyStringValues(formData),
      });
      if (updateRes) {
        setFormData((prev) => ({
          ...prev,
          open_to_work: updateRes.open_to_work || false,
          job_title: updateRes.job_title || "",
          profession: updateRes.profession || "",
          years_of_experience: updateRes.years_of_experience || 0,
          preferred_work_type: updateRes.preferred_work_type || "",
          availability: updateRes.availability || "",
          job_seeking_status: updateRes.job_seeking_status || "",
          bio: updateRes.bio || "",
        }));
        toast.success(
          "Your professional information has been updated. Proceeding...",
          {
            title: "Success",
          }
        );
        extendRouteWithQuery({ step: "3" });
      }
    } catch (error) {
      console.log("Error submitting Pro Info: ", error);
    } finally {
      setLoading("submitting_pro_info");
    }
  };

  const fetchingProInfo = async () => {
    setLoading("fetching_pro_info");
    try {
      const proInfoRes: ProfessionalInformation = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/step2`,
      });
      if (proInfoRes) {
        setFormData((prev) => ({
          ...prev,
          open_to_work: proInfoRes.open_to_work || false,
          job_title: proInfoRes.job_title || "",
          profession: proInfoRes.profession || "",
          years_of_experience: proInfoRes.years_of_experience || 0,
          preferred_work_type: proInfoRes.preferred_work_type || "",
          availability: proInfoRes.availability || "",
          job_seeking_status: proInfoRes.job_seeking_status || "",
          bio: proInfoRes.bio || "",
        }));
      }
    } catch (error) {
      console.log("Error fethcing your professional information: ", error);
    } finally {
      setLoading("fetching_pro_info");
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchingProInfo();
  }, [accessToken]);

  return (
    <TemplateStructure
      headerAlignment="right"
      // Header (A) Props
      step={professionalInformation.step + "/6"}
      title={professionalInformation.title}
      headerDescription={professionalInformation.description}
      // Description (B) Props
      greeting={professionalInformation.greeting}
      pageWriteup={professionalInformation.page_writeup}
      // Navigation
      onBack={handleBack}
      onSkip={handleSkip}
      additionalContent={
        <div className="h-full w-full">
          <Image
            alt="Step 2"
            src={"/vectors/undraw_profile_d7qw.svg"}
            width={1000}
            height={1000}
          />
        </div>
      }
      onArrangementChange={(newArrangement) => {
        console.log(newArrangement);
        setCurrentArrangement(newArrangement); // Update the state
      }}
      arrangement={currentArrangement}
      // Optional: Change arrangement here (default is "A-B-C")
      // arrangement="A-C-B"
    >
      {/* Form (C) as Children */}
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        className="w-full flex flex-col gap-y-4"
      >
        {/* Profession */}
        <div className="w-full">
          <Textinput
            loading={loading.includes("fetching_pro_info")}
            value={formData.profession || ""}
            onChange={(e) => handleFieldChange("profession", e)}
            label="Profession"
            labelBgHexIntensity={1}
            desc={professionalInformation.fields[0].description}
            maxLength={professionalInformation.fields[0].constraints.max_length}
          />
        </div>

        {/* Job Seeking Status and Open to Work */}
        <div className="flex flex-col gap-y-3 md:justify-between md:flex-row gap-x-2">
          <span className="min-w-[70%]">
            <Textinput
              loading={loading.includes("fetching_pro_info")}
              type={professionalInformation.fields[4].type}
              options={
                professionalInformation.fields[4].constraints.enum_values
              }
              value={formData.job_seeking_status || ""}
              onChange={(e) => handleFieldChange("job_seeking_status", e)}
              desc={professionalInformation.fields[4].description}
              required={professionalInformation.fields[4].required}
              placeholder="Job Seeking Status"
              id={professionalInformation.fields[4].name}
            />
          </span>
          <span className="flex flex-wrap items-center md:justify-end min-w-min-w-[30%] gap-x-1">
            <CheckBox
              isChecked={formData.open_to_work}
              setIsChecked={(e) => handleFieldChange("open_to_work", e)}
            />
            <p className="text-xs text-[var(--accent)]">{"Open to work"}</p>
          </span>
        </div>

        {/* Job Title */}
        <div className="w-full">
          <Textinput
            loading={loading.includes("fetching_pro_info")}
            value={formData.job_title || ""}
            onChange={(e) => handleFieldChange("job_title", e)}
            label="Job Title (if currently employed)"
            labelBgHexIntensity={1}
            desc={professionalInformation.fields[1].description}
            maxLength={professionalInformation.fields[1].constraints.max_length}
          />
        </div>

        {/* Work Type and Years of Experience */}
        <div className="flex flex-col gap-y-3 md:justify-between md:flex-row gap-x-2">
          <span className="min-w-[45%]">
            <Textinput
              loading={loading.includes("fetching_pro_info")}
              type="dropdown"
              value={formData.preferred_work_type || ""}
              options={
                professionalInformation.fields[5].constraints.enum_values
              }
              onChange={(e) => handleFieldChange("preferred_work_type", e)}
              placeholder="Preferred work type"
              desc={professionalInformation.fields[5].description}
            />
          </span>
          <span className="min-w-[55%]">
            <Textinput
              loading={loading.includes("fetching_pro_info")}
              type="number"
              value={formData.years_of_experience || ""}
              onChange={(e) => handleFieldChange("years_of_experience", e)}
              label="Years of Experience"
              labelBgHexIntensity={1}
              desc={professionalInformation.fields[2].description}
              minLength={professionalInformation.fields[2].constraints.minimum}
            />
          </span>
        </div>

        {/* Availability */}
        <div className="w-full">
          <Textinput
            loading={loading.includes("fetching_pro_info")}
            value={formData.availability || ""}
            onChange={(e) => handleFieldChange("availability", e)}
            placeholder="Availability"
            labelBgHexIntensity={1}
            desc={professionalInformation.fields[7].description}
            type={professionalInformation.fields[7].type}
            maxLength={professionalInformation.fields[7].constraints.max_length}
            options={professionalInformation.fields[7].constraints.enum}
          />
        </div>

        {/* Bio */}
        <div className="w-full">
          <TextArea
            value={formData.bio || ""}
            onChange={(e) => handleFieldChange("bio", e)}
            label="Professional Bio"
            labelBgHexIntensity={1}
            desc={professionalInformation.fields[3].description}
            maxLength={professionalInformation.fields[3].constraints.max_length}
          />
        </div>

        <Button
          type="submit"
          loading={loading.includes("submitting_pro_info")}
          disabled={loading.includes("submitting_pro_info")}
          text="Continue"
        />
      </form>
    </TemplateStructure>
  );
};

export default Step2;
