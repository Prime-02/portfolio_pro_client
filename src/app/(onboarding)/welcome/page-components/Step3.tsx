import { toast } from "@/app/components/toastify/Toastify";
import {
  GetAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { contactAndLocation } from "@/app/components/utilities/indices/MultiStepWriteUp";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { removeEmptyStringValues } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { FormEvent, useEffect, useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure";
import DataList from "@/app/components/inputs/DataList";
import { Textinput } from "@/app/components/inputs/Textinput";
import CheckBox from "@/app/components/inputs/CheckBox";
import Switch from "@/app/components/inputs/Switch";
import Button from "@/app/components/buttons/Buttons";
import { ContactLocation } from "@/app/components/types and interfaces/UserForm";
import Image from "next/image";

const Step3 = () => {
  const {
    router,
    userData,
    setLoading,
    accessToken,
    loading,
    extendRouteWithQuery,
  } = useGlobalState();
  const [formData, setFormData] = useState({
    website_url: "",
    github_username: "",
    location: "",
    preferred_contact_method: "",
    available_for_contact: true,
  });
  const [isDev, setIsDev] = useState(false);
  const [currentArrangement, setCurrentArrangement] =
    useState<ComponentArrangement>("C-B-A-D");

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
    setLoading("submitting_contact_info");
    try {
      const updateRes: ContactLocation = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/step3`,
        field: removeEmptyStringValues(formData),
      });
      if (updateRes) {
        setFormData((prev) => ({
          ...prev,
          website_url: updateRes.website_url || "",
          github_username: updateRes.github_username || "",
          location: updateRes.location || "",
          preferred_contact_method: updateRes.preferred_contact_method || "",
          available_for_contact: updateRes.available_for_contact || false,
        }));
        toast.success(
          "Your contact and location information has been updated. Proceeding...",
          {
            title: "Success",
          }
        );
        extendRouteWithQuery({ step: "4" });
      }
    } catch (error) {
      console.log("Error submitting Contact and location info: ", error);
    } finally {
      setLoading("submitting_contact_info");
    }
  };

  const fetchingContactInfo = async () => {
    setLoading("fetching_pro_info");
    try {
      const contactRes: ContactLocation = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/step3`,
      });
      if (contactRes) {
        setFormData((prev) => ({
          ...prev,
          website_url: contactRes.website_url || "",
          github_username: contactRes.github_username || "",
          location: contactRes.location || "",
          preferred_contact_method: contactRes.preferred_contact_method || "",
          available_for_contact: contactRes.available_for_contact || false,
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
    fetchingContactInfo();
  }, [accessToken]);

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
          <Image
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
          <DataList
            maxLength={contactAndLocation.fields[2].constraints.max_length}
            labelBgHexIntensity={1}
            url={`${V1_BASE_URL}/location/search/places`}
            onSetValue={(e) => {
              handleFieldChange("location", e);
            }}
            dataPath="results"
            displayKeys={[
              "place.Municipality",
              "place.Region",
              "place.Country",
            ]}
            separator=", "
            placeholder="Search for a location..."
            minQueryLength={3}
            desc={contactAndLocation.fields[2].description}
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
              type={contactAndLocation.fields[3].type}
              options={contactAndLocation.fields[3].constraints.enum_values}
              value={formData.preferred_contact_method || ""}
              onChange={(e) => handleFieldChange("job_seeking_status", e)}
              desc={contactAndLocation.fields[3].description}
              required={contactAndLocation.fields[3].required}
              placeholder="Preferred Contact  Method"
              label="Preferred Contact  Method"
              id={contactAndLocation.fields[3].name}
            />
          </span>
        </div>
        <div className="w-full">
          <Textinput
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
            labelBgHexIntensity={1}
          />
        </div>
        <div className="flex flex-col gap-y-3 md:justify-between md:flex-row gap-x-2">
          <span className="flex flex-wrap items-center md:justify-end min-w-min-w-[35%] gap-x-1">
            <Switch
              isSwitched={isDev}
              onSwitch={(value: boolean) => setIsDev(value)}
            />
            <p className="text-xs text-[var(--accent)]">{"Developer Option"}</p>
          </span>
          {isDev && (
            <span className="min-w-[65%]">
              <Textinput
                type={contactAndLocation.fields[1].type}
                options={contactAndLocation.fields[1].constraints.enum_values}
                value={formData.github_username || ""}
                onChange={(e) => handleFieldChange("github_username", e)}
                desc={contactAndLocation.fields[1].description}
                required={contactAndLocation.fields[1].required}
                label="Your github username"
                id={contactAndLocation.fields[1].name}
                labelBgHexIntensity={1}
              />
            </span>
          )}
        </div>
        {formData.github_username.length > 3 && (
          <div className="w-full">GitHub Contribution graph comming soon</div>
        )}
        <Button
          type="submit"
          loading={loading.includes("submitting_contact_info")}
          text="Continue"
        />
      </form>
    </TemplateStructure>
  );
};

export default Step3;
