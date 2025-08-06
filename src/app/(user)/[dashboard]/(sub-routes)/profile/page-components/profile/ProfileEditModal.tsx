// components/profile/ProfileEditModal.tsx
import React, { useCallback, useEffect, useState } from "react";
import Modal from "@/app/components/containers/modals/Modal";
import { Textinput, TextArea } from "@/app/components/inputs/Textinput";
import DataList from "@/app/components/inputs/DataList";
import CheckBox from "@/app/components/inputs/CheckBox";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { availabilityOptions } from "@/app/components/utilities/indices/DropDownItems";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import {
  User,
  Profile,
} from "@/app/components/types and interfaces/UserAndProfile";
import { FieldUpdateState } from "@/app/components/types and interfaces/userprofile";
import FieldUpdateButton from "./FieldUpdateButton";
import { getLoader } from "@/app/components/loaders/Loader";
import { useGlobalState } from "@/app/globalStateProvider";
import { validateUsername } from "@/app/components/utilities/syncFunctions/syncs";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: User;
  userProfileDetails: Profile;
  userData: User;
  fieldStates: FieldUpdateState;
  validationErrors: Record<string, string>;
  onUserInfoChange: (field: keyof User, value: string | boolean | number) => void;
  onUserProfileChange: (field: keyof Profile, value: string | boolean | number) => void;
  onFieldUpdate: (fieldName: string, isUserInfo: boolean) => void;
  onFieldRevert: (fieldName: string, isUserInfo: boolean) => void;
  onOpenToWorkUpdate: (value: boolean) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  userInfo,
  userProfileDetails,
  userData,
  fieldStates,
  validationErrors,
  onUserInfoChange,
  onUserProfileChange,
  onFieldUpdate,
  onFieldRevert,
  onOpenToWorkUpdate,
}) => {
  const { theme, loader, accentColor } = useTheme();
  const { checkUsernameAvailability, loading } = useGlobalState();
  const LoaderComponent = getLoader(loader) || null;
  const [usernameAvailable, setUsernameAvailable] = useState<string>("");

  const checkUsername = useCallback(
    async (username: string) => {
      if (!username || username.length < 3) {
        setUsernameAvailable("");
        return;
      }

      // First validate the username format
      const validationResult = validateUsername(username);
      if (!validationResult.valid) {
        setUsernameAvailable(
          validationResult.message || "Invalid username format"
        );
        return;
      }

      try {
        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable && userData.username) {
          setUsernameAvailable("This username is already taken");
        } else {
          setUsernameAvailable("");
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameAvailable("Error checking username availability");
      }
    },
    [userData.username]
  );
  // Debounce username checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userData.username && userData.username.length >= 3) {
        checkUsername(userData.username);
      } else {
        setUsernameAvailable("");
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [userData.username]);

  return (
    <Modal
      size="xl"
      centered={true}
      isOpen={isOpen}
      closeOnBackdropClick={false}
      onClose={onClose}
      title="Edit your information"
    >
      <div className="w-full relative mx-auto p-6">
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
                  onChange={(e) => onUserInfoChange("firstname", e)}
                  labelBgHex={theme.background}
                  labelBgHexIntensity={10}
                  label="First Name *"
                  desc={validationErrors.firstname}
                />
                <FieldUpdateButton
                  fieldName="firstname"
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={true}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
                />
              </div>

              {/* Last Name */}
              <div className="w-full">
                <Textinput
                  value={userInfo.lastname}
                  onChange={(e) => onUserInfoChange("lastname", e)}
                  labelBgHex={theme.background}
                  labelBgHexIntensity={10}
                  label="Last Name *"
                  desc={validationErrors.lastname}
                />
                <FieldUpdateButton
                  fieldName="lastname"
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={true}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
                />
              </div>

              {/* Middle Name */}
              <div className="w-full">
                <Textinput
                  value={userInfo.middlename}
                  onChange={(e) => onUserInfoChange("middlename", e)}
                  labelBgHex={theme.background}
                  labelBgHexIntensity={10}
                  label="Middle Name"
                />
                <FieldUpdateButton
                  fieldName="middlename"
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={true}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
                />
              </div>

              {/* Username */}
              <div className="w-full">
                <Textinput
                  value={userInfo.username}
                  loading={loading.includes("checking_username")}
                  onChange={(e) => onUserInfoChange("username", e)}
                  labelBgHex={theme.background}
                  labelBgHexIntensity={10}
                  label={
                    loading.includes("checking_username")
                      ? "Checking Username..."
                      : "Username *"
                  }
                  desc={validationErrors.username}
                  placeholder="Choose a unique username"
                  error={usernameAvailable}
                />
                <FieldUpdateButton
                  fieldName="username"
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={true}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
                />
              </div>

              {/* Location */}
              <div className="w-full">
                <DataList
                  url={`${V1_BASE_URL}/location/search/places`}
                  onSetValue={(e) => onUserProfileChange("location", e)}
                  dataPath="results"
                  displayKeys={[
                    "place.Municipality",
                    "place.Region",
                    "place.Country",
                  ]}
                  separator=", "
                  placeholder="Search for a location..."
                  minQueryLength={3}
                />
                <FieldUpdateButton
                  fieldName="location"
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={false}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
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
                  onChange={(e) => onUserProfileChange("profession", e)}
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
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={false}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
                />
              </div>

              {/* Job Title */}
              <div className="w-full">
                <Textinput
                  value={userProfileDetails.job_title}
                  onChange={(e) => onUserProfileChange("job_title", e)}
                  labelBgHex={theme.background}
                  labelBgHexIntensity={10}
                  label="Job Title"
                  placeholder="Your current or desired job title"
                />
                <FieldUpdateButton
                  fieldName="job_title"
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={false}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
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
                    onUserProfileChange(
                      "years_of_experience",
                      Number(validatedValue)
                    );
                  }}
                  labelBgHex={theme.background}
                  labelBgHexIntensity={10}
                  label="Years of experience"
                  desc={validationErrors.years_of_experience}
                  placeholder="0-50 years"
                />
                <FieldUpdateButton
                  fieldName="years_of_experience"
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={false}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
                />
              </div>

              {/* Availability */}
              <div className="w-full">
                <Textinput
                  options={availabilityOptions}
                  type="dropdown"
                  value={userProfileDetails.availability}
                  onChange={(e) => onUserProfileChange("availability", e)}
                  labelBgHex={theme.background}
                  labelBgHexIntensity={10}
                  label="Availability"
                  placeholder="Select your availability"
                />
                <FieldUpdateButton
                  fieldName="availability"
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={false}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
                />
              </div>

              {/* Website URL */}
              <div className="w-full">
                <Textinput
                  value={userProfileDetails.website_url}
                  onChange={(e) => onUserProfileChange("website_url", e)}
                  labelBgHex={theme.background}
                  labelBgHexIntensity={10}
                  label="Your website link"
                  desc={validationErrors.website_url}
                  placeholder="https://your-website.com"
                />
                <FieldUpdateButton
                  fieldName="website_url"
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={false}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
                />
              </div>

              {/* Open to Work Checkbox */}
              <div className="w-full">
                <span className="flex w-full items-center justify-start gap-x-3 py-2">
                  <CheckBox
                    isChecked={userProfileDetails.open_to_work}
                    setIsChecked={(e) => {
                      onUserProfileChange("open_to_work", e);
                      onOpenToWorkUpdate(e);
                    }}
                    target={true}
                  />
                  <span className="text-sm">Open to work</span>
                  <span className="text-xs opacity-60 ml-2">
                    (This will be visible to recruiters)
                  </span>
                  {fieldStates.open_to_work?.isUpdating && (
                    <span className="text-xs text-blue-600 flex items-center gap-1 ml-2">
                      {LoaderComponent ? (
                        <LoaderComponent color={accentColor.color} size={20} />
                      ) : null}
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
                  onChange={(e) => onUserProfileChange("bio", e)}
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
                  fieldStates={fieldStates}
                  validationErrors={validationErrors}
                  isUserInfo={false}
                  className="mt-2"
                  onUpdate={onFieldUpdate}
                  onRevert={onFieldRevert}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileEditModal;
