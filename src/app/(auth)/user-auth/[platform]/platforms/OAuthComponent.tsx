import Button from "@/app/components/buttons/Buttons";
import PortfolioProLogo from "@/app/components/logo/PortfolioProTextLogo";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import {
  GetAllData,
  PostAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import OAuthButton from "./OAuthButton";
import VercelButton from "./vercel/VercelButton";
import Modal from "@/app/components/containers/modals/Modal";
import { Textinput } from "@/app/components/inputs/Textinput";

// Configuration for different OAuth providers
const PROVIDER_CONFIG = {
  linkedin: {
    endpoint: "linkedin-auth/callback",
    loadingKey: "linkedin_verification_in_progress",
    logoSrc: "/socials/linkedin/linkedin-logo/LI-Logo.png",
    logoAlt: "LinkedIn Logo",
    logoClass: "flex items-center justify-center rounded-full w-16 h-16",
    unapprovedLogoClass:
      "object-cover flex items-center justify-center rounded-full w-32 h-32",
    params: ["code", "installation_id"],
  },
  google: {
    endpoint: "google-auth/callback",
    loadingKey: "google_verification_in_progress",
    logoSrc: "/socials/google/Google_Symbol_3.svg",
    logoAlt: "Google Logo",
    logoClass: "object-cover rounded-full w-10 h-10",
    unapprovedLogoClass: "object-cover rounded-full w-32 h-32",
    params: ["code", "error"],
  },
  canva: {
    endpoint: "canva-auth/callback",
    loadingKey: "canva_verification_in_progress",
    logoSrc: "/socials/canva/Canva_Icon_9.jpeg",
    logoAlt: "Canva Logo",
    logoClass: "object-cover rounded-full w-10 h-10",
    unapprovedLogoClass: "object-cover rounded-full w-32 h-32",
    params: ["code", "error", "state", "email"],
  },
  figma: {
    endpoint: "figma-auth/callback",
    loadingKey: "figma_verification_in_progress",
    logoSrc: "/socials/figma/Figma_Icon_15.png",
    logoAlt: "Figma Logo",
    logoClass: "object-cover rounded-full w-10 h-10",
    unapprovedLogoClass: "object-cover rounded-full w-32 h-32",
    params: ["code", "state", "error"],
  },
  vercel: {
    endpoint: "vercel/login",
    loadingKey: "vercel_verification_in_progress",
    logoSrc: (isDarkMode: boolean) =>
      `/socials/vercel/vercel-logotype-${isDarkMode ? "dark" : "light"}.svg`,
    logoAlt: "Vercel Logo",
    logoClass: "object-cover rounded-full w-10 h-10",
    unapprovedLogoClass: "object-cover rounded-full w-32 h-32",
    params: ["code"],
  },
  github: {
    endpoint: "github-auth/callback",
    loadingKey: "github_verification_in_progress",
    logoSrc: (isDarkMode: boolean) =>
      `/socials/github/github-mark/github-mark${!isDarkMode ? "" : "-white"}.png`,
    logoAlt: "GitHub Logo",
    logoClass: (isDarkMode: boolean) =>
      `object-cover rounded-full ${!isDarkMode ? "bg-white" : "bg-black"} w-10 h-10`,
    unapprovedLogoClass: (isDarkMode: boolean) =>
      `object-cover rounded-full ${!isDarkMode ? "bg-white" : "bg-black"} w-32 h-32`,
    params: ["code", "installation_id"],
  },
} as const;

export type OAuthProvider = keyof typeof PROVIDER_CONFIG;

interface OAuthComponentProps {
  provider: OAuthProvider;
  mode?: "approved" | "unapproved";
}

const OAuthComponent: React.FC<OAuthComponentProps> = ({
  provider,
  mode = "approved",
}) => {
  const {
    loading,
    setLoading,
    checkParams,
    clearQuerryParam,
    setAccessToken,
    router,
    fetchUserData,
  } = useGlobalState();
  const { isDarkMode } = useTheme();
  const hasCalledApproveUser = useRef(false);
  const [emailVerification, setEmailVerification] = useState(false);
  const verifiedEmail = checkParams("email");
  const [email, setEmail] = useState("");

  const config = PROVIDER_CONFIG[provider];

  // Extract parameters based on provider configuration (only for approved mode)
  const params =
    mode === "approved"
      ? config.params.reduce(
          (acc, param) => {
            const value = checkParams(param);
            if (value) acc[param] = value;
            return acc;
          },
          {} as Record<string, string>
        )
      : {};

  const constructedURL =
    mode === "approved"
      ? PathUtil.buildUrlWithQuery(`${V1_BASE_URL}/${config.endpoint}`, params)
      : "";

  const approveUser = async () => {
    if (hasCalledApproveUser.current) {
      return;
    }
    hasCalledApproveUser.current = true;
    setLoading(config.loadingKey);
    try {
      const getVerification: {
        message: string;
        session_token: string;
        refresh_token: string;
        expires_at: string;
        is_new: boolean;
        user: {
          username: string;
        };
      } = await GetAllData({
        url: constructedURL.slice(1),
      });

      if (getVerification) {
        await fetchUserData(getVerification.session_token);

        // Handle success message first
        if (getVerification.message) {
          toast.success(getVerification.message);
        }

        // Handle session token
        if (getVerification.session_token) {
          const { session_token, refresh_token, expires_at } = getVerification;
          console.log("Data retrieved after verification", getVerification);
          setAccessToken(session_token, refresh_token, expires_at);
          localStorage.setItem("session_token", getVerification.session_token);
        }

        // Handle routing based on user status
        if (!getVerification.is_new) {
          router.replace(`/${getVerification?.user?.username ?? "dashboard"}`);
        } else {
          router.replace(`/welcome`);
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
      setLoading(config.loadingKey);
    }
  };

  const requestEmailVerification = async () => {
    setLoading("verify_email_in_progress");
    try {
      const verificationData = Object.assign(params, { email: email });
      const verificationRes: { message: string } = await PostAllData({
        url: `${V1_BASE_URL}/canva-auth/verify-email`,
        data: verificationData,
      });
      if (verificationRes?.message) {
        toast.success(verificationRes.message, {
          title: "Verification Email Sent",
        });
        setEmailVerification(false);
      } else {
        toast.error("We were unable to verify your email. Please try again", {
          title: "Email Verification Error",
        });
        console.log("Data gotten: ", verificationRes);
      }
    } catch (error) {
      toast.error("We were unable to verify your email. Please try again", {
        title: "Email Verification Error",
      });
      console.log("Something went wrong: ", error);
    } finally {
      setLoading("verify_email_in_progress");
    }
  };

  useEffect(() => {
    if (mode === "approved") {
      if (provider === "canva") {
        if (verifiedEmail) {
          approveUser();
          return;
        } else {
          setEmailVerification(true);
        }
      } else {
        approveUser();
      }
    }
  }, [mode]);

  // Get logo source and class based on provider and mode
  const getLogoSrc = () => {
    return typeof config.logoSrc === "function"
      ? config.logoSrc(isDarkMode)
      : config.logoSrc;
  };

  const getLogoClass = () => {
    if (mode === "unapproved") {
      return typeof config.unapprovedLogoClass === "function"
        ? config.unapprovedLogoClass(isDarkMode)
        : config.unapprovedLogoClass;
    }
    return typeof config.logoClass === "function"
      ? config.logoClass(isDarkMode)
      : config.logoClass;
  };

  // Render approved mode (original functionality)
  if (mode === "approved") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8">
        {loading.includes(config.loadingKey) ? (
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
            <Modal
              isOpen={emailVerification}
              onClose={() => setEmailVerification(false)}
              title="Email Verification Required"
            >
              <div className="flex flex-col gap-4">
                <p className="text-sm">
                  To continue with Canva, please provide your email for
                  verification.
                </p>
                <Textinput
                  value={email}
                  onChange={(e) => setEmail(e)}
                  label="Email Address"
                  type="email"
                />
                <Button
                  text="Send Verification Email"
                  loading={loading.includes("verify_email_in_progress")}
                  onClick={requestEmailVerification}
                  className="w-full"
                  disabled={
                    loading.includes("verify_email_in_progress") || !email
                  }
                />
              </div>
            </Modal>
            <div className={getLogoClass()}>
              <Image
                src={getLogoSrc()}
                width={1000}
                height={1000}
                alt={config.logoAlt}
              />
            </div>
            <div className="w-full flex flex-col gap-y-2">
              <div className="flex mt-4 justify-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (verifiedEmail) {
                      router.replace("/welcome");
                    } else {
                      setEmailVerification(true);
                    }
                  }}
                  size="sm"
                  text={
                    verifiedEmail
                      ? "Click to continue if your browser did not redirect you"
                      : "Resend Verification Email"
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render unapproved mode (error state)
  return (
    <div className="w-full min-h-screen h-auto flex items-center justify-center">
      <div className="flex rounded-2xl items-center justify-center p-3 border border-[var(--accent)]/20 flex-col h-auto max-w-md min-w-sm">
        <div className={getLogoClass()}>
          <Image
            src={getLogoSrc()}
            width={1000}
            height={1000}
            alt={config.logoAlt}
          />
        </div>
        <div className="flex flex-col items-center space-y-2 my-2">
          <p className="text-red-500 text-xs">Something went wrong</p>
          {provider === "vercel" ? (
            <VercelButton />
          ) : (
            <OAuthButton provider={provider} fullWidth />
          )}
          <div className="flex mx-auth items-center justify-between w-sm">
            <span className="w-[40%] h-[0.25px] bg-[var(--accent)]"></span>
            <span>or</span>
            <span className="w-[40%] h-[0.25px] bg-[var(--accent)]"></span>
          </div>
          <Button
            text="Back to login"
            size="sm"
            className="w-full"
            onClick={() => {
              router.replace("/user-auth?auth_mode=login");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OAuthComponent;
