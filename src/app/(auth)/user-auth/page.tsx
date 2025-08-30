"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import UserAuth from "./auth-mode/UserAuth";
import { useGlobalState } from "@/app/globalStateProvider";
import PortfolioProLogo from "@/app/components/logo/PortfolioProTextLogo";

const MainAuth = () => {
  const { userData, accessToken } = useGlobalState();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) {
      const redirectPath = `/${userData?.username || "dashboard"}`;
      router.push(redirectPath);
    }
  }, [accessToken, userData?.username, router]);

  // Don't render the auth form if user is already authenticated
  if (accessToken) {
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