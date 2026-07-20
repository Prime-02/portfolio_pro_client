import React from "react";
import NotificationHeader from "./NotificationHeader";
import NotificationsDisplay from "./NotificationsDisplay";

const NotificationMain = () => {
  return (
    <div className="max-w-6xl mx-auto min-h-screen p-6 md:p-8 lg:p-10">
      <NotificationHeader />
      <NotificationsDisplay />
    </div>
  );
};

export default NotificationMain;
