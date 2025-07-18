import DataList from "@/app/components/inputs/DataList";
import Modal from "@/app/components/containers/modals/Modal";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  Profile,
  User,
} from "@/app/components/types and interfaces/UserAndProfile";
import { useGlobalState } from "@/app/globalStateProvider";
import {
  Pen,
  Save,
  AlertCircle,
  CheckCircle,
  Share2,
  Link2,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { availabilityOptions } from "@/app/components/utilities/indices/DropDownItems";
import CheckBox from "@/app/components/inputs/CheckBox";
import Button from "@/app/components/buttons/Buttons";
import Link from "next/link";
import { UpdateAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import {
  copyToClipboard,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";

type UserProfilePanel = {
  userProfile: Profile;
  fetchUserProfile: () => void;
};

type FieldUpdateState = {
  [key: string]: {
    isChanged: boolean;
    isUpdating: boolean;
    lastSaved?: Date;
    error?: string;
  };
};

const ProfileDetails = ({
  userProfile,
  fetchUserProfile,
}: UserProfilePanel) => {
  const { fetchUserData, userData, accessToken } = useGlobalState();
  const [editPanel, setEditPanel] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const { theme } = useTheme();

  const [userInfo, setUserInfo] = useState<User>({
    email: userData.email || "",
    firstname: userData.firstname || "",
    lastname: userData.lastname || "",
    middlename: userData.middlename || "",
    username: userData.username || "",
    phone_number: userData.phone_number || "",
    is_active: userData.is_active || true,
  });

  const [userProfileDetails, setUserProfileDetails] = useState<Profile>({
    github_username: "",
    bio: "",
    profession: "",
    job_title: "",
    years_of_experience: 0,
    website_url: "",
    location: "",
    open_to_work: true,
    availability: "",
  });

  // Track original values for change detection
  const [originalUserInfo, setOriginalUserInfo] = useState<User>({
    email: userData.email || "",
    firstname: userData.firstname || "",
    lastname: userData.lastname || "",
    middlename: userData.middlename || "",
    username: userData.username || "",
    phone_number: userData.phone_number || "",
    is_active: userData.is_active || true,
  });
  const [originalUserProfileDetails, setOriginalUserProfileDetails] =
    useState<Profile>({
      github_username: "",
      bio: "",
      profession: "",
      job_title: "",
      years_of_experience: 0,
      website_url: "",
      location: "",
      open_to_work: true,
      availability: "",
    });

  // Track field-specific update states
  const [fieldStates, setFieldStates] = useState<FieldUpdateState>({});

  const validateField = (
    fieldName: string,
    value: string | number | boolean | undefined | null
  ): string => {
    switch (fieldName) {
      case "firstname":
        return !value?.toString().trim() ? "First name is required" : "";
      case "lastname":
        return !value?.toString().trim() ? "Last name is required" : "";
      case "username":
        if (!value?.toString().trim()) return "Username is required";
        if (value.toString().length < 3)
          return "Username must be at least 3 characters";
        return "";
      case "website_url":
        if (value && !isValidUrl(value.toString()))
          return "Please enter a valid URL";
        return "";
      case "years_of_experience":
        return typeof value === "number" && value < 0
          ? "Years of experience cannot be negative"
          : "";
      default:
        return "";
    }
  };

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Update field state when values change
  const updateFieldState = useCallback(
    (
      fieldName: string,
      currentValue: string | number | boolean | undefined | null,
      originalValue: string | number | boolean | undefined | null
    ) => {
      const isChanged =
        JSON.stringify(currentValue) !== JSON.stringify(originalValue);
      const error = validateField(fieldName, currentValue);

      setFieldStates((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          isChanged,
          error,
        },
      }));

      // Update validation errors
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    },
    []
  );

  // Check for changes in user info fields
  useEffect(() => {
    Object.keys(userInfo).forEach((key) => {
      updateFieldState(
        key,
        userInfo[key as keyof User],
        originalUserInfo[key as keyof User]
      );
    });
  }, [userInfo, originalUserInfo, updateFieldState]);

  // Check for changes in profile fields
  useEffect(() => {
    Object.keys(userProfileDetails).forEach((key) => {
      updateFieldState(
        key,
        userProfileDetails[key as keyof Profile],
        originalUserProfileDetails[key as keyof Profile]
      );
    });
  }, [userProfileDetails, originalUserProfileDetails, updateFieldState]);

  // Update individual user info field
  const updateUserInfoField = async (fieldName: keyof User) => {
    const fieldValue = userInfo[fieldName];
    const error = validateField(fieldName, fieldValue);

    if (error) {
      setValidationErrors((prev) => ({ ...prev, [fieldName]: error }));
      return;
    }

    setFieldStates((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], isUpdating: true },
    }));

    try {
      const updatedData = { ...userInfo, [fieldName]: fieldValue };
      const updateRes: User = await UpdateAllData({
        access: accessToken,
        field: { user_data: JSON.stringify(updatedData) },
        url: `${V1_BASE_URL}/settings/info`,
        useFormData: true,
      });

      if (updateRes) {
        fetchUserData();
        setOriginalUserInfo((prev) => ({ ...prev, [fieldName]: fieldValue }));
        setFieldStates((prev) => ({
          ...prev,
          [fieldName]: {
            isChanged: false,
            isUpdating: false,
            lastSaved: new Date(),
            error: undefined,
          },
        }));
      }
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      setFieldStates((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          isUpdating: false,
          error: "Failed to update",
        },
      }));
    }
  };

  // Update individual profile field
  const updateProfileField = async (fieldName: keyof Profile) => {
    const fieldValue = userProfileDetails[fieldName];
    const error = validateField(fieldName, fieldValue);

    if (error) {
      setValidationErrors((prev) => ({ ...prev, [fieldName]: error }));
      return;
    }

    setFieldStates((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], isUpdating: true },
    }));

    try {
      const updatedData = { ...userProfileDetails, [fieldName]: fieldValue };
      const updateRes: Profile = await UpdateAllData({
        access: accessToken,
        field: { profile_data: JSON.stringify(updatedData) },
        url: `${V1_BASE_URL}/settings/profile`,
        useFormData: true,
      });

      if (updateRes) {
        fetchUserProfile();
        setOriginalUserProfileDetails((prev) => ({
          ...prev,
          [fieldName]: fieldValue,
        }));
        setFieldStates((prev) => ({
          ...prev,
          [fieldName]: {
            isChanged: false,
            isUpdating: false,
            lastSaved: new Date(),
            error: undefined,
          },
        }));
      }
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      setFieldStates((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          isUpdating: false,
          error: "Failed to update",
        },
      }));
    }
  };

  // Revert field to original value
  const revertField = (fieldName: string, isUserInfo: boolean = true) => {
    if (isUserInfo) {
      setUserInfo((prev) => ({
        ...prev,
        [fieldName]: originalUserInfo[fieldName as keyof User],
      }));
    } else {
      setUserProfileDetails((prev) => ({
        ...prev,
        [fieldName]: originalUserProfileDetails[fieldName as keyof Profile],
      }));
    }
  };

  // Field update button component
  const FieldUpdateButton = ({
    fieldName,
    isUserInfo = true,
    className = "",
  }: {
    fieldName: string;
    isUserInfo?: boolean;
    className?: string;
  }) => {
    const state = fieldStates[fieldName];
    const hasError = validationErrors[fieldName];

    if (!state?.isChanged && !state?.lastSaved) return null;

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {state.isChanged && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => revertField(fieldName, isUserInfo)}
              text="Revert"
              disabled={state.isUpdating}
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() =>
                isUserInfo
                  ? updateUserInfoField(fieldName as keyof User)
                  : updateProfileField(fieldName as keyof Profile)
              }
              text="Update"
              loading={state.isUpdating}
              disabled={state.isUpdating || !!hasError}
              icon={<Save size={12} />}
            />
          </>
        )}
        {state.lastSaved && !state.isChanged && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle size={12} />
            Updated {state.lastSaved.toLocaleTimeString()}
          </span>
        )}
        {state.error && (
          <span className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={12} />
            {state.error}
          </span>
        )}
      </div>
    );
  };

  // Handle closing modal
  const handleCloseModal = () => {
    const hasAnyChanges = Object.values(fieldStates).some(
      (state) => state.isChanged
    );

    if (hasAnyChanges) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close without saving?"
      );
      if (!confirmClose) return;
    }

    setEditPanel(false);
    setValidationErrors({});
  };

  useEffect(() => {
    const newUserInfo = {
      email: userData.email || "",
      firstname: userData.firstname || "",
      lastname: userData.lastname || "",
      middlename: userData.middlename || "",
      username: userData.username || "",
      phone_number: userData.phone_number || "",
      is_active: userData.is_active || true,
    };

    const newUserProfileDetails = {
      github_username: userProfile.github_username || "",
      bio: userProfile.bio || "",
      profession: userProfile.profession || "",
      job_title: userProfile.job_title || "",
      years_of_experience: userProfile.years_of_experience || 0,
      website_url: userProfile.website_url || "",
      location: userProfile.location || "",
      open_to_work:
        userProfile.open_to_work !== undefined
          ? userProfile.open_to_work
          : true,
      availability: userProfile.availability || "",
    };

    setUserInfo(newUserInfo);
    setUserProfileDetails(newUserProfileDetails);
    setOriginalUserInfo(newUserInfo);
    setOriginalUserProfileDetails(newUserProfileDetails);
  }, [userData, userProfile]);

  return (
    <>
      <div className="mt-24 px-4">
        <div>
          <div className="space-y-2 relative">
            <h2 className="text-xl font-semibold mb-4"></h2>
            <div className="space-y-1">
              <h1 className="text-4xl font-light tracking-tight">
                {userInfo.firstname && <span>{userInfo.firstname}</span>}
                {userInfo.lastname && (
                  <span className="ml-2">{userInfo.lastname}</span>
                )}
                {!userInfo.firstname && !userInfo.lastname && (
                  <span className="opacity-50">Add your name</span>
                )}
              </h1>
              {userProfileDetails.profession && (
                <p className="text-lg opacity-60">
                  {userProfileDetails.profession}
                </p>
              )}
              {userInfo.username && (
                <p className="text-sm font-thin opacity-80">{`@${userInfo.username}`}</p>
              )}
              {userProfileDetails.bio && (
                <p className="text-base opacity-80 mt-2">
                  {userProfileDetails.bio}
                </p>
              )}
            </div>
            {userProfileDetails.website_url && (
              <Link
                href={userProfileDetails.website_url}
                className="text-base flex  w-fit hover:underline cursor-pointer transition duration-100 text-[var(--accent)] gap-2"
              >
                <p>
                  <Link2 />
                </p>
                <p>{userProfileDetails.website_url}</p>
              </Link>
            )}
            {userProfileDetails.location && (
              <p className="text-sm opacity-60">
                {userProfileDetails.location}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-start gap-3">
              <Button
                onClick={() => setEditPanel(true)}
                icon={<Pen size={16} />}
                text="Edit Profile"
                className="rounded-full"
                size="sm"
              />
              <Button
                onClick={() => copyToClipboard(getCurrentUrl("full"))}
                icon={<Share2 size={16} />}
                text="Share Profile"
                variant="outline"
                className="rounded-full"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <Modal
        size="xl"
        centered={true}
        isOpen={editPanel}
        closeOnBackdropClick={false}
        onClose={handleCloseModal}
        title="Edit your information"
      >
        <div className="w-full relative mx-auto p-6">
          {/* Form Container */}
          <div className="space-y-12">
            {/* Personal Details Section */}
            <div className="space-y-8">
              <h3 className="text-xl font-semibold dark:text-white pb-3 border-b border-gray-200 dark:border-gray-700">
                Personal Details
              </h3>

              <div className="space-y-6">
                {/* First Name */}
                <div className="w-full">
                  <Textinput
                    value={userInfo.firstname}
                    onChange={(e) => {
                      setUserInfo((prev) => ({
                        ...prev,
                        firstname: e,
                      }));
                    }}
                    labelBgHex={theme.background}
                    labelBgHexIntensity={10}
                    label="First Name *"
                    desc={validationErrors.firstname}
                  />
                  <FieldUpdateButton
                    fieldName="firstname"
                    isUserInfo={true}
                    className="mt-2"
                  />
                </div>

                {/* Last Name */}
                <div className="w-full">
                  <Textinput
                    value={userInfo.lastname}
                    onChange={(e) => {
                      setUserInfo((prev) => ({
                        ...prev,
                        lastname: e,
                      }));
                    }}
                    labelBgHex={theme.background}
                    labelBgHexIntensity={10}
                    label="Last Name *"
                    desc={validationErrors.lastname}
                  />
                  <FieldUpdateButton
                    fieldName="lastname"
                    isUserInfo={true}
                    className="mt-2"
                  />
                </div>

                {/* Middle Name */}
                <div className="w-full">
                  <Textinput
                    value={userInfo.middlename}
                    onChange={(e) => {
                      setUserInfo((prev) => ({
                        ...prev,
                        middlename: e,
                      }));
                    }}
                    labelBgHex={theme.background}
                    labelBgHexIntensity={10}
                    label="Middle Name"
                  />
                  <FieldUpdateButton
                    fieldName="middlename"
                    isUserInfo={true}
                    className="mt-2"
                  />
                </div>

                {/* Username */}
                <div className="w-full">
                  <Textinput
                    value={userInfo.username}
                    onChange={(e) => {
                      setUserInfo((prev) => ({
                        ...prev,
                        username: e,
                      }));
                    }}
                    labelBgHex={theme.background}
                    labelBgHexIntensity={10}
                    label="Username *"
                    desc={validationErrors.username}
                    placeholder="Choose a unique username"
                  />
                  <FieldUpdateButton
                    fieldName="username"
                    isUserInfo={true}
                    className="mt-2"
                  />
                </div>

                {/* Location */}
                <div className="w-full">
                  <DataList
                    url={`${V1_BASE_URL}/location/search/places`}
                    onSetValue={(e) => {
                      setUserProfileDetails((prev) => ({
                        ...prev,
                        location: e,
                      }));
                    }}
                    dataPath=""
                    displayKeys={[
                      "Place.Municipality",
                      "Place.Region",
                      "Place.Country",
                    ]}
                    separator=", "
                    placeholder="Search for a location..."
                    minQueryLength={3}
                  />
                  <FieldUpdateButton
                    fieldName="location"
                    isUserInfo={false}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="space-y-8">
              <h3 className="text-xl font-semibold dark:text-white pb-3 border-b border-gray-200 dark:border-gray-700">
                Professional Details
              </h3>

              <div className="space-y-6">
                {/* Profession */}
                <div className="w-full relative">
                  <Textinput
                    value={userProfileDetails.profession}
                    onChange={(e) => {
                      setUserProfileDetails((prev) => ({
                        ...prev,
                        profession: e,
                      }));
                    }}
                    labelBgHex={theme.background}
                    labelBgHexIntensity={10}
                    label="Profession"
                    placeholder="e.g., Software Engineer, Designer, Product Manager"
                  />
                  <Link
                    href={`/${userData.username}/skills`}
                    className="text-xs underline font-light text-[var(--accent)] hover:underline cursor-pointer transition duration-100"
                  >
                    You can select your top expertise from the skill set you
                    uploaded
                  </Link>
                  <FieldUpdateButton
                    fieldName="profession"
                    isUserInfo={false}
                    className="mt-2"
                  />
                </div>

                {/* Job Title */}
                <div className="w-full">
                  <Textinput
                    value={userProfileDetails.job_title}
                    onChange={(e) => {
                      setUserProfileDetails((prev) => ({
                        ...prev,
                        job_title: e,
                      }));
                    }}
                    labelBgHex={theme.background}
                    labelBgHexIntensity={10}
                    label="Job Title"
                    placeholder="Your current or desired job title"
                  />
                  <FieldUpdateButton
                    fieldName="job_title"
                    isUserInfo={false}
                    className="mt-2"
                  />
                </div>

                {/* Years of Experience */}
                <div className="w-full">
                  <Textinput
                    type="number"
                    maxLength={2}
                    value={userProfileDetails.years_of_experience}
                    onChange={(e: string) => {
                      const MAX_EXPERIENCE = 50;
                      const numericValue = e === "" ? 0 : parseInt(e, 10) || 0;
                      const validatedValue = Math.max(
                        0,
                        Math.min(numericValue, MAX_EXPERIENCE)
                      );

                      setUserProfileDetails((prev) => ({
                        ...prev,
                        years_of_experience: Number(validatedValue),
                      }));
                    }}
                    labelBgHex={theme.background}
                    labelBgHexIntensity={10}
                    label="Years of experience"
                    desc={validationErrors.years_of_experience}
                    placeholder="0-50 years"
                  />
                  <FieldUpdateButton
                    fieldName="years_of_experience"
                    isUserInfo={false}
                    className="mt-2"
                  />
                </div>

                {/* Availability */}
                <div className="w-full">
                  <Textinput
                    options={availabilityOptions}
                    type="dropdown"
                    value={userProfileDetails.availability}
                    onChange={(e) => {
                      setUserProfileDetails((prev) => ({
                        ...prev,
                        availability: e,
                      }));
                    }}
                    labelBgHex={theme.background}
                    labelBgHexIntensity={10}
                    label="Availability"
                    placeholder="Select your availability"
                  />
                  <FieldUpdateButton
                    fieldName="availability"
                    isUserInfo={false}
                    className="mt-2"
                  />
                </div>

                {/* Website URL */}
                <div className="w-full">
                  <Textinput
                    value={userProfileDetails.website_url}
                    onChange={(e) => {
                      setUserProfileDetails((prev) => ({
                        ...prev,
                        website_url: e,
                      }));
                    }}
                    labelBgHex={theme.background}
                    labelBgHexIntensity={10}
                    label="Your website link"
                    desc={validationErrors.website_url}
                    placeholder="https://your-website.com"
                  />
                  <FieldUpdateButton
                    fieldName="website_url"
                    isUserInfo={false}
                    className="mt-2"
                  />
                </div>

                {/* Open to Work Checkbox */}
                <div className="w-full">
                  <span className="flex w-full items-center justify-start gap-x-3 py-2">
                    <CheckBox
                      isChecked={userProfileDetails.open_to_work}
                      setIsChecked={(e) => {
                        setUserProfileDetails((prev) => ({
                          ...prev,
                          open_to_work: e,
                        }));
                        // Auto-update on check/uncheck
                        setTimeout(() => updateProfileField("open_to_work"), 0);
                      }}
                      target={true}
                    />
                    <span className="text-sm">Open to work</span>
                    <span className="text-xs opacity-60 ml-2">
                      (This will be visible to recruiters)
                    </span>
                    {fieldStates.open_to_work?.isUpdating && (
                      <span className="text-xs text-blue-600 flex items-center gap-1 ml-2">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </span>
                    )}
                    {fieldStates.open_to_work?.lastSaved &&
                      !fieldStates.open_to_work?.isChanged && (
                        <span className="text-xs text-green-600 flex items-center gap-1 ml-2">
                          <CheckCircle size={12} />
                          Updated
                        </span>
                      )}
                  </span>
                </div>

                {/* Bio/Headline */}
                <div className="relative w-full">
                  <TextArea
                    value={userProfileDetails.bio}
                    onChange={(e) => {
                      setUserProfileDetails((prev) => ({
                        ...prev,
                        bio: e,
                      }));
                    }}
                    labelBgHex={theme.background}
                    labelBgHexIntensity={10}
                    label="Professional Headline"
                    desc="Write a brief summary about yourself and your professional goals..."
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs opacity-75 underline font-light text-[var(--accent)] hover:opacity-100 cursor-pointer transition duration-100">
                      Start a thought, and let AI complete it.
                    </span>
                  </div>
                  <FieldUpdateButton
                    fieldName="bio"
                    isUserInfo={false}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProfileDetails;
