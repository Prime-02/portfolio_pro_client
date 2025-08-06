import Button from "@/app/components/buttons/Buttons";
import { Textinput } from "@/app/components/inputs/Textinput";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  GetAllData,
  PostAllData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import {
  socialMediaPlatforms,
  urlType,
} from "@/app/components/utilities/indices/DropDownItems";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import { SocialCardProps } from "./SocialCard";

const AddSocials = ({ onRefresh }: { onRefresh: () => void }) => {
  const { theme } = useTheme();
  const {
    loading,
    setLoading,
    accessToken,
    searchParams,
    router,
    pathname,
    unauthorizedWarning,
  } = useGlobalState();
  const updateParam = searchParams.get("update");
  const updateSocial =
    updateParam !== null &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      updateParam
    );

  const [addSocial, setAddSocial] = useState<SocialCardProps>({
    platform_name: "",
    profile_url: "",
    profile_headline: "",
    url_type: "",
    id: "",
  });
  const handleClose = () => {
    router.replace(pathname, { scroll: false });
  };

  const postSocialData = async () => {
    setLoading("adding_social_profile");
    unauthorizedWarning();
    try {
      const socialRes = await PostAllData({
        access: accessToken,
        data: addSocial,
        url: `${V1_BASE_URL}/socials/`,
        intToString: false,
      });
      if (socialRes) {
        onRefresh();
        handleClose();
      }
    } catch (error) {
      console.log("error adding socials: ", error );
      
    } finally {
      setLoading("adding_social_profile");
    }
  };

  const updateSocialDetail = async () => {
    setLoading("updating_social_datail");
    try {
      const updateRes: SocialCardProps = await UpdateAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/socials/${updateParam}`,
        field: addSocial,
      });
      if (updateRes && updateRes.platform_name) {
        handleClose();
        onRefresh();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("updating_social_datail");
    }
  };

  
  const getASocialDetail = async () => {
    setLoading("fetching_a_social_detail");
    try {
      const socialRes: SocialCardProps = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/socials/${updateParam}`,
        type: "Single Social Datail",
      });
      if (socialRes && socialRes.platform_name) {
        setAddSocial((prev) => ({
          ...prev,
          platform_name: socialRes.platform_name,
          profile_url: socialRes.profile_url,
          profile_headline: socialRes.profile_headline,
          url_type: socialRes.url_type,
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("fetching_a_social_detail");
    }
  };

  useEffect(() => {
    if (updateParam && updateSocial && accessToken) {
      getASocialDetail();
    }
  }, [updateParam, updateSocial, accessToken]);

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
            placeholder="Platform"
            labelBgHex={theme.background}
            labelBgHexIntensity={10}
            type="dropdown"
            options={socialMediaPlatforms}
          />
        </div>
        <div>
          <Textinput
            value={addSocial.url_type}
            onChange={(e) => {
              setAddSocial((prev) => ({
                ...prev,
                url_type: e,
              }));
            }}
            placeholder="Url Type"
            labelBgHex={theme.background}
            labelBgHexIntensity={10}
            type="dropdown"
            options={urlType}
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
            label="Profile Link"
            labelBgHex={theme.background}
            labelBgHexIntensity={10}
            type="text"
            desc={`Head over to your account profile and copy the link`}
          />
        </div>
        <div>
          <Textinput
            value={addSocial.profile_headline}
            onChange={(e) => {
              setAddSocial((prev) => ({
                ...prev,
                profile_headline: e,
              }));
            }}
            label="Profile Headline"
            labelBgHex={theme.background}
            labelBgHexIntensity={10}
            type="text"
            desc={`Head over to your account profile and copy the link`}
          />
        </div>
        <div className="w-full ">
          <Button
            text={`${updateParam && updateSocial ? "Update" : "Upload"} Social Detail`}
            loading={
              loading.includes("adding_social_profile") ||
              loading.includes("updating_social_datail")
            }
            className="w-full"
            onClick={() => {
              if (updateParam && updateSocial) {
                updateSocialDetail();
              } else {
                postSocialData();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AddSocials;
