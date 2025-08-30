// components/profile/ProfileInfo.tsx
import React from "react";
import Link from "next/link";
import {
  User,
  Profile,
} from "@/app/components/types and interfaces/UserAndProfile";
import BasicSkeleton from "@/app/components/containers/skeletons/BasicSkeleton";

interface ProfileInfoProps {
  userInfo: User;
  userProfileDetails: Profile;
  className?: string;
  isLoading?: boolean;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  userInfo,
  userProfileDetails,
  className = "space-y-1",
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className={className}>
        <BasicSkeleton className=" rounded-md h-9 w-64 mb-2" />
        <BasicSkeleton className=" rounded-md h-6 w-48 mb-2" />
        <BasicSkeleton className=" rounded-md h-5 w-32 mb-4" />
        <BasicSkeleton className=" rounded-md h-16 w-full mb-2" />
        <BasicSkeleton className=" rounded-md h-5 w-36" />
      </div>
    );
  }

  return (
    <div className={className}>
      <h1 className="text-4xl font-light tracking-tight">
        {userInfo.firstname && <span>{userInfo.firstname}</span>}
        {userInfo.lastname && <span className="ml-2">{userInfo.lastname}</span>}
        {!userInfo.firstname && !userInfo.lastname && (
          <BasicSkeleton className=" rounded-md h-9 w-64 inline-block" />
        )}
      </h1>

      {userProfileDetails.profession ? (
        <p className="text-lg opacity-60">{userProfileDetails.profession}</p>
      ) : (
        <BasicSkeleton className=" rounded-md h-6 w-48" />
      )}

      {userInfo.username ? (
        <p className="text-sm font-thin opacity-80">{`@${userInfo.username}`}</p>
      ) : (
        <BasicSkeleton className=" rounded-md h-5 w-32" />
      )}

      {userProfileDetails.bio ? (
        <p className="text-base opacity-80 mt-2">{userProfileDetails.bio}</p>
      ) : (
        <BasicSkeleton className=" rounded-md h-16 w-full mt-2" />
      )}

      {userProfileDetails.website_url ? (
        <Link
          href={userProfileDetails.website_url}
          className="text-base hover:underline cursor-pointer transition duration-100 text-[var(--accent)] gap-2"
        >
          <p>🔗 {userProfileDetails.website_url}</p>
        </Link>
      ) : (
        <span className="flex items-center">
        🔗 <BasicSkeleton className=" rounded-md h-5 w-36" />
        </span>
      )}

      {userProfileDetails.location ? (
        <p className="text-sm opacity-60">{userProfileDetails.location}</p>
      ) : (
        <BasicSkeleton className=" rounded-md h-5 w-36" />
      )}
    </div>
  );
};

export default ProfileInfo;
