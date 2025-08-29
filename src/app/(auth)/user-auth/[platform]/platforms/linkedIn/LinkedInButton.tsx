import Button from "@/app/components/buttons/Buttons";
import { toast } from "@/app/components/toastify/Toastify";
import {
  GetAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import Image from "next/image";
import React from "react";

const LinkedInButton = () => {
  const { loading, setLoading, router } = useGlobalState();

  const continueWithlinkedin = async () => {
    setLoading("linkedin_verification_in_progress");
    try {
      const linkedinResPonse: { url: string } = await GetAllData({
        url: `${V1_BASE_URL}/linkedin-auth/login`,
      });
      if (linkedinResPonse && linkedinResPonse.url) {
        toast.success("Kindly continue the verification process");
        router.push(linkedinResPonse.url);
        window.location.replace(linkedinResPonse.url);
      } else toast.error("Something went wrong, please try again");
    } catch (error) {
      console.log("An Error Occured: ", error);
    } finally {
      setLoading("linkedin_verification_in_progress");
    }
  };

  return (
    <div >
      <Button
        icon={
          <Image
            src={`/socials/linkedin/in-logo/LI-In-Bug.png`}
            width={20}
            height={20}
            alt="linkedin"
          />
        }
        onClick={continueWithlinkedin}
        variant="outline"
        
        size="sm"
        text="Continue with LinkedIn"
        loading={loading.includes("linkedin_verification_in_progress")}
      />
    </div>
  );
};

export default LinkedInButton;
