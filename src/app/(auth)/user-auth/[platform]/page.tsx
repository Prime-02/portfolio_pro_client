"use client";
import React from "react";
import Link from "next/link";
import OAuthComponent, { OAuthProvider } from "./platforms/OAuthComponent";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { PathUtil } from "@/lib/utilities/syncFunctions/syncs";
import Button from "@/src/app/components/buttons/Buttons";

const DynamicMultiPlatformsPage = () => {
  const { currentPath, checkParams } = useRouting();
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
