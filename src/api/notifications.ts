import { http } from "./http";

export type NotificationStatus = "all" | "unread";

export interface NotificationResponse {
  id: number;
  type: string;
  title: string;
  message: string;
  targetView: string | null;
  targetId: number | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  content: NotificationResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UnreadNotificationsResponse {
  unreadCount: number;
}

export const notificationsApi = {
  list(status: NotificationStatus = "all", page = 0, size = 10): Promise<NotificationPage> {
    return http<NotificationPage>("/notifications", {
      query: { status, page, size },
    });
  },

  unreadCount(): Promise<UnreadNotificationsResponse> {
    return http<UnreadNotificationsResponse>("/notifications/unread-count");
  },

  markAsRead(id: string | number): Promise<NotificationResponse> {
    return http<NotificationResponse>(`/notifications/${id}/read`, { method: "PATCH" });
  },

  markAllAsRead(): Promise<UnreadNotificationsResponse> {
    return http<UnreadNotificationsResponse>("/notifications/read-all", { method: "PATCH" });
  },
};
