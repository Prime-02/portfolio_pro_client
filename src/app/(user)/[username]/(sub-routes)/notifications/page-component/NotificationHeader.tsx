
import { api } from "@/lib/client/api";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import Button from "@/src/app/components/buttons/Buttons";
import BasicHeader from "@/src/app/components/containers/divs/header/BasicHeader";
import { useWebSocketContext } from "@/src/app/WebSocketContext";
import React from "react";

const NotificationHeader = () => {
  const { setLoading, isLoading } = useUIStore();
  const { unreadCount, reconnect, notifications } = useWebSocketContext();

  const notificationActions = async () => {
    const url = `/notifications/${unreadCount === 0 ? "delete/delete-read" : "mark-all-as-read"}`;
    const isDeleteAll = unreadCount === 0;
    if (isDeleteAll) {
      setLoading("deleting_all_notifications", true);
    } else {
      setLoading("marking_all_notifications_as_read", true);
    }
    let actionRes;
    try {
      if (isDeleteAll) {
        actionRes = await api.delete(url);
      } else {
        actionRes = await api.post(url);
      }
      if (actionRes) {
        reconnect();
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (isDeleteAll) {
        setLoading("deleting_all_notifications", false);
      } else {
        setLoading("marking_all_notifications_as_read", false);
      }
    }
  };

  return (
    <div className="flex items-start md:items-center flex-col md:flex-row justify-between w-full mb-8 p-3 md:p-8 ">
      <BasicHeader
        heading="Notifications"
        headingClass="md:text-6xl text-4xl font-bold"
        subHeading={
          unreadCount < 1
            ? "You're all caught up"
            : `You have ${unreadCount} notification${unreadCount > 1 ? "s" : ""} to go through`
        }
        subHeadingClass="md:text-3xl text-xl font-semibold"
      />
      {notifications.length > 0 && (
        <span
        className="md:max-w-sm"
        >
          <Button
            text={
              unreadCount === 0
                ? "Delete all notifications"
                : "Mark all as read"
            }
            onClick={notificationActions}
            loading={
              isLoading("marking_all_notifications_as_read") ||
              isLoading("deleting_all_notifications")
            }
          />
        </span>
      )}
    </div>
  );
};

export default NotificationHeader;
