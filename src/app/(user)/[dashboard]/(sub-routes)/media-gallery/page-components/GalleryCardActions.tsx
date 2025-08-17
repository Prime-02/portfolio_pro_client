import React from "react";
import { MoreVertical, LucideIcon } from "lucide-react";
import Popover, {
  PopOverPosition,
} from "@/app/components/containers/divs/PopOver";

export type ActionType = "owner" | "others";

export interface ActionItem {
  icon: LucideIcon;
  actionName: string;
  onClick: (albumId: string) => void;
  type: ActionType | ActionType[]; // Single type or array of types
  style?: string; // Custom CSS classes for styling
  disabled?: boolean;
}

export interface GalleryCardActionsProps {
  albumId: string;
  albumTitle: string;
  actions: ActionItem[];
  userType: ActionType; // Current user's relationship to the album
  popoverPosition?: PopOverPosition;
  triggerClassName?: string;
}

const GalleryCardActions = ({
  albumId,
  actions,
  userType,
  popoverPosition = "top-left",
  triggerClassName,
}: GalleryCardActionsProps) => {
  const defaultTriggerClassName =
    "bg-[var(--background)] border cursor-pointer w-8 h-8 flex items-center justify-center rotate-0 rounded-full shadow-md hover:shadow-lg transition-shadow";

  const defaultActionClassName =
    "w-full px-4 py-2 text-left hover:underline cursor-pointer transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed";

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
