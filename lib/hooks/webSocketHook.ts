// hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "../../src/app/components/toastify/Toastify";
import {
  NotificationData,
  ProcessedNotification,
  UseWebSocketReturn,
  WebSocketMessage,
} from "../../src/app/components/types and interfaces/NotificationsInterface";
import { useNetworkStore } from "../stores/network/useNetworkStore";
import { getToken } from "../client/api";

// WEBSOCKET
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
const WS_V1_BASE_URL = `${WS_BASE_URL}/api/v1`;
// const WS_V2_BASE_URL = `${WS_BASE_URL}/api/v2`;

// Define types for outgoing WebSocket messages
type MarkReadMessage = {
  type: "mark_read";
  notification_id: string;
};

type MarkAllReadMessage = {
  type: "mark_all_read";
};

type OutgoingWebSocketMessage = MarkReadMessage | MarkAllReadMessage;

export const useWebSocket = (): UseWebSocketReturn => {
  const { isOnline } = useNetworkStore();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<ProcessedNotification[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [heartbeatCount, setHeartbeatCount] = useState<number>(0);
  const url = `${WS_V1_BASE_URL}/ws/notifications?token=${getToken()}`;
  const ws = useRef<WebSocket | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const missedHeartbeats = useRef<number>(0);
  const maxMissedHeartbeats = 5; // Reconnect after 5 missed heartbeats
  const toast = useToast();

  const processNotificationData = useCallback(
    (data: NotificationData): ProcessedNotification => {
      return {
        id: data.id,
        message: data.message,
        type: data.notification_type,
        actionUrl: data.action_url,
        isRead: data.is_read,
        createdAt: data.created_at,
        readAt: data.read_at,
        metadata: data.meta_data,
        userId: data.user_id,
        actorId: data.actor_id,
      };
    },
    [],
  );

  const disconnect = useCallback(() => {
    // Clean up interval
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }

    if (ws.current) {
      ws.current.close();
    }
  }, []);

  const connect = useCallback(() => {
    try {
      // Clear any existing interval
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }

      missedHeartbeats.current = 0;
      setHeartbeatCount(0);

      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        setError(null);

        // Start monitoring heartbeats
        heartbeatInterval.current = setInterval(() => {
          missedHeartbeats.current++;

          if (missedHeartbeats.current >= maxMissedHeartbeats) {
            if (ws.current) {
              ws.current.close();
            }
            setTimeout(() => {
              connect();
            }, 2000);
          }
        }, 30000); // Check every 30 seconds (adjust based on expected heartbeat frequency)
      };

      ws.current.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case "initial_notifications":
              // Handle initial batch of notifications
              if (message.data && Array.isArray(message.data)) {
                const processedNotifications = message.data.map(
                  processNotificationData,
                );
                setNotifications(processedNotifications);
              }
              break;

            case "new_notification":
              // Handle single new notification
              if (message.data && !Array.isArray(message.data)) {
                const newNotification = processNotificationData(message.data);
                setNotifications((prev) => [newNotification, ...prev]);
                toast.toast(newNotification.message, {
                  type: "default",
                  className:
                    "border-[var(--accent)] bg-purple-[var(--background)] text-[var(--accent)]",
                  sound: true,
                  animation: "bounce",
                  position: "bottom-center",
                });
              }
              break;

            case "heartbeat":
              // Reset missed heartbeat counter
              missedHeartbeats.current = 0;
              setHeartbeatCount((prev) => prev + 1);
              break;

            default:
              console.warn("Unknown message type:", message.type);
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);

        // Clean up interval
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
          heartbeatInterval.current = null;
        }
      };

      ws.current.onerror = (error: Event) => {
        setError("WebSocket error");
        console.error("WebSocket error:", error);
      };
    } catch (err) {
      setError("Failed to connect to WebSocket");
      console.error("Connection error:", err);
    }
  }, [url, processNotificationData]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 2000); // Wait 2 seconds before reconnecting
  }, [connect, disconnect]);

  const sendMessage = useCallback((message: OutgoingWebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const markAsRead = useCallback(
    (notificationId: string) => {
      sendMessage({
        type: "mark_read",
        notification_id: notificationId,
      });

      // Optimistically update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : notification,
        ),
      );
    },
    [sendMessage],
  );

  const markAllAsRead = useCallback(() => {
    sendMessage({
      type: "mark_all_read",
    });

    // Optimistically update local state
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date().toISOString(),
      })),
    );
  }, [sendMessage]);

  useEffect(() => {
    if (getToken() && isOnline) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    notifications,
    error,
    heartbeatCount,
    sendMessage,
    disconnect,
    connect,
    reconnect,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications.filter((n) => !n.isRead).length,
  };
};
