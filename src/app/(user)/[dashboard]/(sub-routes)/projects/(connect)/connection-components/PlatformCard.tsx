import React from "react";
import {
  LucideSettings,
  LucidePlus,
  Eye,
  RefreshCcw,
  ImportIcon,
} from "lucide-react";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import Button from "@/app/components/buttons/Buttons";
import Image from "next/image";
import Popover from "@/app/components/containers/divs/PopOver";
import { GiCancel } from "react-icons/gi";
import { useTheme } from "@/app/components/theme/ThemeContext ";

export interface ConnectionPlatformsCardIconProps {
  hasTheme: boolean;
  primaryColor: string;
  logoAlt: string;
  logoSrc: string;
}

export interface ConnectionPlatformsCardManagementProps {
  view: () => void;
  resync: () => void;
  disconnect: () => void;
  importPrj: () => void;
}

export interface ConnectionPlatformsCardProps {
  platform: string;
  description: string;
  connected: boolean;
  projectCount: number;
  iconConfig: ConnectionPlatformsCardIconProps;
  management: ConnectionPlatformsCardManagementProps;
}

interface ManagePopUpProps {
  platform: string;
  projectCount: number;
  management: ConnectionPlatformsCardManagementProps;
}

const ManagePopUp = ({
  platform,
  projectCount,
  management,
}: ManagePopUpProps) => {
  const managementActions = [
    {
      name: "View Projects",
      icon: Eye,
      action: management.view,
      description: `View all ${projectCount} project${projectCount !== 1 ? "s" : ""}`,
    },
    {
      name: "Import Projects",
      icon: ImportIcon,
      action: management.importPrj,
      description: "Import project data from platform",
    },
    {
      name: "Re-sync Projects",
      icon: RefreshCcw,
      action: management.resync,
      description: "Refresh project data from platform",
    },
    {
      name: "Disconnect",
      icon: GiCancel,
      action: management.disconnect,
      description: "Disconnect from platform",
      destructive: true,
    },
  ];

  return (
    <div className="sm:w-72 w-full p-3 flex flex-col gap-y-1 min-h-32">
      <div className="mb-3 pb-2 border-b border-[var(--accent)]/30">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Manage {platform}
        </h3>
        <p className="text-xs text-[var(--foreground)]/60 mt-1">
          {projectCount} project{projectCount !== 1 ? "s" : ""} connected
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {managementActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`w-full p-3 rounded-lg text-left transition-all duration-150 hover:bg-[var(--accent)]/10 group ${
              action.destructive
                ? "hover:bg-red-50 dark:hover:bg-red-900/20"
                : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                  action.destructive
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-[var(--accent)]/20 text-[var(--foreground)]/70"
                }`}
              >
                <action.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${
                    action.destructive
                      ? "text-red-600 dark:text-red-400"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {action.name}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    action.destructive
                      ? "text-red-500/70 dark:text-red-400/70"
                      : "text-[var(--foreground)]/50"
                  }`}
                >
                  {action.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const PlatformCard = (props: ConnectionPlatformsCardProps) => {
  const { theme } = useTheme();
  const {
    platform,
    description,
    connected,
    projectCount,
    iconConfig,
    management,
  } = props;

  return (
    <div className="w-full rounded-lg p-6 border flex flex-col justify-start border-[var(--accent)]/50 transition-all duration-200 hover:shadow-lg relative overflow-hidden bg-[var(--background)]">
      {/* Connected Badge */}

      {/* Platform Icon */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: getColorShade(theme.background, 10),
          }}
        >
          <Image
            src={iconConfig.logoSrc}
            alt={iconConfig.logoAlt}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              // Fallback to a generic icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
            width={32}
            height={32}
          />
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold hidden"
            style={{
              backgroundColor: theme.foreground,
              color: theme.background,
            }}
          >
            {platform.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-1 truncate">{platform}</h3>
          <p className="text-xs opacity-70 line-clamp-2 leading-relaxed">
            {description}
          </p>
          <div className={`flex mt-1  ${projectCount > 0 && "divide-x"} `}>
            {connected && (
              <span className="text-xs pr-1 text-[var(--foreground)]/60  block">
                {projectCount > 0 &&
                  `${projectCount} Project${projectCount !== 1 ? "s" : ""}`}
              </span>
            )}
            {connected && (
              <span
                className={` text-xs ${projectCount > 0 && "pl-1"} font-medium  text-green-700  dark:text-green-400`}
              >
                Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4">
        {connected ? (
          <Popover
            clickerClassName="w-full"
            clicker={
              <Button
                className="w-full"
                variant="outline"
                icon={<LucideSettings size={16} />}
                text="Manage"
              />
            }
          >
            <ManagePopUp
              platform={platform}
              projectCount={projectCount}
              management={management}
            />
          </Popover>
        ) : (
          <Button
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-90"
            variant="outline"
            text={`Connect ${platform}`}
            icon={<LucidePlus size={16} />}
            onClick={() => {
              // Add connection logic here
              console.log(`Connecting to ${platform}...`);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PlatformCard;
