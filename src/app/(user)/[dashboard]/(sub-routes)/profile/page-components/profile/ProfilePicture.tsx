// components/profile/ProfilePicture.tsx
import Image from "next/image";
import React from "react";
import ProfileImageSkeleton from "@/app/components/containers/skeletons/ProfileImageSkeleton";
import { User } from "@/app/components/types and interfaces/UserAndProfile";
import { ModalType } from "@/app/components/types and interfaces/userprofile";
import { useGlobalState } from "@/app/globalStateProvider";

interface ProfilePictureProps {
  userData: User;
  onEditClick: (type: ModalType) => void;
  className?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  userData,
  onEditClick,
  className = "absolute bottom-0 left-8 w-32 h-32 overflow-clip rounded-full border border-white z-10 cursor-pointer translate-y-1/2",
}) => {
  const { currentUser } = useGlobalState();
  return (
    <span
      onClick={() => {
        if (currentUser) return;
        onEditClick({ type: "profile" });
      }}
      className={className}
    >
      {userData.profile_picture ? (
        <Image
          src={userData.profile_picture}
          width={1000}
          height={1000}
          alt="Profile Picture"
          className="w-full h-full  object-cover object-center"
        />
      ) : (
        <ProfileImageSkeleton
          size="full"
          rounded="none"
          className="w-full h-full"
          showIcon={true}
        />
      )}
    </span>
  );
};

export default ProfilePicture;
