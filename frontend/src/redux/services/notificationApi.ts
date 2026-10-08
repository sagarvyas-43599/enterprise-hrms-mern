import { baseApi } from "../api/baseApi";

export type NotificationType =
  | "ANNOUNCEMENT"
  | "ALERT"
  | "LEAVE_UPDATE"
  | "PAYROLL_GENERATED"
  | "POLICY_MANDATE"
  | "TICKET_UPDATE"
  | "GENERAL";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface AppNotification {
  _id: string;
  recipientId?: string | null;
  senderId?: string | null;
  senderName?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string | null;
  actionLink?: string | null;
  targetRole?: string | null;
  targetDepartment?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface BroadcastPayload {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  actionLink?: string;
  targetRole?: string;
  targetDepartment?: string;
}

export interface GetNotificationsParams {
  status?: "all" | "unread" | "read";
  type?: NotificationType;
  priority?: NotificationPriority;
  search?: string;
  page?: number;
  limit?: number;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: AppNotification[];
    unreadCount: number;
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, GetNotificationsParams | void>({
      query: (params) => ({
        url: "/notifications",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.notifications
          ? [
              ...result.data.notifications.map(({ _id }) => ({
                type: "Notification" as const,
                id: _id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    markAsRead: builder.mutation<
      { success: boolean; data: AppNotification },
      string
    >({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    markAllAsRead: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    deleteNotification: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    clearAllReadNotifications: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/notifications/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    broadcastAnnouncement: builder.mutation<
      { success: boolean; data: AppNotification; message: string },
      BroadcastPayload
    >({
      query: (body) => ({
        url: "/notifications/broadcast",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllReadNotificationsMutation,
  useBroadcastAnnouncementMutation,
} = notificationApi;
