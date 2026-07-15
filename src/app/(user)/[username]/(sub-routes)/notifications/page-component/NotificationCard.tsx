import { api } from "@/lib/client/api";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { formatDateString, getColorShade } from "@/lib/utilities/syncFunctions/syncs";
import Button from "@/src/app/components/buttons/Buttons";
import { useTheme } from "@/src/app/components/theme/ThemeContext";
import { ProcessedNotification } from "@/src/app/components/types and interfaces/NotificationsInterface";
import { useWebSocketContext } from "@/src/app/WebSocketContext";
import React from "react";

const NotificationCard = (prop: ProcessedNotification) => {
  const { type, message, createdAt, isRead, id } = prop;
  const { setLoading, isLoading } = useUIStore();
  const { theme } = useTheme();
  const { reconnect } = useWebSocketContext();

  const notificationActions = async (action: string) => {
    if (action === "delete") {
      setLoading(`deleting_notification_${id}`, true);
    } else {
      setLoading(`marking_notification_${id}_as_read`, true);
    }
    let actionRes;
    try {
      if (action === "delete") {
        actionRes = await api.delete(`/notifications/${id}`);
      } else {
        actionRes = await api.put(`/notifications/${id}`, { is_read: true });
      }
      if (actionRes) {
        reconnect();
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (action === "delete") {
        setLoading(`deleting_notification_${id}`, false);
      } else {
        setLoading(`marking_notification_${id}_as_read`, false);
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
      <span className="flex flex-wrap items-center gap-2 flex-shrink-0 self-end md:self-center">
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
