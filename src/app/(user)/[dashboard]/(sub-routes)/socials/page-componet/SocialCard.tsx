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
    <div className="w-64 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-40 bg-gray-100">
        {profile_screenshot ? (
          <img
            src={profile_screenshot}
            alt={`${platform_name} profile`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">No preview available</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center mb-2">
          <div
            className={`w-8 h-8 rounded-full mr-2 ${getPlatformIcon(platform_name)}`}
          />
          <h3 className="font-medium text-gray-800 capitalize">
            {platform_name}
            <span className="btn btn-danger" onClick={deleteSocial}>
              delete
            </span>
          </h3>
        </div>

        <a
          href={profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 truncate block"
          title={profile_url}
        >
          {profile_url}
        </a>
        <a
          href={profile_screenshot}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 truncate block"
          title={profile_screenshot}
        >
          {profile_screenshot}
        </a>

        <button
          className="mt-3 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
          onClick={() => window.open(profile_url, "_blank")}
        >
          Visit Profile
        </button>
      </div>
    </div>
  );
};

export default SocialCard;
