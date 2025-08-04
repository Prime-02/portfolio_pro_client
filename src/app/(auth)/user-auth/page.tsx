"use client";
import React from "react";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import UserAuth from "./auth-mode/UserAuth";
import { useGlobalState } from "@/app/globalStateProvider";

const MainAuth = () => {
  const { isSignedIn } = useAuth();
  const { userData } = useGlobalState();

  if (isSignedIn) {
    redirect(`/${userData?.username || "dashboard"}`);
  }

  return (
    <div className="w-full min-h-screen flex flex-col gap-y-3 items-center justify-center px-2 max-sm:px-0">
      <UserAuth />
    </div>
  );
};

export default MainAuth;
