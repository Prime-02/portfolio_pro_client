import React from "react";
import { MoreVertical, LucideIcon } from "lucide-react";
import Popover, {
  PopOverPosition,
} from "@/app/components/containers/divs/PopOver";

export type ActionType = "owner" | "others";
export type DisplayMode =
  | "popover"
  | "circular-icons-vertical"
  | "circular-icons-horizontal"
  | "buttons";

export interface ActionItem {
  icon: LucideIcon;
  actionName: string;
  onClick: (albumId: string) => void;
  type: ActionType | ActionType[]; // Single type or array of types
  style?: string; // Custom CSS classes for styling
  disabled?: boolean;
  displayMode?: DisplayMode;
}

export interface GalleryCardActionsProps {
  albumId: string;
  albumTitle: string;
  actions: ActionItem[];
  userType: ActionType; // Current user's relationship to the album
  popoverPosition?: PopOverPosition;
  triggerClassName?: string;
  displayMode?: DisplayMode; // Override display mode for all actions
}

const GalleryCardActions = ({
  albumId,
  actions,
  userType,
  popoverPosition = "top-left",
  triggerClassName,
  displayMode: overrideDisplayMode,
}: GalleryCardActionsProps) => {
  const defaultTriggerClassName =
    "bg-[var(--background)] border cursor-pointer w-8 h-8 flex items-center justify-center rotate-0 rounded-full shadow-md hover:shadow-lg transition-shadow";

  const defaultActionClassName =
    "w-full px-4 py-2 text-left hover:underline cursor-pointer transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed";

  const circularIconClassName =
    "w-10 h-10 flex items-center justify-center rounded-full  bg-[var(--background)] hover:bg-gray-100 dark:hover:bg-[var(--accent)] hover:border cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md";

  const buttonClassName =
    "flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--background)] hover:bg-gray-100 dark:hover:bg-[var(--accent)] hover:border cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm";

  // Filter actions based on user type
  const filteredActions = actions.filter((action) => {
    if (Array.isArray(action.type)) {
      return action.type.includes(userType);
    }
    return action.type === userType;
  });

  // Don't render if no actions are available for this user type
  if (filteredActions.length === 0) {
    return null;
  }

  // Determine the display mode (override takes precedence, then first action's mode, then default to popover)
  const currentDisplayMode =
    overrideDisplayMode || filteredActions[0]?.displayMode || "popover";

  // Render circular icons (vertical)
  if (currentDisplayMode === "circular-icons-vertical") {
    return (
      <div className="flex flex-col gap-2">
        {filteredActions.map((action, index) => {
          const Icon = action.icon;
          const combinedClassName = action.style
            ? `${circularIconClassName} ${action.style}`
            : circularIconClassName;

          return (
            <button
              key={`${action.actionName}-${index}`}
              onClick={() => action.onClick(albumId)}
              disabled={action.disabled}
              className={combinedClassName}
              title={action.actionName}
              aria-label={action.actionName}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>
    );
  }

  // Render circular icons (horizontal)
  if (currentDisplayMode === "circular-icons-horizontal") {
    return (
      <div className="flex flex-row gap-2 flex-wrap">
        {filteredActions.map((action, index) => {
          const Icon = action.icon;
          const combinedClassName = action.style
            ? `${circularIconClassName} ${action.style}`
            : circularIconClassName;

          return (
            <button
              key={`${action.actionName}-${index}`}
              onClick={() => action.onClick(albumId)}
              disabled={action.disabled}
              className={combinedClassName}
              title={action.actionName}
              aria-label={action.actionName}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>
    );
  }

  // Render buttons with text
  if (currentDisplayMode === "buttons") {
    return (
      <div className="flex flex-wrap gap-2">
        {filteredActions.map((action, index) => {
          const Icon = action.icon;
          const combinedClassName = action.style
            ? `${buttonClassName} ${action.style}`
            : buttonClassName;

          return (
            <button
              key={`${action.actionName}-${index}`}
              onClick={() => action.onClick(albumId)}
              disabled={action.disabled}
              className={combinedClassName}
            >
              <Icon size={16} />
              <span>{action.actionName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default: Render popover
  return (
    <Popover
      position={popoverPosition}
      clickerClassName={triggerClassName || defaultTriggerClassName}
      clicker={
        <span>
          <MoreVertical size={16} />
        </span>
      }
    >
      <div className="min-w-48 py-2">
        {filteredActions.map((action, index) => {
          const Icon = action.icon;
          const combinedClassName = action.style
            ? `${defaultActionClassName} ${action.style}`
            : defaultActionClassName;

          return (
            <button
              key={`${action.actionName}-${index}`}
              onClick={() => action.onClick(albumId)}
              disabled={action.disabled}
              className={combinedClassName}
            >
              <Icon size={16} />
              <span>{action.actionName}</span>
            </button>
          );
        })}
      </div>
    </Popover>
  );
};

export default GalleryCardActions;
