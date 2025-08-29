import Button from "@/app/components/buttons/Buttons";
import { toast } from "@/app/components/toastify/Toastify";
import {
  GetAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import Image from "next/image";
import React from "react";

const GioogleButton = () => {
  const { loading, setLoading, router } = useGlobalState();

  const continueWithgoogle = async () => {
    setLoading("google_verification_in_progress");
    try {
      const googleResPonse: { url: string } = await GetAllData({
        url: `${V1_BASE_URL}/google-auth/login`,
      });
      if (googleResPonse && googleResPonse.url) {
        toast.success("Kindly continue the verification process");
        router.push(googleResPonse.url);
        window.location.replace(googleResPonse.url);
      } else toast.error("Something went wrong, please try again");
    } catch (error) {
      console.log("An Error Occured: ", error);
    } finally {
      setLoading("google_verification_in_progress");
    }
  };

  return (
    <div className="w-full">
      <Button
        icon={
          <Image
            src={`/socials/google/Google_Symbol_3.svg`}
            width={20}
            height={20}
            alt="google"
          />
        }
        onClick={continueWithgoogle}
        variant="outline"
        className="w-full"
        size="sm"
        text="Continue with google"
        loading={loading.includes("google_verification_in_progress")}
      />
    </div>
  );
};

export default GioogleButton;
