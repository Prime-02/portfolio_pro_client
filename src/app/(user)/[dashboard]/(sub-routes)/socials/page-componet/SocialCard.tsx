import { DeleteData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import { log } from "console";
import { Trash } from "lucide-react";
import React from "react";
import { urlToHttpOptions } from "url";

export type SocialCardProps = {
  id: string;
  profile_headline: string;
  platform_name: string;
  url_type: string;
  profile_url: string;
  onRefresh?: () => void;
};

const SocialCard = (props: SocialCardProps) => {
  const { platform_name, url_type, profile_headline, profile_url, onRefresh } =
    props;
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
      onRefresh && onRefresh();
    }
  };

  return (
    <div className="w-full border bg-[var(--background)] p-4 relative rounded-lg shadow-md flex flex-col gap-2">
      <div className="w-full  ">{platform_name}</div>
      <span className="absolute top-0 left-0 w-8 h-2">{url_type}</span>
      <span
        className="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center bg-red-500 translate-1/3 text-white rounded-full"
        onClick={deleteSocial}
      >
        <Trash size={16} />
      </span>
    </div>
  );
};

export default SocialCard;
