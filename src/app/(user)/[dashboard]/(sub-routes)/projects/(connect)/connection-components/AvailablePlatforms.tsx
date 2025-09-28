import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  getColorShade,
  PathUtil,
} from "@/app/components/utilities/syncFunctions/syncs";
import {
  useLoadProjectStats,
  useProjectStatisticsStore,
} from "@/app/stores/project_stores/ProjectStats";
import { LucideExternalLink } from "lucide-react";
import React, { useEffect, useState } from "react";
import { BsLightningCharge } from "react-icons/bs";
import PlatformCard, { ConnectionPlatformsCardProps } from "./PlatformCard";
import { useGlobalState } from "@/app/globalStateProvider";
import { getLoader } from "@/app/components/loaders/Loader";
import { toast } from "@/app/components/toastify/Toastify";
import { ConnectionPlatforms } from "@/app/components/utilities/indices/projects-JSONs/projectCreate";

const AvailablePlatforms = () => {
  const [currentTab, setCurrentTab] = useState<"overview" | "browse">(
    "overview"
  );
  const { platform_projects } = useProjectStatisticsStore();
  const { theme, isDarkMode, accentColor, loader } = useTheme();
  const { accessToken, currentPath, router, loading } = useGlobalState();
  const loadProjectStats = useLoadProjectStats();
  const LoaderComponent = getLoader(loader) || null;

  useEffect(() => {
    loadProjectStats();
  }, [accessToken]);

  // Helper function to check if a platform is connected
  const isPlatformConnected = (platformKey: string): boolean => {
    return platform_projects.hasOwnProperty(platformKey);
  };

  // Helper function to get project count for a platform
  const getProjectCount = (platformKey: string): number => {
    return (
      platform_projects[platformKey as keyof typeof platform_projects] || 0
    );
  };

  // Filter platforms based on current tab
  const getFilteredPlatforms = () => {
    if (currentTab === "overview") {
      // Show only connected platforms
      return ConnectionPlatforms.filter((platform) =>
        isPlatformConnected(platform.platformKey)
      );
    } else {
      // Show only unconnected platforms
      return ConnectionPlatforms.filter(
        (platform) => !isPlatformConnected(platform.platformKey)
      );
    }
  };
  const filteredPlatforms = getFilteredPlatforms();

  const constructManagementUrl = (
    rawPlatform: string,
    mode: "view" | "import" | "resync" | "checkForNew" | "disconnect"
  ) => {
    const platform = rawPlatform.toLowerCase().replace("-", "");
    // Check if this is Portfolio Pro and the action is restricted
    if (
      platform === "portfoliopro" &&
      (mode === "resync" || mode === "checkForNew" || mode === "disconnect")
    ) {
      toast.warning(
        "You cannot perform this action on the Portfolio Pro platform.",
        {
          title: "Invalid Action",
        }
      );
      return;
    }

    const baseUrl = PathUtil.removeLastSegment(currentPath);
    const cunstructedRouter = () => {
      switch (mode) {
        case "view":
          return PathUtil.buildUrlWithQuery(baseUrl, {
            filter: platform,
            hideStats: true,
            hideHeader: true,
          });
        case "resync":
          return PathUtil.buildUrlWithQuery(`${baseUrl}/import`, {
            platform: platform,
            resync: true,
          });
        case "import":
          return PathUtil.buildUrlWithQuery(`${baseUrl}/import`, {
            platform: platform,
          });
        case "checkForNew":
          return PathUtil.buildUrlWithQuery(`${baseUrl}/import`, {
            platform: platform,
            checkForNew: true,
          });
        case "disconnect":
          return PathUtil.buildUrlWithQuery(`${baseUrl}/import`, {
            platform: platform,
            disconnect: true,
          });
      }
    };
    if (cunstructedRouter()) {
      router.push(cunstructedRouter());
    }
  };

  return (
    <div className="w-full mx-auto h-auto flex p-2 flex-col gap-y-4">
      <header
        className="w-full p-1.5 flex items-center justify-between rounded-full shadow-lg"
        style={{
          backgroundColor: getColorShade(theme.background, 5),
        }}
      >
        <span
          onClick={() => {
            setCurrentTab("overview");
          }}
          className={`w-1/2 cursor-pointer text-center text-sm rounded-full ${currentTab === "overview" && "text-[var(--background)] bg-[var(--foreground)]"} font-semibold py-1 flex items-center justify-center gap-x-2`}
        >
          <span>{<BsLightningCharge size={16} />}</span>
          <p>{"Overview"}</p>
        </span>
        <span
          onClick={() => {
            setCurrentTab("browse");
          }}
          className={`w-1/2 cursor-pointer text-center text-sm rounded-full ${currentTab === "browse" && "text-[var(--background)] bg-[var(--foreground)]"} font-semibold py-1 flex items-center justify-center gap-x-2`}
        >
          <span>{<LucideExternalLink size={16} />}</span>
          <p>{"Browse Platforms"}</p>
        </span>
      </header>

      <div className="w-full">
        {currentTab === "overview" ? (
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-4">
              <h1 className="md:text-xl text-sm">{`Connected Platforms`}</h1>
              <h3 className="md:text-base text-sm w-full opacity-65 font-thin">
                {`Manage your active platform connections `}
              </h3>
            </div>
            <span
              onClick={() => {
                loadProjectStats();
              }}
              className="text-xs text-[var(--background)] p-1 text-center w-32 rounded-full bg-[var(--foreground)] "
            >
              {`${filteredPlatforms.length} connected`}
            </span>
          </div>
        ) : (
          currentTab === "browse" && (
            <div className="flex items-center justify-between">
              <div className="flex flex-col  items-start ">
                <h1 className="md:text-xl text-md  ">{`Available Platforms`}</h1>
                <h3 className="md:text-base text-sm w-full opacity-65 font-thin">
                  {`Connect new platforms to expand your project dashboard`}
                </h3>
              </div>
              <span className="text-xs text-[var(--background)] p-1 text-center w-32 rounded-full bg-[var(--foreground)] ">
                {`${filteredPlatforms.length} available`}
              </span>
            </div>
          )
        )}
      </div>

      {filteredPlatforms.length > 0 ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlatforms.map((platform, index) => {
            const isConnected = isPlatformConnected(platform.platformKey);
            const projectCount = getProjectCount(platform.platformKey);

            const platformCardProps: ConnectionPlatformsCardProps = {
              platform: platform.platform,
              description: platform.description,
              connected: isConnected,
              projectCount: projectCount,
              iconConfig: {
                hasTheme: isDarkMode,
                primaryColor: theme.foreground,
                logoAlt: platform.logoAlt,
                logoSrc:
                  typeof platform.logoSrc === "function"
                    ? platform.logoSrc(isDarkMode)
                    : platform.logoSrc,
              },
              management: {
                view: () =>
                  constructManagementUrl(platform.platformKey, "view"),
                importPrj: () =>
                  constructManagementUrl(platform.platformKey, "import"),
                resync: () => {
                  constructManagementUrl(platform.platformKey, "resync");
                },
                disconnect: () => {
                  constructManagementUrl(platform.platformKey, "disconnect");
                },
              },
            };

            return (
              <PlatformCard
                key={`${platform.platform}-${index}`}
                {...platformCardProps}
              />
            );
          })}
        </div>
      ) : (
        <div className="w-full text-center py-8 opacity-50">
          {currentTab === "overview"
            ? "No platforms connected yet"
            : "All available platforms are already connected"}
        </div>
      )}
    </div>
  );
};

export default AvailablePlatforms;
