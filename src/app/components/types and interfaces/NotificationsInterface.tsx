// Type definitions
export interface NotificationMetadata {
  timestamp?: string;
  ip_address?: string;
  user_agent?: string;
  event?: string;
  login_method?: string;
  reset_link?: string;
  notification_header?: string;
  action_name?: string;
  [key: string]: any;
}

export interface NotificationData {
  id: string;
  message: string;
  notification_type: "info" | "security" | "success" | "warning";
  action_url: string | null;
  user_id: string;
  actor_id: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  meta_data: NotificationMetadata | null;
}

export interface ProcessedNotification {
  id: string;
  message: string;
  type: "info" | "security" | "success" | "warning";
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  metadata: NotificationMetadata | null;
  userId: string;
  actorId: string | null;
}

export interface WebSocketMessage {
  type: "initial_notifications" | "new_notification" | "heartbeat";
  data?: NotificationData[] | NotificationData;
  timestamp?: string;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  notifications: ProcessedNotification[];
  error: string | null;
  heartbeatCount: number;
  sendMessage: (message: any) => void;
  disconnect: () => void;
  connect: () => void;
  reconnect: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}