import Button from "@/app/components/buttons/Buttons";
import CheckBox from "@/app/components/inputs/CheckBox";
import PortfolioProLogo from "@/app/components/logo/PortfolioProTextLogo";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const Approved = () => {
  const {
    loading,
    setLoading,
    checkParams,
    clearQuerryParam,
    setAccessToken,
    accessToken,
  } = useGlobalState();
  const { isDarkMode } = useTheme();
  const code = checkParams("code");
  const installation_id = checkParams("installation_id");
  const [preview, setPreview] = useState(false);
  const contructedURL = PathUtil.buildUrlWithQuery(
    `${V1_BASE_URL}/linkedin-auth/callback`,
    {
      code: code,
      installation_id: installation_id,
    }
  );

  const approveUser = async () => {
    setLoading("linkedin_verification_in_progress");
    try {
      const getVerification: {
        message: string;
        session_token: string;
        is_new: boolean;
        user: {
          username: string;
        };
      } = await GetAllData({
        url: contructedURL.slice(1),
      });
      if (getVerification) {
        if (getVerification.is_new) {
          window.location.replace(
            `/${getVerification?.user?.username ?? "dashboard"}`
          );
        }
        if (getVerification.message) {
          toast.success(getVerification.message);
        }
        if (getVerification.session_token) {
          setAccessToken(getVerification.session_token);
          toast.success(getVerification.session_token);
          localStorage.setItem("session_token", getVerification.session_token);
        }
      } else {
        toast.error("We were unable to verify you. Please try again", {
          title: "Verification Error",
        });
        clearQuerryParam();
        console.log("Data gotten: ", getVerification);
      }
    } catch (error) {
      toast.error("We were unable to verify you. Please try again", {
        title: "Verification Error",
      });
      console.log("Something went wrong: ", error);
      clearQuerryParam();
    } finally {
      setLoading("linkedin_verification_in_progress");
    }
  };

  useEffect(() => {
    approveUser();
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8 ">
      {loading.includes("linkedin_verification_in_progress") ? (
        <div>
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
      ) : (
        <div className="flex flex-col p-2 items-center min-w-sm h-full border border-[var(--accent)]/20 rounded-2xl w-auto">
          <div
            className={`object-cover  flex items-center justify-center rounded-full w-16 h-16 `}
          >
            <Image
            src={`/socials/linkedin/linkedin-logo/LI-Logo.png`}
              width={1000}
              height={1000}
              alt="LinkedIn Logo"
            />
          </div>
          <div className="w-full flex flex-col gap-y-2">
            <div className="flex mt-4 justify-center gap-3">
              <Link href={"/welcome"}>
                <Button
                  variant="ghost"
                  size="sm"
                  text="Click to continue if your browser did not redirect you"
                />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approved;
