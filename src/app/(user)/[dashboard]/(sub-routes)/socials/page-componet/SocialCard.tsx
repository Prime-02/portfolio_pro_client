import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { DeleteData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { socialMediaPlatforms } from "@/app/components/utilities/indices/DropDownItems";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { copyToClipboard } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { Trash, Globe, Copy, Edit } from "lucide-react";
import Link from "next/link";
import React from "react";

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
  const { accessToken, loading, setLoading, extendRouteWithQuery } =
    useGlobalState();
  const { loader, accentColor, themeVariant } = useTheme();
  const LoaderComponent = getLoader(loader) || null;

  // Enhanced platform matching logic
  const getPlatformData = (platformName: string) => {
    const normalizedPlatformName = platformName.toLowerCase().trim();

    // Find exact match by code or id (case-insensitive)
    let platform = socialMediaPlatforms.find(
      (p) =>
        p.code.toLowerCase() === normalizedPlatformName ||
        p.id.toLowerCase() === normalizedPlatformName
    );

    // If no exact match, try partial matching for common variations
    if (!platform) {
      platform = socialMediaPlatforms.find((p) => {
        const code = p.code.toLowerCase();
        const id = p.id.toLowerCase();

        // Handle common variations
        return (
          (normalizedPlatformName.includes("twitter") &&
            (code.includes("twitter") || code.includes("x"))) ||
          (normalizedPlatformName.includes("x") && code.includes("twitter")) ||
          (normalizedPlatformName.includes("github") &&
            code.includes("github")) ||
          (normalizedPlatformName.includes("linkedin") &&
            code.includes("linkedin")) ||
          (normalizedPlatformName.includes("facebook") &&
            code.includes("facebook")) ||
          (normalizedPlatformName.includes("instagram") &&
            code.includes("instagram")) ||
          (normalizedPlatformName.includes("youtube") &&
            code.includes("youtube")) ||
          (normalizedPlatformName.includes("tiktok") && code.includes("tiktok"))
        );
      });
    }

    return (
      platform || {
        code: "Unknown",
        id: "Unknown",
        icon: Globe,
        color: "#6B7280",
        darkColor: "#9CA3AF",
      }
    );
  };

  const platformData = getPlatformData(platform_name);
  const IconComponent = platformData.icon;
  const platformColor =
    themeVariant === "dark" ? platformData.color : platformData.darkColor;

  const deleteSocial = async () => {
    setLoading(`deleting_social_${props.id}`);
    try {
      await DeleteData({
        access: accessToken,
        url: `${V1_BASE_URL}/socials/${props.id}`,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(`deleting_social_${props.id}`);
      onRefresh && onRefresh();
    }
  };

  return (
    <div className="group w-full bg-[var(--background)] hover:bg-[var(--background-hover)] transition-all duration-200 p-4 relative rounded-xl shadow-sm hover:shadow-md border-[var(--border)] overflow-hidden">
      {/* Platform Color Accent Bar */}
      <div
        className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
        style={{ backgroundColor: platformColor }}
      />

      {/* URL Type Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className="px-2 py-1 text-xs font-medium rounded-full border"
          style={{
            backgroundColor: `${platformColor}15`,
            color: platformColor,
            borderColor: `${platformColor}30`,
          }}
        >
          {url_type}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex items-start gap-3 mb-3 mt-2">
        {/* Platform Icon */}
        <div
          className="flex-shrink-0 p-2 rounded-lg"
          style={{ backgroundColor: `${platformColor}10` }}
        >
          <IconComponent size={24} style={{ color: platformColor }} />
        </div>

        {/* Platform Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--foreground)] truncate">
            {platformData.code}
          </h3>
          {profile_headline && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">
              {profile_headline}
            </p>
          )}
        </div>
      </div>

      {/* Profile URL */}
      {profile_url && (
        <div className="mb-4 w-full flex justify-between items-center">
          <Link
            href={profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-1/2 flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200 group/link"
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap group-hover/link:underline">
              {profile_url.replace(/^https?:\/\//, "")}
            </span>
          </Link>
          <Copy
            onClick={() => {
              copyToClipboard(profile_url);
            }}
            size={14}
            className="text-[var(--muted-foreground)] cursor-pointer"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: platformColor }}
          />
          <span>Connected</span>
        </div>

        {/* Delete Button */}
        <div className="flex items-center">
          <button
            onClick={() => {
              extendRouteWithQuery({ update: props.id });
            }}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-[var(--muted-foreground)] hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.includes(`deleting_social_${props.id}`) ? (
              <div className="flex items-center justify-center">
                {LoaderComponent && (
                  <LoaderComponent
                    color={String(accentColor.color)}
                    size={16}
                  />
                )}
              </div>
            ) : (
              <Edit size={14} />
            )}
          </button>
          <button
            onClick={deleteSocial}
            disabled={loading.includes(`deleting_social_${props.id}`)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--muted-foreground)] hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.includes(`deleting_social_${props.id}`) ? (
              <div className="flex items-center justify-center">
                {LoaderComponent && (
                  <LoaderComponent
                    color={String(accentColor.color)}
                    size={16}
                  />
                )}
              </div>
            ) : (
              <Trash size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialCard;
