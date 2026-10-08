import { baseApi } from "../api/baseApi";

export interface AuditLog {
  _id: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLogsQueryParams {
  action?: string;
  entity?: string;
  actorEmail?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totalEvents: number;
  todayEvents: number;
  totalUniqueActors: number;
  topActions: { _id: string; count: number }[];
}

export const auditLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Compliance Audit Trail
    getAuditLogs: builder.query<
      {
        success: boolean;
        data: AuditLog[];
        meta?: { total: number; page: number; limit: number; totalPages: number };
      },
      AuditLogsQueryParams | void
    >({
      query: (params) => ({
        url: "/audit-logs",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "AuditLog" as const,
                id: _id,
              })),
              { type: "AuditLog", id: "LIST" },
            ]
          : [{ type: "AuditLog", id: "LIST" }],
    }),

    // 2. Aggregate Security & Audit Stats
    getAuditLogStats: builder.query<
      {
        success: boolean;
        data: AuditLogStats;
      },
      void
    >({
      query: () => ({
        url: "/audit-logs/stats",
        method: "GET",
      }),
      providesTags: [{ type: "AuditLog", id: "STATS" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogsQuery, useGetAuditLogStatsQuery } = auditLogApi;
