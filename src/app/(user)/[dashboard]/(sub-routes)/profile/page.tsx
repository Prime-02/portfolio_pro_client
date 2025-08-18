"use client";
import { getCurrentUrl } from "@/app/components/utilities/syncFunctions/syncs";
import React from "react";
import ProfileTemplate from "./page-components/ProfileTemplate";
import { useGlobalState } from "@/app/globalStateProvider";
const ProfileMain = () => {
  const { userData } = useGlobalState();

  return (
    <div className=" flex flex-col max-w-xl mx-auto gap-y-5">
      <div className=" w-full flex flex-col p h-auto p-2 relative">
        <ProfileTemplate
          showSettings={getCurrentUrl("pathSegment", 0) === userData.username}
        />
      </div>
    </div>
  );
};

export default ProfileMain;
