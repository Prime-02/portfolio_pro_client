import Button from "@/app/components/buttons/Buttons";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import Image from "next/image";
import React from "react";

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
}

const OAuthButton: React.FC<OAuthButtonProps> = ({
  provider,
  className = "",
  fullWidth = false,
}) => {
  const { isDarkMode } = useTheme();
  const { loading, setLoading, router } = useGlobalState();

  const config = OAUTH_BUTTON_CONFIG[provider];

  const continueWithProvider = async () => {
    setLoading(config.loadingKey);
    try {
      const response: { url: string } = await GetAllData({
        url: `${V1_BASE_URL}/${config.endpoint}`,
      });

      if (response && response.url) {
        toast.success("Kindly continue the verification process");
        router.push(response.url);
        window.location.replace(response.url);
      } else {
        toast.error("Something went wrong, please try again");
      }
    } catch (error) {
      console.log("An Error Occurred: ", error);
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(config.loadingKey);
    }
  };

  const getLogoSrc = () => {
    return typeof config.logoSrc === "function"
      ? config.logoSrc(isDarkMode)
      : config.logoSrc;
  };

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <Button
        icon={
          <Image
            src={getLogoSrc()}
            width={provider === "canva" ? 0 : 20}
            height={20}
            alt={config.logoAlt}
          />
        }
        icon2={
          <Image
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
        text={config.buttonText}
        loading={loading.includes(config.loadingKey)}
      />
    </div>
  );
};

export default OAuthButton;
