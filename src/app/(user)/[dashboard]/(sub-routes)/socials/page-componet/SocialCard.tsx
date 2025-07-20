import { DeleteData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";

export type SocialCardProps = {
  id: string;
  profile_screenshot: string;
  screenshot_id: string;
  platform_name: string;
  profile_url: string;
  onRefresh: () => void;
};

const SocialCard = (props: SocialCardProps) => {
  const { platform_name, profile_screenshot, profile_url, onRefresh } = props;
  const { accessToken, loading, setLoading } = useGlobalState();

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return "fb-icon"; // Replace with actual icon component or class
      case "twitter":
        return "twitter-icon";
      case "instagram":
        return "instagram-icon";
      case "linkedin":
        return "linkedin-icon";
      default:
        return "social-icon";
    }
  };

  const deleteSocial = async () => {
    setLoading("deleting_social");
    try {
      await DeleteData({
        access: accessToken,
        url: `${V1_BASE_URL}/socials/${props.id}`,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("fetching_socials");
      onRefresh();
    }
  };

  return (
   <div className="max-w-md p-3">
    <div className="">

    </div>
   </div>
  );
};

export default SocialCard;
