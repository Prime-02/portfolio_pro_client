import EmptyState from "@/app/components/containers/cards/EmptyState";
import { useWebSocketContext } from "@/app/WebSocketContext";
import React from "react";
import NotificationCard from "./NotificationCard";

const NotificationsDisplay = () => {
  const { notifications, reconnect } = useWebSocketContext();
  return (
    <div>
      {notifications.length < 1 ? (
        <EmptyState
          title="No notifications found"
          description="We coundn't find any notifications. Click refresh to try again."
          actionText="Refresh"
          onAction={reconnect}
        />
      ) : (
        <div>
          {notifications.map((notification, i) => (
            <NotificationCard key={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsDisplay;
