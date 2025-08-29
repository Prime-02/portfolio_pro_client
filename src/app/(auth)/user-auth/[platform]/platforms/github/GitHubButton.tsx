import Button from "@/app/components/buttons/Buttons";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import {
  GetAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import Image from "next/image";
import React from "react";

const GitHubButton = () => {
  const { isDarkMode } = useTheme();
  const { loading, setLoading, router } = useGlobalState();

  const continueWithGitHub = async () => {
    setLoading("github_verification_in_progress");
    try {
      const gitHubResPonse: { url: string } = await GetAllData({
        url: `${V1_BASE_URL}/github-auth/login`,
      });
      if (gitHubResPonse && gitHubResPonse.url) {
        toast.success("Kindly continue the verification process");
        router.push(gitHubResPonse.url);
        window.location.replace(gitHubResPonse.url);
      } else toast.error("Something went wrong, please try again");
    } catch (error) {
      console.log("An Error Occured: ", error);
    } finally {
      setLoading("github_verification_in_progress");
    }
  };

  return (
    <div>
      <Button
        icon={
          <Image
            src={`/socials/github/github-mark/github-mark${!isDarkMode ? "" : "-white"}.png`}
            width={20}
            height={20}
            alt="Git Hub Logo"
          />
        }
        onClick={continueWithGitHub}
        variant="outline"
        size="sm"
        text="Continue with Github"
        loading={loading.includes("github_verification_in_progress")}
      />
    </div>
  );
};

export default GitHubButton;
