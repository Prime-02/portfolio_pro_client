"use client";
import React from "react";
import AvailablePlatforms from "../connection-components/AvailablePlatforms";

const page = () => {
  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="flex flex-col gap-y-2 items-start ">
        <h1 className="md:text-3xl text-2xl  ">{`Platform Connections`}</h1>
        <h3 className="md:text-base text-sm w-xs md:w-lg opacity-65 font-thin">
          {`Connect your professional platforms to automatically sync projects
            and streamline your workflow`}
        </h3>
      </div>
      <AvailablePlatforms />
    </div>
  );
};

export default page;
