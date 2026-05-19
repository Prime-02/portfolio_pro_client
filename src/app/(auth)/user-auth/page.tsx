"use client";
import React from "react";
import UserAuth from "./auth-mode/UserAuth";
import PortfolioProLogo from "../../components/logo/PortfolioProTextLogo";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";


const MainAuth = () => {
  const { userInfo } = useUserSettings()

  // Don't render the auth form if user is already authenticated
  if (userInfo?.username) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div>
          <PortfolioProLogo
            tracking={0.2}
            scale={0.75}
            fontWeight={"extrabold"}
            reanimateDelay={3000}
          />
        </div>
        <p className="font-semibold">
          {"Please wait... we are validating your credentials  "}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col gap-y-3 items-center justify-center px-2 max-sm:px-0">
      <UserAuth />
    </div>
  );
};

export default MainAuth;
