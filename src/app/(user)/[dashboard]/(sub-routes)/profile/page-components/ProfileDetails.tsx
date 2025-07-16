import DataList from "@/app/components/inputs/DataList";
import Modal from "@/app/components/containers/modals/Modal";
import { TextArea, Textinput } from "@/app/components/inputs/Textinput";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  Profile,
  User,
} from "@/app/components/types and interfaces/UserAndProfile";
import { useGlobalState } from "@/app/globalStateProvider";
import { Pen } from "lucide-react";
import React, { useState } from "react";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import Button from "@/app/components/buttons/Buttons";

type UserProfilePanel = {
  userProfile: Profile;
  fetchUserProfile: () => void;
};

const ProfileDetails = ({
  userProfile,
  fetchUserProfile,
}: UserProfilePanel) => {
  const { fetchUserData, userData } = useGlobalState();
  const [editPanel, setEditPanel] = useState(false);
  const { theme } = useTheme();
  const [userInfo, setUserInfo] = useState<User>({
    email: "",
    firstname: "",
    lastname: "",
    middlename: "",
    username: "",
    phone_number: "",
    is_active: true,
    role: "",
    created_at: "",
    updated_at: "",
    profile_picture: "",
    profile_picture_id: "",
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
  return (
    <>
      <div className="mt-24 px-4">
        <div>
          <div className="space-y-4 relative">
            <h2 className="text-xl font-semibold mb-4"></h2>
            <div className="space-y-1">
              <h1 className="text-4xl font-light tracking-tight">
                {userData.firstname && <span>{userData.firstname}</span>}
                {userData.lastname && (
                  <span className="ml-2">{userData.lastname}</span>
                )}
              </h1>
              {userData.username && (
                <p className="text-lg font-thin opacity-60">{`@${userData.username}`}</p>
              )}
            </div>
            <span
              onClick={() => {
                setEditPanel(!editPanel);
              }}
              className="absolute cursor-pointer w-10 flex items-center justify-center h-10 shadow-2xl rounded-full bg-[var(--background)] top-0 right-0 z-10"
            >
              <Pen />
            </span>
          </div>
        </div>
      </div>
      <Modal
        size="xl"
        centered={true}
        isOpen={editPanel}
        closeOnBackdropClick={false}
        onClose={() => {
          setEditPanel(!editPanel);
        }}
        title="Edit your information"
      >
        <div className="max-w-2xl relative mx-auto p-6">
          {/* Form Container */}
          <div className="space-y-8">
            {/* Personal Details Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold  dark:text-white pb-3 border-b border-gray-200 dark:border-gray-700">
                Personal Details
              </h3>

              <div className="space-y-6">
                {/* Name Fields Row */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-2">
                  <div className="flex-1 min-w-0">
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
                      label="First Name"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
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
                      label="Last Name"
                    />
                  </div>
                </div>

                {/* Middle Name and Profession Row */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-2">
                  <div className="flex-1 min-w-0">
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
                  </div>

                  <div className="flex-[1.5] min-w-0">
                    <Textinput
                      value={userProfile.profession}
                      onChange={(e) => {
                        setUserProfileDetails((prev) => ({
                          ...prev,
                          profession: e,
                        }));
                      }}
                      labelBgHex={theme.background}
                      labelBgHexIntensity={10}
                      label="Choose a unique username"
                    />
                  </div>
                </div>

                {/* Location Row - Full Width */}
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
                </div>
              </div>
            </div>
            {/* Account Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium  pb-2 border-b border-gray-100">
                Professional Details
              </h3>
              <Textinput
                value={userProfile.profession}
                onChange={(e) => {
                  setUserProfileDetails((prev) => ({
                    ...prev,
                    profession: e,
                  }));
                }}
                labelBgHex={theme.background}
                labelBgHexIntensity={10}
                label="Curent Position"
              />
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
                  label="Headline"
                />
                <span className="text-xs opacity-75 underline font-light text-[var(--accent)] absolute bottom-2 hover:opacity-100 cursor-pointer transition duration-100 left-2">
                  {"Start a thought, and let AI complete it."}
                </span>
              </div>
              <span className="w-full flex items-center justify-end">
                <Button text="Save" />
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProfileDetails;
