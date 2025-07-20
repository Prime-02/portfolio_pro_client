import Button from "@/app/components/buttons/Buttons";
import { Textinput } from "@/app/components/inputs/Textinput";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { socialMediaPlatforms } from "@/app/components/utilities/indices/DropDownItems";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export type SocialType = {
  platform_name: string;
  profile_url: string;
};

const AddSocials = () => {
  const { theme } = useTheme();
  const { loading, setLoading, accessToken } = useGlobalState();
  const [addSocial, setAddSocial] = useState<SocialType>({
    platform_name: "",
    profile_url: "",
  });
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const handleClose = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("create");
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  };

  const postSocialData = async () => {
    setLoading("adding_social_profile");
    if (!accessToken) {
      toast.warning(
        "You're not supposed to be here without permission, please proceed to logn or sign up "
      );
      return;
    }
    try {
      const socialRes = await PostAllData({
        access: accessToken,
        data: addSocial,
        url: `${V1_BASE_URL}/socials/`,
      });
      if (socialRes) {
        handleClose();
      }
    } catch (error) {
    } finally {
      setLoading("adding_social_profile");
    }
  };

  return (
    <div className="min-h-32 h-auto">
      <div className="flex flex-col gap-y-5">
        <div>
          <Textinput
            value={addSocial.platform_name}
            onChange={(e) => {
              setAddSocial((prev) => ({
                ...prev,
                platform_name: e,
              }));
            }}
            label="Platform"
            labelBgHex={theme.background}
            labelBgHexIntensity={10}
            type="dropdown"
            options={socialMediaPlatforms}
          />
        </div>
        <div>
          <Textinput
            value={addSocial.profile_url}
            onChange={(e) => {
              setAddSocial((prev) => ({
                ...prev,
                profile_url: e,
              }));
            }}
            label="Prolfile Link"
            labelBgHex={theme.background}
            labelBgHexIntensity={10}
            type="text"
            desc={`Head over to your account profile and copy the link`}
          />
        </div>
        <div className="w-full ">
          <Button
            text="Upload"
            loading={loading.includes("adding_social_profile")}
            className="w-full"
            onClick={postSocialData}
          />
        </div>
      </div>
    </div>
  );
};

export default AddSocials;
