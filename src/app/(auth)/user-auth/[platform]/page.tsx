"use client";

import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";
import Github from "./platforms/github/Github";
import Google from "./platforms/google/Google";
import LinkedIn from "./platforms/linkedIn/LinkedIn";
import Button from "@/app/components/buttons/Buttons";
import Link from "next/link";

const page = () => {
  const { currentPath } = useGlobalState();
  const currentPage = PathUtil.getLastSegment(currentPath);

  const renderPage = () => {
    switch (currentPage) {
      case "github":
        return <Github />;
      case "google":
        return <Google />;
      case "linkedin":
        return <LinkedIn />;
      default:
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

export default page;
