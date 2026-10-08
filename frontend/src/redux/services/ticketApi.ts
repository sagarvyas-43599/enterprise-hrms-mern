import { baseApi } from "../api/baseApi";

export type TicketCategory =
  | "IT_SUPPORT"
  | "PAYROLL_QUERY"
  | "HR_POLICY"
  | "FACILITIES_ADMIN"
  | "GENERAL";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface TicketMessage {
  _id?: string;
  senderId:
    | {
        _id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        role?: string;
      }
    | string;
  senderModel?: string;
  senderName?: string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  employeeId?:
    | {
        _id: string;
        empId: string;
        firstName: string;
        lastName: string;
        department?: string;
        designation?: string;
      }
    | string;
  raisedBy?:
    | {
        _id: string;
        empId: string;
        firstName: string;
        lastName: string;
        department?: string;
      }
    | string;
  assignedTo?:
    | {
        _id: string;
        empId: string;
        firstName: string;
        lastName: string;
      }
    | string
    | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  conversations?: TicketMessage[];
  messages?: TicketMessage[];
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTicketPayload {
  category: TicketCategory;
  priority?: TicketPriority;
  subject: string;
  description: string;
}

export interface UpdateTicketStatusPayload {
  status: TicketStatus;
  assignedTo?: string | null;
  resolutionNotes?: string;
}

export interface AddTicketMessagePayload {
  message: string;
}

export interface TicketsQueryParams {
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignedTo?: string;
  employeeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TicketMetrics {
  totalTickets?: number;
  total?: number;
  open?: number;
  inProgress?: number;
  resolved?: number;
  closed?: number;
  urgent?: number;
  criticalPending?: number;
}

export const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. List tickets
    getTickets: builder.query<
      {
        success: boolean;
        data: Ticket[];
        meta?: { total: number; page: number; limit: number; totalPages: number };
      },
      TicketsQueryParams | void
    >({
      query: (params) => ({
        url: "/tickets",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Ticket" as const,
                id: _id,
              })),
              { type: "Ticket", id: "LIST" },
            ]
          : [{ type: "Ticket", id: "LIST" }],
    }),

    // 2. View ticket thread
    getTicketById: builder.query<{ success: boolean; data: Ticket }, string>({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Ticket", id }],
    }),

    // 3. SLA & resolution metrics
    getTicketMetrics: builder.query<{ success: boolean; data: TicketMetrics }, void>({
      query: () => ({
        url: "/tickets/metrics",
        method: "GET",
      }),
      providesTags: [{ type: "Ticket", id: "METRICS" }],
    }),

    // 4. Raise new ticket
    createTicket: builder.mutation<
      { success: boolean; data: Ticket; message: string },
      CreateTicketPayload
    >({
      query: (body) => ({
        url: "/tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Ticket", id: "LIST" },
        { type: "Ticket", id: "METRICS" },
      ],
    }),

    // 5. Update ticket status & assignee
    updateTicketStatus: builder.mutation<
      { success: boolean; data: Ticket; message: string },
      { id: string; body: UpdateTicketStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/tickets/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" },
        { type: "Ticket", id: "METRICS" },
      ],
    }),

    // 6. Post message to thread
    addTicketMessage: builder.mutation<
      { success: boolean; data: Ticket; message: string },
      { id: string; body: AddTicketMessagePayload }
    >({
      query: ({ id, body }) => ({
        url: `/tickets/${id}/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Ticket", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useGetTicketMetricsQuery,
  useCreateTicketMutation,
  useUpdateTicketStatusMutation,
  useAddTicketMessageMutation,
} = ticketApi;
