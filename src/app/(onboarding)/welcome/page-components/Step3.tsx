import { useRouting } from "@/lib/hooks/routing/useRouting";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure";
import { toast } from "@/src/app/components/toastify/Toastify";
import { isAuthenticated } from "@/lib/client/api";
import { removeEmptyStringValues } from "@/lib/utilities/syncFunctions/syncs";
import { contactAndLocation } from "@/lib/utilities/indices/MultiStepWriteUp";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import CheckBox from "@/src/app/components/inputs/CheckBox";
import Button from "@/src/app/components/buttons/Buttons";
import { useUserOnboarding } from "@/lib/stores/user/useUserOnboarding";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

const Step3 = () => {
  const { extendRouteWithQuery, router } = useRouting();
  const { userInfo } = useUserSettings();

  const {
    step3,
    isLoading: storeLoading,
    isSaving,
    error: storeError,
    fetchStep3,
    updateStep3,
  } = useUserOnboarding();

  const [formData, setFormData] = useState({
    website_url: "",
    github_username: "",
    location: "",
    preferred_contact_method: "",
    available_for_contact: true,
  });

  const [currentArrangement, setCurrentArrangement] =
    useState<ComponentArrangement>("C-B-A-D");

  // Fetch existing data on component mount
  useEffect(() => {
    if (!isAuthenticated()) return;
    fetchStep3();
  }, []);

  // Populate form data when store data changes
  useEffect(() => {
    if (step3) {
      setFormData((prev) => ({
        ...prev,
        website_url: step3.website_url || "",
        github_username: step3.github_username || "",
        location: step3.location || "",
        preferred_contact_method: step3.preferred_contact_method || "",
        available_for_contact: step3.available_for_contact ?? true,
      }));
    }
  }, [step3]);

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

    try {
      const data = removeEmptyStringValues(formData);
      await updateStep3(data);

      // Update form data with response from store
      if (step3) {
        setFormData((prev) => ({
          ...prev,
          website_url: step3.website_url || "",
          github_username: step3.github_username || "",
          location: step3.location || "",
          preferred_contact_method: step3.preferred_contact_method || "",
          available_for_contact: step3.available_for_contact ?? true,
        }));
      }

      toast.success(
        "Your contact and location information has been updated. Proceeding...",
        {
          title: "Success",
        }
      );
      extendRouteWithQuery({ step: "4" });
    } catch (error) {
      console.log("Error submitting Contact and location info: ", error);
      // Error toast is handled by the store error effect
    }
  };

  return (
    <TemplateStructure
      headerAlignment="right"
      step={String(contactAndLocation.step)}
      headerDescription={contactAndLocation.description}
      greeting={contactAndLocation.greeting}
      pageWriteup={contactAndLocation.page_writeup}
      onBack={handleBack}
      onSkip={handleSkip}
      additionalContent={
        <div className=" h-full w-full">
          <img
            alt="Step 3"
            src={"/vectors/undraw_contact-us_kcoa.svg"}
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
      title={contactAndLocation.title}
    >
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        className="flex flex-col gap-y-3"
      >
        <div className="w-full">
          <Textinput
            loading={storeLoading}
            onChange={(e) => {
              handleFieldChange("location", e);
            }}
            value={formData.location || ""}
            label="Address"
            maxLength={contactAndLocation.fields[2].constraints.max_length}
            pattern={contactAndLocation.fields[2].constraints.pattern}
            desc={contactAndLocation.fields[2].description}
            required={contactAndLocation.fields[2].required}
            id={contactAndLocation.fields[2].name}
          />
        </div>
        <div className="flex flex-col gap-y-3 md:justify-between md:flex-row gap-x-2">
          <span className="flex flex-wrap items-center md:justify-end min-w-min-w-[35%] gap-x-1">
            <CheckBox
              label="Available for contact"
              isChecked={formData.available_for_contact}
              setIsChecked={(e) =>
                handleFieldChange("available_for_contact", e)
              }
            />
          </span>
          <span className="min-w-[65%]">
            <Textinput
              loading={storeLoading}
              type={contactAndLocation.fields[3].type}
              options={contactAndLocation.fields[3].constraints.enum_values}
              value={formData.preferred_contact_method || ""}
              onChange={(e) => handleFieldChange("preferred_contact_method", e)}
              desc={contactAndLocation.fields[3].description}
              required={contactAndLocation.fields[3].required}
              placeholder="Preferred Contact  Method"
              label="Preferred Contact  Method"
              id={contactAndLocation.fields[3].name}
            />
          </span>
        </div>
        {formData.preferred_contact_method === "website" && (
          <div className="w-full">
            <Textinput
              loading={storeLoading}
              value={formData.website_url}
              label="Your website URL"
              onChange={(e: string) => {
                handleFieldChange("website_url", e);
              }}
              maxLength={contactAndLocation.fields[0].constraints.max_length}
              pattern={contactAndLocation.fields[0].constraints.pattern}
              desc={contactAndLocation.fields[0].description}
              required={contactAndLocation.fields[0].required}
              id={contactAndLocation.fields[0].name}
            />
          </div>
        )}
        <Button
          type="submit"
          loading={isSaving}
          text="Continue"
        />
      </form>
    </TemplateStructure>
  );
};

export default Step3;