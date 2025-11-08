import Button from "@/app/components/buttons/Buttons";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import {
  DeleteData,
  PostAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { useGlobalState } from "@/app/globalStateProvider";
import { useWebSocketContext } from "@/app/WebSocketContext";
import React from "react";

const NotificationHeader = () => {
  const { setLoading, isLoading, accessToken } = useGlobalState();
  const { unreadCount, reconnect } = useWebSocketContext();

  const notificationActions = async () => {
    const url = `/notifications/${unreadCount === 0 ? "delete/delete-read" : "mark-all-as-read"}`;
    const isDeleteAll = unreadCount === 0;
    if (isDeleteAll) {
      setLoading("deleting_all_notifications");
    } else {
      setLoading("marking_all_notifications_as_read");
    }
    let actionRes;
    try {
      if (isDeleteAll) {
        actionRes = await DeleteData({
          access: accessToken,
          url: url,
        });
      } else {
        actionRes = await PostAllData({
          access: accessToken,
          url: url,
        });
      }
      if (actionRes) {
        reconnect();
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (isDeleteAll) {
        setLoading("deleting_all_notifications");
      } else {
        setLoading("marking_all_notifications_as_read");
      }
    }
  };

  return (
    <div className="flex items-center justify-between w-full mb-8 p-3 md:p-8 ">
      <BasicHeader
        heading="Notifications"
        headingClass="md:text-6xl text-4xl font-bold"
        subHeading={`You have ${unreadCount} notification${unreadCount > 1 ? "s" : ""} to go through`}
        subHeadingClass="md:text-3xl text-xl font-semibold"
      />
      <Button
        text={
          unreadCount === 0 ? "Delete all notifications" : "Mark all as read"
        }
        onClick={notificationActions}
        loading={isLoading("marking_all_notifications_as_read") || isLoading("deleting_all_notifications") }
      />
    </div>
  );
};

export default NotificationHeader;
