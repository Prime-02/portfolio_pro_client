import {
  PrivacyNotifications,
  ProfileVisibility,
} from "@/app/components/types and interfaces/UserForm";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { FormEvent, useEffect, useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure";
import { toast } from "@/app/components/toastify/Toastify";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import {
  GetAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { privacyAndNotification } from "@/app/components/utilities/indices/MultiStepWriteUp";
import Switch from "@/app/components/inputs/Switch";
import CheckBox from "@/app/components/inputs/CheckBox";
import { Textinput } from "@/app/components/inputs/Textinput";
import Button from "@/app/components/buttons/Buttons";
import Image from "next/image";

const Step4 = () => {
  const {
    router,
    userData,
    setLoading,
    accessToken,
    loading,
    extendRouteWithQuery,
  } = useGlobalState();
  const [formData, setFormData] = useState({
    show_email: false,
    show_phone: false,
    allow_indexing: true,
    show_last_active: true,
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    weekly_digest: true,
    profile_visibility: ProfileVisibility.Public,
  });
  const [currentArrangement, setCurrentArrangement] =
    useState<ComponentArrangement>("B-C-D-A");

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
    setLoading("submitting_pro_info");
    try {
      const updateRes: PrivacyNotifications = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/step4`,
        field: formData,
      });
      if (updateRes) {
        setFormData((prev) => ({
          ...prev,
          show_email: updateRes.show_email ?? true,
          show_phone: updateRes.show_phone ?? true,
          allow_indexing: updateRes.allow_indexing ?? true,
          email_notifications: updateRes.email_notifications ?? true,
          push_notifications: updateRes.push_notifications ?? false,
          marketing_emails: updateRes.marketing_emails ?? false,
          weekly_digest: updateRes.weekly_digest ?? false,
          profile_visibility:
            updateRes.profile_visibility ?? ProfileVisibility.Public,
        }));
        toast.success(
          "Your privacy and notification settings has been updated. Proceeding...",
          {
            title: "Success",
          }
        );
        extendRouteWithQuery({ step: "5" });
      }
    } catch (error) {
      console.log("Error submitting Pro Info: ", error);
    } finally {
      setLoading("submitting_pro_info");
    }
  };

  const fetchingPrivacySettings = async () => {
    setLoading("fetching_privacy_settings");
    try {
      const privacyRes: PrivacyNotifications = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/step4`,
      });

      if (privacyRes) {
        setFormData((prev) => ({
          ...prev,
          show_email: privacyRes.show_email ?? false,
          show_phone: privacyRes.show_phone ?? false,
          allow_indexing: privacyRes.allow_indexing ?? true,
          show_last_active: privacyRes.show_last_active ?? true,
          email_notifications: privacyRes.email_notifications ?? true,
          push_notifications: privacyRes.push_notifications ?? true,
          marketing_emails: privacyRes.marketing_emails ?? false,
          weekly_digest: privacyRes.weekly_digest ?? true,
          profile_visibility:
            privacyRes.profile_visibility ?? ProfileVisibility.Public,
        }));
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
      toast.error("Failed to load privacy settings", {
        title: "Loading Error",
      });
    } finally {
      setLoading("fetching_privacy_settings");
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    // Optional: Add cleanup for async operation
    let isMounted = true;

    const fetchData = async () => {
      try {
        await fetchingPrivacySettings();
      } catch (error) {
        if (isMounted) {
          console.error("Fetch error:", error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  return (
    <TemplateStructure
      headerAlignment="left"
      step={privacyAndNotification.step + "/6"}
      headerDescription={privacyAndNotification.description}
      greeting={privacyAndNotification.greeting}
      pageWriteup={privacyAndNotification.page_writeup}
      onBack={handleBack}
      onSkip={handleSkip}
      additionalContent={
        <div className="h-full w-full">
          <Image
            alt="Step 4"
            src={"/vectors/undraw_my-notifications_fy5v.svg"}
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
      title={privacyAndNotification.title}
    >
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        className="flex flex-col gap-y-4"
      >
        {/* Show Email */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <Switch
            isSwitched={formData.show_email}
            onSwitch={(e: boolean) => handleFieldChange("show_email", e)}
            description={privacyAndNotification.fields[0].description}
            showDescriptionOn="hover"
          />
          <p className="font-semibold">Show Email</p>
        </span>

        {/* Show Phone */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <p className="font-semibold">Show Phone</p>
          <Switch
            isSwitched={formData.show_phone}
            onSwitch={(e: boolean) => handleFieldChange("show_phone", e)}
            description={privacyAndNotification.fields[1].description}
            showDescriptionOn="hover"
            direction="left"
          />
        </span>

        {/* Allow Indexing */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <CheckBox
            id="allow_indexing"
            isChecked={formData.allow_indexing}
            setIsChecked={(e: boolean) =>
              handleFieldChange("allow_indexing", e)
            }
            description={privacyAndNotification.fields[2].description}
            showDescriptionOn="hover"
          />
          <p className="font-semibold">Allow Indexing</p>
        </span>

        {/* Show Last Active */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <p className="font-semibold">Show Last Active</p>
          <Switch
          direction="left"
            isSwitched={formData.show_last_active}
            onSwitch={(e: boolean) => handleFieldChange("show_last_active", e)}
            description={privacyAndNotification.fields[3].description}
            showDescriptionOn="hover"
          />
        </span>

        {/* Email Notifications */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <CheckBox
            id="email_notification"
            isChecked={formData.email_notifications}
            setIsChecked={(e: boolean) =>
              handleFieldChange("email_notifications", e)
            }
            description={privacyAndNotification.fields[4].description}
            showDescriptionOn="hover"
          />
          <p className="font-semibold">Enable Email Notification</p>
        </span>

        {/* Push Notifications */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <p className="font-semibold">Enable Push Notification</p>
          <CheckBox
          direction="left"
            id="push_notifications"
            isChecked={formData.push_notifications}
            setIsChecked={(e: boolean) =>
              handleFieldChange("push_notifications", e)
            }
            description={privacyAndNotification.fields[5].description}
            showDescriptionOn="hover"
          />
        </span>

        {/* Weekly Digest */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <Switch
            isSwitched={formData.weekly_digest}
            onSwitch={(e: boolean) => handleFieldChange("weekly_digest", e)}
            description={privacyAndNotification.fields[7].description}
            showDescriptionOn="hover"
          />
          <p className="font-semibold">Enable Weekly Digest</p>
        </span>

        {/* Profile Visibility */}
        <span className="w-full shadow-lg rounded-2xl p-3">
          <Textinput
            label="Profile Visibility"
            value={formData.profile_visibility}
            onChange={(e: string) => handleFieldChange("profile_visibility", e)}
            type="dropdown"
            className="w-full"
            id={privacyAndNotification.fields[8].name}
            desc={privacyAndNotification.fields[8].description}
            options={privacyAndNotification.fields[8].constraints.enum_values}
          />
        </span>
        <Button
          type="submit"
          text="Continue"
          loading={loading.includes("submitting_pro_info")}
        />
      </form>
    </TemplateStructure>
  );
};

export default Step4;
