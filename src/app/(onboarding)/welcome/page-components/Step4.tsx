import { useRouting } from "@/lib/hooks/routing/useRouting";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure";
import { isAuthenticated } from "@/lib/client/api";
import { toast } from "@/src/app/components/toastify/Toastify";
import { privacyAndNotification } from "@/lib/utilities/indices/MultiStepWriteUp";
import CheckBox from "@/src/app/components/inputs/CheckBox";
import Button from "@/src/app/components/buttons/Buttons";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { useUserOnboarding } from "@/lib/stores/user/useUserOnboarding";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

const Step4 = () => {
  const { router, extendRouteWithQuery } = useRouting();
  const { userInfo } = useUserSettings();

  const {
    step4,
    isLoading: storeLoading,
    isSaving,
    error: storeError,
    fetchStep4,
    updateStep4,
  } = useUserOnboarding();

  const [formData, setFormData] = useState({
    show_email: false,
    show_phone: false,
    allow_indexing: true,
    show_last_active: true,
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    weekly_digest: true,
    profile_visibility: "public",
  });

  const [currentArrangement, setCurrentArrangement] =
    useState<ComponentArrangement>("B-C-D-A");

  // Fetch existing data on component mount
  useEffect(() => {
    if (!isAuthenticated()) return;
    fetchStep4();
  }, []);

  // Populate form data when store data changes
  useEffect(() => {
    if (step4) {
      setFormData((prev) => ({
        ...prev,
        show_email: step4.show_email ?? false,
        show_phone: step4.show_phone ?? false,
        allow_indexing: step4.allow_indexing ?? true,
        show_last_active: step4.show_last_active ?? true,
        email_notifications: step4.email_notifications ?? true,
        push_notifications: step4.push_notifications ?? true,
        marketing_emails: step4.marketing_emails ?? false,
        weekly_digest: step4.weekly_digest ?? true,
        profile_visibility: step4.profile_visibility ?? "public",
      }));
    }
  }, [step4]);

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
      await updateStep4(formData);

      // Update form data with response from store
      if (step4) {
        setFormData((prev) => ({
          ...prev,
          show_email: step4.show_email ?? false,
          show_phone: step4.show_phone ?? false,
          allow_indexing: step4.allow_indexing ?? true,
          show_last_active: step4.show_last_active ?? true,
          email_notifications: step4.email_notifications ?? true,
          push_notifications: step4.push_notifications ?? true,
          marketing_emails: step4.marketing_emails ?? false,
          weekly_digest: step4.weekly_digest ?? true,
          profile_visibility: step4.profile_visibility ?? "public",
        }));
      }

      toast.success(
        "Your privacy and notification settings has been updated. Proceeding...",
        {
          title: "Success",
        }
      );
      extendRouteWithQuery({ step: "5" });
    } catch (error) {
      console.log("Error submitting privacy settings: ", error);
      // Error toast is handled by the store error effect
    }
  };

  return (
    <TemplateStructure
      headerAlignment="left"
      step={String(privacyAndNotification.step)}
      headerDescription={privacyAndNotification.description}
      greeting={privacyAndNotification.greeting}
      pageWriteup={privacyAndNotification.page_writeup}
      onBack={handleBack}
      onSkip={handleSkip}
      additionalContent={
        <div className="h-full w-full">
          <img
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
          <p className="font-semibold">Show Email</p>
          <CheckBox
            id="show_email"
            isChecked={formData.show_email}
            setIsChecked={(e: boolean) => handleFieldChange("show_email", e)}
            description={privacyAndNotification.fields[0].description}
            showDescriptionOn="hover"
          />
        </span>

        {/* Show Phone */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <p className="font-semibold">Show Phone</p>
          <CheckBox
            id="show_phone"
            isChecked={formData.show_phone}
            setIsChecked={(e: boolean) => handleFieldChange("show_phone", e)}
            description={privacyAndNotification.fields[1].description}
            showDescriptionOn="hover"
          />
        </span>

        {/* Allow Indexing */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <p className="font-semibold">Allow Indexing</p>
          <CheckBox
            id="allow_indexing"
            isChecked={formData.allow_indexing}
            setIsChecked={(e: boolean) =>
              handleFieldChange("allow_indexing", e)
            }
            description={privacyAndNotification.fields[2].description}
            showDescriptionOn="hover"
          />
        </span>

        {/* Show Last Active */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <p className="font-semibold">Show Last Active</p>
          <CheckBox
            id="show_last_active"
            isChecked={formData.show_last_active}
            setIsChecked={(e: boolean) =>
              handleFieldChange("show_last_active", e)
            }
            description={privacyAndNotification.fields[3].description}
            showDescriptionOn="hover"
          />
        </span>

        {/* Email Notifications */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <p className="font-semibold">Enable Email Notification</p>
          <CheckBox
            id="email_notification"
            isChecked={formData.email_notifications}
            setIsChecked={(e: boolean) =>
              handleFieldChange("email_notifications", e)
            }
            description={privacyAndNotification.fields[4].description}
            showDescriptionOn="hover"
          />
        </span>

        {/* Push Notifications */}
        <span className="flex items-center w-full justify-between shadow-lg rounded-2xl p-3">
          <p className="font-semibold">Enable Push Notification</p>
          <CheckBox
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
          <p className="font-semibold">Enable Weekly Digest</p>
          <CheckBox
            id="weekly_digest"
            isChecked={formData.weekly_digest}
            setIsChecked={(e: boolean) =>
              handleFieldChange("weekly_digest", e)
            }
            description={privacyAndNotification.fields[7].description}
            showDescriptionOn="hover"
          />
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
          loading={storeLoading || isSaving}
          disabled={storeLoading || isSaving}
        />
      </form>
    </TemplateStructure>
  );
};

export default Step4;