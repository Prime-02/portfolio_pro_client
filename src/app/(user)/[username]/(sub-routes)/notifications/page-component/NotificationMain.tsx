import React from "react";
import NotificationHeader from "./NotificationHeader";
import NotificationsDisplay from "./NotificationsDisplay";

const NotificationMain = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <NotificationHeader />
      <NotificationsDisplay />
    </div>
  );
};

export default NotificationMain;
