// ProfileTemplate.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useGlobalState } from "@/app/globalStateProvider";
import {
  Profile,
  User,
} from "@/app/components/types and interfaces/UserAndProfile";
import {
  GetAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import {
  base64ToFile,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";
import { toast } from "@/app/components/toastify/Toastify";
import {
  ModalType,
  FieldUpdateState,
} from "@/app/components/types and interfaces/userprofile";

// Import all components
import CoverPhoto from "./profile/CoverPhoto";
import ProfilePicture from "./profile/ProfilePicture";
import ProfileInfo from "./profile/ProfileInfo";
import ProfileActions from "./profile/ProfileActions";
import ImageActionsModal from "./profile/ImageActionsModal";
import ProfileEditModal from "./profile/ProfileEditModal";
import Modal from "@/app/components/containers/modals/Modal";
import { MdDashboard } from "react-icons/md";
import CheckBox from "@/app/components/inputs/CheckBox";
import Switch from "@/app/components/inputs/Switch";
import Dropdown from "@/app/components/inputs/DynamicDropdown";
import Button from "@/app/components/buttons/Buttons";
import {
  ProfileSettings,
  useTheme,
} from "@/app/components/theme/ThemeContext ";

interface ProfileTemplateProps {
  showSettings?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ProfileTemplate: React.FC<ProfileTemplateProps> = ({
  showSettings = false,
  className = "",
  children,
}) => {
  const {
    userData,
    accessToken,
    loading,
    setLoading,
    fetchUserData,
    currentUser,
  } = useGlobalState();
  const {
    settings,
    setSettings,
    defaultSettings,
    layoutLoaded,
    setLayoutLoaded,
  } = useTheme();
  const [tempSettings, setTempSettings] =
    useState<ProfileSettings>(defaultSettings);

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Existing state management
  const [profileImages, setProfileImages] = useState<ModalType>({ type: null });
  const [activeTab, setActiveTab] = useState<string>("");
  const [editPanel, setEditPanel] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [userProfile, setUserProfile] = useState<Profile>({
    user_id: "",
    github_username: "",
    bio: "",
    profession: "",
    job_title: "",
    years_of_experience: 0,
    website_url: "",
    location: "",
    open_to_work: true,
    availability: "",
    profile_picture: null,
    profile_picture_id: "",
  });

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

  // Settings handlers
  const handleSettingsChange = (
    key: keyof ProfileSettings,
    value: string | boolean
  ) => {
    setTempSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const resetToDefaults = () => {
    setTempSettings(defaultSettings);
  };

  const handleSaveSettings = async () => {
    try {
      setSettings(tempSettings);
      setShowSettingsModal(false);
      console.log("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save profile settings", {
        title: "Error",
      });
    }
  };

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  // Validation function
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

      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    },
    []
  );

  // API Functions (keeping existing ones)
  const fetchUserProfile = async () => {
    setLoading("fetching_user_profile");
    const url = currentUser
      ? `${V1_BASE_URL}/settings/profile/${currentUser}`
      : `${V1_BASE_URL}/settings/profile`;

    try {
      const profileRes: Profile = await GetAllData({
        access: accessToken,
        url: url,
        type: "User Profile",
      });
      if (profileRes) {
        setUserProfile(profileRes);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("fetching_user_profile");
    }
  };

  const loadInitialData = async () => {
    if (!accessToken || !layoutLoaded) return;
    try {
      await Promise.all([fetchUserData(), fetchUserProfile()]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setLayoutLoaded(false); // Only set false on error
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [accessToken, layoutLoaded]);

  const handleCancelSettings = () => {
    setTempSettings(settings);
    setShowSettingsModal(false);
  };

  const handleProfilePictureCapture = async (newPicture: string | null) => {
    setLoading("updating_profile_from_cam");
    if (!newPicture) {
      toast.warning("No image found");
      return;
    }
    try {
      const newPictureTaken = await base64ToFile(
        String(newPicture),
        `${userData.username}-${profileImages.type}-photo`
      );

      if (profileImages.type === "profile") {
        const updateRes = await UpdateAllData({
          access: accessToken,
          field: {
            profile_picture: newPictureTaken,
            user_data: JSON.stringify({}),
          },
          url: `${V1_BASE_URL}/settings/info`,
          useFormData: true,
        });
        if (updateRes) {
          setProfileImages({ type: null });
          setActiveTab("");
          fetchUserData();
        }
      } else if (profileImages.type === "cover") {
        const updateRes = await UpdateAllData({
          access: accessToken,
          field: {
            profile_picture: newPictureTaken,
            profile_data: JSON.stringify({}),
          },
          url: `${V1_BASE_URL}/settings/profile`,
          useFormData: true,
        });
        if (updateRes) {
          setProfileImages({ type: null });
          setActiveTab("");
          fetchUserProfile();
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("updating_profile_from_cam");
    }
  };

  const handleImageFinish = async (data: {
    file: File | null;
    croppedImage: string | null;
  }) => {
    setLoading("uploading_image");
    const { croppedImage } = data;
    if (!croppedImage) {
      toast.warning("No image was provided");
      return;
    }
    const convertedImg = await base64ToFile(
      String(croppedImage),
      `${userData.username}-${profileImages.type}-photo`
    );

    try {
      if (profileImages.type === "profile") {
        const updateRes = await UpdateAllData({
          url: `${V1_BASE_URL}/settings/info`,
          access: accessToken,
          field: {
            profile_picture: convertedImg,
            user_data: JSON.stringify({}),
          },
          useFormData: true,
        });
        if (updateRes) {
          setProfileImages({ type: null });
          setActiveTab("");
          fetchUserData();
        }
      } else if (profileImages.type === "cover") {
        const updateRes = await UpdateAllData({
          url: `${V1_BASE_URL}/settings/profile`,
          access: accessToken,
          field: {
            profile_picture: convertedImg,
            profile_data: JSON.stringify({}),
          },
          useFormData: true,
        });
        if (updateRes) {
          setProfileImages({ type: null });
          setActiveTab("");
          fetchUserProfile();
        }
      }
    } catch (error) {
      console.log("Failed to update image, see logs: ", error);
    } finally {
      setLoading("uploading_image");
    }
  };

  const deleteProfileImage = async () => {
    setLoading(`deleting_${profileImages.type}_image`);
    try {
      const deleteRes = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/settings/${profileImages.type === "profile" ? "info" : "profile"}`,
        field: {
          [profileImages.type === "cover" ? "profile_data" : "user_data"]:
            JSON.stringify({
              profile_picture: "delete",
            }),
        },
        useFormData: true,
      });
      if (deleteRes) {
        setProfileImages({ type: null });
        setActiveTab("");
        if (profileImages.type === "cover") {
          fetchUserProfile();
        } else {
          fetchUserData();
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(`deleting_${profileImages.type}_image`);
    }
  };

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

  // Handle field updates
  const handleFieldUpdate = (fieldName: string, isUserInfo: boolean) => {
    if (isUserInfo) {
      updateUserInfoField(fieldName as keyof User);
    } else {
      updateProfileField(fieldName as keyof Profile);
    }
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

  // Handle tab changes for image modal
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const goBack = () => {
    setActiveTab("");
  };

  // Handle user info changes
  const handleUserInfoChange = (
    field: keyof User,
    value: string | boolean | number
  ) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Handle profile changes
  const handleUserProfileChange = (
    field: keyof Profile,
    value: string | boolean | number
  ) => {
    setUserProfileDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Handle open to work update with auto-save
  const handleOpenToWorkUpdate = () => {
    setTimeout(() => updateProfileField("open_to_work"), 0);
  };

  // Effects
  useEffect(() => {
    Object.keys(userInfo).forEach((key) => {
      updateFieldState(
        key,
        userInfo[key as keyof User],
        originalUserInfo[key as keyof User]
      );
    });
  }, [userInfo, originalUserInfo, updateFieldState]);

  useEffect(() => {
    Object.keys(userProfileDetails).forEach((key) => {
      updateFieldState(
        key,
        userProfileDetails[key as keyof Profile],
        originalUserProfileDetails[key as keyof Profile]
      );
    });
  }, [userProfileDetails, originalUserProfileDetails, updateFieldState]);

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

  // Dynamic styling functions based on settings
  const getLayoutClasses = () => {
    const spacingClasses = {
      compact: "space-y-2",
      normal: "space-y-6",
      relaxed: "space-y-8",
    };

    const borderRadiusClasses = {
      none: "rounded-none",
      small: "rounded-sm",
      medium: "rounded-lg",
      large: "rounded-xl",
      full: "rounded-3xl",
    };

    const baseClasses = spacingClasses[settings.spacing];

    switch (settings.layout) {
      case "compact":
        return `${baseClasses} max-w-md mx-auto`;
      case "card":
        return `bg-white dark:bg-gray-800 shadow-lg p-6 ${baseClasses} ${borderRadiusClasses[settings.borderRadius]}`;
      case "minimal":
        return `${baseClasses} border-l-4 border-blue-500 pl-4`;
      case "showcase":
        return `bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 ${baseClasses} ${borderRadiusClasses[settings.borderRadius]}`;
      default:
        return baseClasses;
    }
  };

  const getCoverPhotoClasses = () => {
    const borderRadiusClasses = {
      none: "rounded-none",
      small: "rounded-sm",
      medium: "rounded-lg",
      large: "rounded-xl",
      full: "rounded-3xl",
    };

    return `bg-gradient-to-br overflow-hidden animated-gradient from-slate-900 via-[var(--accent)] to-slate-900 relative ${settings.coverHeight} w-full ${borderRadiusClasses[settings.borderRadius]}`;
  };

  const getProfilePictureClasses = () => {
    const borderRadiusClasses = {
      none: "rounded-none",
      small: "rounded-sm",
      medium: "rounded-lg",
      large: "rounded-xl",
      full: "rounded-full",
    };

    const positionClasses = {
      left: "left-8",
      center: "left-1/2 transform -translate-x-1/2",
      right: "right-8",
    };

    return `absolute bottom-0 ${positionClasses[settings.profilePicturePosition]} ${settings.profilePictureSize} ${borderRadiusClasses[settings.borderRadius]} border overflow-hidden border-white z-10 bg-gradient-to-br animated-gradient from-slate-900 via-[var(--accent)] cursor-pointer to-slate-900 transform translate-y-1/2`;
  };

  const getProfileInfoClasses = () => {
    const alignmentClasses = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };

    const spacingClasses = {
      compact: "mt-12 px-4 space-y-1",
      normal: "mt-20 px-4 space-y-3",
      relaxed: "mt-24 px-4 space-y-4",
    };

    const styleClasses = {
      default: "",
      card: "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm",
      minimal: "border-b border-gray-200 dark:border-gray-700 pb-4",
    };

    return `${spacingClasses[settings.spacing]} ${alignmentClasses[settings.infoAlignment]} ${styleClasses[settings.profileInfoStyle]}`;
  };

  const getActionButtonClasses = () => {
    // Base button classes
    let baseClasses = "";

    // Add alignment classes based on profile info alignment setting
    const alignmentClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    };

    // Style-specific classes
    const styleClasses = {
      default: " text-white  rounded px-4 py-2",
      outline: "border-2 border-blue-500 text-blue-500 px-4 py-2",
      minimal: "text-blue-500 :text-blue-600 :underline px-2 py-1",
      rounded: " text-white   px-6 py-2",
    };

    // Combine classes
    baseClasses += `flex gap-3 ${alignmentClasses[settings.infoAlignment]} `;
    baseClasses += styleClasses[settings.actionButtonStyle];

    // Add margin/spacing if needed
    if (settings.actionButtonStyle !== "minimal") {
      baseClasses += " mt-4"; // Add top margin for non-minimal styles
    }

    return baseClasses;
  };

  // Settings Modal Component
  const SettingsModal = () => {
    if (!showSettingsModal) return null;

    return (
      <div className="w-full">
        <div className="p-6 space-y-8">
          {/* Layout Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Layout & Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Dropdown
                  label="Layout Type"
                  value={tempSettings.layout}
                  onSelect={(e: string) => handleSettingsChange("layout", e)}
                  options={[
                    { id: "default", code: "Default" },
                    { id: "card", code: "Card Style" },
                    { id: "minimal", code: "Minimal" },
                    { id: "showcase", code: "Showcase" },
                  ]}
                />
              </div>

              <div>
                <Dropdown
                  label="Spacing"
                  value={tempSettings.spacing}
                  onSelect={(e: string) => handleSettingsChange("spacing", e)}
                  options={[
                    { id: "compact", code: "Compact" },
                    { id: "normal", code: "Normal" },
                    { id: "relaxed", code: "Relaxed" },
                  ]}
                />
              </div>

              <div>
                <Dropdown
                  label="Border Radius"
                  value={tempSettings.borderRadius}
                  onSelect={(e: string) =>
                    handleSettingsChange("borderRadius", e)
                  }
                  options={[
                    { id: "none", code: "None" },
                    { id: "small", code: "Small" },
                    { id: "medium", code: "Medium" },
                    { id: "large", code: "Large" },
                    { id: "full", code: "Full" },
                  ]}
                />
              </div>

              <div>
                <Dropdown
                  label="Content Alignment"
                  value={tempSettings.infoAlignment}
                  onSelect={(e: string) =>
                    handleSettingsChange("infoAlignment", e)
                  }
                  options={[
                    { id: "left", code: "Left" },
                    { id: "center", code: "Center" },
                    { id: "right", code: "Right" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Cover Photo Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 ">Cover Photo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-x-2 items-center">
                <CheckBox
                  id="showCover"
                  isChecked={tempSettings.showCover}
                  setIsChecked={(e) => handleSettingsChange("showCover", e)}
                />
                <p className="text-xs font-medium ">Show Cover Photo</p>
              </div>
              {tempSettings.showCover && (
                <div>
                  <Dropdown
                    label="Cover Height"
                    value={tempSettings.coverHeight}
                    onSelect={(e: string) =>
                      handleSettingsChange("coverHeight", e)
                    }
                    disabled={!tempSettings.showCover}
                    options={[
                      { id: "h-48", code: "Small (192px)" },
                      { id: "h-56", code: "Medium (224px)" },
                      { id: "h-64", code: "Default (256px)" },
                      { id: "h-72", code: "Large (288px)" },
                      { id: "h-80", code: "Extra Large (320px)" },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Profile Picture Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 ">Profile Picture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Dropdown
                  label="Profile Picture Size"
                  value={tempSettings.profilePictureSize}
                  onSelect={(e: string) =>
                    handleSettingsChange("profilePictureSize", e)
                  }
                  options={[
                    { id: "w-24 h-24", code: "Small (96px)" },
                    { id: "w-28 h-28", code: "Medium Small (112px)" },
                    { id: "w-32 h-32", code: "Default (128px)" },
                    { id: "w-36 h-36", code: "Large (144px)" },
                    { id: "w-40 h-40", code: "Extra Large (160px)" },
                  ]}
                />
              </div>

              <div>
                <Dropdown
                  label="Picture Position"
                  value={tempSettings.profilePicturePosition}
                  onSelect={(e: string) =>
                    handleSettingsChange("profilePicturePosition", e)
                  }
                  options={[
                    { id: "left", code: "Left" },
                    { id: "center", code: "Center" },
                    { id: "right", code: "Right" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Content Display Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 ">Content Display</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex gap-x-3 items-center">
                <Switch
                  // id="showBio"
                  isSwitched={tempSettings.showBio}
                  onSwitch={(e) => handleSettingsChange("showBio", e)}
                />
                <p className="text-xs font-medium ">Show Bio</p>
              </div>

              <div className="flex items-center">
                <Switch
                  isSwitched={tempSettings.showProfession}
                  onSwitch={(e) => handleSettingsChange("showProfession", e)}
                />
                <label className=" ml-3 text-xs font-medium ">
                  Show Profession
                </label>
              </div>

              <div className="flex items-center">
                <Switch
                  isSwitched={tempSettings.showLocation}
                  onSwitch={(e) => handleSettingsChange("showLocation", e)}
                />
                <label
                  htmlFor="showLocation"
                  className="text-xs ml-3 font-medium "
                >
                  Show Location
                </label>
              </div>

              <div className="flex items-center">
                <Switch
                  isSwitched={tempSettings.showWebsite}
                  onSwitch={(e) => handleSettingsChange("showWebsite", e)}
                />
                <label
                  htmlFor="showWebsite"
                  className="text-xs ml-3 font-medium "
                >
                  Show Website
                </label>
              </div>

              <div className="flex items-center">
                <Switch
                  isSwitched={tempSettings.showExperience}
                  onSwitch={(e) => handleSettingsChange("showExperience", e)}
                />
                <label className=" ml-3 text-xs font-medium ">
                  Show Experience
                </label>
              </div>

              <div className="flex items-center">
                <Switch
                  isSwitched={tempSettings.showAvailability}
                  onSwitch={(e) => handleSettingsChange("showAvailability", e)}
                />
                <label className=" ml-3 text-xs font-medium ">
                  Show Availability
                </label>
              </div>
            </div>
          </div>

          {/* Profile Info Style Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 ">Profile Info Style</h3>
            <div>
              <label className="block text-sm font-medium  mb-2">
                Info Display Style
              </label>
              <Dropdown
                value={tempSettings.profileInfoStyle}
                onSelect={(e: string) =>
                  handleSettingsChange("profileInfoStyle", e)
                }
                options={[
                  { id: "default", code: "Default" },
                  { id: "card", code: "Card Style" },
                  { id: "minimal", code: "Minimal" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <Button
            text="Reset to Defaults"
            variant="outline"
            onClick={resetToDefaults}
          />

          <div className="flex space-x-3">
            <Button
              text="Cancel"
              onClick={handleCancelSettings}
              variant="ghost"
            />
            <Button
              text="Save Setting"
              loading={loading.includes("updating_layout")}
              onClick={handleSaveSettings}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${getLayoutClasses()} ${className} relative`}>
      {" "}
      {/* Settings Button */}
      { !currentUser && (
        <span
          onClick={() => setShowSettingsModal(true)}
          className="absolute z-50 top-0 cursor-pointer left-0 p-2 bg-black/50 rounded-full backdrop-blur-sm"
          title="Customize Profile"
        >
          <MdDashboard size={16} />
        </span>
      )}
      {/* Cover Photo Section */}
      {settings.showCover && (
        <div className="relative">
          <CoverPhoto
            userProfile={userProfile}
            onEditClick={setProfileImages}
            className={getCoverPhotoClasses()}
          />
          <ProfilePicture
            userData={userData}
            onEditClick={setProfileImages}
            className={getProfilePictureClasses()}
          />
        </div>
      )}
      {/* Profile Info Section */}
      <div className={getProfileInfoClasses()}>
        <ProfileInfo
          userInfo={userInfo}
          userProfileDetails={userProfileDetails}
          // settings={settings}
        />

        {/* Profile Actions */}
        {settings.showActions && (
          <ProfileActions
            onEditClick={() => setEditPanel(true)}
            className={getActionButtonClasses()}
          />
        )}

        {/* Custom children content */}
        {children}
      </div>
      {/* Settings Modal */}
      <Modal
        size="lg"
        closeOnBackdropClick
        isOpen={showSettingsModal}
        onClose={() => {
          handleCancelSettings();
        }}
        title={"Profile Customization"}
      >
        <SettingsModal />
      </Modal>
      {/* Image Actions Modal */}
      <ImageActionsModal
        profileImages={profileImages}
        activeTab={activeTab}
        loading={loading}
        onClose={() => {
          setProfileImages({ type: null });
          setActiveTab("");
        }}
        onTabChange={handleTabChange}
        onGoBack={goBack}
        onPhotoCapture={handleProfilePictureCapture}
        onImageFinish={handleImageFinish}
        onDeleteImage={deleteProfileImage}
      />
      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={editPanel}
        onClose={handleCloseModal}
        userInfo={userInfo}
        userProfileDetails={userProfileDetails}
        userData={userData}
        fieldStates={fieldStates}
        validationErrors={validationErrors}
        onUserInfoChange={handleUserInfoChange}
        onUserProfileChange={handleUserProfileChange}
        onFieldUpdate={handleFieldUpdate}
        onFieldRevert={revertField}
        onOpenToWorkUpdate={handleOpenToWorkUpdate}
      />
    </div>
  );
};

export default ProfileTemplate;
