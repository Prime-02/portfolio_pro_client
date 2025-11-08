"use client";
import React from "react";
import { Bell } from "lucide-react";
import { useWebSocketContext } from "@/app/WebSocketContext";

const NotificationsButton = ({ expanded }: { expanded: boolean }) => {
  const { unreadCount } = useWebSocketContext();

  return (
    <div
      className={`flex items-center justify-${expanded ? "around" : "center"} w-full`}
    >
      <span className="relative">
        <Bell size={26} />
        {!expanded && unreadCount > 0 && (
          <p className="px-[2px] text-[8px] flex items-center animate-pulse justify-center w-auto absolute top-0 right-0 rounded-full bg-red-500 text-white ">
            {unreadCount > 99 ? "99+" : unreadCount}
          </p>
        )}
      </span>
      {expanded && (
        <span className="text-sm">
          {unreadCount < 1
            ? "No new notifications"
            : `${unreadCount > 99 ? "99+" : unreadCount} new notification${unreadCount > 1 ? "s" : ""}`}
        </span>
      )}
    </div>
  );
};

export default NotificationsButton;
