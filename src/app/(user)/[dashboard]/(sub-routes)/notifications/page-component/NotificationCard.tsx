import Button from "@/app/components/buttons/Buttons";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { ProcessedNotification } from "@/app/components/types and interfaces/NotificationsInterface";
import {
  DeleteData,
  UpdateAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import {
  formatDateString,
  getColorShade,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { useWebSocketContext } from "@/app/WebSocketContext";
import React from "react";

const NotificationCard = (prop: ProcessedNotification) => {
  const { type, message, createdAt, isRead, id } = prop;
  const { setLoading, isLoading, accessToken } = useGlobalState();
  const { theme } = useTheme();
  const { reconnect } = useWebSocketContext();

  const notificationActions = async (action: string) => {
    if (action === "delete") {
      setLoading(`deleting_notification_${id}`);
    } else {
      setLoading(`marking_notification_${id}_as_read`);
    }
    let actionRes;
    try {
      if (action === "delete") {
        actionRes = await DeleteData({
          access: accessToken,
          url: `/notifications/${id}`,
        });
      } else {
        actionRes = await UpdateAllData({
          access: accessToken,
          url: `/notifications/${id}`,
          field: { is_read: true },
        });
      }
      if (actionRes) {
        reconnect();
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (action === "delete") {
        setLoading(`deleting_notification_${id}`);
      } else {
        setLoading(`marking_notification_${id}_as_read`);
      }
    }
  };

  return (
    <div
      className={`w-full flex flex-col md:flex-row md:items-center 
        ${!isRead && "outline-2 outline-[var(--accent)] "} md:justify-between gap-4 rounded-lg border border-[var(--accent)]/20 p-4`}
      style={{
        backgroundColor: getColorShade(theme.background, 5),
      }}
    >
      <div className="flex flex-col gap-y-2 items-start flex-1 min-w-0">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-lg font-bold md:text-xl">
            {type.toLocaleUpperCase()}
          </h2>
          <p className="opacity-65 text-xs md:text-sm">
            {formatDateString(createdAt)}
          </p>
        </span>
        <p className="text-sm md:text-base break-words">{message}</p>
      </div>
      <span className="flex items-center gap-x-2 flex-shrink-0 self-end md:self-center">
        {!isRead && (
          <Button
            text="Mark as read"
            variant="ghost"
            onClick={() => {
              notificationActions("read");
            }}
            loading={isLoading(`marking_notification_${id}_as_read`)}
            disabled={isLoading(`marking_notification_${id}_as_read`)}
          />
        )}
        {/* <Button
          text="Delete"
          variant="ghost"
          customColor="red"
          onClick={() => {
            notificationActions("delete");
          }}
          loading={isLoading(`deleting_notification_${id}`)}
          disabled={isLoading(`deleting_notification_${id}`)}
        /> */}
      </span>
    </div>
  );
};

export default NotificationCard;
