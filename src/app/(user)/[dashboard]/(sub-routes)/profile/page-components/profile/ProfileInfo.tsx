// components/profile/ProfileInfo.tsx
import React from "react";
import Link from "next/link";
import { User, Profile } from "@/app/components/types and interfaces/UserAndProfile";

interface ProfileInfoProps {
  userInfo: User;
  userProfileDetails: Profile;
  className?: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ 
  userInfo, 
  userProfileDetails,
  className = "space-y-1"
}) => {
  return (
    <div className={className}>
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
      {userProfileDetails.website_url && (
        <Link
          href={userProfileDetails.website_url}
          className="text-base hover:underline cursor-pointer transition duration-100 text-[var(--accent)] gap-2"
        >
          {/* <p>
            <Link2 />
          </p> */}
          <p>🔗 {userProfileDetails.website_url}</p>
        </Link>
      )}
      {userProfileDetails.location && (
        <p className="text-sm opacity-60">
          {userProfileDetails.location}
        </p>
      )}
    </div>
  );
};

export default ProfileInfo;
