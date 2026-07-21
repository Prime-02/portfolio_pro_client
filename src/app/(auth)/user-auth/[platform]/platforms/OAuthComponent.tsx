import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import OAuthButton from "./OAuthButton";
import VercelButton from "./vercel/VercelButton";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useUserStore } from "@/lib/stores/user/userStore";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { useTheme } from "@/src/context/ThemeContext";
import { PathUtil } from "@/lib/utilities/syncFunctions/syncs";
import { api } from "@/lib/client/api";
import { toast } from "@/src/context/Toastify";
import PortfolioProLogo from "@/src/app/components/logo/PortfolioProTextLogo";
import Modal from "@/src/app/components/containers/modals/Modal";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import Button from "@/src/app/components/buttons/Buttons";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";


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
    params: ["code", "installation_id", "setup_action", "state"], // Added setup_action and state
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
    checkParams,
    clearQueryParam,
    router,
    redirectUrl,
    navigateToRedirect
  } = useRouting()
  const { fetchUserData } = useUserStore()
  const { isLoading,
    startLoading, stopLoading, } = useUIStore()
  const { isDarkMode } = useTheme();
  // Guards against React StrictMode's double-invocation of the mount effect only.
  // Manual retries (via canvaVerification) are NOT gated by this ref.
  const hasCalledOnMount = useRef(false);
  const [emailVerification, setEmailVerification] = useState(false);
  const { userInfo } = useUserSettings()
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

  // For GitHub, also check for user_id from state parameter
  const constructedURL = (() => {
    if (mode !== "approved") return "";

    // Build base URL with params
    let url = PathUtil.buildUrlWithQuery(`/${config.endpoint}`, params);

    // For GitHub specifically, add user_id if available
    if (provider === "github") {
      const state = checkParams("state");
      const userId = userInfo?.id;

      // Check if user_id is embedded in state parameter (format: "installation_{id}_user_{userId}")
      let extractedUserId = "";
      if (state && state.includes("_user_")) {
        extractedUserId = state.split("_user_")[1];
      }

      // Priority: 1) user_id from state, 2) current logged-in user, 3) userInfo
      const finalUserId = extractedUserId || userId || userInfo?.id;

      if (finalUserId) {
        url += `${url.includes('?') ? '&' : '?'}user_id=${finalUserId}`;
      }
    }

    return url;
  })();

  // In OAuthComponent, update approveUser:
  const approveUser = async () => {
    startLoading(config.loadingKey);
    try {
      const { data } = await api.get(constructedURL.slice(1));

      if (data) {
        await fetchUserData();

        if (data.message) {
          toast.success(data.message);
        }

        // Debug logs
        const storedRedirect = localStorage.getItem("redirectUrl");

        if (storedRedirect) {
          // Priority 1: Navigate to saved redirect URL
          navigateToRedirect();
        } else if (data.is_new) {
          // Priority 2: New users go to edit profile
          router.replace(`/${data?.user?.username}?edit_profile=true`);
        } else {
          // Priority 3: Existing users go to home
          router.replace(`/`);
        }
      } else {
        toast.error("We were unable to verify you. Please try again", {
          title: "Verification Error",
        });
        clearQueryParam();
      }
    } catch (error) {
      toast.error("We were unable to verify you. Please try again", {
        title: "Verification Error",
      });
      clearQueryParam();
    } finally {
      stopLoading(config.loadingKey);
    }
  };

  const requestEmailVerification = async () => {
    startLoading("verify_email_in_progress");
    try {
      const verificationData = Object.assign(params, { email: email });
      const { data } = await api.post("canva-auth/verify-email", verificationData);
      if (data?.message) {
        toast.success(data.message, {
          title: "Verification Email Sent",
        });
        setEmailVerification(false);
      } else {
        toast.error("We were unable to verify your email. Please try again", {
          title: "Email Verification Error",
        });
      }
    } catch (error) {
      toast.error("We were unable to verify your email. Please try again", {
        title: "Email Verification Error",
      });
    } finally {
      stopLoading("verify_email_in_progress");
    }
  };

  const canvaVerification = async () => {
    try {
      if (mode === "approved") {
        if (provider === "canva") {
          if (verifiedEmail) {
            await approveUser();
            return;
          } else {
            setEmailVerification(true);
          }
        } else {
          await approveUser();
        }
      }
    } catch (error) {
      // approveUser already handles errors and loading state
    }
  }

  useEffect(() => {
    // Only guard the automatic mount-time trigger (protects against
    // StrictMode's double-invoke in dev). Manual retries via the button
    // call canvaVerification() directly and are unaffected by this ref.
    if (hasCalledOnMount.current) {
      return;
    }
    hasCalledOnMount.current = true;
    canvaVerification()
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
        {isLoading(config.loadingKey) ? (
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
                  loading={isLoading("verify_email_in_progress")}
                  onClick={requestEmailVerification}
                  className="w-full"
                  disabled={
                    isLoading("verify_email_in_progress") || !email
                  }
                />
              </div>
            </Modal>
            <div className={getLogoClass()}>
              <img
                src={getLogoSrc()}
                width={1000}
                height={1000}
                alt={config.logoAlt}
              />
            </div>
            <div className="w-full flex flex-col gap-y-2">
              <div className="flex mt-4 justify-center gap-3">
                <Button
                  disabled={isLoading(config.loadingKey)}
                  loading={isLoading(config.loadingKey)}
                  variant="ghost"
                  onClick={() => {
                    if (verifiedEmail && !isLoading(config.loadingKey)) {
                      canvaVerification()
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
          <img
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