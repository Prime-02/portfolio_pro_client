import Button from "@/app/components/buttons/Buttons";
import CheckBox from "@/app/components/inputs/CheckBox";
import { Textinput } from "@/app/components/inputs/Textinput";
import { toast } from "@/app/components/toastify/Toastify";
import { AccountBasics } from "@/app/components/types and interfaces/UserForm";
import {
  GetAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { accountBasics } from "@/app/components/utilities/indices/MultiStepWriteUp";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { removeEmptyStringValues } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState, useCallback } from "react";
import TemplateStructure from "./TemplateStructure";

const Step1 = () => {
  const {
    accessToken,
    extendRouteWithQuery,
    loading,
    setLoading,
    userData,
    router,
    fetchUserData,
    checkUsernameAvailability,
  } = useGlobalState();

  const [formData, setFormData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    phone_number: "",
    data_processing_consent: false,
    terms_accepted_at: new Date().toISOString(),
  });

  const [usernameAvailable, setUsernameAvailable] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch existing data on component mount
  useEffect(() => {
    if (!accessToken) return;
    fetchStepOneData();
  }, [accessToken]);

  // Track form changes for unsaved changes detection
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  const fetchStepOneData = async () => {
    setLoading("fetching_step1_data");
    try {
      const step1DataRes: AccountBasics = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/step1`,
        type: "Step 1 Data",
      });

      if (step1DataRes) {
        const initialData = {
          username: step1DataRes.username || "",
          firstname: step1DataRes.firstname || "",
          lastname: step1DataRes.lastname || "",
          phone_number: step1DataRes.phone_number || "",
          data_processing_consent:
            step1DataRes.data_processing_consent || false,
          terms_accepted_at:
            step1DataRes.terms_accepted_at || new Date().toISOString(),
        };
        setFormData(initialData);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Error fetching step 1 data: ", error);
    } finally {
      setLoading("fetching_step1_data");
    }
  };

  const checkUsername = useCallback(
    async (username: string) => {
      if (!username || username.length < 3) {
        setUsernameAvailable("");
        return;
      }
      try {
        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable && formData.username !== userData.username) {
          setUsernameAvailable("This username is already taken");
          setFormErrors((prev) => ({
            ...prev,
            username: "This username is already taken",
          }));
        } else {
          setUsernameAvailable("");
          setFormErrors((prev) => ({
            ...prev,
            username: "",
          }));
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameAvailable("Error checking username availability");
        setFormErrors((prev) => ({
          ...prev,
          username: "Error checking username availability",
        }));
      }
    },
    [formData.username]
  );

  // Debounce username checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.username && formData.username.length >= 3) {
        checkUsername(formData.username);
      } else {
        setUsernameAvailable("");
        setFormErrors((prev) => {
          const { username, ...rest } = prev;
          return rest;
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (
      formData.username.length <
      (accountBasics.fields[0]?.constraints?.min_length || 3)
    ) {
      errors.username = `Username must be at least ${accountBasics.fields[0]?.constraints?.min_length || 3} characters`;
    } else if (usernameAvailable) {
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

    setLoading("updating_step1_data");
    const data = removeEmptyStringValues(formData);
    try {
      const step1UpdateRes: AccountBasics = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/user-multistep-form/step1`,
        field: data,
      });

      if (step1UpdateRes) {
        await fetchUserData();
        setFormData({
          username: step1UpdateRes.username || "",
          firstname: step1UpdateRes.firstname || "",
          lastname: step1UpdateRes.lastname || "",
          phone_number: step1UpdateRes.phone_number || "",
          data_processing_consent:
            step1UpdateRes.data_processing_consent || false,
          terms_accepted_at:
            step1UpdateRes.terms_accepted_at || new Date().toISOString(),
        });
        setHasUnsavedChanges(false);

        toast.success("Account basics saved successfully!", {
          title: "Success",
        });

        extendRouteWithQuery({ step: "2" });
      }
    } catch (error) {
      console.error("Error updating Step 1 data: ", error);
      toast.error("Failed to save account basics. Please try again.", {
        title: "Error",
      });
    } finally {
      setLoading("updating_step1_data");
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
      step={String(accountBasics.step)}
      title={accountBasics.title}
      headerDescription={accountBasics.description}
      headerAlignment="left" // Align header to the left as per original Step1
      greeting={accountBasics.greeting}
      pageWriteup={accountBasics.page_writeup}
      additionalContent={<div className="border h-full w-full"></div>}
      onBack={handleBack}
      onSkip={handleSkip}
      arrangement="A-D-B-C" // Default arrangement: Header top, Description left, Form right
      children={
        <div className="w-full md:w-md flex flex-col gap-y-4 p-4">
          <div className="w-full">
            <Textinput
              loading={loading.includes("fetching_step1_data")}
              labelBgHexIntensity={1}
              value={formData.username}
              onChange={(e: string) => {
                setFormData((prev) => ({
                  ...prev,
                  username: e,
                }));
              }}
              label={
                loading.includes("checking_username")
                  ? "Checking username..."
                  : "Username *"
              }
              minLength={accountBasics.fields[0]?.constraints?.min_length}
              maxLength={accountBasics.fields[0]?.constraints?.max_length}
              desc={accountBasics.fields[0]?.description}
              error={formErrors.username}
            />
          </div>

          {/* {String(formData.username === userData.username)} */}

          <div className="flex flex-col gap-y-4 md:gap-x-1 md:flex-row justify-between w-full">
            <span className="min-w-1/2">
              <Textinput
                loading={loading.includes("fetching_step1_data")}
                labelBgHexIntensity={1}
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
            <span>
              <Textinput
                loading={loading.includes("fetching_step1_data")}
                labelBgHexIntensity={1}
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
              loading={loading.includes("fetching_step1_data")}
              labelBgHexIntensity={1}
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
              disabled={
                !isFormValid() || loading.includes("updating_step1_data")
              }
              loading={loading.includes("updating_step1_data")}
              onClick={updateStepOneData}
            />
          </div>
        </div>
      }
    />
  );
};

export default Step1;
