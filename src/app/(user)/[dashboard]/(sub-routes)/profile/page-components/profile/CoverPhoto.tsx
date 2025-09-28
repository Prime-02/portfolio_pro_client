import Image from "next/image";
import React from "react";
import { Profile } from "@/app/components/types and interfaces/UserAndProfile";
import { ModalType } from "@/app/components/types and interfaces/userprofile";
import { useGlobalState } from "@/app/globalStateProvider";

interface CoverPhotoProps {
  userProfile: Profile;
  onEditClick: (type: ModalType) => void;
  className?: string;
}

const CoverPhoto: React.FC<CoverPhotoProps> = ({
  userProfile,
  onEditClick,
  className = "bg-gradient-to-br animated-gradient from-slate-900 via-[var(--accent)] to-slate-900 relative h-64 w-full",
}) => {
  const { currentUser } = useGlobalState();
  return (
    <div
      onClick={() => {
        if (currentUser) return;
        onEditClick({ type: "cover" });
      }}
      className={className}
    >
      <Image
        src={
          userProfile.profile_picture ||
          "https://res.cloudinary.com/df1gkpvzj/image/upload/v1758226616/profolio-05_ioihfh.png"
        }
        width={1000}
        height={1000}
        alt="Cover Photo"
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
};

export default CoverPhoto;
