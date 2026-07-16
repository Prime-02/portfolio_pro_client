
import { api } from "@/lib/client/api";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import Button from "@/src/app/components/buttons/Buttons";
import BasicHeader from "@/src/app/components/containers/divs/header/BasicHeader";
import { PageHeader } from "@/src/app/components/ui/PageHeader";
import { useWebSocketContext } from "@/src/app/WebSocketContext";
import { Bell } from "lucide-react";
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
    <PageHeader
      title="Notifications"
      description={
        unreadCount < 1
          ? "You're all caught up"
          : `You have ${unreadCount} notification${unreadCount > 1 ? "s" : ""} to go through`
      }
      action={notifications.length > 0 && (
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
      )}
      icon={<Bell />}
    />
  );
};

export default NotificationHeader;
