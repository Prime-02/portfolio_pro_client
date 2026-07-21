import { api } from "@/lib/client/api";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import Button from "@/src/app/components/buttons/Buttons";
import { useTheme } from "@/src/context/ThemeContext";
import { toast } from "@/src/context/Toastify";
import Image from "next/image";
import React from "react";
import VercelButton from "./vercel/VercelButton";

// Configuration for different OAuth providers
const OAUTH_BUTTON_CONFIG = {
  github: {
    endpoint: "github-auth/login",
    loadingKey: "github_verification_in_progress",
    logoSrc: (isDarkMode: boolean) =>
      `/socials/github/github-mark/github-mark${!isDarkMode ? "" : "-white"}.png`,
    logoAlt: "GitHub Logo",
    buttonText: "Continue with Github",
  },
  google: {
    endpoint: "google-auth/login",
    loadingKey: "google_verification_in_progress",
    logoSrc: "/socials/google/Google_Symbol_3.svg",
    logoAlt: "Google Logo",
    buttonText: "Continue with google",
  },
  linkedin: {
    endpoint: "linkedin-auth/login",
    loadingKey: "linkedin_verification_in_progress",
    logoSrc: "/socials/linkedin/in-logo/LI-In-Bug.png",
    logoAlt: "LinkedIn Logo",
    buttonText: "Continue with LinkedIn",
  },
  figma: {
    endpoint: "figma-auth/login",
    loadingKey: "figma_verification_in_progress",
    logoSrc: "/socials/figma/Figma_Icon_15.png",
    logoAlt: "figma Logo",
    buttonText: "Continue with Figma",
  },
  canva: {
    endpoint: "canva-auth/login",
    loadingKey: "canva_verification_in_progress",
    logoSrc: "/socials/canva/Canva_Logo_0.svg",
    logoAlt: "Canva Logo",
    buttonText: "Continue with ",
  },
  //vercel has a different integration method
  vercel: {
    endpoint: "",
    loadingKey: "",
    logoSrc: "",
    logoAlt: "",
    buttonText: "",
  },
} as const;

type OAuthProvider = keyof typeof OAUTH_BUTTON_CONFIG;

interface OAuthButtonProps {
  provider: OAuthProvider;
  className?: string;
  fullWidth?: boolean;
  redirect?: boolean
  buttonText?: string
}

const OAuthButton: React.FC<OAuthButtonProps> = ({
  provider,
  className = "",
  fullWidth = false,
  redirect = false,
  buttonText
}) => {
  const { isDarkMode } = useTheme();
  const { isLoading, startLoading, stopLoading } = useUIStore();
  const { router, pathname, setRedirectUrl } = useRouting()

  const config = OAUTH_BUTTON_CONFIG[provider];

  const continueWithProvider = async () => {
    if (redirect) {
      setRedirectUrl(pathname)
    }
    startLoading(config.loadingKey);
    try {
      const { data } = await api.get(`/${config.endpoint}`);

      if (data && data.url) {
        toast.success("Kindly continue the verification process");
        router.push(data.url);
        window.location.replace(data.url);
      } else {
        toast.error("Something went wrong, please try again");
      }
    } catch (error) {
      console.log("An Error Occurred: ", error);
      toast.error("Something went wrong, please try again");
    } finally {
      stopLoading(config.loadingKey);
    }
  };

  const getLogoSrc = () => {
    return typeof config.logoSrc === "function"
      ? config.logoSrc(isDarkMode)
      : config.logoSrc;
  };

  if (provider === "vercel") return <VercelButton buttonText={buttonText} />

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <Button
        icon={
          <img
            src={getLogoSrc()}
            width={provider === "canva" ? 0 : 20}
            height={20}
            alt={config.logoAlt}
          />
        }
        icon2={
          <img
            src={getLogoSrc()}
            width={provider === "canva" ? 35 : 0}
            height={20}
            alt={config.logoAlt}
          />
        }
        onClick={continueWithProvider}
        variant="outline"
        className={`${fullWidth ? "w-full" : ""} ${className}`}
        size="sm"
        text={buttonText ? buttonText : config.buttonText}
        loading={isLoading(config.loadingKey)}
      />
    </div>
  );
};

export default OAuthButton;
