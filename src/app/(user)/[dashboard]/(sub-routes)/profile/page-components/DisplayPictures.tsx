import Modal from "@/app/components/containers/modals/Modal";
import ProfileImageSkeleton from "@/app/components/containers/skeletons/ProfileImageSkeleton";
import { Profile } from "@/app/components/types and interfaces/UserAndProfile";
import {
  GetAllData,
  PostAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState, UserData } from "@/app/globalStateProvider";
import {
  Camera,
  CameraIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { ImageAction } from "@/app/components/types and interfaces/loaderTypes";
import PhotoCapture from "@/app/components/inputs/PhotoCapture";
import ImageCropper from "@/app/components/inputs/ImageUploader";
import Button from "@/app/components/buttons/Buttons";
import { base64ToFile } from "@/app/components/utilities/syncFunctions/syncs";
import { toast } from "@/app/components/toastify/Toastify";
import ProfileDetails from "./ProfileDetails";

export type ModalType = {
  type: "profile" | "cover" | null;
};

const UserDisplayPictures = () => {
  const {
    userData,
    accessToken,
    loading,
    setLoading,
    fetchUserData,
    setUserData,
  } = useGlobalState();
  const [profileImages, setProfileImages] = useState<ModalType>({
    type: null,
  });
  const [activeTab, setActiveTab] = useState<string>("");
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

  const imageActions: ImageAction[] = [
    {
      name: "Take Photo",
      action: (e?: ModalType) => setProfileImages(e!),
      icon: Camera,
      tab: "take-photo",
    },
    {
      name: "Upload Photo",
      action: (e?: ModalType) => setProfileImages(e!),
      icon: Upload,
      tab: "upload-photo",
    },
    {
      name: "Delete Image",
      tab: "delete-photo",
      icon: Trash2,
    },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const goBack = () => {
    setActiveTab("");
  };

  const fetchUserProfile = async () => {
    setLoading("fetching_user_profile");
    try {
      const profileRes: Profile = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/settings/profile`,
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
    const { croppedImage, file } = data;
    if (!croppedImage) {
      toast.warning("No image was provided");
      return;
    }
    const convertedImg = await base64ToFile(
      String(croppedImage),
      `${userData.username}-${profileImages.type}-photo`
    );

    console.log("Processed Data: ", convertedImg);

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
    } catch (error) {
    } finally {
      setLoading(`deleting_${profileImages.type}_image`);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchUserData();
    fetchUserProfile();
  }, [accessToken]);

  return (
    <>
      <div className="bg-gradient-to-br animated-gradient from-slate-900 via-[var(--accent)] to-slate-900 relative h-64 w-full rounded-t-3xl">
        {/* Cover photo */}
        {userProfile.profile_picture && (
          <Image
            src={userProfile.profile_picture}
            width={1000}
            height={1000}
            alt="Cover Photo"
            className="w-full h-full object-cover object-center rounded-t-3xl"
          />
        )}
        {/* Cover photo camera icon */}
        <span
          onClick={() => {
            setProfileImages({ type: "cover" });
          }}
          className="absolute top-4 cursor-pointer right-4 p-2 bg-black/50 rounded-full backdrop-blur-sm"
        >
          <CameraIcon className="w-5 h-5 text-white" />
        </span>

        {/* Profile picture container */}
        <span className="absolute bottom-0 left-8 w-32 h-32 rounded-full border border-white z-10 bg-gradient-to-br animated-gradient from-slate-900 via-[var(--accent)] to-slate-900 transform translate-y-1/2">
          {userData.profile_picture ? (
            <Image
              src={userData.profile_picture}
              width={1000}
              height={1000}
              alt="Profile Picture"
              className="w-full h-full rounded-full object-cover object-center"
            />
          ) : (
            <ProfileImageSkeleton
              size="full"
              rounded="full"
              className="w-full h-full"
              showIcon={true}
            />
          )}

          {/* Profile picture camera icon */}
          <span
            onClick={() => {
              setProfileImages({ type: "profile" });
            }}
            className="absolute -bottom-1 cursor-pointer right-2 p-2 bg-black/50 rounded-full backdrop-blur-sm"
          >
            <CameraIcon className="w-4 h-4 text-white" />
          </span>
        </span>
      </div>
      <div>
        <ProfileDetails
          userProfile={userProfile}
          fetchUserProfile={fetchUserProfile}
        />
      </div>
      <Modal
        closeOnBackdropClick={false}
        isOpen={
          profileImages.type === "profile" || profileImages.type === "cover"
        }
        title={`Update ${profileImages.type} image`}
        onClose={() => {
          setProfileImages({ type: null });
          setActiveTab("");
        }}
      >
        <div className="relative h-full">
          {/* Main actions view */}
          <div
            className={`transition-all duration-300 ${activeTab ? "-translate-x-full opacity-0 absolute" : "translate-x-0 opacity-100"}`}
          >
            <div className="flex flex-col space-y-4">
              {imageActions.map(({ name, icon: Icon, tab }) => (
                <span
                  onClick={() => handleTabChange(tab)}
                  key={name}
                  className="flex flex-row items-center hover:bg-[var(--background)] rounded-lg justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-x-4 justify-start">
                    <span className="w-12 h-12 flex items-center justify-center transition duration-100 cursor-pointer rounded-full bg-[var(--background)]">
                      <Icon />
                    </span>
                    <h3 className="font-semibold">{name}</h3>
                  </span>
                  <ChevronRight />
                </span>
              ))}
            </div>
          </div>

          {/* Tab content view */}
          <div
            className={`transition-all duration-300 ${activeTab ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute"}`}
          >
            {activeTab && (
              <div className="relative">
                {activeTab !== "delete-photo" && (
                  <span
                    onClick={goBack}
                    className="w-8 h-8 z-20 absolute top-1 left-2 flex items-center justify-center transition duration-100 cursor-pointer rounded-full bg-[var(--background)]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </span>
                )}

                <div className="mt-8">
                  {activeTab === "upload-photo" && (
                    <ImageCropper
                      onFinish={handleImageFinish}
                      loading={loading.includes("uploading_image")}
                    />
                  )}
                  {activeTab === "take-photo" && (
                    <PhotoCapture
                      onPhotoTaken={handleProfilePictureCapture}
                      loading={loading.includes("updating_profile_from_cam")}
                    />
                  )}
                  {activeTab === "delete-photo" && (
                    <div className="">
                      <h1 className="text-xl font-semibold">Delete Image</h1>
                      <h3 className="text-sm mb-4">
                        Are you sure you want to delete this image?
                      </h3>
                      <div className="flex gap-4">
                        <Button
                          onClick={() => deleteProfileImage()}
                          variant="danger"
                          text="Delete"
                          loading={loading.includes(
                            `deleting_${profileImages.type}_image`
                          )}
                          disabled={loading.includes(
                            `deleting_${profileImages.type}_image`
                          )}
                        />
                        <Button
                          onClick={goBack}
                          variant="outline"
                          text="Cancel"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserDisplayPictures;
