"use client";

import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";
import Button from "@/app/components/buttons/Buttons";
import Link from "next/link";
import OAuthComponent, { OAuthProvider } from "./platforms/OAuthComponent";

const DynamicMultiPlatformsPage = () => {
  const { currentPath, checkParams } = useGlobalState();
  const currentPage = PathUtil.getLastSegment(currentPath);
  const code = checkParams("code");
  const validProviders: OAuthProvider[] = [
    "github",
    "google",
    "linkedin",
    "figma",
    "canva",
    "vercel"
  ];

  const renderPage = () => {
    // Check if currentPage is a valid provider
    if (validProviders.includes(currentPage as OAuthProvider)) {
      return (
        <OAuthComponent
          provider={currentPage as OAuthProvider}
          mode={code ? "approved" : "unapproved"}
        />
      );
    } else {
      return (
        <div className="w-full h-screen flex-col flex items-center justify-center">
          <Link href={"/user-auth"}>
            <Button text="Back To Login" size="sm" />
          </Link>
        </div>
      );
    }
  };

  return renderPage();
};

export default DynamicMultiPlatformsPage;
