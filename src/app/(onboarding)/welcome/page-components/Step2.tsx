import { useRouting } from "@/lib/hooks/routing/useRouting";
import { FormEvent, useEffect, useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure";
import { toast } from "@/src/context/Toastify";
import { isAuthenticated } from "@/lib/client/api";
import { removeEmptyStringValues } from "@/lib/utilities/syncFunctions/syncs";
import { professionalInformation } from "@/lib/utilities/indices/MultiStepWriteUp";
import Image from "@/src/app/components/ui/Image";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import CheckBox from "@/src/app/components/inputs/CheckBox";
import Button from "@/src/app/components/buttons/Buttons";
import { useUserOnboarding } from "@/lib/stores/user/useUserOnboarding";
import MarkdownEditor from "@/src/app/components/markdown/MarkdownEditor";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

const Step2 = () => {
  const { extendRouteWithQuery, router } = useRouting();
  const { userInfo } = useUserSettings();

  const {
    step2,
    isLoading: storeLoading,
    isSaving,
    error: storeError,
    fetchStep2,
    updateStep2,
  } = useUserOnboarding();

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

  // Fetch existing data on component mount
  useEffect(() => {
    if (!isAuthenticated()) return;
    fetchStep2();
  }, []);

  // Populate form data when store data changes
  useEffect(() => {
    if (step2) {
      setFormData((prev) => ({
        ...prev,
        open_to_work: step2.open_to_work ?? false,
        job_title: step2.job_title || "",
        profession: step2.profession || "",
        years_of_experience: step2.years_of_experience ?? 0,
        preferred_work_type: step2.preferred_work_type || "",
        availability: step2.availability || "",
        job_seeking_status: step2.job_seeking_status || "",
        bio: step2.bio || "",
      }));
    }
  }, [step2]);

  // Handle store error
  useEffect(() => {
    if (storeError) {
      toast.error(storeError, {
        title: "Error",
      });
    }
  }, [storeError]);

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    if (userInfo?.username) {
      router.push(`/${userInfo?.username}`);
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

    try {
      const data = removeEmptyStringValues(formData);
      await updateStep2(data);

      // Update form data with response from store
      if (step2) {
        setFormData((prev) => ({
          ...prev,
          open_to_work: step2.open_to_work ?? false,
          job_title: step2.job_title || "",
          profession: step2.profession || "",
          years_of_experience: step2.years_of_experience ?? 0,
          preferred_work_type: step2.preferred_work_type || "",
          availability: step2.availability || "",
          job_seeking_status: step2.job_seeking_status || "",
          bio: step2.bio || "",
        }));
      }

      toast.success(
        "Your professional information has been updated. Proceeding...",
        {
          title: "Success",
        }
      );
      extendRouteWithQuery({ step: "3" });
    } catch (error) {
      console.log("Error submitting Pro Info: ", error);
      // Error toast is handled by the store error effect
    }
  };

  return (
    <TemplateStructure
      headerAlignment="right"
      // Header (A) Props
      step={String(professionalInformation.step)}
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
            loading={storeLoading}
            value={formData.profession || ""}
            onChange={(e) => handleFieldChange("profession", e)}
            label="Profession"
            desc={professionalInformation.fields[0].description}
            maxLength={professionalInformation.fields[0].constraints.max_length}
          />
        </div>

        {/* Job Seeking Status and Open to Work */}
        <div className="flex flex-col gap-y-3 md:justify-between items-end md:flex-row gap-x-2">
          <span className="min-w-[70%]">
            <Textinput
              loading={storeLoading}
              type={professionalInformation.fields[4].type}
              options={
                professionalInformation.fields[4].constraints.enum_values
              }
              value={formData.job_seeking_status || ""}
              onChange={(e) => handleFieldChange("job_seeking_status", e)}
              desc={professionalInformation.fields[4].description}
              required={professionalInformation.fields[4].required}
              placeholder="Job Seeking Status"
              label="Job Seeking Status"
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
            loading={storeLoading}
            value={formData.job_title || ""}
            onChange={(e) => handleFieldChange("job_title", e)}
            label="Job Title (if currently employed)"
            desc={professionalInformation.fields[1].description}
            maxLength={professionalInformation.fields[1].constraints.max_length}
          />
        </div>

        {/* Work Type and Years of Experience */}
        <div className="flex flex-col gap-y-3 md:justify-between items-center md:flex-row gap-x-2">
          <span className="w-full md:min-w-[55%]">
            <Textinput
              loading={storeLoading}
              type="dropdown"
              value={formData.preferred_work_type || ""}
              options={
                professionalInformation.fields[5].constraints.enum_values
              }
              onChange={(e) => handleFieldChange("preferred_work_type", e)}
              placeholder="Preferred work type"
              label="Preferred work type"
              desc={professionalInformation.fields[5].description}
            />
          </span>
          <span className="w-full md:min-w-[45%] ">
            <Textinput
              loading={storeLoading}
              type="number"
              value={formData.years_of_experience || ""}
              onChange={(e) => handleFieldChange("years_of_experience", e)}
              label="Years of Experience"
              desc={professionalInformation.fields[2].description}
              minLength={professionalInformation.fields[2].constraints.minimum}
            />
          </span>
        </div>

        {/* Availability */}
        <div className="w-full">
          <Textinput
            loading={storeLoading}
            value={formData.availability || ""}
            onChange={(e) => handleFieldChange("availability", e)}
            placeholder="Availability"
            label="Availability"
            desc={professionalInformation.fields[7].description}
            type={professionalInformation.fields[7].type}
            maxLength={professionalInformation.fields[7].constraints.max_length}
            options={professionalInformation.fields[7].constraints.enum}
          />
        </div>

        {/* Bio */}
        <div className="w-full">
          <MarkdownEditor
            value={formData.bio || ""}
            onChange={(e) => handleFieldChange("bio", e)}
            label="Professional Bio"
            minHeight="150px"
            hint={professionalInformation.fields[3].description}
            placeholder={professionalInformation.fields[3].description}
            showCopy={false}
            showDownload={false}
          />
        </div>

        <Button
          type="submit"
          loading={isSaving}
          disabled={isSaving}
          text="Continue"
        />
      </form>
    </TemplateStructure>
  );
};

export default Step2;