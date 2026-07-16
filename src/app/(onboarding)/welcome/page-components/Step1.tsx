import React, { useEffect, useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure";
import Image from "next/image";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { isAuthenticated } from "@/lib/client/api";
import { removeEmptyStringValues } from "@/lib/utilities/syncFunctions/syncs";
import { accountBasics } from "@/lib/utilities/indices/MultiStepWriteUp";
import { toast } from "@/src/app/components/toastify/Toastify";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import CheckBox from "@/src/app/components/inputs/CheckBox";
import Button from "@/src/app/components/buttons/Buttons";
import { useUserOnboarding } from "@/lib/stores/user/useUserOnboarding";
import { UsernameField } from "@/src/app/components/profile/edit-components/UsernameField";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

const Step1 = () => {
  const {
    step1,
    isLoading: storeLoading,
    isSaving,
    error: storeError,
    fetchStep1,
    updateStep1,
  } = useUserOnboarding();

  const { extendRouteWithQuery, router } = useRouting();
  const { userInfo, fetchUserInfo } = useUserSettings()
  const [formData, setFormData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    phone_number: "",
    data_processing_consent: false,
    terms_accepted_at: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentArrangement, setCurrentArrangement] =
    useState<ComponentArrangement>("A-D-B-C");
  const [usernameAvailable, setUsernameAvailable] = useState<string>("");

  // Fetch existing data on component mount
  useEffect(() => {
    if (!isAuthenticated()) return;
    fetchStep1();
  }, []);

  // Populate form data when store data changes
  useEffect(() => {
    if (step1) {
      const initialData = {
        username: step1.username || "",
        firstname: step1.firstname || "",
        lastname: step1.lastname || "",
        phone_number: step1.phone_number || "",
        data_processing_consent: step1.data_processing_consent || false,
        terms_accepted_at: step1.terms_accepted_at || new Date().toISOString(),
      };
      setFormData(initialData);
      setHasUnsavedChanges(false);
    }
  }, [step1]);

  // Track form changes for unsaved changes detection
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  // Handle store error
  useEffect(() => {
    if (storeError) {
      toast.error(storeError, {
        title: "Error",
      });
    }
  }, [storeError]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation - basic check only, detailed validation handled by UsernameField
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (usernameAvailable) {
      // This gets set by UsernameField's onValidationChange callback
      errors.username = usernameAvailable;
    }

    // Data processing consent validation
    if (!formData.data_processing_consent) {
      errors.data_processing_consent =
        "You must accept data processing consent to continue";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateStepOneData = async () => {
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the form errors before continuing", {
        title: "Validation Error",
      });
      return;
    }

    const data = removeEmptyStringValues(formData);
    try {
      await updateStep1({ ...data, onboarding_step: 1 });

      // Update user store after successful step 1 update
      await fetchUserInfo();

      setHasUnsavedChanges(false);

      toast.success(
        "Your basic account information has been updated. Proceeding...",
        {
          title: "Success",
        }
      );

      extendRouteWithQuery({ step: "2" });
    } catch (error) {
      // Error handling is already done in the store
      console.error("Error updating Step 1 data: ", error);
      toast.error("Failed to save account basics. Please try again.", {
        title: "Error",
      });
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to go back?"
      );
      if (!confirmLeave) return;
    }
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

  const isFormValid = () => {
    return (
      formData.username.trim() &&
      formData.data_processing_consent &&
      !usernameAvailable &&
      !formErrors.username &&
      !formErrors.data_processing_consent
    );
  };

  return (
    <TemplateStructure
      onArrangementChange={(newArrangement) => {
        console.log(newArrangement);
        setCurrentArrangement(newArrangement);
      }}
      arrangement={currentArrangement}
      step={String(accountBasics.step)}
      title={accountBasics.title}
      headerDescription={accountBasics.description}
      headerAlignment="left"
      greeting={accountBasics.greeting}
      pageWriteup={accountBasics.page_writeup}
      additionalContent={
        <div className=" h-full w-full">
          <img
            alt="Step 1"
            src={"/vectors/undraw_applications_h0mq.svg"}
            width={1000}
            height={1000}
          />
        </div>
      }
      onBack={handleBack}
      onSkip={handleSkip}
    >
      <div className="w-full flex flex-col gap-y-4">
        <div className="w-full">
          <UsernameField
            value={formData.username}
            onChange={(e: string) => {
              setFormData((prev) => ({
                ...prev,
                username: e,
              }));
            }}
            label="Username*"
            loading={storeLoading}
            currentUsername={userInfo?.username ?? ""}
            onValidationChange={(isValid) => {
              if (!isValid) {
                setUsernameAvailable("Invalid or taken username");
              } else {
                setUsernameAvailable("");
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-y-4 md:gap-x-1 md:flex-row justify-between w-full">
          <span className="min-w-1/2">
            <Textinput
              loading={storeLoading}
              value={formData.firstname}
              onChange={(e: string) => {
                setFormData((prev) => ({
                  ...prev,
                  firstname: e,
                }));
              }}
              minLength={accountBasics.fields[1]?.constraints?.min_length}
              maxLength={accountBasics.fields[1]?.constraints?.max_length}
              desc={accountBasics.fields[1]?.description}
              label="Firstname"
              error={formErrors.firstname}
            />
          </span>
          <span className="min-w-1/2">
            <Textinput
              loading={storeLoading}
              value={formData.lastname}
              onChange={(e: string) => {
                setFormData((prev) => ({
                  ...prev,
                  lastname: e,
                }));
              }}
              label="Lastname"
              minLength={accountBasics.fields[2]?.constraints?.min_length}
              maxLength={accountBasics.fields[2]?.constraints?.max_length}
              desc={accountBasics.fields[2]?.description}
              error={formErrors.lastname}
            />
          </span>
        </div>

        <div className="w-full">
          <Textinput
            loading={storeLoading}
            value={formData.phone_number}
            onChange={(e: string) => {
              setFormData((prev) => ({
                ...prev,
                phone_number: e,
              }));
            }}
            label="Phone"
            type="tel"
            minLength={accountBasics.fields[3]?.constraints?.min_length}
            maxLength={accountBasics.fields[3]?.constraints?.max_length}
            desc={accountBasics.fields[3]?.description}
            error={formErrors.phone_number}
          />
        </div>

        <div>
          <div className="flex w-full justify-start gap-x-4 items-center">
            <span>
              <CheckBox
                id="data_processing"
                isChecked={formData.data_processing_consent}
                setIsChecked={(checked: boolean) => {
                  setFormData((prev) => ({
                    ...prev,
                    data_processing_consent: checked,
                  }));
                }}
              />
            </span>
            <span className="text-xs max-w-xs text-[var(--accent)]">
              {accountBasics.fields[4]?.description}
            </span>
          </div>
          {formErrors.data_processing_consent && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.data_processing_consent}
            </p>
          )}

          <span className="w-full mt-4 flex-1 flex items-center justify-end"></span>
          <Button
            variant="primary"
            size="md"
            text="Submit & Continue"
            className="w-full"
            disabled={!isFormValid() || isSaving}
            loading={isSaving}
            onClick={updateStepOneData}
          />
        </div>
      </div>
    </TemplateStructure>
  );
};

export default Step1;