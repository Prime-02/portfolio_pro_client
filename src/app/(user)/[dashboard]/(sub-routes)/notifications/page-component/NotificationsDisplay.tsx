import EmptyState from "@/app/components/containers/cards/EmptyState";
import { useWebSocketContext } from "@/app/WebSocketContext";
import React from "react";
import NotificationCard from "./NotificationCard";

const NotificationsDisplay = () => {
  const { notifications, reconnect } = useWebSocketContext();

  // Helper function to get the date label (Today, Yesterday, or formatted date)
  const getDateLabel = (date: string | Date): string => {
    const today = new Date();
    const notifDate = new Date(date);

    // Reset time to midnight for accurate day comparison
    today.setHours(0, 0, 0, 0);
    notifDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - notifDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    // Format as "Month Day, Year" for older dates
    return notifDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Group notifications by day
  const groupNotificationsByDay = () => {
    const grouped: { [key: string]: typeof notifications } = {};

    notifications.forEach((notification) => {
      const label = getDateLabel(notification.createdAt);
      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(notification);
    });

    return grouped;
  };

  const groupedNotifications = groupNotificationsByDay();

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
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([dateLabel, notifs]) => (
            <div key={dateLabel}>
              <h3 className="text-sm font-semibold opacity-65 mb-3 px-4">
                {dateLabel}
              </h3>
              <div className="space-y-2">
                {notifs.map((notification, i) => (
                  <NotificationCard key={i} {...notification} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsDisplay;
